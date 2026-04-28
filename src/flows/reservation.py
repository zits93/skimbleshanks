import inquirer
from termcolor import colored

from ..adapters.rail import list_reservations
from ..services.notifications import send_telegram
from .common import login, pay_card
from ..services.logger import logger


def check_reservation(debug=False):
    rail = login(debug=debug)

    while True:
        reservations = list_reservations(rail)
        all_reservations = []

        for reservation in reservations:
            reservation.is_ticket = bool(
                hasattr(reservation, "paid") and reservation.paid
            )
            all_reservations.append(reservation)

        if not reservations:
            logger.info("조회된 예약 내역이 없습니다.")
            return

        choices = [
            (str(reservation), i) for i, reservation in enumerate(all_reservations)
        ] + [
            ("텔레그램으로 예매 정보 전송", -2),
            ("돌아가기", -1),
        ]
        choice = inquirer.list_input(message="예약 취소 (Enter: 결정)", choices=choices)

        if choice in (None, -1):
            return

        if choice == -2:
            out = []
            if all_reservations:
                out.append("[ 예매 내역 ]")
                for reservation in all_reservations:
                    out.append(f"🚅{reservation}")
                    out.extend(map(str, reservation.tickets))
            if out:
                send_telegram("\n".join(out))
            return

        if (
            not all_reservations[choice].is_ticket
            and not all_reservations[choice].is_waiting
        ):
            answer = inquirer.list_input(
                message=f"결재 대기 승차권: {all_reservations[choice]}",
                choices=[("결제하기", 1), ("취소하기", 2)],
            )
            if answer == 1:
                if pay_card(rail, all_reservations[choice]):
                    logger.info(f"결제 성공: {all_reservations[choice]}")
            elif answer == 2:
                rail.cancel(all_reservations[choice])
                logger.info(f"예약 취소: {all_reservations[choice]}")
            return

        if inquirer.confirm(
            message=colored("정말 취소하시겠습니까", "green", "on_red")
        ):
            if all_reservations[choice].is_ticket:
                rail.refund(all_reservations[choice])
            else:
                rail.cancel(all_reservations[choice])
            return
