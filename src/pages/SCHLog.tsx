/*
 * @file-overview
 * 파일: src/pages/SCHLog.tsx
 * 설명: SCHLog(스케줄 로그) 조회 화면을 제공합니다.
 */

import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import type { JobCodeFilter, LogStatusFilter, ScheduleLogItem } from "./schlog/types";
import {
  fetchScheduleLogs,
  formatStatusForFilter,
  getJobCodeFilterLabel,
  getJobDescByCode,
  getStatusFilterLabel,
} from "./schlog/api";
import "./SCHLog.css";

const LIST_PAGE_SIZE = 5;

function parseDateTime(raw?: string) {
  if (!raw) return null;
  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) return date;
  const fallback = new Date(raw.replace(" ", "T"));
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function getDurationMs(item: ScheduleLogItem) {
  const start = parseDateTime(item.startedAt);
  const end = parseDateTime(item.endedAt);
  if (!start || !end) return undefined;
  return Math.max(0, end.getTime() - start.getTime());
}

function formatMs(ms?: number) {
  if (typeof ms !== "number") return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDateTime(raw?: string) {
  const parsed = parseDateTime(raw);
  if (!parsed) return raw ?? "-";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  const hh = String(parsed.getHours()).padStart(2, "0");
  const mm = String(parsed.getMinutes()).padStart(2, "0");
  const ss = String(parsed.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

// SCHLog: /api/schedule-log 기준으로 스케줄 로그를 조회한다.
export default function SCHLog() {
  const today = new Date();
  const defaultFrom = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const defaultTo = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [q, setQ] = useState("");
  const [startedFrom, setStartedFrom] = useState(defaultFrom);
  const [startedTo, setStartedTo] = useState(defaultTo);
  const [status, setStatus] = useState<LogStatusFilter>("ALL");
  const [jobCode, setJobCode] = useState<JobCodeFilter>("ALL");
  const [advancedOpen, setAdvancedOpen] = useState(true);

  const [applied, setApplied] = useState({
    q: "",
    startedFrom: defaultFrom,
    startedTo: defaultTo,
    status: "ALL" as LogStatusFilter,
    jobCode: "ALL" as JobCodeFilter,
  });

  const [rowsRaw, setRowsRaw] = useState<ScheduleLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(LIST_PAGE_SIZE);

  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError(null);

    fetchScheduleLogs(
      {
        startedFrom: applied.startedFrom,
        startedTo: applied.startedTo,
        status: applied.status,
        jobCode: applied.jobCode,
      },
      abort.signal,
    )
      .then((list) => {
        setRowsRaw(list);
        setVisibleCount(LIST_PAGE_SIZE);
      })
      .catch((err) => {
        if (abort.signal.aborted) return;
        setRowsRaw([]);
        setError(err instanceof Error ? err.message : "스케줄 로그 조회에 실패했습니다.");
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });

    return () => abort.abort();
  }, [applied.startedFrom, applied.startedTo, applied.status, applied.jobCode]);

  const rows = useMemo(() => {
    if (!applied.q.trim()) return rowsRaw;
    const keyword = applied.q.trim().toLowerCase();
    return rowsRaw.filter((row) => {
      const text = `${row.idx} ${row.jobCode} ${getJobDescByCode(row.jobCode, row.jobDesc)} ${row.status ?? ""} ${row.scheduleNote ?? ""}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [applied.q, rowsRaw]);

  const visibleRows = useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount]);
  const hasMore = visibleCount < rows.length;

  const summary = useMemo(() => {
    const successCount = rows.filter((x) => formatStatusForFilter(x.status) === "SUCCESS").length;
    const failedCount = rows.filter((x) => formatStatusForFilter(x.status) === "FAILED").length;

    const durationRows = rows.map((row) => getDurationMs(row)).filter((ms): ms is number => typeof ms === "number");
    const avgDurationMs = durationRows.length ? Math.round(durationRows.reduce((acc, cur) => acc + cur, 0) / durationRows.length) : 0;

    const syncCount = rows.filter((x) => getJobDescByCode(x.jobCode, x.jobDesc) === "SYNC").length;
    const closeCount = rows.filter((x) => getJobDescByCode(x.jobCode, x.jobDesc) === "CLOSE").length;

    const recentRuns = [...rows].sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)).slice(0, 6);
    return { successCount, failedCount, avgDurationMs, syncCount, closeCount, recentRuns };
  }, [rows]);

  const handleSearch = () => {
    setApplied({ q, startedFrom, startedTo, status, jobCode });
  };

  const chips = useMemo(() => {
    const result = [
      `시작일: ${applied.startedFrom} ~ ${applied.startedTo}`,
      `상태: ${getStatusFilterLabel(applied.status)}`,
      `잡코드: ${getJobCodeFilterLabel(applied.jobCode)}`,
    ];
    if (applied.q.trim()) result.push(`키워드: ${applied.q.trim()}`);
    return result;
  }, [applied]);

  return (
    <div className="logs-page">
      <section className="logs-hero panel-card">
        <h2>스케줄 로그</h2>
        <h6 className="logs-hero-desc">GitHub Action을 활용해 실행되는 스케줄 작업 로그를 확인하는 화면입니다.</h6>

        <div className="logs-bar-row">
          <input
            className="logs-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="IDX / JOB_CODE / JOB_DESC / STATUS / SCHEDULE_NOTE"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button className="logs-btn" type="button" onClick={handleSearch} aria-label="로그 조회 실행" disabled={loading}>
            <FaSearch />
          </button>
          <button
            type="button"
            className={`logs-toggle-btn ${advancedOpen ? "is-open" : ""}`}
            onClick={() => setAdvancedOpen((prev) => !prev)}
            aria-expanded={advancedOpen}
          >
            상세보기
          </button>
        </div>

        {advancedOpen ? (
          <div className="logs-advanced">
            <div className="logs-advanced-row">
              <div className="logs-advanced-label">Status</div>
              <div className="logs-advanced-controls">
                {(["ALL", "SUCCESS", "FAILED"] as LogStatusFilter[]).map((s) => (
                  <label key={s} className="logs-radio">
                    <input type="radio" name="status" checked={status === s} onChange={() => setStatus(s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <div className="logs-advanced-row">
              <div className="logs-advanced-label">JobCode</div>
              <div className="logs-advanced-controls">
                {(["ALL", "SYNC", "CLOSE"] as JobCodeFilter[]).map((c) => (
                  <label key={c} className="logs-radio">
                    <input type="radio" name="jobCode" checked={jobCode === c} onChange={() => setJobCode(c)} />
                    {c === "ALL" ? "ALL" : c}
                  </label>
                ))}
              </div>
            </div>

            <div className="logs-advanced-row">
              <div className="logs-advanced-label">기간</div>
              <div className="logs-advanced-controls">
                <input type="date" value={startedFrom} onChange={(e) => setStartedFrom(e.target.value)} />
                <span>~</span>
                <input type="date" value={startedTo} onChange={(e) => setStartedTo(e.target.value)} />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="logs-content panel-card">
        <div className="logs-applied-wrap">
          <div className="logs-applied-title">
            적용된 조건 / 로그 <strong>{rows.length.toLocaleString()}건</strong>
          </div>
          <div className="logs-chip-row">
            {chips.map((chip) => (
              <span key={chip} className="logs-chip">{chip}</span>
            ))}
          </div>
          {error ? <div className="logs-error">{error}</div> : null}
        </div>

        <div className="logs-main-grid">
          <div>
            <div className="table-wrap logs-table-wrap">
              <table className="table table-sm mb-0 logs-table">
                <thead>
                  <tr>
                    <th style={{ width: 64 }}>IDX</th>
                    <th style={{ width: 110 }}>JOB_CODE</th>
                    <th style={{ width: 120 }}>JOB_DESC</th>
                    <th style={{ width: 110 }}>STATUS</th>
                    <th style={{ minWidth: 160 }}>STARTED_AT</th>
                    <th style={{ minWidth: 160 }}>ENDED_AT</th>
                    <th style={{ width: 110 }}>DURATION</th>
                    <th style={{ minWidth: 320 }}>SCHEDULE_NOTE</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.idx}>
                      <td className="font-weight-bold text-muted">{row.idx}</td>
                      <td>{row.jobCode}</td>
                      <td>{getJobDescByCode(row.jobCode, row.jobDesc)}</td>
                      <td>
                        <span className={`logs-status ${formatStatusForFilter(row.status).toLowerCase()}`}>{row.status ?? "-"}</span>
                      </td>
                      <td>{formatDateTime(row.startedAt)}</td>
                      <td>{row.endedAt ? formatDateTime(row.endedAt) : "진행중"}</td>
                      <td>{formatMs(getDurationMs(row))}</td>
                      <td className="logs-message-cell" title={row.scheduleNote ?? ""}>{row.scheduleNote ?? "-"}</td>
                    </tr>
                  ))}
                  {visibleRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-muted p-4">조회 결과가 없습니다.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {hasMore ? (
              <div className="logs-loadmore-wrap">
                <button className="logs-loadmore-btn" type="button" onClick={() => setVisibleCount((prev) => prev + LIST_PAGE_SIZE)}>
                  더보기 (현재 {visibleRows.length} / 전체 {rows.length})
                </button>
              </div>
            ) : null}
          </div>

          <aside className="logs-right panel-card">
            <h3>스케줄 동작 현황</h3>
            <div className="logs-kpi-grid">
              <div className="logs-kpi-card"><div className="logs-kpi-label">SUCCESS</div><div className="logs-kpi-value">{summary.successCount}</div></div>
              <div className="logs-kpi-card"><div className="logs-kpi-label">FAILED</div><div className="logs-kpi-value">{summary.failedCount}</div></div>
              <div className="logs-kpi-card"><div className="logs-kpi-label">SYNC</div><div className="logs-kpi-value">{summary.syncCount}</div></div>
              <div className="logs-kpi-card"><div className="logs-kpi-label">CLOSE</div><div className="logs-kpi-value">{summary.closeCount}</div></div>
              <div className="logs-kpi-card logs-kpi-wide"><div className="logs-kpi-label">평균 소요</div><div className="logs-kpi-value">{formatMs(summary.avgDurationMs)}</div></div>
            </div>

            <section className="logs-side-section">
              <div className="logs-side-title">최근 동작</div>
              <div className="logs-side-list">
                {summary.recentRuns.map((run) => (
                  <div key={run.idx} className="logs-side-item">
                    <div className="logs-side-main">{formatDateTime(run.startedAt)} · [{run.jobCode}] {getJobDescByCode(run.jobCode, run.jobDesc)}</div>
                    <div className="logs-side-sub">{run.status ?? "-"} · {run.scheduleNote ?? "-"}</div>
                  </div>
                ))}
                {summary.recentRuns.length === 0 ? <div className="logs-side-empty">최근 동작이 없습니다.</div> : null}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}

