import inquirer
import click
from termcolor import colored
import sys
from pathlib import Path

# 패키지 상위 디렉토리를 path에 추가하여 직접 실행 지원
if __name__ == "__main__" and not __package__:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from src.flows.booking import reserve
from src.flows.common import set_login
from src.flows.reservation import check_reservation
from src.services import config_store
from src.services.notifications import configure_telegram

from src.constants import STATIONS, DEFAULT_STATIONS
from src.services.logger import logger


def set_station() -> bool:
    _, default_station_key = config_store.get_station(
        {"SRT": STATIONS}, {"SRT": DEFAULT_STATIONS}, "SRT"
    )
    station_info = inquirer.prompt(
        [
            inquirer.Checkbox(
                "stations",
                message="역 선택 (↕:이동, Space: 선택, Enter: 완료, Ctrl-A: 전체선택, Ctrl-R: 선택해제, Ctrl-C: 취소)",
                choices=STATIONS,
                default=default_station_key,
            )
        ]
    )
    if not station_info:
        return False
    if not (selected := station_info["stations"]):
        logger.warning("선택된 역이 없습니다.")
        return False
    logger.info(f"선택된 역: {config_store.save_station('SRT', selected)}")
    return True


def edit_station() -> bool:
    station_info = inquirer.prompt(
        [
            inquirer.Text(
                "stations",
                message="역 수정 (예: 수서,대전,동대구)",
                default=config_store.get_station_value("SRT"),
            )
        ]
    )
    if not station_info:
        return False
    if not (selected := station_info["stations"]):
        logger.warning("선택된 역이 없습니다.")
        return False

    stations = config_store.sanitize_station_input(
        selected, {"SRT": DEFAULT_STATIONS}, "SRT"
    )
    if stations != [s.strip() for s in selected.split(",")]:
        logger.warning("잘못된 역 입력이 있어 기본 역으로 설정합니다.")
    logger.info(f"선택된 역: {config_store.save_station('SRT', stations)}")
    return True


def set_options():
    default_options = config_store.get_options()
    choices = inquirer.prompt(
        [
            inquirer.Checkbox(
                "options",
                message="예매 옵션 선택 (Space: 선택, Enter: 완료, Ctrl-A: 전체선택, Ctrl-R: 선택해제, Ctrl-C: 취소)",
                choices=[
                    ("어린이", "child"),
                    ("경로우대", "senior"),
                    ("중증장애인", "disability1to3"),
                    ("경증장애인", "disability4to6"),
                ],
                default=default_options,
            )
        ]
    )
    if choices is not None:
        config_store.set_options(choices.get("options", []))


def set_telegram() -> bool:
    token, chat_id = config_store.get_telegram_credentials()
    telegram_info = inquirer.prompt(
        [
            inquirer.Text(
                "token",
                message="텔레그램 token (Enter: 완료, Ctrl-C: 취소)",
                default=token,
            ),
            inquirer.Text(
                "chat_id",
                message="텔레그램 chat_id (Enter: 완료, Ctrl-C: 취소)",
                default=chat_id,
            ),
        ]
    )
    if not telegram_info:
        return False
    if not configure_telegram(telegram_info["token"], telegram_info["chat_id"]):
        logger.error("텔레그램 설정에 실패했습니다.")
        return False
    logger.info("텔레그램 설정이 완료되었습니다.")
    return True


def set_card() -> None:
    card_info = config_store.get_card()
    answers = inquirer.prompt(
        [
            inquirer.Password(
                "number",
                message="신용카드 번호 (하이픈 제외(-), Enter: 완료, Ctrl-C: 취소)",
                default=card_info["number"],
            ),
            inquirer.Password(
                "password",
                message="카드 비밀번호 앞 2자리 (Enter: 완료, Ctrl-C: 취소)",
                default=card_info["password"],
            ),
            inquirer.Password(
                "birthday",
                message="생년월일 (YYMMDD) / 사업자등록번호 (Enter: 완료, Ctrl-C: 취소)",
                default=card_info["birthday"],
            ),
            inquirer.Password(
                "expire",
                message="카드 유효기간 (YYMM, Enter: 완료, Ctrl-C: 취소)",
                default=card_info["expire"],
            ),
        ]
    )
    if answers:
        config_store.save_card(answers)


@click.command()
@click.option("--debug", is_flag=True, help="Debug mode")
def skimbleshanks(debug=False):
    MENU_ITEMS = [
        ("예매 시작", lambda dbg: reserve(dbg, STATIONS, DEFAULT_STATIONS), True),
        ("예매 확인/결제/취소", lambda dbg: check_reservation(dbg), True),
        ("로그인 설정", lambda dbg: set_login(dbg), True),
        ("텔레그램 설정", lambda dbg: set_telegram(), False),
        ("카드 설정", lambda dbg: set_card(), False),
        ("역 설정", lambda dbg: set_station(), False),
        ("역 직접 수정", lambda dbg: edit_station(), False),
        ("예매 옵션 설정", lambda dbg: set_options(), False),
        ("나가기", None, False),
    ]

    menu_choices = [(item[0], idx) for idx, item in enumerate(MENU_ITEMS)]

    while True:
        choice_idx = inquirer.list_input(
            message="메뉴 선택 (↕:이동, Enter: 선택)", choices=menu_choices
        )
        if choice_idx is None:
            break

        title, action, _ = MENU_ITEMS[choice_idx]
        if action is None:
            break

        action(debug)


if __name__ == "__main__":
    skimbleshanks()
