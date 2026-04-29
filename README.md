# 🚂 Skimbleshanks: The Railway Cat
[![CI](https://github.com/zits93/skimbleshanks/actions/workflows/ci.yml/badge.svg)](https://github.com/zits93/skimbleshanks/actions/workflows/ci.yml)
![Python Version](https://img.shields.io/badge/python-3.10+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> *"Nothing happens on the Northern Mail / If Skimbleshanks is not there"*

**Skimbleshanks**는 고속열차(SRT) 예매를 완벽하게 관리하는 당신의 철도 도우미입니다. 뮤지컬 '캣츠'의 꼼꼼한 철도 고양이처럼, 당신이 잠든 사이에도 가장 빠른 길을 찾아 예매를 완료합니다.

---

## 🌟 주요 기능
- **완벽한 예매 관리**: 스킴블처럼 꼼꼼하게 열차 상황을 감시하여 예매를 성공시킵니다.
- **다양한 승객 옵션**: 모든 연령층과 인원 설정을 완벽하게 지원합니다.
- **자동 예매 대기**: 매진된 열차도 포기하지 않고 자리가 나는 즉시 낚아챕니다.
- **자동 결제 기능**: 카드 정보를 안전하게 사용하여 예매와 동시에 결제까지 마칩니다.
- **텔레그램 알림**: 예매 성공 시 집사님(사용자)에게 즉시 알림을 보냅니다.
- **Liquid Glass UI**: 현대적이고 유려한 "액체 유리" 디자인의 웹 인터페이스를 제공합니다.

## 🚀 시작하기

### 1. 웹 접속 (가장 쉬운 방법)
복잡한 설치 없이 브라우저에서 바로 사용할 수 있습니다.
*   **접속 주소**: [Web GUI (GitHub Pages)](https://zits93.github.io/skimbleshanks/)
*   **주의**: 웹 GUI를 사용하려면 본인의 PC나 서버에서 **백엔드 서버**가 실행 중이어야 합니다.

### 2. 터미널(CLI) 및 서버 설치
터미널 환경에 익숙한 집사님들을 위한 방법입니다.
1.  **설치**: `pip install -e .` (소스 코드가 있는 루트 디렉토리에서 실행)
2.  **실행**: `python src/cli/main.py`

---

## 📚 추가 문서
- **[전문가용 가이드](./docs/EXPERT_GUIDE.md)**: 직접 서버를 구축하거나 백엔드 설정을 변경하려는 사용자를 위한 가이드입니다.
- **[프로젝트 아키텍처](./docs/ARCHITECTURE.md)**: 프로젝트의 구조와 설계 원칙이 궁금한 개발자를 위한 문서입니다.
- **[보안 정책](./SECURITY.md)**: 취약점 보고 및 보안 권장 사항입니다.

## 🤝 참고 및 감사
본 프로젝트는 [SRTgo](https://github.com/lapis42/srtgo), [SRT](https://github.com/ryanking13/SRT), [korail2](https://github.com/carpedm20/korail2), [RunCat365](https://github.com/Kyome22/RunCat365) 등 여러 오픈소스 프로젝트를 기반으로 재구축되었으며, 원작자분들의 노고에 깊은 감사를 표합니다.
