import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from src.services.notifications import send_telegram, configure_telegram

@patch("src.services.notifications.get_telegram_credentials")
@patch("src.services.notifications.telegram.Bot")
def test_send_telegram(mock_bot, mock_creds):
    mock_creds.return_value = ("token", "chat_id")
    
    # Mock bot async context manager
    mock_bot_instance = mock_bot.return_value
    mock_bot_instance.__aenter__.return_value = mock_bot_instance
    mock_bot_instance.send_message = AsyncMock()

    send_telegram("Hello")
    
    mock_bot_instance.send_message.assert_called_with(chat_id="chat_id", text="Hello")

@patch("src.services.notifications.set_telegram_credentials")
@patch("src.services.notifications.send_telegram")
def test_configure_telegram_success(mock_send, mock_set):
    res = configure_telegram("token", "chat_id")
    assert res is True
    mock_set.assert_called_with("token", "chat_id")
    mock_send.assert_called_with("[SKIMBLESHANKS] 텔레그램 설정 완료")

@patch("src.services.notifications.set_telegram_credentials")
@patch("src.services.notifications.send_telegram")
def test_configure_telegram_fail(mock_send, mock_set):
    mock_send.side_effect = Exception("Fail")
    res = configure_telegram("token", "chat_id")
    assert res is False
