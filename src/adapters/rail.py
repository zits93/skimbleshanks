from ..providers.srt import SRT, SRTError, SRTNetFunnelError, SeatType as SRTSeatType
from ..providers.ktx import Korail, KorailError, NetFunnelError, SeatType as KTXSeatType

# Aliases for unified use
SeatType = SRTSeatType

class RailError(Exception):
    pass

class RailNetFunnelError(RailError):
    pass

def login_client(user_id: str, password: str, provider: str = "SRT", debug: bool = False):
    if provider == "KTX":
        return Korail(user_id, password, verbose=debug)
    return SRT(user_id, password, verbose=debug)


def is_seat_available(train, seat_type):
    # Both SRT and KTX Train objects now have these normalized methods
    if not train.seat_available():
        return train.reserve_standby_available()
    
    # seat_type is an Enum (SeatType)
    if seat_type in [SRTSeatType.GENERAL_FIRST, SRTSeatType.SPECIAL_FIRST]:
        return train.seat_available()
    if seat_type in [SRTSeatType.GENERAL_ONLY, KTXSeatType.GENERAL_ONLY]:
        return train.general_seat_available()
    return train.special_seat_available()


def list_reservations(rail):
    if hasattr(rail, 'get_reservations'):
        return rail.get_reservations()
    return rail.reservations()


__all__ = [
    "SRTError",
    "KorailError",
    "RailError",
    "SRTNetFunnelError",
    "NetFunnelError",
    "SeatType",
    "is_seat_available",
    "list_reservations",
    "login_client",
]
