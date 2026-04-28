import re
from typing import List, Tuple

import keyring


class Storage:
    def get(self, service: str, key: str) -> str | None:
        raise NotImplementedError

    def set(self, service: str, key: str, value: str) -> None:
        raise NotImplementedError

    def delete(self, service: str, key: str) -> None:
        raise NotImplementedError


class KeyringStorage(Storage):
    def get(self, service: str, key: str) -> str | None:
        return keyring.get_password(service, key)

    def set(self, service: str, key: str, value: str) -> None:
        keyring.set_password(service, key, value)

    def delete(self, service: str, key: str) -> None:
        try:
            keyring.delete_password(service, key)
        except keyring.errors.PasswordDeleteError:
            pass


storage = KeyringStorage()


def get_station(
    stations_map: dict, default_stations: dict, rail_type: str
) -> Tuple[List[str], List[str]]:
    stations = stations_map[rail_type]
    station_key = storage.get(rail_type, "station")

    if not station_key:
        return stations, default_stations[rail_type]

    valid_keys = [x for x in station_key.split(",")]
    return stations, valid_keys


def save_station(rail_type: str, selected: List[str]) -> str:
    selected_stations = ",".join(selected)
    storage.set(rail_type, "station", selected_stations)
    return selected_stations


def get_station_value(rail_type: str) -> str:
    return storage.get(rail_type, "station") or ""


def sanitize_station_input(
    selected: str, default_stations: dict, rail_type: str
) -> List[str]:
    stations = [s.strip() for s in selected.split(",")]
    hangul = re.compile("[가-힣]+")
    for station in stations:
        if not hangul.search(station):
            return default_stations[rail_type]
    return stations


def set_options(options: List[str]) -> None:
    storage.set("SRT", "options", ",".join(options))


def get_options() -> List[str]:
    options = storage.get("SRT", "options") or ""
    return options.split(",") if options else []


def get_telegram_credentials() -> tuple[str, str]:
    token = storage.get("telegram", "token") or ""
    chat_id = storage.get("telegram", "chat_id") or ""
    return token, chat_id


def set_telegram_credentials(token: str, chat_id: str) -> None:
    storage.set("telegram", "ok", "1")
    storage.set("telegram", "token", token)
    storage.set("telegram", "chat_id", chat_id)


def clear_telegram_ok() -> None:
    try:
        storage.delete("telegram", "ok")
    except Exception:
        pass


def get_card() -> dict:
    return {
        "number": storage.get("card", "number") or "",
        "password": storage.get("card", "password") or "",
        "birthday": storage.get("card", "birthday") or "",
        "expire": storage.get("card", "expire") or "",
    }


def save_card(card_info: dict) -> None:
    for key, value in card_info.items():
        storage.set("card", key, value)
    storage.set("card", "ok", "1")


def get_card_payment_info() -> tuple[str, str, str, str] | None:
    if not storage.get("card", "ok"):
        return None
    return (
        storage.get("card", "number"),
        storage.get("card", "password"),
        storage.get("card", "birthday"),
        storage.get("card", "expire"),
    )


def get_login(rail_type: str) -> dict:
    return {
        "id": storage.get(rail_type, "id") or "",
        "pass": storage.get(rail_type, "pass") or "",
    }


def save_login(rail_type: str, user_id: str, password: str) -> None:
    storage.set(rail_type, "id", user_id)
    storage.set(rail_type, "pass", password)
    storage.set(rail_type, "ok", "1")


def clear_login_ok(rail_type: str) -> None:
    try:
        storage.delete(rail_type, "ok")
    except Exception:
        pass


def has_login(rail_type: str) -> bool:
    return (
        storage.get(rail_type, "id") is not None
        and storage.get(rail_type, "pass") is not None
    )


def get_login_values(rail_type: str) -> tuple[str | None, str | None]:
    return storage.get(rail_type, "id"), storage.get(rail_type, "pass")


def get_reserve_defaults(rail_type: str, today: str, is_srt: bool) -> dict:
    return {
        "departure": storage.get(rail_type, "departure")
        or ("수서" if is_srt else "서울"),
        "arrival": storage.get(rail_type, "arrival") or "동대구",
        "date": storage.get(rail_type, "date") or today,
        "time": storage.get(rail_type, "time") or "120000",
        "adult": int(storage.get(rail_type, "adult") or 1),
        "child": int(storage.get(rail_type, "child") or 0),
        "senior": int(storage.get(rail_type, "senior") or 0),
        "disability1to3": int(storage.get(rail_type, "disability1to3") or 0),
        "disability4to6": int(storage.get(rail_type, "disability4to6") or 0),
    }


def save_reserve_preferences(rail_type: str, info: dict) -> None:
    for key, value in info.items():
        storage.set(rail_type, key, str(value))
