# 🏡 Chungyak Manager

> 청약 공고를 매일 직접 확인하던 반복 작업을 줄이기 위해 만든 개인용 청약 관리 서비스입니다.

공공주택 모집공고를 자동으로 수집하고, 변경 사항과 마감 여부를 관리하며, 관심 공고는 알림으로 이어지도록 구성했습니다.

---

## 📸 Preview

> 실제 화면 캡처와 데모 GIF를 추가할 예정입니다.

<table>
<tr>
<td width="50%" align="center"><b>Dashboard</b><br/><sub>대시보드 / 일정 / 마감 임박 / 지도</sub></td>
<td width="50%" align="center"><b>Search</b><br/><sub>공고 검색 / 필터 / 상세 조회</sub></td>
</tr>
<tr>
<td width="50%" align="center"><b>Detail & Favorite</b><br/><sub>상세 정보 / 즐겨찾기 / 외부 공고 연결</sub></td>
<td width="50%" align="center"><b>Alarm & Logs</b><br/><sub>Slack 알림 / 알림 이력 / 스케줄 로그</sub></td>
</tr>
</table>

### Demo

> `대시보드 → 검색 → 상세 → 즐겨찾기/알림` 흐름의 짧은 GIF를 추가할 예정입니다.

---

## 🎯 Project Overview

청약과 임대주택 정보를 직접 확인하면서 다음과 같은 불편이 반복됐습니다.

- 공고 사이트를 매일 직접 확인해야 함
- 신규 공고나 일정 변경을 놓치기 쉬움
- 마감일과 발표일을 별도로 관리해야 함
- 관심 공고와 일반 공고를 구분해 관리하기 번거로움

이를 해결하기 위해 **공고 수집 → DB 동기화 → 변경/마감 처리 → 조회 → 즐겨찾기 → 알림** 흐름을 하나의 서비스로 구성했습니다.

---

## ✨ Key Features

| 기능 | 설명 |
|---|---|
| **공고 자동 수집** | 외부 공공 API를 통해 모집공고 데이터를 주기적으로 수집하고 DB와 동기화 |
| **대시보드** | 주요 공고 현황, 일정, 마감 임박 공고, 지도 기반 위치 정보 제공 |
| **검색 / 상세 조회** | 키워드·상태·D-Day 조건 검색 및 공고 상세 정보 확인 |
| **지도 연동** | 공고 위치를 지도에서 확인하고 실제 공고 페이지로 이동 |
| **즐겨찾기** | 관심 공고를 별도로 관리하고 알림 대상 데이터와 연계 |
| **마감 자동 처리** | 종료일을 기준으로 마감된 공고의 상태를 주기적으로 자동 반영 |
| **Slack 알림** | 관심 공고의 주요 일정과 알림 데이터를 주기적으로 확인해 Slack 메시지 발송 |
| **로그 조회** | 스케줄 실행 로그 및 발송된 알림 이력을 화면에서 조회 |
| **반응형 UI** | 데스크톱뿐 아니라 좁은 화면에서도 사용할 수 있도록 반응형 구성 |

---

## 🏗️ Architecture

```text
Public Housing API
        │
        ▼
SeinServices.Api
  ├─ 모집공고 수집 / 동기화
  ├─ 검색 / 상세 / 즐겨찾기 API
  ├─ 마감 처리
  ├─ 알림 예약 / 발송
  └─ Schedule / Alarm Log
        │
        ▼
     Database
        │
        ├──────────────► Slack
        │                 알림 발송
        ▼
Chungyak Manager Web
  ├─ Dashboard
  ├─ Search / Detail
  ├─ Favorite
  └─ Logs
```

### Repositories

- **Frontend** — [chungyak_manage_web](https://github.com/leesein1/chungyak_manage_web)
- **Backend API** — [08.SeinServices.Api](https://github.com/leesein1/08.SeinServices.Api)

---

## 🛠️ Tech Stack

### Front-End

`React` `TypeScript` `Vite` `React-Bootstrap`

### Back-End

`ASP.NET Core Web API` `C#`

### Database / Infra

`Azure SQL` `GitHub Actions` `Docker` `Vercel` `Slack Webhook`

---

## 🔄 Automation Flow

### 1. 공고 수집 및 동기화

외부 API에서 데이터를 수집한 뒤 기존 DB 데이터와 비교하여 신규 공고와 변경 데이터를 반영합니다.

### 2. 마감 처리

공고 종료일을 기준으로 마감 대상을 확인하고 상태를 자동 갱신합니다.

### 3. 즐겨찾기 및 알림 예약

사용자가 관심 공고를 즐겨찾기하면 필요한 일정 데이터를 알림 대상과 연결합니다.

### 4. 알림 발송 및 이력 관리

주기적으로 알림 대상을 확인하여 Slack 메시지를 발송하고, 발송 결과를 로그로 저장합니다.

---

## 🧩 Implementation Notes

### API 기반 UI 전환

초기에는 mock 데이터를 이용해 화면 구조를 먼저 설계했지만, 이후 실제 API 연동으로 전환했습니다.
현재 대시보드, 검색, 상세 조회, 즐겨찾기, 로그 화면은 백엔드 API 데이터를 기준으로 동작합니다.

### Scheduler / Log

백엔드 작업은 단순 실행에 그치지 않고, 최근 동기화 시간과 스케줄 실행 결과를 기록하고 프론트에서 확인할 수 있도록 구성했습니다.

### UTC / KST 시간 처리

자동 마감 처리 과정에서 서버의 UTC 기준 시간과 한국 시간 차이로 일부 공고의 마감 처리가 누락되는 문제가 있었습니다.
시간 기준을 명확히 분리하고 처리 로직을 수정해 자동 마감이 정상적으로 동작하도록 보완했습니다.

### Deployment

프론트는 Vercel 기반으로 배포하고, API 서버는 Docker 기반 배포 및 외부 실행 환경을 구성해 프론트와 분리했습니다.

---

## 🗺️ Roadmap

현재 핵심 기능은 구현된 상태이며, 아래 기능은 추후 확장 후보입니다.

- [ ] 서울 / 경기 등 지역 범위 확장
- [ ] FCM 기반 모바일 푸시 알림

---

## 📌 Current Status

- [x] 대시보드 API 연동
- [x] 검색 / 상세 조회 API 연동
- [x] 지도 기반 공고 확인
- [x] 즐겨찾기 연동
- [x] 자동 공고 수집 / 동기화
- [x] 자동 마감 처리
- [x] 스케줄 로그 조회
- [x] Slack 알림 로그 조회
- [x] 즐겨찾기 기반 알림 데이터 생성
- [x] 주기적 Slack 메시지 발송
- [x] 반응형 UI 작업
- [x] 프론트 / API 분리 배포

---

## 🔗 Related

- [Frontend Repository](https://github.com/leesein1/chungyak_manage_web)
- [Backend Repository](https://github.com/leesein1/08.SeinServices.Api)
