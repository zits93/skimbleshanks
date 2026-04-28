from ..providers.srt import SRT, SRTError, SRTNetFunnelError, SeatType


def login_client(user_id: str, password: str, debug: bool = False):
    return SRT(user_id, password, verbose=debug)


def is_seat_available(train, seat_type):
    if not train.seat_available():
        return train.reserve_standby_available()
    if seat_type in [SeatType.GENERAL_FIRST, SeatType.SPECIAL_FIRST]:
        return train.seat_available()
    if seat_type == SeatType.GENERAL_ONLY:
        return train.general_seat_available()
    return train.special_seat_available()


def list_reservations(rail):
    return rail.get_reservations()


__all__ = [
    "SRTError",
    "SRTNetFunnelError",
    "SeatType",
    "is_seat_available",
    "list_reservations",
    "login_client",
]
