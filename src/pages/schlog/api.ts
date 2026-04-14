/*
 * @file-overview
 * 파일: src/pages/schlog/api.ts
 * 설명: SCHLog API 연동 함수들을 제공합니다.
 */

import type { JobCodeFilter, LogStatusFilter, ScheduleLogItem, ScheduleLogQuery } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_PROXY_PREFIX = "/backend-api";

function buildApiUrl(path: string) {
  if (API_BASE_URL) return `${API_BASE_URL}/api/${path}`;
  return `${API_PROXY_PREFIX}/${path}`;
}

function toIsoStart(dateYmd: string) {
  const date = new Date(`${dateYmd}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function toIsoEnd(dateYmd: string) {
  const date = new Date(`${dateYmd}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function normalizeStatus(status?: string) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "SUCCESS" || normalized === "FAILED" || normalized === "RUNNING") return normalized;
  return status ?? "UNKNOWN";
}

function normalizeItem(raw: Record<string, unknown>): ScheduleLogItem {
  const idx = typeof raw.idx === "number" ? raw.idx : Number(raw.idx ?? 0);
  const jobCode = typeof raw.jobCode === "number" ? raw.jobCode : Number(raw.jobCode ?? 0);

  return {
    idx,
    jobCode,
    jobCodeName: typeof raw.jobCodeName === "string" ? raw.jobCodeName : undefined,
    jobDesc: typeof raw.jobDesc === "string" ? raw.jobDesc : undefined,
    status: normalizeStatus(typeof raw.status === "string" ? raw.status : undefined),
    startedAt: typeof raw.startedAt === "string" ? raw.startedAt : "",
    endedAt: typeof raw.endedAt === "string" ? raw.endedAt : undefined,
    scheduleNote: typeof raw.scheduleNote === "string" ? raw.scheduleNote : undefined,
  };
}

export async function fetchScheduleLogs(query: ScheduleLogQuery, signal?: AbortSignal) {
  const qs = new URLSearchParams();

  const fromIso = toIsoStart(query.startedFrom);
  const toIso = toIsoEnd(query.startedTo);

  if (fromIso) qs.set("StartedFrom", fromIso);
  if (toIso) qs.set("StartedTo", toIso);

  if (query.status !== "ALL") {
    qs.set("Status", query.status);
  }

  if (query.jobCode !== "ALL") {
    // Swagger: JobCode(string). 허용값은 SYNC, CLOSE만 전달한다.
    qs.set("JobCode", query.jobCode);
  }

  const url = `${buildApiUrl("schedule-log")}?${qs.toString()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`스케줄 로그 조회 실패 (${res.status})`);

  const json = (await res.json()) as unknown;
  if (!Array.isArray(json)) return [];

  return json
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .map(normalizeItem)
    .filter((row) => row.startedAt);
}

export function formatStatusForFilter(status?: string): Exclude<LogStatusFilter, "ALL"> | "OTHER" {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "SUCCESS") return "SUCCESS";
  if (normalized === "FAILED") return "FAILED";
  return "OTHER";
}

export function getJobDescByCode(code: number, desc?: string) {
  if (desc && desc.trim()) return desc;
  if (code === 1) return "SYNC";
  if (code === 2) return "CLOSE";
  return "UNKNOWN";
}

export function getJobCodeFilterLabel(code: JobCodeFilter) {
  if (code === "SYNC") return "SYNC";
  if (code === "CLOSE") return "CLOSE";
  return "ALL";
}

export function getStatusFilterLabel(status: LogStatusFilter) {
  if (status === "ALL") return "ALL";
  return status;
}

