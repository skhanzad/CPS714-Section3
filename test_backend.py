from backend import (
    init_system,
    check_in_member,
    check_out_member,
    get_capacity_snapshot,
    join_equipment_waitlist,
    pop_next_for_equipment,
    leave_equipment_waitlist,
    get_equipment_queue,
    get_all_waitlists,
    get_member_position,
)


def test_capacity():
    print("=== Capacity Tests ===")
    check_in_member("ID001")
    check_in_member("ID002")
    check_in_member("ID003")
    snap = get_capacity_snapshot()
    print("Snapshot after check-ins:", snap)
    check_out_member("ID002")
    snap = get_capacity_snapshot()
    print("Snapshot after one checkout:", snap)


def test_waitlists():
    print("\n=== Waitlist Tests ===")
    init_system()
    pos1 = join_equipment_waitlist("squat_rack", "ID010")
    pos2 = join_equipment_waitlist("squat_rack", "ID011")
    pos3 = join_equipment_waitlist("squat_rack", "ID012")
    print("Positions:", pos1, pos2, pos3)
    print("Queue:", get_equipment_queue("squat_rack"))
    print("Position of ID011:", get_member_position("squat_rack", "ID011"))
    next_id = pop_next_for_equipment("squat_rack")
    print("Next popped:", next_id)
    print("Queue after pop:", get_equipment_queue("squat_rack"))
    removed = leave_equipment_waitlist("squat_rack", "ID012")
    print("Removed ID012:", removed)
    print("Final queue:", get_equipment_queue("squat_rack"))


if __name__ == "__main__":
    test_capacity()
    test_waitlists()
