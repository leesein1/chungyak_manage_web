/*
 * @file-overview
 * 파일: src/components\dashboard\DashboardCalendar.tsx
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardCalendar.css";
import KakaoMapPanel from "./KakaoMapPanel";

export type CalendarEventType = "ANNOUNCE" | "RECEIVE" | "RESULT";

export type CalendarEvent = {
  date: string; // yyyy-mm-dd
  type: CalendarEventType;
  title: string;
  badgeText?: string;
  badgeTone?: "green" | "red" | "gray" | "purple" | "blue" | "orange";
  status?: string;
  address?: string;
  linkUrl?: string;
};

type Props = {
  events: CalendarEvent[];
  initialMonth?: Date;
  showMapToggle?: boolean;
  onSelectDate?: (date: Date) => void;
};

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

const TYPE_LABEL: Record<CalendarEventType, string> = {
  ANNOUNCE: "청약공고",
  RECEIVE: "청약접수",
  RESULT: "청약마감",
};

// DashboardCalendar: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
export default function DashboardCalendar({
  events,
  initialMonth,
  showMapToggle = true,
  onSelectDate,
}: Props) {
  const navigate = useNavigate();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState<Date>(
    startOfMonth(initialMonth ?? today),
  );
  const [selectedDate, setSelectedDate] = useState<Date>(stripTime(today));
  const [viewMode, setViewMode] = useState<"calendar" | "map">("calendar");
  const [selectedMapPointId, setSelectedMapPointId] = useState("");
  const [activeTypes, setActiveTypes] = useState<
    Record<CalendarEventType, boolean>
  >({
    ANNOUNCE: true,
    RECEIVE: true,
    RESULT: true,
  });

  const monthGrid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

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

  const mapPoints = useMemo(() => {
    // 지도는 "진행/예정" 우선으로 보여주되, 없으면 선택일 전체 이벤트를 fallback으로 사용
    // (빈 지도로 보이는 상황을 줄이기 위한 UX 보강)
    const isProgressOrPlanned = (event: CalendarEvent) => {
      const source = `${event.status ?? ""} ${event.badgeText ?? ""} ${event.title}`;
      return /(접수중|접수예정|진행중|예정)/.test(source);
    };

    const progressOrPlanned = selectedEvents.filter(isProgressOrPlanned);
    const baseEvents =
      progressOrPlanned.length > 0 ? progressOrPlanned : selectedEvents;

    return baseEvents.map((event, idx) => ({
      id: `${event.date}-${event.type}-${idx}`,
      title: event.title,
      address: (event.address && event.address.trim()) || event.title,
      status: event.status ?? event.badgeText,
      eventType: event.type,
      eventPhaseLabel: TYPE_LABEL[event.type],
      eventBadgeLabel: event.badgeText ?? defaultBadgeByType(event.type),
      linkUrl: event.linkUrl,
    }));
  }, [selectedEvents]);

  useEffect(() => {
    // 날짜/필터가 바뀌면 지도 선택도 첫 항목으로 리셋해 UI 상태를 일치시킨다.
    setSelectedMapPointId(mapPoints[0]?.id ?? "");
  }, [mapPoints]);

  const headerTitle = `${viewMonth.getFullYear()}년 ${String(viewMonth.getMonth() + 1).padStart(2, "0")}월`;

  const rightTitle = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 청약공고`;

  // handlePickDate: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
  const handlePickDate = (d: Date) => {
    const sd = stripTime(d);
    setSelectedDate(sd);
    onSelectDate?.(sd);
  };

  // handleOpenMyHome: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
  const handleOpenMyHome = (url?: string) => {
    const target = url && url.trim() ? url : "https://www.myhome.go.kr/";
    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="cal-wrap">
      <div className="cal-left">
        <div className="cal-top">
          <div className="cal-top-title">
            전국 공공주택 모집공고 달력으로 확인하기
          </div>

          {showMapToggle && (
            <div className="cal-toggle" data-mode={viewMode}>
              <span className="cal-toggle-thumb" aria-hidden="true" />
              <button
                className={`toggle-btn ${viewMode === "map" ? "toggle-active" : ""}`}
                type="button"
                onClick={() => setViewMode("map")}
              >
                지도
              </button>
              <button
                className={`toggle-btn ${viewMode === "calendar" ? "toggle-active" : ""}`}
                type="button"
                onClick={() => setViewMode("calendar")}
              >
                달력
              </button>
            </div>
          )}
        </div>

        <div className="cal-month-nav">
          <button
            className="nav-btn"
            onClick={() => setViewMonth(addMonths(viewMonth, -1))}
            aria-label="prev month"
          >
            ←
          </button>
          <div className="month-title">{headerTitle}</div>
          <button
            className="nav-btn"
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            aria-label="next month"
          >
            →
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
          <LegendItem label="청약마감일" kind="RESULT" />
        </div>
      </div>

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

        {viewMode === "map" ? (
          <>
            {/* 지도 모드에서는 상단 리스트(선택 UI) + 하단 지도 순서로 노출 */}
            <div className="map-list-shell">
              <div className="map-list-scroller">
                {mapPoints.length === 0 ? (
                  <div className="empty">
                    선택한 날짜에 지도에 표시할 항목이 없습니다.
                  </div>
                ) : (
                  mapPoints.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`event-item event-item-button ${selectedMapPointId === item.id ? "is-active" : ""}`}
                      onClick={() => setSelectedMapPointId(item.id)}
                      onDoubleClick={() => handleOpenMyHome(item.linkUrl)}
                      title="더블클릭하면 모집공고 페이지로 이동합니다."
                    >
                      <div
                        className={`event-badge tone-${toneByType(item.eventType)}`}
                      >
                        {item.eventBadgeLabel}
                      </div>
                      <div className="map-item-text">
                        <div className="event-title">{item.title}</div>
                        <div className="small text-muted mt-1">
                          {item.eventPhaseLabel} · 상태:{" "}
                          {item.status ?? "정보 없음"}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <KakaoMapPanel
              points={mapPoints}
              selectedDateLabel={rightTitle}
              selectedPointId={selectedMapPointId}
              onSelectPoint={setSelectedMapPointId}
            />
          </>
        ) : (
          <>
            <div className="event-list">
              {selectedEvents.length === 0 ? (
                <div className="empty">
                  선택한 날짜에 표시할 항목이 없습니다.
                </div>
              ) : (
                selectedEvents.map((e, idx) => (
                  <button
                    key={`${e.date}-${e.type}-${idx}`}
                    type="button"
                    className="event-item event-item-button"
                    onDoubleClick={() => handleOpenMyHome(e.linkUrl)}
                    title="더블클릭하면 모집공고 페이지로 이동합니다."
                  >
                    <div
                      className={
                        "event-badge tone-" +
                        (e.badgeTone ?? toneByType(e.type))
                      }
                    >
                      {e.badgeText ?? defaultBadgeByType(e.type)}
                    </div>
                    <div className="event-title">{e.title}</div>
                  </button>
                ))
              )}
            </div>

            <div className="cal-right-legend">
              {(["ANNOUNCE", "RECEIVE", "RESULT"] as CalendarEventType[]).map(
                (t) => (
                  <span
                    key={`legend-${t}`}
                    className={`cal-right-legend-pill t-${t.toLowerCase()}`}
                  >
                    <span className="cal-right-legend-dot" />
                    {defaultBadgeByType(t)}
                  </span>
                ),
              )}
            </div>
          </>
        )}

        <div className="right-actions">
          <button
            className="outline-btn"
            type="button"
            onClick={() => navigate("/search?from=dashboard&mode=all")}
          >
            모집공고 전체보기
          </button>
        </div>
      </div>
    </div>
  );
}

// LegendItem: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
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

// legendDotClass: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
function legendDotClass(t: CalendarEventType) {
  if (t === "ANNOUNCE") return "dot-announce";
  if (t === "RECEIVE") return "dot-receive";
  return "dot-result";
}

// stripTime: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// startOfMonth: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// addMonths: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
function addMonths(d: Date, diff: number) {
  return new Date(d.getFullYear(), d.getMonth() + diff, 1);
}

// formatYmd: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
function formatYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// buildMonthGrid: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
function buildMonthGrid(viewMonth: Date) {
  const first = startOfMonth(viewMonth);
  const firstDayOfWeek = first.getDay();
  const start = new Date(
    first.getFullYear(),
    first.getMonth(),
    1 - firstDayOfWeek,
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
      start.getDate() + i,
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

// toneByType: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
function toneByType(t: CalendarEventType) {
  if (t === "ANNOUNCE") return "green";
  if (t === "RECEIVE") return "red";
  return "orange";
}

// defaultBadgeByType: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
function defaultBadgeByType(t: CalendarEventType) {
  if (t === "ANNOUNCE") return "모집공고";
  if (t === "RECEIVE") return "접수";
  return "마감";
}
