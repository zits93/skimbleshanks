import time
from random import gammavariate

import inquirer

from .notifications import send_telegram

RESERVE_INTERVAL_SHAPE = 4
RESERVE_INTERVAL_SCALE = 0.25
RESERVE_INTERVAL_MIN = 0.25
RESERVE_INTERVAL_MULTIPLIER = 3
WAITING_BAR = ["|", "/", "-", "\\"]


def sleep() -> None:
    time.sleep(
        (
            gammavariate(RESERVE_INTERVAL_SHAPE, RESERVE_INTERVAL_SCALE)
            + RESERVE_INTERVAL_MIN
        )
        * RESERVE_INTERVAL_MULTIPLIER
    )


def show_waiting(i_try: int, start_time: float) -> None:
    elapsed_time = time.time() - start_time
    hours, remainder = divmod(int(elapsed_time), 3600)
    minutes, seconds = divmod(remainder, 60)
    print(
        f"\r예매 대기 중... {WAITING_BAR[i_try & 3]} {i_try:4d} ({hours:02d}:{minutes:02d}:{seconds:02d}) ",
        end="",
        flush=True,
    )


def handle_error(ex, msg=None):
    msg = (
        msg
        or f"\nException: {ex}, Type: {type(ex)}, Message: {ex.msg if hasattr(ex, 'msg') else 'No message attribute'}"
    )
    print(msg)
    send_telegram(msg)
    return inquirer.confirm(message="계속할까요", default=True)
