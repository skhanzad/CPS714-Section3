from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from data import data_router
from datetime import date as date_type, time as time_type, datetime
from typing import Optional
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_KEY", "")
)

app = FastAPI()

class BookingRequest(BaseModel): #Pydantic model for the booking request
    user_id: str
    schedule_id: int

class CancelRequest(BaseModel): #Pydantic model for the cancel request
    user_id: str
    booking_id: int

class MemberName(BaseModel): #Pydantic model for member name
    first_name: str
    last_name: str

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "FitHub Class Booking API",
        "version": "1.0.0"
    }

@app.get("/classes/schedules")
async def get_classes_schedules(
    date: Optional[str] = None,
    time_from: Optional[str] = None,
    time_to: Optional[str] = None,
):
    # supabase query to get classes schedules (need to fix for final table)
    db_query = supabase.table('class_schedules')\
        .select('*, class(*)')\
        .gte('scheduled_date', datetime.now().date().isoformat())

    #if filters are provided in the query, add them to the query
    if date:
        db_query = db_query.eq('scheduled_date', date)
    if time_from:
        db_query = db_query.gte('time_from', time_from)
    if time_to:
        db_query = db_query.lte('time_to', time_to)

    #Sort the results of the query by start_time
    db_query = db_query.order('scheduled_date').order('time_from')

    final_result = db_query.execute() #execute the query and get the results

    return final_result.data #get JSON data from the query returned

#integration with team 1 and team 6 to help with this with membership tier validation and notification system
@app.post("/classes/book")
async def book_class(request: BookingRequest):
    try:

        #supabase query to get the schedule and class details for the provided schedule_id
        #schedule is feteched to verify and check avaliabity and check existance
        schedule_query = supabase.table('class_schedules')\
            .select('*, class(*)')\
            .eq('id', request.schedule_id)\
            .execute()
        
        if not schedule_query.data: #if the schedule is not found, return an error
            return {
                "success": False,
                "message": "ClassSchedule not found"
            }
        
        schedule = schedule_query.data[0] #get the schedule data from the first result

        #check if the call if full or not by comparing taken and total spots
        if schedule['taken_spots'] >= schedule['total_spots']:
            return{
                "success": False,
                "message": "Class is full, No more spots available"
            }
        
        # Fetch user's membership status from the member table
        # This is needed to validate if they can book premium/vip classes (team 1)
        member_query = supabase.table('member')\
            .select('member_status')\
            .eq('member_id', request.user_id)\
            .execute()
        
        if not member_query.data: #if the member is not found, return an error
            return {
                "success": False,
                "message": "Member not found. Please ensure you have a valid membership."
            }
        
        member_status = member_query.data[0]['member_status']  # Get the member's tier (basic, premium, vip)
        class_premium_status = schedule['class']['premium_status']  # Get the class's tier requirement
        
        # Validate membership tier against class premium status
        # Membership hierarchy: basic < premium < vip
        # Rules:
        # - basic members can only book basic classes
        # - premium members can book basic and premium classes
        # - vip members can book all classes (basic, premium, vip)
        
        tier_hierarchy = {'basic': 1, 'premium': 2, 'vip': 3}
        
        user_tier_level = tier_hierarchy.get(member_status, 0)
        class_tier_level = tier_hierarchy.get(class_premium_status, 0)
        
        if user_tier_level < class_tier_level:
            # User's membership tier is too low for this class
            return {
                "success": False,
                "message": f"This class requires {class_premium_status} membership. Your current membership is {member_status}. Please upgrade your membership to book this class."
            }
        
        #check if the user has already book the class schedule previously
        #Query the class_bookings table to check if the user has already booked the class schedule
        #Look at not null constraint on the schedule_id and user_id columns
        existing_booking_query = supabase.table('class_bookings')\
            .select('*')\
            .eq('schedule_id', request.schedule_id)\
            .eq('user_id', request.user_id)\
            .is_('cancelled_at', 'null')\
            .execute()
        
        if existing_booking_query.data: #if the user has already booked the class schedule, return an error
            return {
                "success": False,
                "message": "You have already booked this class schedule"
            }

        #past the checks, we are created the booking record for the user
        #automatic time stamp set by the database
        booking_result = supabase.table('class_bookings')\
            .insert({
                'schedule_id': int(request.schedule_id),
                'user_id': request.user_id,

            }).execute()
        
        if not booking_result.data: #if the booking is not created, return an error
            return {
                "success": False,
                "message": "Error creating booking record"
            }
        
        #increment the taken spots in the schedule and update the table
        new_taken_spots = schedule['taken_spots'] + 1
        supabase.table('class_schedules')\
            .update({'taken_spots': new_taken_spots})\
            .eq('id', request.schedule_id)\
            .execute()
        
        # Mock notification - In production, this would integrate with team 6's notification system
        # to send actual email/push notifications to the user
        notification_message = f"Booking confirmed for {schedule['class']['class_name']} on {schedule['scheduled_date']} at {schedule['time_from']}. Notification sent to user."
        
        #return success booking response with details
        return {
            "success": True,
            "message": "Class Booking created successfully",
            "booking": booking_result.data[0],
            "class_name": schedule['class']['class_name'],  # Include class name for UI
            "scheduled_date": schedule['scheduled_date'],
            "time_from": schedule['time_from'],
            "notification": notification_message  # Mock notification confirmation
        }
        
    except Exception as e: 
        #if an error occurs in booking the class, return an error response
        #log the error for debugging purposes
        print(f"Error booking class: {str(e)}")
        return {
            "success": False,
            "message": f"Error booking class: {str(e)}"
        }

@app.post("/classes/cancel")
async def cancel_class(request: CancelRequest):
    try:
        #supabase query to class_bookings table to cancel the booking
        #verify that the user owns the booking 
        booking_query = supabase.table('class_bookings')\
            .select('*, class_schedules(taken_spots, total_spots)')\
            .eq('id', request.booking_id)\
            .eq('user_id', request.user_id)\
            .execute()

        if not booking_query.data: #if the booking is not found, return an error
            return {
                "success": False,
                "message": "Booking not found or does not belong to this user"
            }
        
        booking = booking_query.data[0] #otherwise, get the booking data

        #verify that the booking is not already cancelled
        if booking.get('booking_status') == 'cancelled' or booking['cancelled_at'] is not None:
            return {
                "success": False,
                "message": "Booking already cancelled"
            }
        
        schedule_id = booking['schedule_id']


        #Update booking status to cancelled with current timestamp
        supabase.table('class_bookings')\
            .update({
                'cancelled_at': datetime.now().isoformat(),
                'booking_status': 'cancelled'
            })\
            .eq('id', request.booking_id)\
            .execute()

        #decrement the taken spots in the schedule and update the table
        current_taken = booking['class_schedules']['taken_spots']
        supabase.table('class_schedules')\
            .update({'taken_spots': current_taken - 1})\
            .eq('id', schedule_id)\
            .execute()
        
        #return success cancellation response
        return {
            "success": True,
            "message": "Booking cancelled successfully",
            "booking_id": request.booking_id
        }
    
    except Exception as e: #if an error occurs in cancelling the booking, return an error response
        return {
            "success": False,
            "message": f"Error cancelling booking: {str(e)}"
        }



@app.get("/classes/my-bookings") 
async def get_my_bookings(user_id: str):
    try:
        #supabase query to get bookings for the user with class and schedule details
        #fetching from class_bookings table where user_id matches the provided user_id
        db_query = supabase.table('class_bookings')\
            .select('*, class_schedules(*, class(*))')\
            .eq('user_id', user_id)\
            .order('booked_at', desc=True)
        
        final_result = db_query.execute()

        if not final_result.data: #if no bookings found for the user, return an empty list
            return {
                "success": True,
                "message": "No bookings found for this user",
                "bookings": []
            }
        return { #return the bookings found for the user
            "success": True,
            "message": "Bookings retrieved successfully",
            "bookings": final_result.data
        }
    except Exception as e:
        return { #return an error response if an exception occurs
            "success": False,
            "message": f"Error retrieving bookings: {str(e)}",
            "bookings": []
        }

@app.get("/members/name")
async def get_member_by_name(first_name: str, last_name: str):
    try:
        db_query = supabase.table('member')\
            .select('member_id, first_name, last_name, member_status')\
            .eq('first_name', first_name)\
            .eq('last_name', last_name)\
            .execute()
        
        member_data = db_query.data
        
        if not member_data:
            return {
                "success": False,
                "message": f"Member '{first_name} {last_name}' not found"
            }
            
        return {
            "success": True,
            "message": "Member(s) retrieved successfully",
            "members": member_data
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Error retrieving member by name: {str(e)}"
        }

@app.get("/members/{member_id}")
async def get_member_by_id(member_id: str):
    try:
        db_query = supabase.table('member')\
            .select('member_id, first_name, last_name, member_status')\
            .eq('member_id', member_id)\
            .single()\
            .execute()
        
        member_data = db_query.data
        
        if not member_data:
            return {
                "success": False,
                "message": f"Member with ID '{member_id}' not found"
            }
            
        return {
            "success": True,
            "message": "Member retrieved successfully",
            "member": member_data
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Error retrieving member by ID: {str(e)}"
        }

app.include_router(data_router.data_router)