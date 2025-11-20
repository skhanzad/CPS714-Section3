from typing import Dict, List, Optional, Any
from .config import MAX_CAPACITY
from .events import on as subscribe_event, emit
from .capacity import CapacityTracker
from . import waitlist

_capacity_tracker = CapacityTracker(max_capacity=MAX_CAPACITY)


def init_system() -> None:
    waitlist.init_queues()


def check_in_member(member_id: str) -> bool:
    success = _capacity_tracker.check_in(member_id)
    if success:
        emit("capacity_updated", get_capacity_snapshot())
    return success


def check_out_member(member_id: str) -> bool:
    success = _capacity_tracker.check_out(member_id)
    if success:
        emit("capacity_updated", get_capacity_snapshot())
    return success


def get_capacity_snapshot() -> Dict[str, Any]:
    return {
        "count": _capacity_tracker.get_count(),
        "status": _capacity_tracker.get_status(),
        "max_capacity": _capacity_tracker.max_capacity,
    }


def join_equipment_waitlist(equipment: str, member_id: str) -> int:
    position = waitlist.join_queue(equipment, member_id)
    emit("waitlist_updated", {
        "equipment": equipment,
        "queue": waitlist.get_queue(equipment),
    })
    return position


def pop_next_for_equipment(equipment: str) -> Optional[str]:
    member_id = waitlist.pop_next_in_queue(equipment)
    emit("waitlist_updated", {
        "equipment": equipment,
        "queue": waitlist.get_queue(equipment),
    })
    return member_id


def leave_equipment_waitlist(equipment: str, member_id: str) -> bool:
    removed = waitlist.leave_queue(equipment, member_id)
    if removed:
        emit("waitlist_updated", {
            "equipment": equipment,
            "queue": waitlist.get_queue(equipment),
        })
    return removed


def get_equipment_queue(equipment: str) -> List[str]:
    return waitlist.get_queue(equipment)


def get_all_waitlists() -> Dict[str, List[str]]:
    return waitlist.get_all_queues()


def get_member_position(equipment: str, member_id: str) -> Optional[int]:
    return waitlist.get_position(equipment, member_id)


def subscribe(event_name: str, callback) -> None:
    subscribe_event(event_name, callback)
