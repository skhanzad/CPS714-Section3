class EquipmentWaitlist:
    def __init__(self):
        self.waitlists = {}  # {equipment_name: [member_ids]}
    
    def join_waitlist(self, equipment, member_id):
        """Add member to equipment waitlist"""
        self._ensure_equipment_exists(equipment)

        if member_id in self.waitlists[equipment]:
            return False  # Already in waitlist
        
        self.waitlists[equipment].append(member_id)
        return True  # joining returns success flag
    
    def leave_waitlist(self, equipment, member_id):
        """Remove member from waitlist"""
        if equipment in self.waitlists and member_id in self.waitlists[equipment]:
            self.waitlists[equipment].remove(member_id)
            return True
        return False
    
    def get_next(self, equipment):
        """Get next member in line (front of queue)"""
        if equipment in self.waitlists and len(self.waitlists[equipment]) > 0:
            return self.waitlists[equipment][0]
        return None
    
    def get_position(self, equipment, member_id):
        """Get member's position in waitlist (1 = first)"""
        if equipment in self.waitlists and member_id in self.waitlists[equipment]:
            return self.waitlists[equipment].index(member_id) + 1
        return None
    
    def get_waitlist_size(self, equipment):
        """Get number of people waiting"""
        if equipment in self.waitlists:
            return len(self.waitlists[equipment])
        return 0

    def get_queue(self, equipment):
        """Return a copy of the queue list for an equipment."""
        self._ensure_equipment_exists(equipment)
        return list(self.waitlists[equipment])

    def get_all_waitlists(self):
        """Return a mapping of equipment -> queue list."""
        return {eq: list(q) for eq, q in self.waitlists.items()}

    def get_queue_lengths(self):
        """Return a mapping of equipment -> queue size."""
        return {eq: len(q) for eq, q in self.waitlists.items()}

    def get_queue_details(self, equipment, member_id=None):
        """Return queue, count, next up, and member position (if provided)."""
        queue_list = self.get_queue(equipment)
        details = {
            "equipment": equipment,
            "queue": queue_list,
            "count": len(queue_list),
            "next_up": queue_list[0] if queue_list else None,
        }
        if member_id is not None:
            details["position"] = self.get_position(equipment, member_id)
        return details

    def ensure_equipment(self, equipment_list):
        """Ensure equipment keys exist with empty queues."""
        for eq in equipment_list:
            self._ensure_equipment_exists(eq)

    def _ensure_equipment_exists(self, equipment):
        if equipment not in self.waitlists:
            self.waitlists[equipment] = []


# Test
if __name__ == "__main__":
    waitlist = EquipmentWaitlist()
    
    # Members join waitlist for squat rack
    waitlist.join_waitlist("Squat Rack", "M001")
    waitlist.join_waitlist("Squat Rack", "M002")
    waitlist.join_waitlist("Squat Rack", "M003")
    
    print(f"Next in line: {waitlist.get_next('Squat Rack')}")
    print(f"M002 position: {waitlist.get_position('Squat Rack', 'M002')}")
    print(f"Waitlist size: {waitlist.get_waitlist_size('Squat Rack')}")
    
    # M001 leaves
    waitlist.leave_waitlist("Squat Rack", "M001")
    print(f"After M001 leaves, next: {waitlist.get_next('Squat Rack')}")
