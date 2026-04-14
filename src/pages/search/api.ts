/*
 * @file-overview
 * 파일: src/pages\search\api.ts
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

import type {
  SearchDetailItem,
  SearchFilterParams,
  SearchListItem,
  SearchStatusFilter,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_PROXY_PREFIX = "/backend-api";

// search 도메인 API 호출용 URL(실서버/프록시)을 통일해서 만든다.
function buildApiUrl(path: string) {
  if (API_BASE_URL) return `${API_BASE_URL}/api/${path}`;
  return `${API_PROXY_PREFIX}/${path}`;
}

// 화면 상태 필터값을 API query 값으로 변환한다.
function statusToQueryValue(status: SearchStatusFilter) {
  if (status === "all") return "";
  return status;
}

// 날짜 입력값을 하루 시작 시각 ISO로 변환한다.
function toIsoStart(dateYmd?: string) {
  if (!dateYmd) return "";
  const date = new Date(`${dateYmd}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

// 날짜 입력값을 하루 끝 시각 ISO로 변환한다.
function toIsoEnd(dateYmd?: string) {
  if (!dateYmd) return "";
  const date = new Date(`${dateYmd}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

// 검색 목록 API에서 쓰는 BeginFrom/BeginTo 쿼리를 생성한다.
function buildDateRangeQuery(beginFrom?: string, beginTo?: string) {
  const qs = new URLSearchParams();

  const defaultFrom = new Date();
  defaultFrom.setMonth(defaultFrom.getMonth() - 2);
  const defaultTo = new Date();
  defaultTo.setFullYear(defaultTo.getFullYear() + 1);

  qs.set("BeginFrom", toIsoStart(beginFrom) || defaultFrom.toISOString());
  qs.set("BeginTo", toIsoEnd(beginTo) || defaultTo.toISOString());
  return qs;
}

// D-day 문자열을 숫자 비교 가능한 값으로 파싱한다.
function parseDday(text: string) {
  const normalized = text.trim();
  const matched = normalized.match(/D-(\d+)/i);
  if (matched) return Number(matched[1]);
  if (normalized.includes("마감")) return 0;
  return Number.POSITIVE_INFINITY;
}

// 날짜 문자열을 yyyy-mm-dd 형식으로 화면 표시용 정규화한다.
function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 응답 객체에서 지정한 후보 키 중 첫 번째 텍스트 값을 꺼낸다.
function getText(raw: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "bigint") return String(value);
  }
  return "";
}

// 응답 객체에서 지정한 후보 키 중 첫 번째 boolean 값을 꺼낸다.
function getBool(raw: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "boolean") return value;
  }
  return false;
}

// search 도메인의 공통 fetch 래퍼.
async function fetchJson<T>(url: string, signal: AbortSignal, label: string): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${label} 실패 (${res.status})`);
  return (await res.json()) as T;
}

// 공고의 기본 식별자(pblancId)를 여러 키 후보에서 안전하게 추출한다.
function getPrimaryId(raw: Record<string, unknown>) {
  return getText(raw, ["고유번호", "pblancId", "PBLANC_ID", "id"]);
}

// 목록 API 한 행을 화면 목록 모델(SearchListItem)로 변환한다.
function mapListRow(raw: Record<string, unknown>, index: number): SearchListItem {
  const apiId = getPrimaryId(raw);
  const order = getText(raw, ["순서", "order", "NO"]);
  const title = getText(raw, ["공고명", "noticeName", "PBLANC_NM"]);
  const complex = getText(raw, ["단지명", "complexName", "HSMP_NM"]);
  const status = getText(raw, ["상태", "status", "rawStatus", "STTUS_NM"]);
  const begin = getText(raw, ["접수시작일", "beginDate", "BEGIN_DE"]);
  const end = getText(raw, ["접수마감일", "endDate", "END_DE"]);
  const period =
    getText(raw, ["접수기간", "dateRangeText"]) || `${formatDate(begin)} ~ ${formatDate(end)}`;
  const region =
    getText(raw, ["지역", "brtcName", "signguName"]) ||
    [getText(raw, ["brtcName"]), getText(raw, ["signguName"])].filter(Boolean).join(" ");
  const ddaySource = getText(raw, ["남은일수", "ddayText", "D_DAY"]);
  const ddayValue = parseDday(ddaySource);

  return {
    id: `${apiId || "noid"}:${order || "row"}:${index}`,
    apiId,
    title: title || "공고명 없음",
    complex: complex || "단지명 없음",
    region: region || "지역 정보 없음",
    period: period || "일정 정보 없음",
    status: status || "상태 미상",
    ddayText: ddaySource || "-",
    ddayValue,
    url: getText(raw, ["url", "URL"]),
    favored: getBool(raw, ["즐겨찾기", "isFavorite", "favorite"]),
  };
}

// 상세 API 응답을 상세 패널 모델(SearchDetailItem)로 변환한다.
function mapDetail(raw: Record<string, unknown>): SearchDetailItem {
  const mapped = mapListRow(raw, 0);
  const apiId = getPrimaryId(raw);
  const address = getText(raw, ["주소", "address", "FULL_ADRES"]);
  const announcementDateText = formatDate(
    getText(raw, ["공고일", "announcementDate", "RCRIT_PBLANC_DE"])
  );

  return {
    id: apiId || mapped.apiId || "-",
    title: mapped.title,
    complex: mapped.complex,
    region: mapped.region,
    address: address || "-",
    period: mapped.period,
    status: getText(raw, ["status", "상태"]) || mapped.status,
    rawStatus: getText(raw, ["rawStatus", "상태"]) || mapped.status,
    ddayText: mapped.ddayText,
    url: mapped.url,
    isFavorite: getBool(raw, ["isFavorite", "즐겨찾기", "favorite"]),
    announcementDateText,
  };
}

// 검색 조건으로 목록 API를 호출하고 화면 모델 배열로 반환한다.
export async function fetchSearchList(params: SearchFilterParams, signal: AbortSignal) {
  const qs = buildDateRangeQuery(params.beginFrom, params.beginTo);
  if (params.keyword.trim()) qs.set("Keyword", params.keyword.trim());
  const statusQueryValue = statusToQueryValue(params.status);
  if (statusQueryValue) qs.set("Status", statusQueryValue);

  const endpoint = params.onlySoon ? "rcvhome-search/deadline-soon" : "rcvhome-search/rcvhomes";
  const rows = await fetchJson<unknown[]>(
    `${buildApiUrl(endpoint)}?${qs.toString()}`,
    signal,
    "검색 목록 조회"
  );

  const mapped = rows
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .map((row, idx) => mapListRow(row, idx));

  if (params.onlyFavorite) {
    return mapped.filter((row) => row.favored);
  }

  if (params.onlyOngoing) {
    return mapped.filter((row) => /접수중|접수예정/.test(row.status));
  }

  return mapped;
}

// 선택한 공고 ID 기준으로 상세 API를 조회한다.
export async function fetchSearchDetail(pblancId: string, signal: AbortSignal) {
  const detail = await fetchJson<Record<string, unknown>>(
    buildApiUrl(`rcvhome-search/rcvhomes/${encodeURIComponent(pblancId)}`),
    signal,
    "공고 상세 조회"
  );
  return mapDetail(detail);
}

// 즐겨찾기 상태를 서버에 반영한다. (현재 true면 DELETE, false면 POST)
export async function toggleFavorite(pblancId: string, isFavorite: boolean) {
  const method = isFavorite ? "DELETE" : "POST";
  const res = await fetch(buildApiUrl(`rcvhome-favorites/${encodeURIComponent(pblancId)}`), {
    method,
  });
  if (!res.ok) {
    throw new Error(`즐겨찾기 ${isFavorite ? "해제" : "추가"} 실패 (${res.status})`);
  }
}
