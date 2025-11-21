"""
Index for integration with Sub-Projects 2 and 8
"""

from capacity import CapacityTracker
from waitlist import EquipmentWaitlist

capacity_tracker = CapacityTracker()
equipment_waitlist = EquipmentWaitlist()

# Functions to call

def get_capacity_status():
    return {
        "count": capacity_tracker.get_count(),
        "status": capacity_tracker.get_status(),
        "max_capacity": capacity_tracker.MAX_CAPACITY
    }

def get_waitlist(equipment_name):
    return {
        "equipment": equipment_name,
        "size": equipment_waitlist.get_waitlist_size(equipment_name),
        "next": equipment_waitlist.get_next(equipment_name)
    }
