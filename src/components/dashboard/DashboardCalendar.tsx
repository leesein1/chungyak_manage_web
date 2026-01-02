/**
 * DashboardCalendar
 * 용도: 대시보드에 표시되는 달력 컴포넌트입니다.
 * - 달력 그리드, 날짜별 이벤트 마커, 선택일의 이벤트 리스트를 제공합니다.
 * 위치: `src/pages/Dashboard.tsx`에서 사용됩니다.
 */

import React, { useMemo, useState } from "react";
import "./DashboardCalendar.css";

export type CalendarEventType = "ANNOUNCE" | "RECEIVE" | "RESULT";

export type CalendarEvent = {
  /** yyyy-mm-dd */
  date: string;
  type: CalendarEventType;
  title: string;

  /** 우측 리스트에 붙일 뱃지 (예: 매입임대/영구임대 등) */
  badgeText?: string;
  /** 뱃지 색상 (없으면 타입 기본색) */
  badgeTone?: "green" | "red" | "gray" | "purple" | "blue";
};

type Props = {
  /** 달력에 표시할 이벤트들 */
  events: CalendarEvent[];

  /** 초기 표시 월 (없으면 오늘) */
  initialMonth?: Date;

  /** “지도/달력” 토글 UI만 보여주기용 (기능 연결은 나중에) */
  showMapToggle?: boolean;

  /** 날짜 선택 변경을 외부로도 알리고 싶으면 */
  onSelectDate?: (date: Date) => void;
};

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

const TYPE_LABEL: Record<CalendarEventType, string> = {
  ANNOUNCE: "청약공고",
  RECEIVE: "청약접수",
  RESULT: "당첨자발표",
};

export default function DashboardCalendar({
  events,
  initialMonth,
  showMapToggle = true,
  onSelectDate,
}: Props) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState<Date>(
    startOfMonth(initialMonth ?? today)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(stripTime(today));
  const [activeTypes, setActiveTypes] = useState<
    Record<CalendarEventType, boolean>
  >({
    ANNOUNCE: true,
    RECEIVE: true,
    RESULT: true,
  });

  const monthGrid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  // dateKey -> { ANNOUNCE?:true, RECEIVE?:true, RESULT?:true }
  const markersByDay = useMemo(() => {
    const map = new Map<string, Record<CalendarEventType, boolean>>();
    for (const e of events) {
      if (!activeTypes[e.type]) continue;
      const key = e.date;
      const cur = map.get(key) ?? {
        ANNOUNCE: false,
        RECEIVE: false,
        RESULT: false,
      };
      cur[e.type] = true;
      map.set(key, cur);
    }
    return map;
  }, [events, activeTypes]);

  const selectedKey = formatYmd(selectedDate);

  const selectedEvents = useMemo(() => {
    return events
      .filter((e) => e.date === selectedKey)
      .filter((e) => activeTypes[e.type])
      .sort((a, b) => a.type.localeCompare(b.type));
  }, [events, selectedKey, activeTypes]);

  const headerTitle = `${viewMonth.getFullYear()}년 ${String(
    viewMonth.getMonth() + 1
  ).padStart(2, "0")}월`;

  const rightTitle = `${selectedDate.getFullYear()}년 ${
    selectedDate.getMonth() + 1
  }월 ${selectedDate.getDate()}일 청약공고`;

  const handlePickDate = (d: Date) => {
    const sd = stripTime(d);
    setSelectedDate(sd);
    onSelectDate?.(sd);
  };

  return (
    <div className="cal-wrap">
      {/* 좌측 */}
      <div className="cal-left">
        <div className="cal-top">
          <div className="cal-top-title">
            전국 공공주택 모집공고 달력으로 확인하기
          </div>

          {showMapToggle && (
            <div className="cal-toggle">
              <button className="toggle-btn">지도</button>
              <button className="toggle-btn toggle-active">달력</button>
            </div>
          )}
        </div>

        <div className="cal-month-nav">
          <button
            className="nav-btn"
            onClick={() => setViewMonth(addMonths(viewMonth, -1))}
            aria-label="prev month"
          >
            ‹
          </button>
          <div className="month-title">{headerTitle}</div>
          <button
            className="nav-btn"
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            aria-label="next month"
          >
            ›
          </button>
        </div>

        <div className="cal-weekdays">
          {WEEKDAYS_KO.map((w, idx) => (
            <div key={w} className={"wd" + (idx === 0 ? " sun" : "")}>
              {w}
            </div>
          ))}
        </div>

        <div className="cal-grid">
          {monthGrid.map((cell, i) => {
            const key = cell.dateKey;
            const marks = markersByDay.get(key);
            const isToday = key === formatYmd(stripTime(today));
            const isSelected = key === selectedKey;
            const isOtherMonth = !cell.inMonth;

            return (
              <button
                key={`${key}-${i}`}
                type="button"
                className={
                  "day-cell" +
                  (isOtherMonth ? " other" : "") +
                  (isSelected ? " selected" : "") +
                  (isToday ? " today" : "")
                }
                onClick={() => handlePickDate(cell.date)}
              >
                <div className="day-num">{cell.day}</div>

                <div className="marks">
                  {marks?.ANNOUNCE ? (
                    <span className="dot dot-announce" />
                  ) : (
                    <span className="dot-spacer" />
                  )}
                  {marks?.RECEIVE ? (
                    <span className="dot dot-receive" />
                  ) : (
                    <span className="dot-spacer" />
                  )}
                  {marks?.RESULT ? (
                    <span className="dot dot-result" />
                  ) : (
                    <span className="dot-spacer" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="cal-legend">
          <LegendItem label="오늘" kind="today" />
          <LegendItem label="선택일" kind="selected" />
          <LegendItem label="청약공고일" kind="ANNOUNCE" />
          <LegendItem label="청약접수일" kind="RECEIVE" />
          <LegendItem label="당첨자발표일" kind="RESULT" />
        </div>
      </div>

      {/* 우측 */}
      <div className="cal-right">
        <div className="right-title">{rightTitle}</div>

        <div className="type-filter">
          {(Object.keys(TYPE_LABEL) as CalendarEventType[]).map((t) => (
            <button
              key={t}
              type="button"
              className={
                "type-pill" +
                (activeTypes[t] ? " on" : "") +
                " t-" +
                t.toLowerCase()
              }
              onClick={() =>
                setActiveTypes((prev) => ({ ...prev, [t]: !prev[t] }))
              }
            >
              <span className="pill-dot" />
              {TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        <div className="event-list">
          {selectedEvents.length === 0 ? (
            <div className="empty">선택한 날짜에 표시할 항목이 없습니다.</div>
          ) : (
            selectedEvents.map((e, idx) => (
              <div key={`${e.date}-${e.type}-${idx}`} className="event-item">
                <div
                  className={
                    "event-badge tone-" + (e.badgeTone ?? toneByType(e.type))
                  }
                >
                  {e.badgeText ?? defaultBadgeByType(e.type)}
                </div>
                <div className="event-title">{e.title}</div>
              </div>
            ))
          )}
        </div>

        <div className="right-actions">
          <button className="outline-btn" type="button">
            모집공고 전체보기
          </button>
        </div>
      </div>
    </div>
  );
}

/** ---------- 작은 컴포넌트 ---------- */
function LegendItem({
  label,
  kind,
}: {
  label: string;
  kind: "today" | "selected" | CalendarEventType;
}) {
  if (kind === "today") {
    return (
      <div className="legend-item">
        <span className="legend-chip today" />
        {label}
      </div>
    );
  }
  if (kind === "selected") {
    return (
      <div className="legend-item">
        <span className="legend-chip selected" />
        {label}
      </div>
    );
  }

  return (
    <div className="legend-item">
      <span className={"legend-dot " + legendDotClass(kind)} />
      {label}
    </div>
  );
}

function legendDotClass(t: CalendarEventType) {
  if (t === "ANNOUNCE") return "dot-announce";
  if (t === "RECEIVE") return "dot-receive";
  return "dot-result";
}

/** ---------- helpers ---------- */
function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, diff: number) {
  return new Date(d.getFullYear(), d.getMonth() + diff, 1);
}

function formatYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildMonthGrid(viewMonth: Date) {
  const first = startOfMonth(viewMonth);
  const firstDayOfWeek = first.getDay(); // 0 (Sun) ~ 6
  const start = new Date(
    first.getFullYear(),
    first.getMonth(),
    1 - firstDayOfWeek
  );

  const cells: {
    date: Date;
    dateKey: string;
    day: number;
    inMonth: boolean;
  }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i
    );
    cells.push({
      date: d,
      dateKey: formatYmd(stripTime(d)),
      day: d.getDate(),
      inMonth: d.getMonth() === viewMonth.getMonth(),
    });
  }
  return cells;
}

function toneByType(t: CalendarEventType) {
  if (t === "ANNOUNCE") return "green";
  if (t === "RECEIVE") return "red";
  return "gray";
}

function defaultBadgeByType(t: CalendarEventType) {
  if (t === "ANNOUNCE") return "모집공고";
  if (t === "RECEIVE") return "접수";
  return "발표";
}
