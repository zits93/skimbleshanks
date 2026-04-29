import pytest
from unittest.mock import MagicMock
from src.services import config_store

@pytest.fixture
def mock_storage(monkeypatch):
    mock = MagicMock()
    monkeypatch.setattr(config_store, "storage", mock)
    return mock

def test_save_station(mock_storage):
    assert config_store.save_station("SRT", ["수서", "부산"]) == "수서,부산"
    mock_storage.set.assert_called_with("SRT", "station", "수서,부산")

def test_telegram_config(mock_storage):
    from src.services.config_store import set_telegram_credentials, get_telegram_credentials
    set_telegram_credentials("token123", "chat456")
    mock_storage.set.assert_any_call("telegram", "token", "token123")
    
    mock_storage.get.side_effect = lambda s, k: "token123" if k == "token" else "chat456"
    token, cid = get_telegram_credentials()
    assert token == "token123"
    assert cid == "chat456"

def test_card_config(mock_storage):
    from src.services.config_store import save_card, get_card
    card = {"number": "1234", "password": "56"}
    save_card(card)
    mock_storage.set.assert_any_call("card", "number", "1234")
    
    mock_storage.get.side_effect = lambda s, k: card.get(k, "")
    res = get_card()
    assert res["number"] == "1234"

def test_login_config(mock_storage):
    from src.services.config_store import save_login, get_login, has_login
    save_login("SRT", "user1", "pass1")
    mock_storage.set.assert_any_call("SRT", "id", "user1")
    
    mock_storage.get.side_effect = lambda s, k: "user1" if k == "id" else "pass1"
    assert has_login("SRT") is True
    res = get_login("SRT")
    assert res["id"] == "user1"


def test_get_station_default(mock_storage):
    mock_storage.get.return_value = None
    stations, keys = config_store.get_station(
        {"SRT": ["수서", "부산"]}, 
        {"SRT": ["수서"]}, 
        "SRT"
    )
    assert keys == ["수서"]

def test_get_station_saved(mock_storage):
    mock_storage.get.return_value = "수서,대전"
    stations, keys = config_store.get_station(
        {"SRT": ["수서", "대전", "부산"]}, 
        {"SRT": ["수서"]}, 
        "SRT"
    )
    assert keys == ["수서", "대전"]

def test_sanitize_station_input():
    defaults = {"SRT": ["수서", "부산"]}
    
    # Valid input
    res = config_store.sanitize_station_input("수서, 부산", defaults, "SRT")
    assert res == ["수서", "부산"]
    
    # Invalid characters (not hangul)
    res = config_store.sanitize_station_input("수서, Seoul", defaults, "SRT")
    assert res == ["수서", "부산"]

def test_get_reserve_defaults(mock_storage):
    mock_storage.get.side_effect = lambda s, k: {
        "departure": "대전",
        "adult": "2"
    }.get(k)
    
    defaults = config_store.get_reserve_defaults("SRT", "20240101", True)
    assert defaults["departure"] == "대전"
    assert defaults["adult"] == 2
    assert defaults["arrival"] == "동대구" # Default in code

