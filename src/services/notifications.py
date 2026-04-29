import asyncio
from typing import Awaitable, Callable, Optional

import telegram

from .config_store import (
    clear_telegram_ok,
    get_telegram_credentials,
    set_telegram_credentials,
)


def get_telegram() -> Optional[Callable[[str], Awaitable[None]]]:
    token, chat_id = get_telegram_credentials()

    async def tgprintf(text):
        if token and chat_id:
            bot = telegram.Bot(token=token)
            async with bot:
                await bot.send_message(chat_id=chat_id, text=text)

    return tgprintf


def send_telegram(text: str) -> None:
    tgprintf = get_telegram()
    asyncio.run(tgprintf(text))


def configure_telegram(token: str, chat_id: str) -> bool:
    try:
        set_telegram_credentials(token, chat_id)
        send_telegram("[SKIMBLESHANKS] 텔레그램 설정 완료")
        return True
    except Exception:
        clear_telegram_ok()
        return False
