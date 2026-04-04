import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { FaArrowUp, FaCheckCircle, FaClock } from "react-icons/fa";
import DashboardKpi from "@/components/dashboard/DashboardKpi";
import DashboardCalendar, {
  type CalendarEvent,
} from "@/components/dashboard/DashboardCalendar";
import "./Dashboard.css";

type ApiRcvhome = {
  "고유번호"?: string;
  "공고명"?: string;
  "단지명"?: string;
  "상태"?: string;
  "접수시작일"?: string;
  "접수마감일"?: string;
  "접수기간"?: string;
  "주소"?: string;
  "남은일수"?: string;
  "url"?: string;
  "즐겨찾기"?: boolean;
};

type ScheduleLastResponse = {
  status?: string;
  startedAt?: string;
  endedAt?: string | null;
  scheduleNote?: string | null;
};

type SoonItem = {
  id: string;
  dday: number;
  title: string;
  region: string;
  period: string;
  status: string;
};

type UpdateItem = {
  id: string;
  title: string;
  when: string;
  desc: string;
};

type DashboardState = {
  totalCount: number;
  ongoingCount: number;
  deadlineSoonCount: number;
  favoriteCount: number;
  lastSyncLabel: string;
  syncHealthy: boolean;
  soonItems: SoonItem[];
  updates: UpdateItem[];
  calendarEvents: CalendarEvent[];
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "";
const API_PROXY_PREFIX = "/backend-api";

// API_BASE_URL이 있으면 직접 백엔드 호출, 없으면 Vercel 프록시 경로를 사용합니다.
function buildApiUrl(path: string) {
  if (API_BASE_URL) return `${API_BASE_URL}/api/${path}`;
  return `${API_PROXY_PREFIX}/${path}`;
}

// 공통 JSON fetch 유틸: 상태코드/콘텐츠 타입/파싱 오류를 구분해 에러를 반환합니다.
async function fetchJson<T>(
  url: string,
  signal: AbortSignal,
  label: string
): Promise<T> {
  const res = await fetch(url, { signal });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`${label} 실패 (${res.status})`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`${label} 실패 (JSON 아님: ${contentType || "unknown"})`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${label} 실패 (JSON 파싱 오류)`);
  }
}

// ISO 문자열을 yyyy-mm-dd 포맷으로 변환합니다.
function toIsoDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// "D-3", "마감" 같은 문자열에서 D-day 숫자를 파싱합니다.
function parseDday(text?: string) {
  if (!text) return 999;
  const match = text.match(/D-(\d+)/);
  if (match) return Number(match[1]);
  if (text.includes("마감")) return 0;
  return 999;
}

// 서버 시각을 현재 시각 기준 상대 시간(방금/분 전/시간 전)으로 포맷합니다.
function formatRelativeTime(iso?: string | null) {
  if (!iso) return "정보 없음";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "정보 없음";

  const diffMs = Date.now() - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}

// 대시보드 조회에 사용할 공통 기간 파라미터를 생성합니다.
function buildDateRangeQuery() {
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const to = new Date();
  to.setDate(to.getDate() + 365);

  const qs = new URLSearchParams();
  qs.set("BeginFrom", from.toISOString());
  qs.set("BeginTo", to.toISOString());
  return qs.toString();
}

// API 응답 1건을 마감 임박 테이블에서 쓰는 형태로 변환합니다.
function toSoonItem(row: ApiRcvhome): SoonItem {
  return {
    id: row["고유번호"] ?? Math.random().toString(36).slice(2),
    dday: parseDday(row["남은일수"]),
    title: row["공고명"] ?? "공고명 없음",
    region: row["주소"]?.trim() || "지역 정보 없음",
    period: row["접수기간"] ?? "일정 정보 없음",
    status: row["상태"] ?? "상태 미상",
  };
}

// 공고 목록에서 캘린더 이벤트(접수 시작/마감)를 생성합니다.
function buildCalendarEvents(rows: ApiRcvhome[]): CalendarEvent[] {
  const map = new Map<string, CalendarEvent>();

  rows.slice(0, 20).forEach((row) => {
    const title = row["공고명"] ?? "공고";
    const startDate = toIsoDate(row["접수시작일"]);
    const endDate = toIsoDate(row["접수마감일"]);

    if (startDate) {
      const key = `${startDate}-RECEIVE-${title}`;
      map.set(key, {
        date: startDate,
        type: "RECEIVE",
        title: `${title} 접수 시작`,
        badgeText: "접수",
        badgeTone: "red",
      });
    }

    if (endDate) {
      const key = `${endDate}-RESULT-${title}`;
      map.set(key, {
        date: endDate,
        type: "RESULT",
        title: `${title} 접수 마감`,
        badgeText: "마감",
        badgeTone: "gray",
      });
    }
  });

  return Array.from(map.values());
}

// 대시보드 메인: API 조회/집계 후 히어로, KPI, 캘린더, 목록을 렌더링합니다.
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<DashboardState>({
    totalCount: 0,
    ongoingCount: 0,
    deadlineSoonCount: 0,
    favoriteCount: 0,
    lastSyncLabel: "정보 없음",
    syncHealthy: false,
    soonItems: [],
    updates: [],
    calendarEvents: [],
  });

  useEffect(() => {
    const abortController = new AbortController();

    // 대시보드에 필요한 API를 병렬 조회하고 화면 상태를 갱신합니다.
    async function loadDashboard() {
      setLoading(true);
      setError(null);

      const query = buildDateRangeQuery();

      try {
        const [allRowsRes, deadlineRowsRes, favoriteRowsRes, scheduleLastRes] =
          await Promise.allSettled([
            // 1) 진행중 공고(전체 공고) 조회
            fetchJson<ApiRcvhome[]>(
              `${buildApiUrl("rcvhome-search/rcvhomes")}?${query}`,
              abortController.signal,
              "1번 API(전체 공고)"
            ),
            // 2) D-7 임박 공고 조회
            fetchJson<ApiRcvhome[]>(
              `${buildApiUrl("rcvhome-search/deadline-soon")}?${query}`,
              abortController.signal,
              "2번 API(마감 임박)"
            ),
            // 3) 즐겨찾기 공고 조회
            fetchJson<ApiRcvhome[]>(
              `${buildApiUrl("rcvhome-favorites")}?${query}`,
              abortController.signal,
              "3번 API(즐겨찾기)"
            ),
            // 4) 마지막 동기화 로그 조회
            fetchJson<ScheduleLastResponse>(
              buildApiUrl("schedule-log/last"),
              abortController.signal,
              "4번 API(스케줄 로그)"
            ),
          ]);

        const allRows = allRowsRes.status === "fulfilled" ? allRowsRes.value : [];
        const deadlineRows =
          deadlineRowsRes.status === "fulfilled" ? deadlineRowsRes.value : [];
        const favoriteRows =
          favoriteRowsRes.status === "fulfilled" ? favoriteRowsRes.value : [];
        const scheduleLast =
          scheduleLastRes.status === "fulfilled" ? scheduleLastRes.value : {};

        const partialErrors: string[] = [];
        if (allRowsRes.status === "rejected")
          partialErrors.push(String(allRowsRes.reason?.message ?? allRowsRes.reason));
        if (deadlineRowsRes.status === "rejected")
          partialErrors.push(
            String(deadlineRowsRes.reason?.message ?? deadlineRowsRes.reason)
          );
        if (favoriteRowsRes.status === "rejected")
          partialErrors.push(
            String(favoriteRowsRes.reason?.message ?? favoriteRowsRes.reason)
          );
        if (scheduleLastRes.status === "rejected")
          partialErrors.push(
            String(scheduleLastRes.reason?.message ?? scheduleLastRes.reason)
          );

        const ongoingCount = allRows.filter((row) => {
          const status = row["상태"] ?? "";
          return status.includes("접수중") || status.includes("접수예정");
        }).length;

        const deadlineSoonCount = deadlineRows.length;
        const favoriteCount = favoriteRows.length;
        const lastSyncBase = scheduleLast.endedAt ?? scheduleLast.startedAt;
        const lastSyncLabel = formatRelativeTime(lastSyncBase);
        const syncHealthy = (scheduleLast.status ?? "").toUpperCase() === "SUCCESS";

        const soonItems = deadlineRows.slice(0, 5).map(toSoonItem);

        const updates: UpdateItem[] = [
          {
            id: "log-1",
            title: `동기화 상태: ${scheduleLast.status ?? "UNKNOWN"}`,
            when: lastSyncLabel,
            desc: scheduleLast.scheduleNote ?? "최근 실행 로그가 없습니다.",
          },
          {
            id: "log-2",
            title: "즐겨찾기 공고",
            when: "실시간",
            desc: `현재 즐겨찾기 공고 ${favoriteCount}건`,
          },
          {
            id: "log-3",
            title: "마감 임박 공고",
            when: "실시간",
            desc: `D-7 이내 공고 ${deadlineSoonCount}건`,
          },
        ];

        setState({
          totalCount: allRows.length,
          ongoingCount,
          deadlineSoonCount,
          favoriteCount,
          lastSyncLabel,
          syncHealthy,
          soonItems,
          updates,
          calendarEvents: buildCalendarEvents(allRows),
        });

        setError(partialErrors.length ? partialErrors.join(" | ") : null);
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : "대시보드 로딩 실패");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      abortController.abort();
    };
  }, []);

  const heroStatusText = useMemo(() => {
    if (loading) return "동기화 확인 중";
    return state.syncHealthy ? "정상 동기화" : "동기화 확인 필요";
  }, [loading, state.syncHealthy]);

  return (
    <div className="dashboard-page">
      <section className="dash-hero mb-3">
        <div className="dash-hero-content">
          <div className="dash-hero-eyebrow">CHUNGYAK MONITOR</div>
          <h1 className="dash-hero-title">오늘지 인천의 마이홈 청약 흐름을 한눈에</h1>
          <p className="dash-hero-sub">
            마감 임박, 즐겨찾기, 신규 공고를 실시간으로 추적하고 중요한 일정만
            빠르게 확인하세요.
          </p>
          <div className="dash-hero-badges">
            <span className="hero-badge">
              <FaCheckCircle /> {heroStatusText}
            </span>
            <span className="hero-badge">
              <FaArrowUp /> 전체 공고 {state.totalCount}건
            </span>
            <span className="hero-badge">
              <FaClock /> 마지막 갱신 {state.lastSyncLabel}
            </span>
          </div>
          {error ? <div className="dash-load-error">{error}</div> : null}
        </div>
        <HeroArt />
      </section>

      <DashboardKpi
        totalCount={state.totalCount}
        ongoingCount={state.ongoingCount}
        deadlineSoonCount={state.deadlineSoonCount}
        favoriteCount={state.favoriteCount}
        lastSyncLabel={state.lastSyncLabel}
        syncHealthy={state.syncHealthy}
      />

      <div className="mb-3">
        <DashboardCalendar events={state.calendarEvents} />
      </div>

      <Row>
        <Col lg={7} className="mb-3">
          <Card className="panel-card dash-section-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">마감 임박 (D-7)</h5>
                <button className="btn btn-sm btn-purple">전체보기</button>
              </div>

              <div className="table-wrap">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 110 }}>D-Day</th>
                      <th>공고명</th>
                      <th style={{ width: 140 }}>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.soonItems.map((x) => (
                      <tr key={x.id}>
                        <td className="font-weight-bold">D-{x.dday}</td>
                        <td>
                          <div className="font-weight-bold">{x.title}</div>
                          <div className="small text-muted">
                            {x.region} · {x.period}
                          </div>
                        </td>
                        <td>
                          <span className="status-pill">{x.status}</span>
                        </td>
                      </tr>
                    ))}
                    {!loading && state.soonItems.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-muted p-4">
                          마감 임박 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5} className="mb-3">
          <Card className="panel-card dash-section-card">
            <Card.Body>
              <h5 className="mb-2">최근 업데이트</h5>
              <div className="small text-muted mb-3">
                스케줄 변경과 공고 동기화 이력을 시간순으로 확인합니다.
              </div>
              <div className="d-flex flex-column" style={{ gap: 12 }}>
                {state.updates.map((u) => (
                  <div key={u.id} className="dash-update-item">
                    <div className="d-flex justify-content-between">
                      <div className="font-weight-bold">{u.title}</div>
                      <span className="badge badge-light">{u.when}</span>
                    </div>
                    <div className="small text-muted mt-1">{u.desc}</div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// 히어로 섹션 오른쪽 장식용 SVG 일러스트입니다.
function HeroArt() {
  return (
    <svg
      className="dash-hero-art"
      viewBox="0 0 420 280"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="dashboard illustration"
    >
      <defs>
        <linearGradient id="dashCard" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5f8ff" />
          <stop offset="100%" stopColor="#dbe6ff" />
        </linearGradient>
        <linearGradient id="dashLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd29d" />
          <stop offset="100%" stopColor="#ff9f66" />
        </linearGradient>
      </defs>

      <rect x="40" y="28" width="330" height="220" rx="22" fill="url(#dashCard)" />
      <rect x="70" y="58" width="120" height="72" rx="12" fill="#fff" opacity="0.95" />
      <rect x="206" y="58" width="134" height="28" rx="10" fill="#fff" opacity="0.95" />
      <rect x="206" y="94" width="90" height="12" rx="6" fill="#b9c8ef" />
      <rect x="70" y="146" width="270" height="16" rx="8" fill="#c7d6f5" />
      <rect x="70" y="174" width="222" height="16" rx="8" fill="#d6e1f8" />
      <rect x="70" y="202" width="146" height="16" rx="8" fill="#e2e9fa" />

      <path
        d="M86 118 C122 88, 142 146, 176 112 S236 98, 268 122 S324 138, 350 110"
        fill="none"
        stroke="url(#dashLine)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="86" cy="118" r="7" fill="#ff9f66" />
      <circle cx="176" cy="112" r="7" fill="#ff9f66" />
      <circle cx="268" cy="122" r="7" fill="#ff9f66" />
      <circle cx="350" cy="110" r="7" fill="#ff9f66" />
    </svg>
  );
}
