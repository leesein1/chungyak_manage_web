import type { CalendarEvent } from "@/components/dashboard/DashboardCalendar";

export type ApiRcvhome = {
  "고유번호"?: string;
  "공고명"?: string;
  "단지명"?: string;
  "상태"?: string;
  "접수시작일"?: string;
  "접수마감일"?: string;
  "접수기간"?: string;
  "주소"?: string;
  "남은일수"?: string;
  url?: string;
  "즐겨찾기"?: boolean;
};

export type ScheduleLastResponse = {
  status?: string;
  startedAt?: string;
  endedAt?: string | null;
  scheduleNote?: string | null;
};

export type SoonItem = {
  id: string;
  dday: number;
  title: string;
  region: string;
  period: string;
  status: string;
};

export type UpdateItem = {
  id: string;
  title: string;
  when: string;
  desc: string;
};

export type DashboardState = {
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

export const initialDashboardState: DashboardState = {
  totalCount: 0,
  ongoingCount: 0,
  deadlineSoonCount: 0,
  favoriteCount: 0,
  lastSyncLabel: "정보 없음",
  syncHealthy: false,
  soonItems: [],
  updates: [],
  calendarEvents: [],
};
