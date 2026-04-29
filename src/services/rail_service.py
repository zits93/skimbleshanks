from typing import List, Optional
from fastapi import HTTPException
from src.providers.srt import Adult, Child, Senior, Disability1To3, Disability4To6, Passenger
from src.adapters.rail import SeatType

def build_passengers(
    adults: int = 1,
    children: int = 0,
    seniors: int = 0,
    disability1to3: int = 0,
    disability4to6: int = 0
) -> List[Passenger]:
    passengers = []
    if adults > 0: passengers.append(Adult(adults))
    if children > 0: passengers.append(Child(children))
    if seniors > 0: passengers.append(Senior(seniors))
    if disability1to3 > 0: passengers.append(Disability1To3(disability1to3))
    if disability4to6 > 0: passengers.append(Disability4To6(disability4to6))
    
    if not passengers:
        raise HTTPException(status_code=400, detail="No passengers selected")
    return passengers

def find_target_train(trains, target_train_name: str):
    for t in trains:
        if f"{t.train_name} {t.train_number}" == target_train_name:
            return t
    return None

def get_seat_type_enum(seat_type_str: str) -> Optional[SeatType]:
    return getattr(SeatType, seat_type_str, None)
