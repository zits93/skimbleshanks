import pytest
from unittest.mock import patch, MagicMock
from src.flows.common import set_login, login, pay_card

@patch("src.flows.common.inquirer.prompt")
@patch("src.flows.common.login_client")
@patch("src.services.config_store.get_login")
@patch("src.services.config_store.save_login")
def test_set_login_success(mock_save, mock_get, mock_client, mock_prompt):
    mock_get.return_value = {"id": "user", "pass": "pass"}
    mock_prompt.return_value = {"id": "user2", "pass": "pass2"}
    
    assert set_login() is True
    assert mock_save.called

@patch("src.flows.common.login_client")
@patch("src.services.config_store.has_login")
@patch("src.services.config_store.get_login_values")
def test_login(mock_get, mock_has, mock_client):
    mock_has.return_value = True
    mock_get.return_value = ("user", "pass")
    
    login()
    assert mock_client.called

@patch("src.services.config_store.get_card_payment_info")
def test_pay_card(mock_get):
    mock_get.return_value = ("1234", "56", "900101", "2512")
    rail = MagicMock()
    pay_card(rail, MagicMock())
    assert rail.pay_with_card.called
