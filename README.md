# HY_TOY

> 만들고 싶은 걸 하나씩 만들어보는 개인 프로젝트 모음

- [GitHub Page 바로가기](https://hakyoonkim2.github.io/hy_toy/)
- [Vercel 배포 링크](https://hy-toy.vercel.app/)

---

## 🕒 StopWatch Project

간단한 테스트용 스톱워치 프로젝트입니다.

---

## 💰 Coin Project

**Skills:** React 19, TypeScript, TanStack Query

### 🔧 기능 및 구현 내용

- **거래소 연동**

  - Binance, Upbit 실시간 데이터 연동
  - REST API 및 WebSocket을 통한 실시간 가격 정보 제공
  - 원화-달러 가격 차이를 통한 **김치 프리미엄 시각화 UI** 제공

- **SharedWorker 기반 데이터 공유**

  - `SharedWorker`를 활용해 여러 브라우저 탭에서도 데이터가 공유되도록 구현
  - Android 기반 모바일 환경에서는 `SharedWorker`가 지원되지 않음 → Fallback 방식으로 처리

- **모바일 및 웹뷰 최적화**

  - 다양한 뷰포트에 대응하는 반응형 UI 구성
  - 모바일 브라우저 및 앱 내 웹뷰 환경에서도 최적화된 사용자 경험 제공

- **미국(US) Region 대응**
  - 업비트의 WebSocket 연결 제한 → REST API 기반 Polling 방식으로 처리
  - 미국 지역에서는 업비트 REST API 호출 제한이 있어 **Region 체크 및 Proxy 서버 우회 방식** 적용
  - 바이낸스 URL을 .com이 아닌 .us로 변경 (Websocket, RESTAPI 동일)
  - 이를 위해 **Vercel 서버리스 함수와 Express 기반 Proxy 서버** 배포 및 연동
