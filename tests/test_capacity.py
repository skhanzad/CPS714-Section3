import pytest

from backend.capacity import CapacityTracker


def test_check_in_and_capacity_limit():
    tracker = CapacityTracker(max_capacity=2)

    assert tracker.check_in("A") is True
    assert tracker.check_in("B") is True
    assert tracker.get_count() == 2

    # At capacity: next check-in should fail
    assert tracker.check_in("C") is False
    assert tracker.get_count() == 2


def test_prevent_duplicate_check_in():
    tracker = CapacityTracker(max_capacity=3)

    assert tracker.check_in("A") is True
    assert tracker.check_in("A") is False
    assert tracker.get_count() == 1


def test_check_out_behaviour():
    tracker = CapacityTracker(max_capacity=3)
    tracker.check_in("A")
    tracker.check_in("B")

    assert tracker.check_out("A") is True
    assert tracker.get_count() == 1

    # Removing non-existent member should return False
    assert tracker.check_out("C") is False
    assert tracker.get_count() == 1


def test_status_thresholds():
    tracker = CapacityTracker(max_capacity=10)

    # 0.0 ratio -> Quiet
    assert tracker.get_status() == "Quiet"

    # 0.4 ratio -> Quiet
    for member in ["A", "B", "C", "D"]:
        tracker.check_in(member)
    assert tracker.get_status() == "Quiet"

    # 0.5 ratio -> Busy
    tracker.check_in("E")
    assert tracker.get_status() == "Busy"

    # 0.8 ratio -> Packed
    for member in ["F", "G", "H"]:
        tracker.check_in(member)
    assert tracker.get_status() == "Packed"

    # Above 0.8 stays Packed
    tracker.check_in("I")
    assert tracker.get_status() == "Packed"
