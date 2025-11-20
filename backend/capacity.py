class CapacityTracker:
    def __init__(self, max_capacity=100):
        self.max_capacity = max_capacity
        self.stack = []  # Stack of member IDs
    
    def check_in(self, member_id):
        """Add member to gym"""
        if len(self.stack) >= self.max_capacity:
            return False
        if member_id in self.stack:
            return False
        self.stack.append(member_id)
        return True
    
    def check_out(self, member_id):
        """Remove member from gym"""
        if member_id in self.stack:
            self.stack.remove(member_id)
            return True
        return False
    
    def get_status(self):
        """Return gym status: Quiet, Busy, or Packed"""
        ratio = len(self.stack) / self.max_capacity
        if ratio < 0.5:
            return "Quiet"
        elif ratio < 0.8:
            return "Busy"
        else:
            return "Packed"
    
    def get_count(self):
        """Return current number of people"""
        return len(self.stack)


# Test
if __name__ == "__main__":
    gym = CapacityTracker(max_capacity=50)
    
    gym.check_in("ID001")
    gym.check_in("ID002")
    gym.check_in("ID003")
    
    print(f"Count: {gym.get_count()}")
    print(f"Status: {gym.get_status()}")
    
    gym.check_out("M002")
    print(f"After checkout: {gym.get_count()}")