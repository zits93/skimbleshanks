import pytest
from unittest.mock import patch, MagicMock
from src.services.retry_policy import sleep, show_waiting, handle_error

@patch("src.services.retry_policy.time.sleep")
@patch("src.services.retry_policy.gammavariate")
def test_sleep(mock_gamma, mock_sleep):
    mock_gamma.return_value = 1.0
    sleep()
    mock_sleep.assert_called()

def test_show_waiting(capsys):
    show_waiting(1, 1000.0)
    captured = capsys.readouterr()
    assert "예매 대기 중..." in captured.out

@patch("src.services.retry_policy.send_telegram")
@patch("src.services.retry_policy.inquirer.confirm")
def test_handle_error(mock_confirm, mock_send):
    mock_confirm.return_value = True
    res = handle_error(Exception("test"))
    assert res is True
    assert mock_send.called
