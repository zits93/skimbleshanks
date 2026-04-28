# 🚀 Skimbleshanks Project Roadmap & Issues

이 파일은 프로젝트의 완성도를 높이기 위해 도출된 개선 사항들을 관리하는 목록입니다.

## 🛡 Security
- [ ] **API 엔드포인트 인증 강화**: ngrok 외부 노출 시 보안을 위해 간단한 API Key 인증(`X-API-KEY`) 또는 접근 제한 로직 추가.
- [ ] **입력 데이터 검증**: 프론트엔드와 백엔드 양측에서 카드 번호 형식, 날짜 형식 등에 대한 정규식 검증 강화.
- [ ] **기본 API 키 하드코딩 제거**: `app.py`에 하드코딩된 `API_KEY` 기본값을 제거하고 안전하게 관리.
- [ ] **CORS 설정 제한**: `CORSMiddleware`의 와일드카드(`*`) 허용을 프론트엔드 도메인으로 엄격히 제한.
- [ ] **결제 정보 보안**: API 통신 시 결제 정보 마스킹 및 HTTPS 전송 강제화 검토.

## 🎨 UX/UI
- [ ] **컴포넌트 모듈화**: `app.jsx` 하나에 집중된 코드를 `components/` 폴더로 분리 (Search, Results, Settings 등).
- [ ] **애니메이션 디테일**: 탭 전환 및 리스트 로딩 시 스켈레톤(Skeleton) UI 또는 부드러운 트랜지션 추가.
- [ ] **실시간 상태 로그**: 자동예매 진행 상황을 '시도 횟수' 외에 상세 로그(예: "15:30:01 - 조회 결과 없음")로 사용자에게 노출.
- [ ] **잘못된 안내 가이드 수정**: `README.md` 내 프론트엔드 실행법(기존 `http.server`)을 Vite 서버 서빙 방식으로 수정.
- [ ] **단일 실행 스크립트**: 사용자 편의를 위해 백엔드/프론트엔드 동시 실행 및 브라우저 자동 오픈을 돕는 통합 스크립트 작성.

## ⚙️ Operability & Maintenance
- [ ] **구조화된 로깅 (Logging)**: Python `logging` 모듈을 사용하여 `logs/` 디렉토리에 실행 기록 영구 저장.
- [ ] **유닛 테스트 도입**: 핵심 로직(`src/providers`, `src/utils`)에 대한 `pytest` 기반 테스트 코드 작성.
- [ ] **환경 설정 분리**: API URL(`API_BASE`) 등을 `.env` 파일로 관리하여 배포 환경별 대응 용이성 확보.
- [ ] **서버 내부 에러 메시지 은닉**: 500 에러 발생 시 내부 예외 메시지를 그대로 노출하지 않고 정제하여 클라이언트에 응답.
- [ ] **CI 프론트엔드 파이프라인**: GitHub Actions(`.github/workflows/ci.yml`)에 프론트엔드 Linter 및 빌드(`npm run build`) 검증 추가.

## 📈 Performance & Reliability
- [ ] **세션 복구 로직 강화**: 세션 만료 시 백그라운드에서 자동으로 재로그인하고 작업을 이어가는 워크플로우 최적화.
- [ ] **지수 백오프 (Exponential Backoff)**: 예매 실패 시 재시도 간격을 점진적으로 늘려 서버 부하 및 계정 차단 방지.
- [ ] **렌더링 최적화**: React의 `useMemo`, `useCallback`을 활용하여 대량의 열차 정보 렌더링 시 성능 저하 방지.
- [ ] **FastAPI 비동기 성능 최적화**: 동기 I/O가 발생하는 API 호출(`search_train` 등)을 `run_in_threadpool` 또는 비동기로 전환하여 블로킹 방지.

## 🏗 Architecture
- [ ] **관심사 분리 (Decoupling)**: API 라우팅 컨트롤러와 비즈니스/데이터 처리 로직(승객 조립, 예약 처리)을 `src/services` 레이어로 명확히 분리.
- [ ] **단일 패키징 배포**: PyInstaller 빌드 시 프론트엔드 `dist` 빌드 산출물과 FastAPI 서버를 통합하여 하나의 실행 파일로 배포할 수 있는 구조 모색 (FastAPI `StaticFiles` 서빙 등).

## ⚖️ Compliance & Testability
- [ ] **Mock 기반 테스트 환경 구축**: 외부 철도 API 상태에 의존하지 않는 안정적인 단위 테스트를 위해 의존성 주입(DI) 및 Mock 객체 도입.
- [ ] **매크로 방지 정책 대비**: 과도한 트래픽 유발로 인한 코레일/SRT 서버 차단을 막기 위해 API 요청 Rate Limiting 및 딜레이 로직 점검.
