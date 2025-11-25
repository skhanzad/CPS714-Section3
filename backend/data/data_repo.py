# repository layer for data_service.py, for Reporting & Analytics Dashboard

from supabase import create_client, Client

url ="https://zgughkuatbflarqipgyj.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndWdoa3VhdGJmbGFycWlwZ3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Nzk5NDAsImV4cCI6MjA3ODQ1NTk0MH0.fFCkPXPtYPrUPujp-7M1XuZRbfbUaV5juwNYOR1kTs0"

supabase: Client = create_client(url, key)

def getNumberActiveMembersFromRepo():
    supabase: Client = create_client(url, key)

    # get a list of dictionaries describing all active memberships
    response = (
        supabase.table("memberships")
        .select("*", count = "exact")
        .eq("status", "active")
        .execute()
    )
    data = response.data
    return data

def getMemberTypesDataFromRepo():
    supabase: Client = create_client(url, key)

    # get the tiers of all active memberships
    response = (
        supabase.table("memberships")
        .select("tier")
        .eq("status", "active")
        .execute()
    )
    data = response.data
    return data

def getSignupsAndCancellationsDataFromRepo():
    supabase: Client = create_client(url, key)

    # get the created at and subscription end times of all memberships
    response = (
        supabase.table("memberships")
        .select("created_at, current_period_end")
        .execute()
    )
    data = response.data
    return data

def getMembershipDataFromRepo():
    supabase: Client = create_client(url, key)

    # get the created at and subscription end times of all memberships
    response = (
        supabase.table("memberships")
        .select("created_at, current_period_end")
        .execute()
    )
    data = response.data
    return data

def getClassNamesFromRepo():
    supabase: Client = create_client(url, key)

    # get a list of class names and their total bookings
    response = (
        supabase.table("class")
        .select("class_name, total_bookings")
        .execute()
    )
    data = response.data
    return data

def getClassTimesFromRepo():
    supabase: Client = create_client(url, key)

    # get a list of class times and their total bookings
    response = (
        supabase.table("class")
        .select("time, total_bookings")
        .execute()
    )
    data = response.data
    return data