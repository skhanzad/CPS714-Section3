from fastapi import APIRouter
from pydantic import BaseModel

from index import (
    capacity_tracker,
    equipment_waitlist,
    get_capacity_status,
    get_waitlist
)

class WaitlistRequest(BaseModel):
    equipment_name: str
    member_id: str

class CheckInOutRequest(BaseModel):
    member_id: str


operations_router = APIRouter(prefix="/operations", tags=["operations"])

@operations_router.get("/capacity")
async def get_capacity():
    """Returns the current gym capacity and status."""
    return get_capacity_status()

@operations_router.post("/check-in")
async def check_in(request: CheckInOutRequest):
    """Checks a member into the gym."""
    try:
        capacity_tracker.check_in(request.member_id)
        return {"status": "success", "message": f"Member {request.member_id} checked in."}
    except ValueError as e:
        return {"status": "error", "message": str(e)}

@operations_router.post("/check-out")
async def check_out(request: CheckInOutRequest):
    """Checks a member out of the gym."""
    try:
        capacity_tracker.check_out(request.member_id)
        return {"status": "success", "message": f"Member {request.member_id} checked out."}
    except ValueError as e:
        return {"status": "error", "message": str(e)}

@operations_router.get("/waitlist/{equipment_name}")
async def get_equipment_waitlist(equipment_name: str):
    """Gets the waitlist for a specific piece of equipment."""
    return get_waitlist(equipment_name)

@operations_router.post("/waitlist/join")
async def join_waitlist(request: WaitlistRequest):
    """Adds a member to an equipment waitlist."""
    try:
        equipment_waitlist.join_waitlist(request.equipment_name, request.member_id)
        return {"status": "success", "message": f"Member {request.member_id} joined waitlist for {request.equipment_name}."}
    except ValueError as e:
        return {"status": "error", "message": str(e)}

@operations_router.post("/waitlist/leave")
async def leave_waitlist(request: WaitlistRequest):
    """Removes a member from an equipment waitlist."""
    try:
        equipment_waitlist.leave_waitlist(request.equipment_name, request.member_id)
        return {"status": "success", "message": f"Member {request.member_id} left waitlist for {request.equipment_name}."}
    except ValueError as e:
        return {"status": "error", "message": str(e)}
