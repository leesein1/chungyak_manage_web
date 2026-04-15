/*
 * @file-overview
 * 파일: src/pages/ALMLog.tsx
 * 설명: ALMLog(조회 로그) 조회 화면을 제공합니다.
 */

import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import type { AlarmLogItem, AlarmSendStatusFilter } from "./alarmlog/types";
import {
  fetchAlarmLogs,
  formatSendStatusForFilter,
  getSendStatusFilterLabel,
} from "./alarmlog/api";
import "./SCHLog.css";

const LIST_PAGE_SIZE = 5;

function parseDateTime(raw?: string) {
  if (!raw) return null;
  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) return date;
  const fallback = new Date(raw.replace(" ", "T"));
  return Number.isNaN(fallback.getTime()) ? null : fallback;
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

// ALMLog: /api/alarm-log 기준으로 조회 로그를 조회한다.
export default function ALMLog() {
  const today = new Date();
  const defaultFrom = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const defaultTo = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [q, setQ] = useState("");
  const [sendFrom, setSendFrom] = useState(defaultFrom);
  const [sendTo, setSendTo] = useState(defaultTo);
  const [sendStatus, setSendStatus] = useState<AlarmSendStatusFilter>("ALL");
  const [advancedOpen, setAdvancedOpen] = useState(true);

  const [applied, setApplied] = useState({
    q: "",
    sendFrom: defaultFrom,
    sendTo: defaultTo,
    sendStatus: "ALL" as AlarmSendStatusFilter,
  });

  const [rowsRaw, setRowsRaw] = useState<AlarmLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(LIST_PAGE_SIZE);

  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError(null);

    fetchAlarmLogs(
      {
        sendFrom: applied.sendFrom,
        sendTo: applied.sendTo,
        sendStatus: applied.sendStatus,
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
        setError(err instanceof Error ? err.message : "조회 로그 조회에 실패했습니다.");
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });

    return () => abort.abort();
  }, [applied.sendFrom, applied.sendTo, applied.sendStatus]);

  const rows = useMemo(() => {
    if (!applied.q.trim()) return rowsRaw;
    const keyword = applied.q.trim().toLowerCase();
    return rowsRaw.filter((row) => {
      const text = `${row.idx} ${row.sendStatus ?? ""} ${row.sendAt} ${row.target ?? ""} ${row.message ?? ""}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [applied.q, rowsRaw]);

  const visibleRows = useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount]);
  const hasMore = visibleCount < rows.length;

  const summary = useMemo(() => {
    const successCount = rows.filter((x) => formatSendStatusForFilter(x.sendStatus) === "SUCCESS").length;
    const failCount = rows.filter((x) => formatSendStatusForFilter(x.sendStatus) === "FAIL").length;
    const recentRuns = [...rows].sort((a, b) => (a.sendAt < b.sendAt ? 1 : -1)).slice(0, 6);
    return { successCount, failCount, recentRuns };
  }, [rows]);

  const handleSearch = () => {
    setApplied({ q, sendFrom, sendTo, sendStatus });
  };

  const chips = useMemo(() => {
    const result = [
      `전송일: ${applied.sendFrom} ~ ${applied.sendTo}`,
      `상태: ${getSendStatusFilterLabel(applied.sendStatus)}`,
    ];
    if (applied.q.trim()) result.push(`키워드: ${applied.q.trim()}`);
    return result;
  }, [applied]);

  return (
    <div className="logs-page">
      <section className="logs-hero panel-card">
        <h2>조회 로그</h2>
        <h6 className="logs-hero-desc">알림 발송 결과(성공/실패) 이력을 확인하는 화면입니다.</h6>

        <div className="logs-bar-row">
          <input
            className="logs-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="IDX / SEND_STATUS / SEND_AT / TARGET / MESSAGE"
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
              <div className="logs-advanced-label">SendStatus</div>
              <div className="logs-advanced-controls">
                {(["ALL", "SUCCESS", "FAIL"] as AlarmSendStatusFilter[]).map((s) => (
                  <label key={s} className="logs-radio">
                    <input type="radio" name="sendStatus" checked={sendStatus === s} onChange={() => setSendStatus(s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <div className="logs-advanced-row">
              <div className="logs-advanced-label">기간</div>
              <div className="logs-advanced-controls">
                <input type="date" value={sendFrom} onChange={(e) => setSendFrom(e.target.value)} />
                <span>~</span>
                <input type="date" value={sendTo} onChange={(e) => setSendTo(e.target.value)} />
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
                    <th style={{ width: 130 }}>SEND_STATUS</th>
                    <th style={{ minWidth: 170 }}>SEND_AT</th>
                    <th style={{ minWidth: 220 }}>TARGET</th>
                    <th style={{ minWidth: 360 }}>MESSAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => {
                    const statusClass = formatSendStatusForFilter(row.sendStatus) === "FAIL" ? "failed" : formatSendStatusForFilter(row.sendStatus).toLowerCase();
                    return (
                      <tr key={`${row.idx}-${row.sendAt}`}>
                        <td className="font-weight-bold text-muted">{row.idx}</td>
                        <td>
                          <span className={`logs-status ${statusClass}`}>{row.sendStatus ?? "-"}</span>
                        </td>
                        <td>{formatDateTime(row.sendAt)}</td>
                        <td>{row.target ?? "-"}</td>
                        <td className="logs-message-cell" title={row.message ?? ""}>{row.message ?? "-"}</td>
                      </tr>
                    );
                  })}
                  {visibleRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted p-4">조회 결과가 없습니다.</td>
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
            <h3>조회 로그 현황</h3>
            <div className="logs-kpi-grid">
              <div className="logs-kpi-card"><div className="logs-kpi-label">SUCCESS</div><div className="logs-kpi-value">{summary.successCount}</div></div>
              <div className="logs-kpi-card"><div className="logs-kpi-label">FAIL</div><div className="logs-kpi-value">{summary.failCount}</div></div>
              <div className="logs-kpi-card logs-kpi-wide"><div className="logs-kpi-label">TOTAL</div><div className="logs-kpi-value">{rows.length}</div></div>
            </div>

            <section className="logs-side-section">
              <div className="logs-side-title">최근 동작</div>
              <div className="logs-side-list">
                {summary.recentRuns.map((run) => (
                  <div key={`${run.idx}-recent-${run.sendAt}`} className="logs-side-item">
                    <div className="logs-side-main">{formatDateTime(run.sendAt)} · {run.target ?? "-"}</div>
                    <div className="logs-side-sub">{run.sendStatus ?? "-"} · {run.message ?? "-"}</div>
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

