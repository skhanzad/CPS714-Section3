from datetime import datetime

class CapacityTracker:
    MAX_CAPACITY = 10

    def __init__(self):
        self.stack = []
        self.history = []  # List of (member_id, action, timestamp)

    def check_in(self, member_id):
        """Add member to gym using stack."""
        if len(self.stack) >= self.MAX_CAPACITY:
            return False
        if member_id in self.stack:
            return False
        self.stack.append(member_id)
        self.history.append((member_id, "CHECK_IN", datetime.now()))
        return True

    def check_out(self, member_id):
        """Remove member from gym using stack."""
        if member_id in self.stack:
            self.stack.remove(member_id)
            self.history.append((member_id, "CHECK_OUT", datetime.now()))
            return True
        return False

    def get_status(self):
        """Return gym status: Quiet, Busy, or Packed."""
        count = len(self.stack)

        if count < 3:       # under 3 people checked in
            return "Quiet"
        elif count < 7:     # 3–7 people checked in
            return "Busy"
        else:                # 7+ checked in
            return "Packed"

    def get_count(self):
        """Return current number of people checked into the gym."""
        return len(self.stack)

    def get_history(self):
        """Return full history of check-ins and check-outs."""
        return self.history



# Tests
if __name__ == "__main__":
    print("=== Running CapacityTracker Tests ===")

    # 1. Test normal check-in
    t1 = CapacityTracker()
    assert t1.check_in("M001") == True
    assert t1.get_count() == 1
    print("Test 1 passed: Normal check-in")

    # 2. Prevent double check-in
    t2 = CapacityTracker()
    t2.check_in("M001")
    assert t2.check_in("M001") == False
    assert t2.get_count() == 1
    print("Test 2 passed: Prevent double check-in")

    # 3. Normal check-out
    t3 = CapacityTracker()
    t3.check_in("M001")
    assert t3.check_out("M001") == True
    assert t3.get_count() == 0
    print("Test 3 passed: Normal check-out")

    # 4. Check-out when not inside
    t4 = CapacityTracker()
    assert t4.check_out("M002") == False
    print("Test 4 passed: Check-out of non-present member")

    # 5. Quiet status
    t5 = CapacityTracker()
    t5.check_in("M002")
    t5.check_in("M003")
    assert t5.get_status() == "Quiet"
    print("Test 5 passed: Quiet status")

    # 6. Busy status
    t6 = CapacityTracker()
    for i in range(5):
        t6.check_in(f"{i}")
    assert t6.get_status() == "Busy"
    print("Test 6 passed: Busy status")

    # 7. Packed status
    t7 = CapacityTracker()
    for i in range(8):
        t7.check_in(f"{i}")
    assert t7.get_status() == "Packed"
    print("Test 7 passed: Packed status")

    # 8. Check history tracking
    t8 = CapacityTracker()
    t8.check_in("M001")
    t8.check_in("M002")
    t8.check_out("M001")
    history = t8.get_history()
    assert len(history) == 3
    assert history[0][0] == "M001" and history[0][1] == "CHECK_IN"
    assert history[2][0] == "M001" and history[2][1] == "CHECK_OUT"
    print("Test 8 passed: History tracking")
    print(f"  Sample history entry: {history[0][0]} {history[0][1]} at {history[0][2]}")

    print("\n=== All Tests Passed Successfully ===")