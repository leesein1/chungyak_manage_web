import type { ApiRcvhome, ScheduleLastResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_PROXY_PREFIX = "/backend-api";

// API_BASE_URL이 있으면 직접 백엔드로, 없으면 프록시 경로로 요청합니다.
function buildApiUrl(path: string) {
  if (API_BASE_URL) return `${API_BASE_URL}/api/${path}`;
  return `${API_PROXY_PREFIX}/${path}`;
}

// 공통 JSON fetch 유틸입니다. 상태코드/콘텐츠 타입/파싱 오류를 구분해서 에러를 냅니다.
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

// 대시보드 4개 API를 병렬 호출합니다.
export function fetchDashboardApis(query: string, signal: AbortSignal) {
  return Promise.allSettled([
    fetchJson<ApiRcvhome[]>(
      `${buildApiUrl("rcvhome-search/rcvhomes")}?${query}`,
      signal,
      "1번 API(전체 공고)"
    ),
    fetchJson<ApiRcvhome[]>(
      `${buildApiUrl("rcvhome-search/deadline-soon")}?${query}`,
      signal,
      "2번 API(마감 임박)"
    ),
    fetchJson<ApiRcvhome[]>(
      `${buildApiUrl("rcvhome-favorites")}?${query}`,
      signal,
      "3번 API(즐겨찾기)"
    ),
    fetchJson<ScheduleLastResponse>(
      buildApiUrl("schedule-log/last?jobCode=1"),
      signal,
      "4번 API(스케줄 로그)"
    ),
  ]);
}
