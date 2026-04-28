import pytest
from unittest.mock import patch, MagicMock
from click.testing import CliRunner
from src.cli.main import skimbleshanks, set_station, set_telegram, set_card, edit_station


def test_set_station_success():
    with patch("src.cli.main.inquirer.prompt") as mock_prompt, \
         patch("src.services.config_store.save_station") as mock_save:
        mock_prompt.return_value = {"stations": ["수서", "부산"]}
        mock_save.return_value = "수서,부산"
        
        assert set_station() is True
        mock_save.assert_called()

@patch("src.services.notifications.send_telegram")
def test_cli_main_menu(mock_send):
    runner = CliRunner()
    # Looking at the code: choice_idx = inquirer.list_input(...)
    with patch("src.cli.main.inquirer.list_input") as mock_list:
        mock_list.return_value = None # Should break the loop
        result = runner.invoke(skimbleshanks)
        assert result.exit_code == 0

def test_set_telegram():
    with patch("src.cli.main.inquirer.prompt") as mock_prompt, \
         patch("src.cli.main.configure_telegram") as mock_config:
        mock_prompt.return_value = {"token": "t", "chat_id": "c"}
        mock_config.return_value = True
        assert set_telegram() is True

def test_set_card():
    with patch("src.cli.main.inquirer.prompt") as mock_prompt, \
         patch("src.services.config_store.save_card") as mock_save:
        mock_prompt.return_value = {"number": "123", "password": "45"}
        set_card()
        assert mock_save.called

def test_edit_station():
    with patch("src.cli.main.inquirer.prompt") as mock_prompt, \
         patch("src.services.config_store.save_station") as mock_save:
        mock_prompt.return_value = {"stations": "수서,대전"}
        assert edit_station() is True
