from capacity import CapacityTracker
from waitlist import EquipmentWaitlist

# Shared instances
capacity_tracker = CapacityTracker()
equipment_waitlist = EquipmentWaitlist()

# ===== Convenience wrapper functions =====

def get_capacity_status():
    """Return current count, max capacity, and status."""
    return {
        "count": capacity_tracker.get_count(),
        "status": capacity_tracker.get_status(),
        "max_capacity": capacity_tracker.MAX_CAPACITY
    }

def get_waitlist(equipment_name):
    """Return basic waitlist info for dashboard."""
    return {
        "equipment": equipment_name,
        "size": equipment_waitlist.get_waitlist_size(equipment_name),
        "next": equipment_waitlist.get_next(equipment_name),
        "queue": equipment_waitlist.get_queue(equipment_name)
    }

def get_capacity_history():
    """Return timestamped check-in/check-out events (for Reporting Team)."""
    return capacity_tracker.get_history()

def get_all_checked_in_users():
    """Return a list of all checked-in member IDs."""
    return list(capacity_tracker.checked_in)