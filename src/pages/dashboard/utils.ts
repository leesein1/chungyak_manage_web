import type { CalendarEvent } from "@/components/dashboard/DashboardCalendar";
import type {
  ApiRcvhome,
  DashboardState,
  ScheduleLastResponse,
  SoonItem,
  UpdateItem,
} from "./types";

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

// "D-3", "마감" 같은 문자열을 숫자 형태의 D-day로 변환합니다.
function parseDday(text?: string) {
  if (!text) return 999;

  const match = text.match(/D-(\d+)/);
  if (match) return Number(match[1]);
  if (text.includes("마감")) return 0;
  return 999;
}

// 서버 시간 문자열을 현재 기준 상대 시간 텍스트로 변환합니다.
export function formatRelativeTime(iso?: string | null) {
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

// 대시보드 조회에 필요한 기본 기간 파라미터를 생성합니다.
export function buildDateRangeQuery() {
  const from = new Date();
  from.setDate(from.getDate() - 30);

  const to = new Date();
  to.setDate(to.getDate() + 365);

  const qs = new URLSearchParams();
  qs.set("BeginFrom", from.toISOString());
  qs.set("BeginTo", to.toISOString());
  return qs.toString();
}

// API 한 건을 마감 임박 테이블에서 쓰는 ViewModel로 변환합니다.
export function toSoonItem(row: ApiRcvhome): SoonItem {
  return {
    id: row["고유번호"] ?? Math.random().toString(36).slice(2),
    dday: parseDday(row["남은일수"]),
    title: row["공고명"] ?? "공고명 없음",
    region: row["주소"]?.trim() || "지역 정보 없음",
    period: row["접수기간"] ?? "일정 정보 없음",
    status: row["상태"] ?? "상태 미상",
  };
}

// 공고 목록에서 캘린더에 찍을 접수 시작/마감 이벤트를 만듭니다.
export function buildCalendarEvents(rows: ApiRcvhome[]): CalendarEvent[] {
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

// 최근 업데이트 카드에 들어갈 메시지를 구성합니다.
export function buildUpdates(
  scheduleLast: ScheduleLastResponse,
  favoriteCount: number,
  deadlineSoonCount: number,
  lastSyncLabel: string
): UpdateItem[] {
  return [
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
}

// API 원본 응답들을 대시보드 화면 상태 형태로 합칩니다.
export function buildDashboardStateFromApi(
  allRows: ApiRcvhome[],
  deadlineRows: ApiRcvhome[],
  favoriteRows: ApiRcvhome[],
  scheduleLast: ScheduleLastResponse
): DashboardState {
  const ongoingCount = allRows.filter((row) => {
    const status = row["상태"] ?? "";
    return status.includes("접수중") || status.includes("접수예정");
  }).length;

  const deadlineSoonCount = deadlineRows.length;
  const favoriteCount = favoriteRows.length;

  const lastSyncBase = scheduleLast.endedAt ?? scheduleLast.startedAt;
  const lastSyncLabel = formatRelativeTime(lastSyncBase);
  const syncHealthy = (scheduleLast.status ?? "").toUpperCase() === "SUCCESS";

  return {
    totalCount: allRows.length,
    ongoingCount,
    deadlineSoonCount,
    favoriteCount,
    lastSyncLabel,
    syncHealthy,
    soonItems: deadlineRows.slice(0, 5).map(toSoonItem),
    updates: buildUpdates(scheduleLast, favoriteCount, deadlineSoonCount, lastSyncLabel),
    calendarEvents: buildCalendarEvents(allRows),
  };
}
