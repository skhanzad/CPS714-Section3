
from collections import deque
from typing import Dict, Deque, List, Optional


EQUIPMENT_TYPES: List[str] = [
    "squat_rack",
    "bench_press",
    "dumbbells",
    "smith_machine",
]

_queues: Dict[str, Deque[str]] = {}



def init_queues() -> None:
    
    for equipment in EQUIPMENT_TYPES:
        _queues[equipment] = deque()



def join_queue(equipment: str, member_id: str) -> int:
   
    _ensure_equipment_exists(equipment)
    queue = _queues[equipment]

   
    if member_id in queue:
        for idx, mid in enumerate(queue):
            if mid == member_id:
                return idx + 1

   
    queue.append(member_id)
    return len(queue)


def pop_next_in_queue(equipment: str) -> Optional[str]:
    _ensure_equipment_exists(equipment)
    queue = _queues[equipment]

    if not queue:
        return None

    return queue.popleft()


def leave_queue(equipment: str, member_id: str) -> bool:
    
    _ensure_equipment_exists(equipment)
    queue = _queues[equipment]

    try:
        queue.remove(member_id)
        return True
    except ValueError:
        # member_id not in queue
        return False


def get_queue(equipment: str) -> List[str]:
   
    _ensure_equipment_exists(equipment)
    return list(_queues[equipment])


def get_position(equipment: str, member_id: str) -> Optional[int]:
   
    _ensure_equipment_exists(equipment)
    queue = _queues[equipment]

    for idx, mid in enumerate(queue):
        if mid == member_id:
            return idx + 1

    return None


def get_all_queues() -> Dict[str, List[str]]:
    
    return {equipment: list(queue) for equipment, queue in _queues.items()}


def _ensure_equipment_exists(equipment: str) -> None:
    
    if equipment not in _queues:
        raise ValueError(f"Unknown equipment: {equipment!r}. "
                         f"Known types: {EQUIPMENT_TYPES}")


if __name__ == "__main__":
    init_queues()
    join_queue("squat_rack", "ID001")
    join_queue("squat_rack", "ID002")
    join_queue("squat_rack", "ID003")
    print(get_queue("squat_rack"))          
    print(get_position("squat_rack", "ID002")) 
    print(pop_next_in_queue("squat_rack"))  
    print(get_queue("squat_rack"))          
    leave_queue("squat_rack", "ID003")
    print(get_queue("squat_rack"))         
