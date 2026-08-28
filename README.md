# 청약알리미 (ChungyakManager)

결혼 준비 중 청약·임대 공고를 매일 확인하던 일을 줄이기 위해 만든 개인 서비스입니다.

공고 수집과 검색, 즐겨찾기, 마감 처리, 알림, 실행 로그 확인까지 한 흐름으로 묶었습니다. 현재도 직접 사용 중이며, 실제 집을 구하는 과정에서도 사용했습니다.

<p align="center">
  <a href="https://ourchungyak.silee.net/">
    <img src="https://img.shields.io/badge/서비스%20바로가기-0F172A?style=for-the-badge&logo=vercel&logoColor=white" alt="서비스 바로가기" />
  </a>
</p>

---

## 만든 이유

청약 공고를 직접 확인하면서 새 공고, 마감일, 발표일을 따로 챙겨야 했습니다. 같은 내용을 반복해서 확인하는 경우도 많았습니다.

공공 API에서 공고를 수집해 DB에 저장하고, 화면에서는 검색과 상세 확인에 집중하도록 구성했습니다. 즐겨찾기한 공고는 알림 대상과 연결하고 종료일이 지난 공고는 자동으로 상태를 갱신합니다.

현재는 개인 사용 기준으로 운영합니다. 회원가입, 관리자/일반 사용자 구분, 다중 사용자 기능은 없습니다.

---

## Preview

<details>
<summary><b>Dashboard</b> — 공고 현황, 일정, 마감 임박, 지도</summary>
<br/>
<p align="center">
  <img src="docs/webp/dashboard.webp" width="820" alt="Chungyak Manager Dashboard" />
</p>
</details>

<details>
<summary><b>Search & Detail</b> — 검색, 상세, 즐겨찾기, 위치 확인</summary>
<br/>
<p align="center">
  <img src="docs/webp/search.webp" width="820" alt="Chungyak Manager Search and Detail" />
</p>
</details>

<details>
<summary><b>Schedule Log</b> — 수집 및 마감 작업 실행 이력</summary>
<br/>
<p align="center">
  <img src="docs/webp/log.webp" width="820" alt="Chungyak Manager Schedule Log" />
</p>
</details>

<details>
<summary><b>Slack Notification</b> — 모집공고 알림</summary>
<br/>
<p align="center">
  <img src="docs/webp/slack.webp" width="360" alt="Chungyak Manager Slack Notification" />
</p>
</details>

---

## 주요 기능

- 공고 현황, 캘린더, 마감 임박, 지도 기반 대시보드
- 키워드·상태·D-Day 검색 및 상세 조회
- 즐겨찾기 등록과 알림 대상 연계
- 공공 API 데이터 수집 및 DB 동기화
- 종료일 기준 마감 상태 갱신
- Slack 알림 및 발송 이력 저장
- 스케줄 실행 로그와 최근 동기화 상태 조회

---

## 기술과 운영 구조

**Front-End**  
`React` `TypeScript` `Vite` `React-Bootstrap`

**Back-End**  
`C#` `ASP.NET Core Web API`

**Database / Infra**  
`Azure SQL` `Docker` `Vercel` `GitHub Actions` `Slack Webhook`

- Frontend: [chungyak_manage_web](https://github.com/leesein1/chungyak_manage_web)
- Backend API: [08.SeinServices.Api](https://github.com/leesein1/08.SeinServices.Api)

```text
Public Housing API
        │
        ▼
SeinServices.Api
  ├─ 공고 동기화
  ├─ 마감 처리
  ├─ 알림 처리
  └─ 실행 로그
        │
        ▼
    Azure SQL
        │
        ▼
Chungyak Manager Web
```

프론트는 Vercel, API는 홈서버의 Docker 환경에서 운영합니다.

---

## 운영하면서 수정한 문제

### Azure App Service 휴면

초기에는 Azure App Service 무료 환경에서 API를 운영했습니다. 유휴 상태에서 앱이 멈추는 문제가 있어 GitHub Actions에서 `warmup → 대기 → run-once` 방식으로 배치 API를 호출했습니다.

이후 API를 홈서버 Docker로 옮기고 `BackgroundService` 기반 스케줄러를 사용하도록 변경했습니다.

### UTC / KST

Azure SQL의 시간 기준 때문에 마감 상태가 한국 날짜와 어긋나는 구간이 있었습니다. 날짜 비교와 로그 저장 기준을 KST로 맞췄습니다.

### 실행 상태 확인

백그라운드 작업 결과를 DB에 기록하고 프론트에서 스케줄 로그를 조회하도록 추가했습니다.

### 알림 날짜 값

알림 대상 생성 중 날짜 형식이 일정하지 않아 오류가 발생했습니다. `TRY_CONVERT`, `COALESCE`를 사용해 처리했습니다.

### 외부 API 요청

공공 API Query String 값은 URL Encoding 후 전달하도록 수정했습니다.
