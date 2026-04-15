/*
 * @file-overview
 * 파일: src/pages/alarmlog/api.ts
 * 설명: 조회로그 API 연동 함수들을 제공합니다.
 */

import type { AlarmLogItem, AlarmLogQuery, AlarmSendStatusFilter } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_PROXY_PREFIX = "/backend-api";

function buildApiUrl(path: string) {
  if (API_BASE_URL) return `${API_BASE_URL}/api/${path}`;
  return `${API_PROXY_PREFIX}/${path}`;
}

function normalizeSendStatus(status?: string) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "SUCCESS" || normalized === "FAIL") return normalized;
  if (normalized === "FAILED") return "FAIL";
  return status ?? "UNKNOWN";
}

function getString(raw: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function normalizeItem(raw: Record<string, unknown>): AlarmLogItem {
  const idxRaw = raw.idx ?? raw.id ?? raw.logId;
  const idx = typeof idxRaw === "number" ? idxRaw : Number(idxRaw ?? 0);
  const sendAt = getString(raw, ["sendAt", "sendTime", "sentAt", "createdAt", "createTime", "startedAt"]) ?? "";
  const sendStatus = normalizeSendStatus(getString(raw, ["sendStatus", "status"]));
  const alarmTitle = getString(raw, ["alarmTitle"]);
  const alarmMessage = getString(raw, ["alarmMessage"]);
  const fullMessage = [alarmTitle, alarmMessage].filter((x): x is string => Boolean(x && x.trim())).join(" ");

  return {
    idx,
    sendStatus,
    sendAt,
    target: getString(raw, ["target", "receiver", "channel", "destination", "pblancId", "alarmSource"]),
    message: fullMessage || getString(raw, ["message", "sendMessage", "note", "scheduleNote", "alarmMessage", "errorMessage"]),
  };
}

export async function fetchAlarmLogs(query: AlarmLogQuery, signal?: AbortSignal) {
  const qs = new URLSearchParams();
  if (query.sendFrom) qs.set("sendFrom", query.sendFrom);
  if (query.sendTo) qs.set("sendTo", query.sendTo);
  if (query.sendStatus !== "ALL") qs.set("sendStatus", query.sendStatus);

  const url = `${buildApiUrl("alarm-log")}?${qs.toString()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`조회 로그 조회 실패 (${res.status})`);

  const json = (await res.json()) as unknown;
  if (!Array.isArray(json)) return [];

  return json
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .map(normalizeItem)
    .filter((row) => row.sendAt);
}

export function formatSendStatusForFilter(status?: string): Exclude<AlarmSendStatusFilter, "ALL"> | "OTHER" {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "SUCCESS") return "SUCCESS";
  if (normalized === "FAIL" || normalized === "FAILED") return "FAIL";
  return "OTHER";
}

export function getSendStatusFilterLabel(status: AlarmSendStatusFilter) {
  if (status === "ALL") return "ALL";
  return status;
}
