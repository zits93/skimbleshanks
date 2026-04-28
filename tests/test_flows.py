import pytest
from unittest.mock import patch, MagicMock
from src.flows.common import set_login
from src.flows.booking import reserve, _reserve, do_reserve, get_search_params, select_trains, select_options, handle_booking_exception, run_reserve_loop
from src.flows.reservation import check_reservation






@patch("src.flows.common.inquirer.prompt")
@patch("src.flows.common.login_client")
@patch("src.services.config_store.save_login")
def test_set_login_success(mock_save, mock_login, mock_prompt):
    mock_prompt.return_value = {"id": "user", "pass": "pass"}
    mock_login.return_value = MagicMock()
    
    assert set_login() is True
    mock_save.assert_called_with("SRT", "user", "pass")

@patch("src.flows.booking.login")
@patch("src.flows.booking.show_waiting")
@patch("src.flows.booking._reserve")
@patch("src.flows.booking.do_reserve")
@patch("src.flows.booking.send_telegram")
def test_reserve_success(mock_send, mock_do, mock_inner, mock_show, mock_login):
    mock_rail = MagicMock()
    mock_login.return_value = mock_rail

    
    # Mock search
    mock_rail.search_train.return_value = [MagicMock(), MagicMock()]
    
    # Mock inner _reserve found seat
    mock_inner.return_value = (True, MagicMock())
    
    params = {"dep": "수서", "arr": "부산", "date": "20300101", "time": "120000"}
    passengers = []
    choice = {"trains": [0]}
    options = {"type": "GENERAL_ONLY"}
    
    run_reserve_loop(params, passengers, choice, options)
    
    assert mock_do.called
    assert mock_inner.called

@patch("src.flows.reservation.login")
@patch("src.flows.reservation.list_reservations")
@patch("src.flows.reservation.inquirer.list_input")
@patch("src.flows.reservation.send_telegram")
def test_check_reservation_telegram(mock_send, mock_list, mock_reservations, mock_login):
    mock_rail = MagicMock()
    mock_login.return_value = mock_rail
    
    res = MagicMock()
    res.__str__.return_value = "Reservation 1"
    res.tickets = [MagicMock()]
    mock_reservations.return_value = [res]
    
    # First call: select "Telegram"
    # Second call: loop breaks or return
    mock_list.side_effect = [-2] 
    
    check_reservation()
    
    assert mock_send.called

@patch("src.flows.reservation.login")
@patch("src.flows.reservation.list_reservations")
@patch("src.flows.reservation.inquirer.list_input")
@patch("src.flows.reservation.inquirer.confirm")
@patch("src.flows.reservation.pay_card")
def test_check_reservation_pay(mock_pay, mock_confirm, mock_list, mock_reservations, mock_login):
    mock_rail = MagicMock()
    mock_login.return_value = mock_rail
    
    res = MagicMock()
    res.paid = False # This will make is_ticket = False
    res.is_waiting = False
    mock_reservations.return_value = [res]
    
    # 0: select reservation, 1: select "Pay"
    mock_list.side_effect = [0, 1]
    
    check_reservation()
    
    assert mock_pay.called

@patch("src.flows.booking.is_seat_available")
def test_inner_reserve(mock_available):
    rail = MagicMock()
    train = MagicMock()
    passengers = []
    
    # First train not available, second is
    mock_available.side_effect = [False, True]
    rail.reserve.return_value = "Success"
    
    res, t = _reserve(rail, [MagicMock(), train], passengers, "GENERAL_ONLY")
    
    assert res == "Success"
    assert t == train

@patch("src.flows.booking.pay_card")
@patch("src.flows.booking.send_telegram")
def test_do_reserve_with_pay(mock_send, mock_pay):
    rail = MagicMock()
    train = MagicMock()
    passengers = []
    options = {"type": "GENERAL_ONLY", "pay": True}
    
    reserve_info = MagicMock()
    reserve_info.is_waiting = False
    rail.reserve.return_value = reserve_info
    
    do_reserve(rail, train, passengers, options)
    
    assert mock_pay.called
    assert mock_send.called

@patch("src.flows.booking.login")
@patch("src.flows.booking.show_waiting")
@patch("src.flows.booking._reserve")
@patch("src.flows.booking.do_reserve")
@patch("src.flows.booking.time.sleep")
@patch("src.flows.booking.send_telegram")
def test_reserve_loop(mock_send, mock_sleep, mock_do, mock_inner, mock_show, mock_login):
    mock_rail = MagicMock()
    mock_login.return_value = mock_rail
    
    # First call: None (search miss)
    # Second call: success
    mock_inner.side_effect = [(None, None), ("Success", MagicMock())]
    
    params = {"departure": "수서", "arrival": "부산", "date": "20240101", "time": "120000"}
    passengers = []
    choice = {"trains": [0]}
    options = {"type": "GENERAL_ONLY", "pay": False}
    
    run_reserve_loop(params, passengers, choice, options)
    
    assert mock_inner.call_count == 2

    assert mock_do.called
    assert mock_sleep.called

@patch("src.flows.booking.inquirer.prompt")
def test_get_search_params(mock_prompt):
    from datetime import datetime
    mock_prompt.return_value = {
        "departure": "수서", "arrival": "동대구", "date": "20240101", "time": "120000"
    }
    params = get_search_params(
        ["수서", "동대구"], 
        {"departure": "수서", "arrival": "동대구", "date": "20240101", "time": "120000", "adult": 1}, 
        datetime.now(), 
        []
    )
    assert params["departure"] == "수서"


@patch("src.flows.booking.inquirer.prompt")
def test_select_trains(mock_prompt):
    mock_prompt.return_value = {"trains": [0]}
    trains = [MagicMock()]
    res = select_trains(trains)
    assert res == {"trains": [0]}

@patch("src.flows.booking.inquirer.prompt")
def test_select_options(mock_prompt):
    mock_prompt.return_value = {"type": "GENERAL_ONLY", "pay": True}
    res = select_options()
    assert res["pay"] is True

@patch("src.flows.booking.sleep")
@patch("src.flows.booking.handle_error")
def test_handle_booking_exception_srt_error(mock_handle, mock_sleep):
    from src.adapters.rail import SRTError
    rail = MagicMock()
    ex = SRTError("잔여석없음")
    res, r = handle_booking_exception(ex, rail, False)
    assert res is True
    assert mock_sleep.called

@patch("src.flows.booking.login")
@patch("src.flows.booking.get_search_params")
def test_reserve_cancel(mock_get, mock_login):
    mock_login.return_value = MagicMock()
    mock_get.return_value = None # Cancel
    
    res = reserve()
    assert res is None

@patch("src.flows.booking.login")
@patch("src.flows.booking.get_search_params")
@patch("src.flows.booking.select_trains")
@patch("src.flows.booking.select_options")
@patch("src.flows.booking.run_reserve_loop")
def test_reserve_full_flow(mock_run, mock_opt, mock_trains, mock_get, mock_login):
    mock_login.return_value = MagicMock()
    mock_get.return_value = {
        "departure": "수서", "arrival": "부산", "date": "20300101", 
        "time": "120000", "adult": 1
    }
    mock_trains.return_value = {"trains": [0]}
    mock_opt.return_value = {"type": "GENERAL_ONLY", "pay": False}
    
    reserve()
    assert mock_run.called








