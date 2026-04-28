# SRTgo: SRT Train Reservation Assistant
[![CI](https://github.com/zits93/srtgo/actions/workflows/ci.yml/badge.svg)](https://github.com/zits93/srtgo/actions/workflows/ci.yml)
![Python Version](https://img.shields.io/badge/python-3.10+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
![Stars](https://img.shields.io/github/stars/zits93/srtgo?style=social)

> [!WARNING]
> 본 프로그램의 모든 상업적, 영리적 이용을 엄격히 금지합니다. 본 프로그램 사용에 따른 민형사상 책임을 포함한 모든 책임은 사용자에게 있으며, 본 프로그램의 개발자는 민형사상 책임을 포함한 어떠한 책임도 부담하지 않습니다. 본 프로그램을 내려받음으로써 모든 사용자는 위 사항에 이의 없이 동의하는 것으로 간주됩니다.

---

## 🌟 주요 기능 (Features)
- **SRT 예매 지원**: 터미널(CLI)과 웹 환경에서 SRT 열차를 간편하게 예매합니다.
- **자동 예매 대기**: 매진된 열차를 주기적으로 확인하여 자리가 나는 즉시 자동으로 예약합니다.
- **텔레그램 알림**: 예매 성공 시 설정된 텔레그램 봇으로 즉시 알림을 전송합니다.
- **다양한 승객 옵션**: 어른/청소년, 어린이, 경로우대, 장애인 등 맞춤형 인원 설정이 가능합니다.
- **자동 결제 기능**: 카드 정보를 사전에 등록하여 예매와 동시에 결제까지 완료할 수 있습니다.
- **대화형 TUI 및 웹 GUI**: 터미널(CLI)과 브라우저(Web) 환경을 모두 지원합니다.

## 🚀 사용법 (Usage)

### 1. 웹 GUI 모드 (추천)
일반 사용자는 설치 없이 브라우저에서 바로 사용할 수 있습니다.
*   **접속 주소**: [SRTgo Web GUI (GitHub Pages)](https://zits93.github.io/srtgo/)
*   **참고**: 웹 GUI를 사용하려면 본인의 PC나 서버에서 **백엔드 API 서버**가 실행 중이어야 합니다. (아래 '전문가용 수동 실행' 참고)

### 2. 터미널(CLI) 모드
터미널 환경에서 대화형 메뉴를 통해 예매를 진행합니다.
1.  **의존성 설치**: `pip install .`
2.  **실행**: `python main.py`

### 3. 전문가용 수동 실행 (백엔드 서버)
웹 GUI와 연동하거나 API를 직접 호출하기 위해 서버를 직접 구축하는 사용자를 위한 안내입니다.

#### 🛠 설치 및 설정
1.  **의존성 설치**: `pip install .`
2.  **환경 변수 설정**: API 호출 시 필요한 인증 키와 CORS 허용 도메인을 설정합니다.
    | 환경 변수 | 설명 | 기본값 |
    | :--- | :--- | :--- |
    | `SRTGO_API_KEY` | API 호출 시 필요한 인증 키 (헤더 `X-API-KEY`) | (필수) |
    | `SRTGO_ALLOWED_ORIGINS` | CORS 허용 도메인. 모든 허용 시 `*` 입력 | `http://localhost:5173` |

#### 🌐 배포 및 호스팅 (Deployment)
직접 서버를 호스팅하거나 외부에서 접속 가능하게 하려는 경우 다음 내용을 참고하세요.
*   **GitHub Pages (프론트엔드)**: `frontend` 폴더에서 `npm run build` 후 `dist` 폴더 내용을 `gh-pages` 브랜치 등에 업로드하여 정적 호스팅이 가능합니다.
*   **백엔드 서버 (API)**: Python 환경이 필요하며, 개인 PC나 AWS 등에서 실행해야 합니다. 외부 접속을 위해서는 `ngrok` 등을 활용하여 `8000` 포트를 터널링할 수 있습니다.
    ```bash
    ngrok http 8000
    ```

#### 🚀 서버 실행
설정이 완료되었다면 서버를 구동합니다.
```bash
export SRTGO_API_KEY=your-secret-key
export SRTGO_ALLOWED_ORIGINS="*"
uvicorn src.api.app:app --host 0.0.0.0 --port 8000
```
**참고**: 서버 실행 후 웹 GUI 설정에서 API 주소를 본인의 서버 주소(예: `http://localhost:8000` 또는 ngrok 주소)로 설정하세요.

---

## 🏗 프로젝트 구조 (Architecture)
- `src/api`: FastAPI 기반 REST API 서버
- `src/services`: 비즈니스 로직 및 외부 연동 서비스 레이어
- `src/providers`: SRT 통신 프로토콜 구현
- `frontend`: React + Vite 기반 웹 어플리케이션
- `tests`: Pytest 기반 단위 및 통합 테스트

## 🤝 Acknowledgments
- This project includes code from [SRT](https://github.com/ryanking13/SRT) by ryanking13 (MIT License) and [korail2](https://github.com/carpedm20/korail2) by carpedm20 (BSD License).
