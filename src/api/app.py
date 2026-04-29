import os
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, SecretStr
from typing import List, Optional

from src.services.notifications import send_telegram
from src.services import config_store, rail_service
from src.services.logger import logger
from src.adapters.rail import login_client, is_seat_available, SeatType


app = FastAPI(title="Skimbleshanks API")

# Simple API Key from environment variable or default
API_KEY = os.getenv("SKIMBLE_API_KEY")

ALLOWED_ORIGINS_RAW = os.getenv("SKIMBLE_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:8080")
if ALLOWED_ORIGINS_RAW == "*":
    ALLOWED_ORIGINS = ["*"]
else:
    ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_RAW.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True if ALLOWED_ORIGINS != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if not API_KEY:
        logger.error("SKIMBLE_API_KEY is not set in environment variables.")
        raise HTTPException(
            status_code=500, 
            detail={"code": "ERR_CONFIG_ERROR", "message": "API Key configuration error"}
        )
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=403, 
            detail={"code": "ERR_INVALID_API_KEY", "message": "Invalid or missing API Key"}
        )
    return x_api_key

class LoginRequest(BaseModel):
    user_id: str
    password: str
    provider: str = "SRT"

class SearchRequest(BaseModel):
    dep: str
    arr: str
    date: str
    time: str
    provider: str = "SRT"
    adults: int = 1
    children: int = 0
    seniors: int = 0
    disability1to3: int = 0
    disability4to6: int = 0

class TelegramRequest(BaseModel):
    token: str
    chat_id: str

class CardConfigRequest(BaseModel):
    number: str
    password: str
    birthday: str
    expire: str

class StationConfigRequest(BaseModel):
    provider: str
    stations: List[str]

class OptionsConfigRequest(BaseModel):
    options: List[str]

@app.post("/api/telegram", dependencies=[Depends(verify_api_key)])
async def set_telegram(req: TelegramRequest):
    from src.services.notifications import configure_telegram
    success = await run_in_threadpool(configure_telegram, req.token, req.chat_id)
    if success:
        return {"message": "Telegram configured and test message sent"}
    else:
        raise HTTPException(
            status_code=400, 
            detail={"code": "ERR_TELEGRAM_CONFIG_FAILED", "message": "Failed to configure Telegram"}
        )

@app.post("/api/config/card", dependencies=[Depends(verify_api_key)])
async def save_card_config(req: CardConfigRequest):
    try:
        config_store.save_card({
            "number": req.number,
            "password": req.password,
            "birthday": req.birthday,
            "expire": req.expire
        })
        return {"message": "Card configuration saved successfully"}
    except Exception as e:
        logger.error(f"Failed to save card config: {e}")
        raise HTTPException(
            status_code=500,
            detail={"code": "ERR_SAVE_CONFIG_FAILED", "message": "카드 정보 저장에 실패했습니다."}
        )

@app.post("/api/config/stations", dependencies=[Depends(verify_api_key)])
async def save_stations_config(req: StationConfigRequest):
    try:
        config_store.save_station(req.provider, req.stations)
        return {"message": "Station preferences saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/config/options", dependencies=[Depends(verify_api_key)])
async def save_options_config(req: OptionsConfigRequest):
    try:
        config_store.set_options(req.options)
        return {"message": "Option preferences saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/logs", dependencies=[Depends(verify_api_key)])
async def get_logs(lines: int = 100):
    from src.services.logger import LOG_FILE
    if not os.path.exists(LOG_FILE):
        return {"logs": []}
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            all_lines = f.readlines()
            return {"logs": all_lines[-lines:]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ReserveTarget(BaseModel):
    train_name: str
    seat_type: str = "GENERAL_FIRST"

class ReserveRequest(SearchRequest):
    targets: List[ReserveTarget]
    auto_pay: bool = False
    card_number: SecretStr = ""
    card_password: SecretStr = ""
    card_birthday: str = ""
    card_expire: SecretStr = ""

async def _login(provider: str = "SRT"):
    user_id, password = config_store.get_login_values(provider)
    if not user_id or not password:
        logger.warning(f"No credentials found for {provider} in config_store")
        return None
    try:
        return await run_in_threadpool(login_client, user_id, password, provider=provider, debug=True)
    except Exception as e:
        logger.error(f"Auto-login failed for {provider}: {str(e)}")
        return None

@app.post("/api/login", dependencies=[Depends(verify_api_key)])
async def do_login(req: LoginRequest):
    logger.info(f"Login attempt for {req.provider} user: {req.user_id}")
    config_store.save_login(req.provider, req.user_id, req.password)
    try:
        rail = await run_in_threadpool(login_client, req.user_id, req.password, provider=req.provider, debug=True)
        if not rail or (hasattr(rail, 'is_login') and not rail.is_login) or (hasattr(rail, 'logined') and not rail.logined):
            logger.warning(f"Login failed for {req.provider} user: {req.user_id}")
            config_store.clear_login_ok(req.provider)
            raise HTTPException(
                status_code=401, 
                detail={"code": "ERR_LOGIN_FAILED", "message": "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요."}
            )
        logger.info(f"Login successful for {req.provider} user: {req.user_id}")
    except Exception as e:
        logger.error(f"Login error for {req.provider} user {req.user_id}: {str(e)}")
        config_store.clear_login_ok(req.provider)
        raise HTTPException(
            status_code=401, 
            detail={"code": "ERR_LOGIN_ERROR", "message": f"로그인 중 오류가 발생했습니다: {str(e)}"}
        )
    return {"message": "Login successful"}

@app.get("/api/config", dependencies=[Depends(verify_api_key)])
async def get_config():
    srt_id, _ = config_store.get_login_values("SRT")
    ktx_id, _ = config_store.get_login_values("KTX")
    return {
        "srt_logged_in": config_store.has_login("SRT"),
        "ktx_logged_in": config_store.has_login("KTX"),
        "srt_user_id": srt_id,
        "ktx_user_id": ktx_id,
        "srt_stations": config_store.get_station_value("SRT").split(",") if config_store.get_station_value("SRT") else [],
        "ktx_stations": config_store.get_station_value("KTX").split(",") if config_store.get_station_value("KTX") else [],
        "options": config_store.get_options(),
    }

@app.get("/api/stations/{provider}", dependencies=[Depends(verify_api_key)])
async def get_stations(provider: str):
    if provider == "SRT":
        from src.providers.srt import STATION_CODE
        return {"stations": sorted(list(STATION_CODE.keys()))}
    elif provider == "KTX":
        # Simplified major KTX stations list for now
        KTX_STATIONS = [
            "서울", "용산", "영등포", "광명", "수원", "천안아산", "오송", "대전", "김천구미", "동대구",
            "신경주", "울산", "부산", "포항", "익산", "정읍", "광주송정", "나주", "목포", "전주",
            "남원", "곡성", "구례구", "순천", "여천", "여수EXPO", "진주", "마산", "창원중앙", "창원"
        ]
        return {"stations": sorted(KTX_STATIONS)}
    return {"stations": []}

@app.post("/api/search", dependencies=[Depends(verify_api_key)])
async def search_trains(req: SearchRequest):
    rail = await _login(provider=req.provider)
    if not rail or (hasattr(rail, 'is_login') and not rail.is_login) or (hasattr(rail, 'logined') and not rail.logined):
        raise HTTPException(
            status_code=401, 
            detail={"code": "ERR_NOT_LOGGED_IN", "message": f"{req.provider} 로그인이 필요합니다."}
        )

    passengers = rail_service.build_passengers(
        req.adults, req.children, req.seniors, req.disability1to3, req.disability4to6
    )

    logger.info(f"Searching trains: {req.dep} -> {req.arr} ({req.date} {req.time})")
    try:
        trains = await run_in_threadpool(
            rail.search_train,
            dep=req.dep, arr=req.arr, date=req.date, time=req.time,
            passengers=passengers, available_only=False,
        )
        logger.info(f"Found {len(trains)} trains")
        results = []
        for i, t in enumerate(trains):
            try:
                results.append({
                    "id": i,
                    "train_name": f"{getattr(t, 'train_name', getattr(t, 'train_type_name', '열차'))} {getattr(t, 'train_number', getattr(t, 'train_no', ''))}",
                    "dep_time": t.dep_time,
                    "arr_time": t.arr_time,
                    "special_seat": getattr(t, 'special_seat_state', '가능' if t.special_seat_available() else '매진'),
                    "general_seat": getattr(t, 'general_seat_state', '가능' if t.general_seat_available() else '매진'),
                })
            except Exception as e:
                logger.error(f"Error processing train {i}: {e}")
                continue
        return {"trains": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reserve", dependencies=[Depends(verify_api_key)])
async def reserve_train(req: ReserveRequest):
    rail = await _login(provider=req.provider)
    if not rail or (hasattr(rail, 'is_login') and not rail.is_login) or (hasattr(rail, 'logined') and not rail.logined):
        raise HTTPException(
            status_code=401, 
            detail={"code": "ERR_NOT_LOGGED_IN", "message": f"{req.provider} 로그인이 필요합니다."}
        )

    passengers = rail_service.build_passengers(
        req.adults, req.children, req.seniors, req.disability1to3, req.disability4to6
    )

    try:
        trains = await run_in_threadpool(
            rail.search_train,
            dep=req.dep, arr=req.arr, date=req.date, time=req.time,
            passengers=passengers, available_only=False,
        )

        for target in req.targets:
            target_train = rail_service.find_target_train(trains, target.train_name)
            if not target_train:
                continue

            stype = rail_service.get_seat_type_enum(target.seat_type)
            if not stype:
                continue

            if is_seat_available(target_train, stype):
                logger.info(f"Seat available for {target.train_name} ({target.seat_type}). Attempting reserve...")
                reserve_info = await run_in_threadpool(rail.reserve, target_train, passengers=passengers, option=stype)
                msg = f"예매 성공! {reserve_info}"
                logger.info(msg)

                if req.auto_pay and not getattr(reserve_info, 'is_waiting', False):
                    # Prefer stored card info from config_store
                    card_info = config_store.get_card_payment_info()
                    
                    # If not in store, use from request (if provided)
                    c_num = card_info[0] if card_info else req.card_number.get_secret_value()
                    c_pw = card_info[1] if card_info else req.card_password.get_secret_value()
                    c_birth = card_info[2] if card_info else req.card_birthday
                    c_exp = card_info[3] if card_info else req.card_expire.get_secret_value()

                    if c_num and c_pw and c_birth and c_exp:
                        logger.info(f"Attempting auto-payment for {reserve_info}")
                        paid = await run_in_threadpool(
                            rail.pay_with_card,
                            reserve_info,
                            c_num,
                            c_pw,
                            c_birth,
                            c_exp,
                            0,
                            "J" if len(c_birth) == 6 else "S",
                        )
                        if paid:
                            msg += " (결제 완료)"
                            logger.info("Auto-payment successful")
                        else:
                            logger.warning("Auto-payment failed")

                try:
                    await run_in_threadpool(send_telegram, msg)
                except Exception as te:
                    logger.error(f"Telegram notification failed: {str(te)}")

                return {"success": True, "message": msg}

        return {"success": False, "message": "Seat not available.", "retry": True}
    except Exception as e:
        logger.exception("Reservation error")
        return {"success": False, "message": "An internal error occurred.", "retry": True}

# Serve frontend static files if they exist
if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")
