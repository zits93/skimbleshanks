# 🛠 전문가용 수동 실행 가이드 (Expert Guide)

이 문서는 Skimbleshanks를 직접 서버에 구축하거나, 웹 GUI를 본인의 백엔드와 연동하여 사용하려는 전문가분들을 위한 기술 가이드입니다.

## 🛠 설치 및 설정 (Installation & Config)

1. **의존성 설치**:
   ```bash
   pip install .
   ```

2. **환경 변수 설정**:
   API 호출 시 필요한 인증 키와 CORS 허용 도메인을 설정합니다. 웹 GUI의 기본 인증 키는 `your-secret-key`로 설정되어 있습니다.

   | 환경 변수 | 설명 | 기본값 |
   | :--- | :--- | :--- |
   | `SKIMBLE_API_KEY` | API 호출 시 필요한 인증 키 (헤더 `X-API-KEY`) | `your-secret-key` |
   | `SKIMBLE_ALLOWED_ORIGINS` | CORS 허용 도메인. 모든 허용 시 `*` 입력 | `http://localhost:5173` |

## 🚀 백엔드 서버 실행 (Backend Execution)

설정이 완료되었다면 서버를 구동합니다. 기본 포트는 `8000`입니다.

```bash
export SKIMBLE_API_KEY=your-secret-key
export SKIMBLE_ALLOWED_ORIGINS="*"
uvicorn src.api.app:app --host 0.0.0.0 --port 8000
```

## 🌐 배포 및 호스팅 (Deployment)

직접 서버를 호스팅하거나 외부에서 접속 가능하게 하려는 경우 다음 내용을 참고하세요.

### 프론트엔드 (GitHub Pages 등)
`frontend` 폴더에서 빌드 후 정적 호스팅이 가능합니다.
```bash
cd frontend
npm install
npm run build
```
빌드된 `dist` 폴더의 내용을 웹 서버나 GitHub Pages에 업로드하세요.

### 외부 터널링 (ngrok)
로컬에서 실행 중인 서버를 외부(예: 회사나 외부 카페 등)에서 접속하고 싶을 때 `ngrok`을 활용할 수 있습니다.
```bash
ngrok http 8000
```
(※ 현재 웹 GUI는 로컬 통신에 최적화되어 있습니다. 외부 서버 연동이 필요한 경우 소스코드를 수정하여 사용하세요.)
