import pytest
from unittest.mock import patch, MagicMock
from src.providers.srt import (
    Adult, Child, Senior, Disability1To3, Disability4To6, 
    Passenger, SRTError, SRTTrain, SRTResponseData, SRT
)

def test_passenger_creation():
    adult = Adult(2)
    assert adult.name == "어른/청소년"
    assert adult.count == 2
    assert repr(adult) == "어른/청소년 2명"

    child = Child(1)
    assert child.name == "어린이"
    assert child.count == 1

def test_passenger_addition():
    a1 = Adult(1)
    a2 = Adult(2)
    combined = a1 + a2
    assert combined.count == 3
    assert isinstance(combined, Adult)

    with pytest.raises(TypeError):
        a1 + Child(1)

def test_passenger_combine():
    passengers = [Adult(1), Adult(2), Child(1), Senior(1), Child(2)]
    combined = Passenger.combine(passengers)
    
    # Sort by class name to check
    combined.sort(key=lambda x: x.__class__.__name__)
    
    assert len(combined) == 3
    assert isinstance(combined[0], Adult)
    assert combined[0].count == 3
    assert isinstance(combined[1], Child)
    assert combined[1].count == 3
    assert isinstance(combined[2], Senior)
    assert combined[2].count == 1

def test_passenger_total_count():
    passengers = [Adult(2), Child(3)]
    assert Passenger.total_count(passengers) == "5"

def test_srt_error():
    err = SRTError("Test Message")
    assert str(err) == "Test Message"
    assert err.msg == "Test Message"

def test_srt_train():
    data = {
        "stlbTrnClsfCd": "17",
        "trnNo": "301",
        "dptDt": "20240101",
        "dptTm": "120000",
        "dptRsStnCd": "0551",
        "dptStnRunOrdr": "1",
        "dptStnConsOrdr": "1",
        "arvDt": "20240101",
        "arvTm": "140000",
        "arvRsStnCd": "0015",
        "arvStnRunOrdr": "5",
        "arvStnConsOrdr": "5",
        "gnrmRsvPsbStr": "예약가능",
        "sprmRsvPsbStr": "매진",
        "rsvWaitPsbCdNm": "예약대기",
        "rsvWaitPsbCd": "9"
    }
    train = SRTTrain(data)
    assert train.train_name == "SRT"
    assert train.dep_station_name == "수서"
    assert train.arr_station_name == "동대구"
    assert train.general_seat_available() is True
    assert train.special_seat_available() is False
    assert train.reserve_standby_available() is True
    assert "SRT 301" in str(train)

def test_srt_response_data():
    import json
    # Success case
    resp_success = json.dumps({
        "resultMap": [{"strResult": "SUCC", "msgTxt": "성공"}]
    })
    data = SRTResponseData(resp_success)
    assert data.success() is True
    assert data.message() == "성공"

    # Fail case
    resp_fail = json.dumps({
        "resultMap": [{"strResult": "FAIL", "msgTxt": "실패"}]
    })
    data = SRTResponseData(resp_fail)
    assert data.success() is False
    assert data.message() == "실패"

def test_srt_login():
    import json
    with patch('src.providers.srt.curl_cffi.Session') as mock_session:
        mock_instance = mock_session.return_value
        # Mock successful login response
        mock_instance.post.return_value.text = json.dumps({
            "userMap": {
                "MB_CRD_NO": "12345",
                "CUST_NM": "홍길동",
                "MBL_PHONE": "010-1234-5678"
            }
        })
        
        srt = SRT("user", "pass", auto_login=False)
        assert srt.login() is True
        assert srt.is_login is True
        assert srt.membership_name == "홍길동"

def test_srt_search_train():
    import json
    with patch('src.providers.srt.curl_cffi.Session') as mock_session, \
         patch('src.providers.srt.NetFunnelHelper.run', return_value="fake_key"):
        mock_instance = mock_session.return_value
        # Mock search response
        mock_instance.post.return_value.text = json.dumps({
            "resultMap": [{"strResult": "SUCC", "msgTxt": "성공"}],
            "outDataSets": {
                "dsOutput1": [
                    {
                        "stlbTrnClsfCd": "17",
                        "trnNo": "301",
                        "dptDt": "20240101", "dptTm": "120000",
                        "dptRsStnCd": "0551", "dptStnRunOrdr": "1", "dptStnConsOrdr": "1",
                        "arvDt": "20240101", "arvTm": "140000",
                        "arvRsStnCd": "0015", "arvStnRunOrdr": "5", "arvStnConsOrdr": "5",
                        "gnrmRsvPsbStr": "예약가능", "sprmRsvPsbStr": "매진",
                        "rsvWaitPsbCdNm": "예약대기", "rsvWaitPsbCd": "9"
                    }
                ]
            }
        })
        
        srt = SRT("user", "pass", auto_login=False)
        srt.is_login = True
        trains = srt.search_train("수서", "동대구", "20300101", "120000")
        assert len(trains) == 1
        assert trains[0].train_number == "301"

def test_srt_reserve():
    import json
    with patch('src.providers.srt.curl_cffi.Session') as mock_session, \
         patch('src.providers.srt.NetFunnelHelper.run', return_value="fake_key"):
        mock_instance = mock_session.return_value
        # Mock reserve response
        mock_instance.post.return_value.text = json.dumps({
            "resultMap": [{"strResult": "SUCC", "msgTxt": "성공"}],
            "reservListMap": [{"pnrNo": "1234567890"}],
            "outDataSets": {
                "dsOutput0": [{"pnrNo": "1234567890", "rcvdAmt": "30000", "seatNum": "1"}]
            }
        })
        
        srt = SRT("user", "pass", auto_login=False)
        srt.is_login = True
        train_data = {
            "stlbTrnClsfCd": "17", "trnNo": "301",
            "dptDt": "20240101", "dptTm": "120000",
            "dptRsStnCd": "0551", "arvRsStnCd": "0015",
            "arvDt": "20240101", "arvTm": "140000",
            "dptStnRunOrdr": "1", "dptStnConsOrdr": "1",
            "arvStnRunOrdr": "5", "arvStnConsOrdr": "5",
            "gnrmRsvPsbStr": "예약가능", "sprmRsvPsbStr": "매진",
            "rsvWaitPsbCdNm": "예약대기", "rsvWaitPsbCd": "9"
        }
        train = SRTTrain(train_data)
        
        mock_ticket = MagicMock()
        mock_ticket.reservation_number = "1234567890"
        with patch('src.providers.srt.SRT.get_reservations', return_value=[mock_ticket]):
            res = srt.reserve(train)
            assert res.reservation_number == "1234567890"

def test_srt_get_reservations():
    import json
    with patch('src.providers.srt.curl_cffi.Session') as mock_session:
        mock_instance = mock_session.return_value
        mock_instance.post.return_value.text = json.dumps({
            "resultMap": [{"strResult": "SUCC"}],
            "trainListMap": [{"pnrNo": "12345", "rcvdAmt": "30000", "seatNum": "1"}],
            "payListMap": [{
                "stlFlg": "N", "stlbTrnClsfCd": "17", "trnNo": "301",
                "dptDt": "20240101", "dptTm": "120000", "dptRsStnCd": "0551",
                "arvRsStnCd": "0015",
            }],
        })
        srt = SRT("user", "pass", auto_login=False)
        srt.is_login = True
        with patch('src.providers.srt.SRT.ticket_info', return_value=[]):
            res = srt.get_reservations()
            assert len(res) == 1
            assert res[0].reservation_number == "12345"

def test_srt_cancel():
    import json
    with patch('src.providers.srt.curl_cffi.Session') as mock_session:
        mock_instance = mock_session.return_value
        mock_instance.post.return_value.text = json.dumps({
            "resultMap": [{"strResult": "SUCC", "msgTxt": "취소성공"}]
        })
        srt = SRT("user", "pass", auto_login=False)
        srt.is_login = True
        res_obj = MagicMock()
        res_obj.reservation_number = "12345"
        res = srt.cancel(res_obj)
        assert res is True

def test_srt_refund():
    import json
    with patch('src.providers.srt.curl_cffi.Session') as mock_session:
        mock_instance = mock_session.return_value
        mock_instance.post.return_value.text = json.dumps({
            "resultMap": [{"strResult": "SUCC", "msgTxt": "환불성공"}]
        })
        srt = SRT("user", "pass", auto_login=False)
        srt.is_login = True
        res_obj = MagicMock()
        res_obj.reservation_number = "12345"
        # mock reserve_info call inside refund
        mock_info = {"pnrNo": "12345", "ogtkSaleDt": "20240101", "ogtkSaleWctNo": "1", "ogtkSaleSqno": "1", "ogtkRetPwd": "password", "buyPsNm": "user"}
        with patch('src.providers.srt.SRT.reserve_info', return_value=mock_info):
            res = srt.refund(res_obj)
            assert res is True

def create_mock_train_data():
    return {
        "stlbTrnClsfCd": "17", "trnNo": "301",
        "dptDt": "20300101", "dptTm": "120000", "dptRsStnCd": "0551",
        "arvDt": "20300101", "arvTm": "143000", "arvRsStnCd": "0015",
        "genRsvCd": "11", "spnRsvCd": "11",
        "dptStnRunOrdr": "1", "arvStnRunOrdr": "2",
        "dptStnConsOrdr": "1", "arvStnConsOrdr": "2",
        "gnrmRsvPsbStr": "예약가능", "sprmRsvPsbStr": "매진",
        "rsvWaitPsbCdNm": "가능", "rsvWaitPsbCd": "9"
    }

def test_srt_search_train():
    import json
    with patch('src.providers.srt.curl_cffi.Session') as mock_session:
        mock_instance = mock_session.return_value
        mock_instance.post.return_value.text = json.dumps({
            "resultMap": [{"strResult": "SUCC"}],
            "outDataSets": {
                "dsOutput1": [create_mock_train_data()]
            }
        })
        srt = SRT("user", "pass", auto_login=False)
        srt.is_login = True
        with patch('src.providers.srt.NetFunnelHelper.run', return_value="netfunnel_key"):
            trains = srt.search_train("수서", "부산", "20300101", "120000")
            assert len(trains) == 1
            assert trains[0].train_number == "301"

def test_srt_reserve():
    import json
    from src.providers.srt import SRTTrain
    with patch('src.providers.srt.curl_cffi.Session') as mock_session:
        mock_instance = mock_session.return_value
        mock_instance.post.return_value.text = json.dumps({
            "resultMap": [{"strResult": "SUCC"}],
            "trainListMap": [{"pnrNo": "12345", "rcvdAmt": "30000", "seatNum": "1"}],
            "reservListMap": [{"pnrNo": "12345"}],
            "payListMap": [{

                "stlFlg": "N", "stlbTrnClsfCd": "17", "trnNo": "301",
                "dptDt": "20300101", "dptTm": "120000", "dptRsStnCd": "0551",
                "arvRsStnCd": "0015",
            }],
        })
        srt = SRT("user", "pass", auto_login=False)
        srt.is_login = True
        train = SRTTrain(create_mock_train_data())
        
        with patch('src.providers.srt.SRT.ticket_info', return_value=[]), \
             patch('src.providers.srt.NetFunnelHelper.run', return_value="netfunnel_key"):
            res = srt.reserve(train)
            assert res.reservation_number == "12345"

def test_srt_login():
    import json
    with patch('src.providers.srt.curl_cffi.Session') as mock_session:
        mock_instance = mock_session.return_value
        mock_instance.post.return_value.text = json.dumps({
            "resultMap": [{"strResult": "SUCC"}],
            "userMap": {"CUST_NM": "Test User", "MB_CRD_NO": "1234567890", "MBL_PHONE": "010-1234-5678"}
        })



        srt = SRT("user", "pass", auto_login=False)
        assert srt.login() is True

def test_srt_logout():
    with patch('src.providers.srt.curl_cffi.Session') as mock_session:
        srt = SRT("user", "pass", auto_login=False)
        srt.is_login = True
        assert srt.logout() is True
        assert srt.is_login is False

def test_srt_ticket_info():
    import json
    with patch('src.providers.srt.curl_cffi.Session') as mock_session:
        mock_instance = mock_session.return_value
        mock_instance.post.return_value.text = json.dumps({
            "resultMap": [{"strResult": "SUCC"}],
            "trainListMap": [{"pnrNo": "12345", "scarNo": "1", "seatNo": "1A", "psrmClCd": "1", "dcntKndCd": "1", "rcvdAmt": "30000", "stdrPrc": "30000", "dcntPrc": "0"}],
            "payListMap": [{"pnrNo": "12345"}]
        })


        srt = SRT("user", "pass", auto_login=False)
        srt.is_login = True
        res = srt.ticket_info("12345")
        assert len(res) == 1
        assert res[0].seat == "1A"

def test_srt_get_reservations():
    import json
    with patch('src.providers.srt.curl_cffi.Session') as mock_session:
        mock_instance = mock_session.return_value
        mock_instance.post.return_value.text = json.dumps({
            "resultMap": [{"strResult": "SUCC"}],
            "trainListMap": [{"pnrNo": "12345", "rcvdAmt": "30000", "seatNum": "1", "dptDt": "20300101", "dptTm": "120000", "dptRsStnCd": "0551", "arvRsStnCd": "0015", "stlbTrnClsfCd": "17", "trnNo": "301", "arvDt": "20300101", "arvTm": "143000"}],
            "payListMap": [{
                "stlFlg": "N", "stlbTrnClsfCd": "17", "trnNo": "301",
                "dptDt": "20300101", "dptTm": "120000", "dptRsStnCd": "0551",
                "arvRsStnCd": "0015", "arvDt": "20300101", "arvTm": "143000"
            }]
        })




        srt = SRT("user", "pass", auto_login=False)
        srt.is_login = True
        with patch('src.providers.srt.SRT.ticket_info', return_value=[]):
            res = srt.get_reservations()
            assert len(res) == 1


def test_srt_cancel():
    import json
    with patch('src.providers.srt.curl_cffi.Session') as mock_session:
        mock_instance = mock_session.return_value
        mock_instance.post.return_value.text = json.dumps({
            "resultMap": [{"strResult": "SUCC"}]
        })
        srt = SRT("user", "pass", auto_login=False)
        srt.is_login = True
        res_obj = MagicMock()
        res_obj.reservation_number = "12345"
        assert srt.cancel(res_obj) is True

def test_passengers():
    from src.providers.srt import Adult, Child, Senior, Disability1To3, Disability4To6
    assert Adult().count == 1
    assert Child().count == 1
    assert Senior().count == 1
    assert Disability1To3().count == 1
    assert Disability4To6().count == 1




def test_srt_ticket():
    from src.providers.srt import SRTTicket
    data = {
        "scarNo": "5",
        "seatNo": "10A",
        "psrmClCd": "1",
        "dcntKndCd": "1",
        "rcvdAmt": "30000",
        "stdrPrc": "30000",
        "dcntPrc": "0"
    }
    ticket = SRTTicket(data)
    assert ticket.car == "5"
    assert ticket.seat == "10A"
    assert "일반실" in str(ticket)



