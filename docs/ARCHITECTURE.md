# 🏗 프로젝트 아키텍처 (Architecture)

Skimbleshanks는 확장성과 유지보수성을 고려하여 레이어드 아키텍처(Layered Architecture)를 기반으로 설계되었습니다.

## 📁 디렉토리 구조

- **`src/api`**: FastAPI 기반의 REST API 엔드포인트 정의. 프론트엔드와의 통신을 담당합니다.
- **`src/services`**: 비즈니스 로직의 핵심 레이어. 예매 흐름 제어, 알림 전송, 구성 관리 등을 수행합니다.
- **`src/providers`**: 실제 철도 서비스(SRT 등)와 통신하는 어댑터 레이어. 프로토콜 구현을 캡슐화합니다.
- **`src/flows`**: 여러 서비스를 조합하여 하나의 작업을 완성하는 시나리오 로직(예: 조회 후 자동 예약 시도).
- **`frontend`**: React + TypeScript + Vite 기반의 모던 웹 어플리케이션.
- **`tests`**: Pytest를 사용한 단위(Unit) 및 통합(Integration) 테스트 코드.

## 🛠 기술 스택 (Tech Stack)

- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic
- **Frontend**: React, TypeScript, Vite, Vanilla CSS
- **CI/CD**: GitHub Actions (Lint, Test, Auto-deploy)

## 🔄 데이터 흐름 (Data Flow)

1. 사용자가 **Web GUI**에서 조회를 요청합니다.
2. **FastAPI Server**가 요청을 받아 **RailService**를 호출합니다.
3. **SRT Provider**가 철도 서버와 통신하여 결과를 가져옵니다.
4. 결과가 역순으로 전달되어 사용자에게 시각적으로 표시됩니다.
5. 자동 예매 시작 시, 서버는 **Background Task**로 예매 성공 시까지 지속적으로 시도합니다.
