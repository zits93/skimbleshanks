import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.api.app import app

client = TestClient(app)
API_KEY = "skimbleshanks-default-key"

@pytest.fixture(autouse=True)
def mock_api_key():
    with patch("src.api.app.API_KEY", API_KEY):
        yield

@pytest.fixture
def auth_headers():
    return {"X-API-KEY": API_KEY}

def test_api_unauthorized():
    response = client.get("/api/config")
    assert response.status_code == 403

def test_api_get_config(auth_headers):
    with patch("src.services.config_store.has_login", return_value=True):
        response = client.get("/api/config", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["srt_logged_in"] is True

@patch("src.api.app.login_client")
def test_api_login_success(mock_login, auth_headers):
    mock_instance = MagicMock()
    mock_instance.is_login = True
    mock_login.return_value = mock_instance
    
    response = client.post(
        "/api/login", 
        headers=auth_headers,
        json={"user_id": "test", "password": "password"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Login successful"

@patch("src.api.app._login")
def test_api_search_trains(mock_login_helper, auth_headers):
    mock_rail = MagicMock()
    mock_rail.is_login = True
    mock_login_helper.return_value = mock_rail
    
    # Mock search result
    train = MagicMock()
    train.train_name = "SRT"
    train.train_number = "301"
    train.dep_time = "20240101120000"
    train.arr_time = "20240101140000"
    train.special_seat_state = "매진"
    train.general_seat_state = "예약가능"
    mock_rail.search_train.return_value = [train]
    
    response = client.post(
        "/api/search",
        headers=auth_headers,
        json={
            "dep": "수서", "arr": "동대구", 
            "date": "20300101", "time": "120000",
            "adults": 1
        }
    )
    assert response.status_code == 200
    assert len(response.json()["trains"]) == 1
    assert response.json()["trains"][0]["train_name"] == "SRT 301"

@patch("src.api.app._login")
@patch("src.api.app.send_telegram")
def test_api_reserve_success(mock_send, mock_login_helper, auth_headers):
    mock_rail = MagicMock()

    mock_rail.is_login = True
    mock_login_helper.return_value = mock_rail
    
    # Mock search
    train = MagicMock()
    train.train_name = "SRT"
    train.train_number = "301"
    train.seat_available.return_value = True
    mock_rail.search_train.return_value = [train]
    
    # Mock reservation
    mock_rail.reserve.return_value = MagicMock()
    
    response = client.post(
        "/api/reserve",
        headers=auth_headers,
        json={
            "dep": "수서", "arr": "동대구", 
            "date": "20300101", "time": "120000",
            "adults": 1,
            "targets": [{"train_name": "SRT 301", "seat_type": "GENERAL_FIRST"}]
        }
    )
    assert response.status_code == 200
    assert response.json()["success"] is True

