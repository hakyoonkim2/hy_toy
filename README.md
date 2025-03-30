# HY_TOY

> 만들고 싶은 걸 하나씩 만들어보는 개인 프로젝트 모음

- [GitHub Page 바로가기](https://hakyoonkim2.github.io/hy_toy/)
- [Vercel 배포 링크](https://hy-toy.vercel.app/)

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
  - Android 기반 모바일 환경에서는 `SharedWorker`가 지원되지 않음 → Worker로 Fallback 방식 처리

- **모바일 및 웹뷰 최적화**

  - 다양한 뷰포트에 대응하는 반응형 UI 구성
  - 모바일 브라우저 및 앱 내 웹뷰 환경에서도 최적화된 사용자 경험 제공

- **미국(US) Region 대응**
  - 업비트의 WebSocket 연결 제한 → REST API 기반 Polling 방식으로 처리
  - 미국 지역에서는 업비트 REST API 호출 제한이 있어 **Region 체크 및 Proxy 서버 우회 방식** 적용
  - 바이낸스 URL을 .com이 아닌 .us로 변경 (Websocket, RESTAPI 동일)
  - 이를 위해 **Vercel 서버리스 함수를 기반한 Express Proxy 용 프로젝트** 배포 및 연동

### 📡 데이터 흐름 구조

```plaintext
[Upbit / Binance WebSocket]
            │
            ▼
   (실시간 데이터 수신)
            │
            ▼
 [SharedWorker / Worker]
        └─ 쓰로틀링 처리 (300ms)
            │
            ▼
   [React 애플리케이션]
        └─ React Query Client 적재
            │
            ▼
     컴포넌트 렌더링
```

---

#### 🔍 상세 설명

- **거래소 (Upbit, Binance)**  
  실시간 시세 데이터를 WebSocket을 통해 전송합니다.

- **Worker / SharedWorker**  
  중앙에서 WebSocket 연결을 유지하며, 클라이언트로 전달하기 전에 `300ms` 간격으로 쓰로틀링합니다.

- **React 애플리케이션**  
  쓰로틀링된 데이터를 받아 `React Query`에 캐싱하고, 필요한 컴포넌트만 효율적으로 리렌더링합니다.

---

#### ✅ 장점

- **WebSocket 연결 최소화**: 하나의 Worker로 여러 탭 공유 (SharedWorker 사용 시)
- **성능 최적화**: 빈번한 데이터 업데이트를 쓰로틀링으로 제어
- **React Query 사용**: 전역 상태 관리 없이도 데이터 캐싱 및 갱신 용이

## ⌨️ Typing Game

**Skills:** React 18+, TypeScript, SCSS, React Device Detect

---

### 🔧 기능 및 구현 내용

- **타이핑 액션 게임**

  - 알파벳이 위에서 아래로 떨어지는 구조의 실시간 게임
  - 올바른 키를 입력하면 해당 문자가 사라지고 점수 획득
  - 틀리거나 놓친 경우 체력 감소 → 체력 0이면 게임 종료

- **콤보 및 스코어 시스템**

  - 연속 타이핑 성공 시 콤보 증가 및 추가 점수 보너스
  - 일정 점수 도달 시 **속도 증가 및 난이도 상승**

- **폭발 애니메이션 / 시각 효과**

  - 키 입력 시 문자가 터지는 효과 (`explode` animation)
  - 실수 시 화면 흔들림(`shake`) 및 체력바 감소 애니메이션
  - 점수 상승 시 **Score Bump 애니메이션** 적용

- **가상 키보드 UI 제공**

  - 모바일 환경에서도 손쉽게 입력할 수 있도록 **커스텀 키보드** 렌더링
  - 실제 키보드와 동일한 3단 구조

- **반응형 및 모바일 최적화**
  - PC와 모바일 환경에 맞게 게임 화면 크기 자동 조정
  - `react-device-detect`를 통해 모바일일 경우 UI 및 높이 조정

---

### 📡 게임 루프 구조

```plaintext
[ Falling Char Spawn Timer ]
            │
            ▼
[ useState로 Char 상태 적재 ]
            │
            ▼
[ useEffect로 위치 업데이트 (50ms 간격) ]
            │
            ▼
[ Char가 아래 도달 시 체력 감소 + 제거 ]
            │
            ▼
[ 올바른 키 입력 시: Char 제거 + 점수/콤보 증가 ]
```
