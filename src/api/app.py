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
API_KEY = os.getenv("SRTGO_API_KEY")

ALLOWED_ORIGINS_RAW = os.getenv("SRTGO_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:8080")
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
        logger.error("SRTGO_API_KEY is not set in environment variables.")
        raise HTTPException(status_code=500, detail="API Key configuration error")
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing API Key")
    return x_api_key

class LoginRequest(BaseModel):
    user_id: str
    password: str

class SearchRequest(BaseModel):
    dep: str
    arr: str
    date: str
    time: str
    adults: int = 1
    children: int = 0
    seniors: int = 0
    disability1to3: int = 0
    disability4to6: int = 0

class TelegramRequest(BaseModel):
    token: str
    chat_id: str

@app.post("/api/telegram", dependencies=[Depends(verify_api_key)])
async def set_telegram(req: TelegramRequest):
    from src.services.notifications import configure_telegram
    success = await run_in_threadpool(configure_telegram, req.token, req.chat_id)
    if success:
        return {"message": "Telegram configured and test message sent"}
    else:
        raise HTTPException(status_code=400, detail="Failed to configure Telegram")

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

async def _login():
    user_id, password = config_store.get_login_values("SRT")
    if not user_id or not password:
        logger.warning("No credentials found in config_store")
        return None
    try:
        return await run_in_threadpool(login_client, user_id, password, debug=True)
    except Exception as e:
        logger.error(f"Auto-login failed: {str(e)}")
        return None

@app.post("/api/login", dependencies=[Depends(verify_api_key)])
async def do_login(req: LoginRequest):
    logger.info(f"Login attempt for user: {req.user_id}")
    config_store.save_login("SRT", req.user_id, req.password)
    try:
        rail = await run_in_threadpool(login_client, req.user_id, req.password, debug=True)
        if not rail or not rail.is_login:
            logger.warning(f"Login failed for user: {req.user_id}")
            config_store.clear_login_ok("SRT")
            raise HTTPException(status_code=401, detail="Login failed")
        logger.info(f"Login successful for user: {req.user_id}")
    except Exception as e:
        logger.error(f"Login error for user {req.user_id}: {str(e)}")
        config_store.clear_login_ok("SRT")
        raise HTTPException(status_code=401, detail="Login failed")
    return {"message": "Login successful"}

@app.get("/api/config", dependencies=[Depends(verify_api_key)])
async def get_config():
    return {
        "is_logged_in": config_store.has_login("SRT"),
    }

@app.post("/api/search", dependencies=[Depends(verify_api_key)])
async def search_trains(req: SearchRequest):
    rail = await _login()
    if not rail or not rail.is_login:
        raise HTTPException(status_code=401, detail="Not logged in")

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
            results.append({
                "id": i,
                "train_name": f"{t.train_name} {t.train_number}",
                "dep_time": t.dep_time,
                "arr_time": t.arr_time,
                "special_seat": getattr(t, 'special_seat_state', '알수없음'),
                "general_seat": getattr(t, 'general_seat_state', '알수없음'),
            })
        return {"trains": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reserve", dependencies=[Depends(verify_api_key)])
async def reserve_train(req: ReserveRequest):
    rail = await _login()
    if not rail or not rail.is_login:
        raise HTTPException(status_code=401, detail="Not logged in")

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
                    if req.card_number and req.card_password and req.card_birthday and req.card_expire:
                        logger.info(f"Attempting auto-payment for {reserve_info}")
                        birthday = req.card_birthday
                        paid = await run_in_threadpool(
                            rail.pay_with_card,
                            reserve_info,
                            req.card_number.get_secret_value(),
                            req.card_password.get_secret_value(),
                            birthday,
                            req.card_expire.get_secret_value(),
                            0,
                            "J" if len(birthday) == 6 else "S",
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
        logger.error(f"Reservation error: {str(e)}")
        return {"success": False, "message": str(e), "retry": True}

# Serve frontend static files if they exist
if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")
