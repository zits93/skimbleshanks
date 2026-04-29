import pytest
from unittest.mock import MagicMock
import keyring

@pytest.fixture(autouse=True)
def mock_keyring(monkeypatch):
    mock_db = {}

    def set_password(service, username, password):
        mock_db[(service, username)] = password

    def get_password(service, username):
        return mock_db.get((service, username))

    def delete_password(service, username):
        if (service, username) in mock_db:
            del mock_db[(service, username)]
        else:
            raise keyring.errors.PasswordDeleteError("Not found")

    monkeypatch.setattr(keyring, "set_password", set_password)
    monkeypatch.setattr(keyring, "get_password", get_password)
    monkeypatch.setattr(keyring, "delete_password", delete_password)
    
    # Mock errors as well if needed
    monkeypatch.setattr(keyring.errors, "PasswordDeleteError", type("PasswordDeleteError", (Exception,), {}))
    
    return mock_db
