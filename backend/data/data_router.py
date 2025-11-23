# handler for handling API requests for Reporting & Analytics Dashboard
# API requests are expected to come from forntend/src/components/Analytics/analytics_service.tsx

from fastapi import APIRouter

from data.data_service import *

data_router = APIRouter()

# sanity-checks
@data_router.get("/data/", tags=["data"])
async def data_get():
    return [{"This": "Is"}, {"Some": "Data"}]
@data_router.get("/data/test", tags=["data"])
async def data_get():
    return [{"test": "test"}]


@data_router.get("/data/membership_data", tags=["data"])
async def membership_data_get():

    membership_data = getMembershipData()
    
    return membership_data

@data_router.get("/data/signups_cancellations_data", tags=["data"])
async def signups_cancellations_data_get():

    signups_cancellations_data = getSignupsAndCancellationsData()

    return signups_cancellations_data

@data_router.get("/data/class_popularity_data", tags=["data"])
async def class_popularity_data_get():

    class_popularity_data = getClassPopularityData()

    return class_popularity_data

@data_router.get("/data/class_busy_time_data", tags=["data"])
async def class_busy_time_data_get():

    class_busy_time_data = getClassTimesPopularityData()

    return class_busy_time_data

@data_router.get("/data/gym_occupancy_data", tags=["data"])
async def gym_occupancy_data_get():

    gym_occupancy_data = getGymOccupancyData()

    return gym_occupancy_data

@data_router.get("/data/hourly_usage_data", tags=["data"])
async def hourly_usage_data_get():

    hourly_usage_data = getHourlyUsageData()

    return hourly_usage_data

@data_router.get("/data/number_active_members", tags=["data"])
async def number_active_members_get():

    number_active_members = getNumberActiveMembers()

    return number_active_members

@data_router.get("/data/member_types_data", tags=["data"])
async def member_types_data_get():

    member_types_data = getMemberTypesData()

    return member_types_data