/*
 * @file-overview
 * 파일: src/pages\dashboard\api.ts
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

import type { ApiRcvhome, ScheduleLastResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_PROXY_PREFIX = "/backend-api";

const K_ID = "\uace0\uc720\ubc88\ud638";
const K_TITLE = "\uacf5\uace0\uba85";
const K_NOTICE_DATE = "\uacf5\uace0\uc77c";
const K_COMPLEX = "\ub2e8\uc9c0\uba85";
const K_STATUS = "\uc0c1\ud0dc";
const K_ANNOUNCE = "\uccad\uc57d\uacf5\uace0\uc77c";
const K_RECRUIT_ANNOUNCE = "\ubaa8\uc9d1\uacf5\uace0\uc77c";
const K_BEGIN = "\uc811\uc218\uc2dc\uc791\uc77c";
const K_END = "\uc811\uc218\ub9c8\uac10\uc77c";
const K_PERIOD = "\uc811\uc218\uae30\uac04";
const K_ADDR = "\uc8fc\uc18c";
const K_DDAY = "\ub0a8\uc740\uc77c\uc218";
const K_FAVORITE = "\uc990\uaca8\ucc3e\uae30";

// 대시보드 API 호출에서 절대 URL/프록시 URL을 통일해서 만든다.
function buildApiUrl(path: string) {
  if (API_BASE_URL) return `${API_BASE_URL}/api/${path}`;
  return `${API_PROXY_PREFIX}/${path}`;
}

// 대시보드 API의 공통 fetch 래퍼: HTTP 상태/JSON 파싱 실패를 명시적으로 처리한다.
async function fetchJson<T>(url: string, signal: AbortSignal, label: string): Promise<T> {
  const res = await fetch(url, { signal });
  const text = await res.text();

  if (!res.ok) throw new Error(`${label} failed (${res.status})`);

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`${label} failed (non-JSON: ${contentType || "unknown"})`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${label} failed (JSON parse error)`);
  }
}

// 숫자/문자/Date 값을 화면 모델에서 쓰기 쉬운 문자열로 변환한다.
function toText(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (value instanceof Date) return value.toISOString();
  return undefined;
}

// API에서 내려오는 boolean 필드만 안전하게 추출한다.
function toBool(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

// 응답 키가 여러 형태(한글/영문/대소문자)로 내려와도 값을 찾도록 보정한다.
function getValue(raw: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) return raw[key];
  }

  const keyMap = new Map<string, unknown>();
  Object.keys(raw).forEach((key) => {
    keyMap.set(key.toLowerCase(), raw[key]);
  });

  for (const key of keys) {
    const found = keyMap.get(key.toLowerCase());
    if (found !== undefined) return found;
  }

  return undefined;
}

// 대시보드 API의 공고 1건을 앱 내부 표준 모델(ApiRcvhome)로 정규화한다.
function normalizeRcvhomeRow(raw: Record<string, unknown>): ApiRcvhome {
  const beginDate = toText(getValue(raw, [K_BEGIN, "BEGIN_DE", "beginDe", "beginDate"]));
  const endDate = toText(getValue(raw, [K_END, "END_DE", "endDe", "endDate"]));
  const statusText = toText(getValue(raw, [K_STATUS, "STTUS_NM", "sttusNm"]));
  const addressText = toText(getValue(raw, [K_ADDR, "FULL_ADRES", "fullAdres"]));
  const period = toText(getValue(raw, [K_PERIOD, "period"])) ?? (beginDate && endDate ? `${beginDate} ~ ${endDate}` : undefined);

  return {
    [K_ID]: toText(getValue(raw, [K_ID, "PBLANC_ID", "pblancId"])),
    [K_TITLE]: toText(getValue(raw, [K_TITLE, "PBLANC_NM", "pblancNm"])),
    [K_COMPLEX]: toText(getValue(raw, [K_COMPLEX, "HSMP_NM", "hsmpNm"])),
    [K_STATUS]: statusText,
    [K_NOTICE_DATE]: toText(
      getValue(raw, [K_NOTICE_DATE, K_ANNOUNCE, K_RECRUIT_ANNOUNCE, "RCRIT_PBLANC_DE", "rcritPblancDe"])
    ),
    [K_ANNOUNCE]: toText(
      getValue(raw, [K_ANNOUNCE, K_NOTICE_DATE, K_RECRUIT_ANNOUNCE, "RCRIT_PBLANC_DE", "rcritPblancDe"])
    ),
    [K_RECRUIT_ANNOUNCE]: toText(
      getValue(raw, [K_RECRUIT_ANNOUNCE, "RCRIT_PBLANC_DE", "rcritPblancDe"])
    ),
    RCRIT_PBLANC_DE: toText(getValue(raw, ["RCRIT_PBLANC_DE", "rcritPblancDe"])),
    [K_BEGIN]: beginDate,
    [K_END]: endDate,
    [K_PERIOD]: period,
    [K_ADDR]: addressText,
    [K_DDAY]: toText(getValue(raw, [K_DDAY, "dday", "D_DAY"])),
    url: toText(getValue(raw, ["url", "URL"])),
    [K_FAVORITE]: toBool(getValue(raw, [K_FAVORITE, "favorite", "isFavorite"])),
    statusText,
    addressText,
  };
}

// 공고 목록 API 응답 배열을 읽고 정규화하며, 디버깅용 로그를 함께 남긴다.
async function fetchRcvhomeRows(url: string, signal: AbortSignal, label: string) {
  const rows = await fetchJson<unknown[]>(url, signal, label);
  if (!Array.isArray(rows)) return [];

  if (label === "deadline soon" || label === "favorites") {
    console.groupCollapsed(`[Dashboard API] ${label}`);
    console.log("requestUrl:", url);
    console.log("rawCount:", rows.length);
    console.log("rawSample:", rows[0] ?? null);
    console.table(
      rows.slice(0, 30).map((row, idx) => ({
        idx: idx + 1,
        ...(typeof row === "object" && row !== null ? (row as Record<string, unknown>) : {}),
      }))
    );
    console.groupEnd();
  }

  return rows
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .map(normalizeRcvhomeRow);
}

// 대시보드 진입 시 필요한 4개 API(전체/임박/즐겨찾기/동기화로그)를 병렬 호출한다.
export function fetchDashboardApis(query: string, signal: AbortSignal) {
  return Promise.allSettled([
    fetchRcvhomeRows(`${buildApiUrl("rcvhome-search/rcvhomes")}?${query}`, signal, "all announcements"),
    fetchRcvhomeRows(`${buildApiUrl("rcvhome-search/deadline-soon")}?${query}`, signal, "deadline soon"),
    fetchRcvhomeRows(`${buildApiUrl("rcvhome-favorites")}?${query}`, signal, "favorites"),
    fetchJson<ScheduleLastResponse>(buildApiUrl("schedule-log/last?jobCode=1"), signal, "schedule log"),
  ]);
}
