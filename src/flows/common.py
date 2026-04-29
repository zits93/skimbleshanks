from ..adapters.rail import login_client
from ..providers.srt import SRTError
from ..services import config_store
from ..services.logger import logger
import inquirer


def set_login(debug=False):
    credentials = config_store.get_login("SRT")

    login_info = inquirer.prompt(
        [
            inquirer.Text(
                "id",
                message="SRT 계정 아이디 (멤버십 번호, 이메일, 전화번호)",
                default=credentials["id"],
            ),
            inquirer.Password(
                "pass",
                message="SRT 계정 패스워드",
                default=credentials["pass"],
            ),
        ]
    )
    if not login_info:
        return False

    try:
        login_client(login_info["id"], login_info["pass"], debug)
        config_store.save_login("SRT", login_info["id"], login_info["pass"])
        logger.info(f"계정 정보가 저장되었습니다: {login_info['id']}")
        return True
    except SRTError as err:
        logger.error(f"로그인 실패: {str(err)}")
        config_store.clear_login_ok("SRT")
        return False


def login(debug=False):
    if not config_store.has_login("SRT"):
        set_login(debug=debug)

    user_id, password = config_store.get_login_values("SRT")
    return login_client(user_id, password, debug=debug)


def pay_card(rail, reservation) -> bool:
    card_info = config_store.get_card_payment_info()
    if not card_info:
        return False

    number, password, birthday, expire = card_info
    return rail.pay_with_card(
        reservation,
        number,
        password,
        birthday,
        expire,
        0,
        "J" if len(birthday) == 6 else "S",
    )
