import type { CalendarEvent } from "@/components/dashboard/DashboardCalendar";
import type {
  ApiRcvhome,
  DashboardState,
  ScheduleLastResponse,
  SoonItem,
  UpdateItem,
} from "./types";

function toIsoDate(value?: string) {
  if (!value) return "";
  const trimmed = value.trim();
  const compact = trimmed.replace(/[.\-/]/g, "");

  if (/^\d{8,14}$/.test(compact)) {
    const ymd = compact.slice(0, 8);
    const y = Number(ymd.slice(0, 4));
    const m = Number(ymd.slice(4, 6));
    const d = Number(ymd.slice(6, 8));
    const date = new Date(y, m - 1, d);

    if (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === y &&
      date.getMonth() === m - 1 &&
      date.getDate() === d
    ) {
      return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDday(text?: string) {
  if (!text) return 999;

  const match = text.match(/D-(\d+)/);
  if (match) return Number(match[1]);
  if (text.includes("마감")) return 0;
  return 999;
}

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

export function toSoonItem(row: ApiRcvhome): SoonItem {
  const rcritPblancDe = toIsoDate(
    row["공고일"] ?? row["청약공고일"] ?? row["모집공고일"] ?? row.RCRIT_PBLANC_DE
  );

  return {
    id: row["고유번호"] ?? Math.random().toString(36).slice(2),
    dday: parseDday(row["남은일수"]),
    title: row["공고명"] ?? "공고명 없음",
    RCRIT_PBLANC_DE: rcritPblancDe || "-",
    region: (row.addressText ?? row["주소"] ?? "").trim() || "지역 정보 없음",
    period: row["접수기간"] ?? "일정 정보 없음",
    status: row.statusText ?? row["상태"] ?? "상태 미상",
  };
}

export function buildCalendarEvents(rows: ApiRcvhome[]): CalendarEvent[] {
  const map = new Map<string, CalendarEvent>();

  // 지도/달력 패널 성능을 위해 상위 일부만 이벤트로 구성
  rows.slice(0, 40).forEach((row) => {
    const title = row["공고명"] ?? "공고";
    const status = row.statusText ?? row["상태"];
    const address = row.addressText ?? row["주소"];
    const announceDate = toIsoDate(
      row["공고일"] ?? row["청약공고일"] ?? row["모집공고일"] ?? row.RCRIT_PBLANC_DE
    );
    const startDate = toIsoDate(row["접수시작일"]);
    const endDate = toIsoDate(row["접수마감일"]);

    if (announceDate) {
      const key = `${announceDate}-ANNOUNCE-${title}`;
      map.set(key, {
        date: announceDate,
        type: "ANNOUNCE",
        title: `${title} 모집 공고`,
        badgeText: "공고",
        badgeTone: "blue",
        // 지도 패널에서 "선택 날짜 기준 단계"를 설명하기 위한 메타
        status,
        address,
        linkUrl: row.url,
      });
    }

    if (startDate) {
      const key = `${startDate}-RECEIVE-${title}`;
      map.set(key, {
        date: startDate,
        type: "RECEIVE",
        title: `${title} 접수 시작`,
        badgeText: "접수",
        badgeTone: "red",
        status,
        address,
        linkUrl: row.url,
      });
    }

    if (endDate) {
      const key = `${endDate}-RESULT-${title}`;
      map.set(key, {
        date: endDate,
        type: "RESULT",
        title: `${title} 접수 마감`,
        badgeText: "마감",
        badgeTone: "orange",
        status,
        address,
        linkUrl: row.url,
      });
    }
  });

  return Array.from(map.values());
}

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

export function buildDashboardStateFromApi(
  allRows: ApiRcvhome[],
  deadlineRows: ApiRcvhome[],
  favoriteRows: ApiRcvhome[],
  scheduleLast: ScheduleLastResponse
): DashboardState {
  const ongoingCount = allRows.filter((row) => {
    const status = row.statusText ?? row["상태"] ?? "";
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
    soonItems: deadlineRows.map(toSoonItem),
    favoriteItems: favoriteRows.map(toSoonItem),
    updates: buildUpdates(scheduleLast, favoriteCount, deadlineSoonCount, lastSyncLabel),
    calendarEvents: buildCalendarEvents(allRows),
  };
}
