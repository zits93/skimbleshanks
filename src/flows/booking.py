import time
from datetime import datetime, timedelta
from json.decoder import JSONDecodeError
import random
import inquirer

from termcolor import colored

try:
    from curl_cffi.requests.exceptions import ConnectionError
except ImportError:
    from requests.exceptions import ConnectionError

from ..adapters.rail import (
    SRTError,
    SRTNetFunnelError,
    SeatType,
    is_seat_available,
)
from ..providers.srt import Adult, Child, Disability1To3, Disability4To6, Senior
from ..services import config_store
from ..services.logger import logger
from ..services.notifications import send_telegram
from ..services.retry_policy import handle_error, show_waiting, sleep
from ..constants import PASSENGER_TYPES
from .common import login, pay_card
from ..utils.retry import sleep_with_backoff


PASSENGER_CLASSES = {
    "adult": Adult,
    "child": Child,
    "senior": Senior,
    "disability1to3": Disability1To3,
    "disability4to6": Disability4To6,
}

PASSENGER_LABELS = {
    Adult: "어른/청소년",
    Child: "어린이",
    Senior: "경로우대",
    Disability1To3: "1~3급 장애인",
    Disability4To6: "4~6급 장애인",
}


def handle_booking_exception(ex, rail, debug):
    if isinstance(ex, SRTError):
        msg = ex.msg
        if "정상적인 경로로 접근 부탁드립니다" in msg or isinstance(
            ex, SRTNetFunnelError
        ):
            if debug:
                logger.debug(f"\nException: {ex}\nType: {type(ex)}\nArgs: {ex.args}\nMessage: {msg}")
            rail.clear()
        elif "로그인 후 사용하십시오" in msg:
            if debug:
                logger.debug(f"\nException: {ex}\nType: {type(ex)}\nArgs: {ex.args}\nMessage: {msg}")
            rail = login(debug=debug)
            if not rail.is_login and not handle_error(ex):
                return False, rail
        elif not any(
            err in msg
            for err in (
                "잔여석없음",
                "사용자가 많아 접속이 원활하지 않습니다",
                "예약대기 접수가 마감되었습니다",
                "예약대기자한도수초과",
            )
        ):
            if not handle_error(ex):
                return False, rail
        sleep()
    elif isinstance(ex, JSONDecodeError):
        if debug:
            logger.debug(f"\nException: {ex}\nType: {type(ex)}\nArgs: {ex.args}\nMessage: {ex.msg}")
        sleep()
        rail = login(debug=debug)
    elif isinstance(ex, ConnectionError):
        if not handle_error(ex, "연결이 끊겼습니다"):
            return False, rail
        rail = login(debug=debug)
    else:
        if debug:
            logger.debug("\nUndefined exception")
        if not handle_error(ex):
            return False, rail
        rail = login(debug=debug)
    return True, rail



def get_search_params(station_key, defaults, now, options):

    today = now.strftime("%Y%m%d")
    max_days = 30 if now.hour >= 7 else 29
    date_choices = [
        (
            (now + timedelta(days=i)).strftime("%Y/%m/%d %a"),
            (now + timedelta(days=i)).strftime("%Y%m%d"),
        )
        for i in range(max_days + 1)
    ]
    time_choices = [(f"{h:02d}", f"{h:02d}0000") for h in range(24)]

    q_info = [
        inquirer.List(
            "departure",
            message="출발역 선택 (↕:이동, Enter: 선택, Ctrl-C: 취소)",
            choices=station_key,
            default=defaults["departure"],
        ),
        inquirer.List(
            "arrival",
            message="도착역 선택 (↕:이동, Enter: 선택, Ctrl-C: 취소)",
            choices=station_key,
            default=defaults["arrival"],
        ),
        inquirer.List(
            "date",
            message="출발 날짜 선택 (↕:이동, Enter: 선택, Ctrl-C: 취소)",
            choices=date_choices,
            default=defaults["date"],
        ),
        inquirer.List(
            "time",
            message="출발 시각 선택 (↕:이동, Enter: 선택, Ctrl-C: 취소)",
            choices=time_choices,
            default=defaults["time"],
        ),
        inquirer.List(
            "adult",
            message="성인 승객수 (↕:이동, Enter: 선택, Ctrl-C: 취소)",
            choices=range(10),
            default=defaults["adult"],
        ),
    ]

    for key, label in PASSENGER_TYPES.items():
        if key in options:
            q_info.append(
                inquirer.List(
                    key,
                    message=f"{label} 승객수 (↕:이동, Enter: 선택, Ctrl-C: 취소)",
                    choices=range(10),
                    default=defaults[key],
                )
            )

    info = inquirer.prompt(q_info)
    return info


def select_trains(trains):
    def decorate(train):
        return (
            str(train)
            .replace("예약가능", colored("가능", "green"))
            .replace("가능", colored("가능", "green"))
            .replace("신청하기", colored("가능", "green"))
        )

    choice = inquirer.prompt(
        [
            inquirer.Checkbox(
                "trains",
                message="예약할 열차 선택 (↕:이동, Space: 선택, Enter: 완료, Ctrl-A: 전체선택, Ctrl-R: 선택해제, Ctrl-C: 취소)",
                choices=[(decorate(train), i) for i, train in enumerate(trains)],
                default=None,
            )
        ]
    )
    return choice


def select_options():
    return inquirer.prompt(
        [
            inquirer.List(
                "type",
                message="선택 유형",
                choices=[
                    ("일반실 우선", SeatType.GENERAL_FIRST),
                    ("일반실만", SeatType.GENERAL_ONLY),
                    ("특실 우선", SeatType.SPECIAL_FIRST),
                    ("특실만", SeatType.SPECIAL_ONLY),
                ],
            ),
            inquirer.Confirm("pay", message="예매 시 카드 결제", default=False),
        ]
    )


def reserve(debug=False, stations=None, default_stations=None):
    rail = login(debug=debug)

    now = datetime.now() + timedelta(minutes=10)
    today = now.strftime("%Y%m%d")
    this_time = now.strftime("%H%M%S")
    defaults = config_store.get_reserve_defaults("SRT", today, True)

    if defaults["departure"] == defaults["arrival"]:
        defaults["arrival"] = (
            "동대구" if defaults["departure"] == "수서" else None
        )
        defaults["departure"] = (
            defaults["departure"]
            if defaults["arrival"]
            else "수서"
        )

    _, station_key = config_store.get_station(
        {"SRT": stations} if stations else {"SRT": []},
        {"SRT": default_stations} if default_stations else {"SRT": ["수서", "대전", "동대구", "부산"]},
        "SRT",
    )
    options_list = config_store.get_options()

    info = get_search_params(station_key, defaults, now, options_list)
    if not info:
        logger.warning("예매 정보 입력 중 취소되었습니다")
        return
    if info["departure"] == info["arrival"]:
        logger.warning("출발역과 도착역이 같습니다")
        return

    config_store.save_reserve_preferences("SRT", info)
    if info["date"] == today and int(info["time"]) < int(this_time):
        info["time"] = this_time

    passengers = []
    total_count = 0
    for key, cls in PASSENGER_CLASSES.items():
        if key in info and info[key] > 0:
            passengers.append(cls(info[key]))
            total_count += info[key]

    if not passengers:
        logger.warning("승객수는 0이 될 수 없습니다")
        return
    if total_count >= 10:
        logger.warning("승객수는 10명을 초과할 수 없습니다")
        return

    logger.info(
        " ".join([
            f"{PASSENGER_LABELS[type(passenger)]} {passenger.count}명"
            for passenger in passengers
        ])
    )

    params = {
        "dep": info["departure"],
        "arr": info["arrival"],
        "date": info["date"],
        "time": info["time"],
        "passengers": [Adult(total_count)],
        "available_only": False,
    }

    trains = rail.search_train(**params)
    if not trains:
        logger.warning("예약 가능한 열차가 없습니다")
        return

    choice = select_trains(trains)
    if choice is None or not choice["trains"]:
        logger.warning("선택한 열차가 없습니다!")
        return

    options = select_options()
    if options is None:
        logger.warning("예매 정보 입력 중 취소되었습니다")
        return

    run_reserve_loop(params, passengers, choice, options, debug=debug)



def do_reserve(rail, train, passengers, options):
    reserve_info = rail.reserve(
        train, passengers=passengers, option=options["type"]
    )
    msg = f"{reserve_info}"
    if hasattr(reserve_info, "tickets") and reserve_info.tickets:
        msg += "\n" + "\n".join(map(str, reserve_info.tickets))

    logger.info(f"예매 성공!!! {msg}")
    if (
        options["pay"]
        and not reserve_info.is_waiting
        and pay_card(rail, reserve_info)
    ):
        logger.info("결제 성공!!!")
        msg += "\n결제 완료"
    send_telegram(msg)


def _reserve(rail, trains, passengers, stype, debug=False):
    for i, train in enumerate(trains):
        logger.info(f"Checking train {i+1}/{len(trains)}: {train}")
        if is_seat_available(train, stype):
            logger.info(f"Seat available for {train}. Reserving...")
            try:
                reserve_info = rail.reserve(train, passengers=passengers, option=stype)
                logger.info(f"Reservation success: {reserve_info}")
                return reserve_info, train
            except Exception as e:
                logger.error(f"Reservation failed for {train}: {str(e)}")
    return None, None


def run_reserve_loop(params, passengers, choice, options, debug=False):

    rail = login(debug=debug)
    i_try = 0
    start_time = time.time()


    while True:
        try:
            i_try += 1
            show_waiting(i_try, start_time)
            trains = rail.search_train(**params)
            target_trains = [trains[idx] for idx in choice["trains"]]
            res, train = _reserve(rail, target_trains, passengers, options["type"])
            if res:
                do_reserve(rail, train, passengers, options)
                return
            
            # If no seats found, wait with backoff but reset on success/found
            # For simplicity in this loop, we can just use a constant small sleep or jitter
            time.sleep(1 + random.random()) 
        except Exception as ex:
            should_continue, rail = handle_booking_exception(ex, rail, debug)
            if not should_continue:
                return
            # On exception (like session timeout), we use exponential backoff
            sleep_with_backoff(i_try % 5) # Cap backoff to 5 attempts cycle to avoid too long wait in macro
