import pytest
from unittest.mock import MagicMock
from src.adapters.rail import is_seat_available, SeatType

def test_is_seat_available_logic():
    train = MagicMock()
    
    # Both available
    train.seat_available.return_value = True
    train.general_seat_available.return_value = True
    train.special_seat_available.return_value = True
    
    assert is_seat_available(train, SeatType.GENERAL_FIRST) is True
    assert is_seat_available(train, SeatType.GENERAL_ONLY) is True
    assert is_seat_available(train, SeatType.SPECIAL_ONLY) is True

    # Only general available
    train.special_seat_available.return_value = False
    assert is_seat_available(train, SeatType.SPECIAL_ONLY) is False
    assert is_seat_available(train, SeatType.GENERAL_ONLY) is True
    
    # Sold out but standby possible
    train.seat_available.return_value = False
    train.reserve_standby_available.return_value = True
    assert is_seat_available(train, SeatType.GENERAL_ONLY) is True
