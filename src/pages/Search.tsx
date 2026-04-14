/*
 * @file-overview
 * 파일: src/pages\Search.tsx
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import FilterPanel from "@/components/Search/FilterPanel";
import ListPanel from "@/components/Search/ListPanel";
import DetailPanel from "@/components/Search/DetailPanel";
import { fetchSearchDetail, fetchSearchList, toggleFavorite } from "./search/api";
import type { SearchDetailItem, SearchListItem, SearchStatusFilter } from "./search/types";
import "react-toastify/dist/ReactToastify.css";
import "./Search.css";

// Date 객체를 yyyy-mm-dd 문자열로 변환한다.
function formatYmd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 검색 페이지 기본 조회 기간(과거 12개월 ~ 미래 2개월)을 만든다.
function getDefaultRange() {
  const from = new Date();
  from.setMonth(from.getMonth() - 12);
  const to = new Date();
  to.setMonth(to.getMonth() + 2);
  return { beginFrom: formatYmd(from), beginTo: formatYmd(to) };
}

const LIST_PAGE_SIZE = 5;
const VALID_STATUS: SearchStatusFilter[] = ["all", "접수예정", "접수중", "접수마감"];

// parseDashboardPreset: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
function parseDashboardPreset(
  searchParams: URLSearchParams,
  defaults: { beginFrom: string; beginTo: string },
) {
  // 대시보드에서 진입할 때 전달된 mode/status/keyword를 검색 필터 초기값으로 변환한다.
  const from = searchParams.get("from");
  const mode = searchParams.get("mode");
  const rawStatus = searchParams.get("status");
  const status = VALID_STATUS.includes(rawStatus as SearchStatusFilter)
    ? (rawStatus as SearchStatusFilter)
    : "all";
  const keyword = (searchParams.get("keyword") ?? "").trim();

  if (from !== "dashboard") {
    return {
      keyword: "",
      status: "all" as SearchStatusFilter,
      onlyOngoing: false,
      onlySoon: true,
      onlyFavorite: false,
      beginFrom: defaults.beginFrom,
      beginTo: defaults.beginTo,
    };
  }

  if (mode === "favorite") {
    return {
      keyword,
      status,
      onlyOngoing: false,
      onlySoon: false,
      onlyFavorite: true,
      beginFrom: defaults.beginFrom,
      beginTo: defaults.beginTo,
    };
  }

  if (mode === "soon") {
    return {
      keyword,
      status,
      onlyOngoing: false,
      onlySoon: true,
      onlyFavorite: false,
      beginFrom: defaults.beginFrom,
      beginTo: defaults.beginTo,
    };
  }

  if (mode === "ongoing") {
    return {
      keyword,
      status: "all" as SearchStatusFilter,
      onlyOngoing: true,
      onlySoon: false,
      onlyFavorite: false,
      beginFrom: defaults.beginFrom,
      beginTo: defaults.beginTo,
    };
  }

  return {
    keyword,
    status,
    onlyOngoing: false,
    onlySoon: false,
    onlyFavorite: false,
    beginFrom: defaults.beginFrom,
    beginTo: defaults.beginTo,
  };
}

// Search: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
export default function Search() {
  const [searchParams] = useSearchParams();
  const defaults = useMemo(() => getDefaultRange(), []);
  const searchParamKey = searchParams.toString();
  const preset = useMemo(
    () => parseDashboardPreset(new URLSearchParams(searchParamKey), defaults),
    [searchParamKey, defaults.beginFrom, defaults.beginTo],
  );

  const [q, setQ] = useState(preset.keyword);
  const [onlyOngoing, setOnlyOngoing] = useState(preset.onlyOngoing);
  const [onlySoon, setOnlySoon] = useState(preset.onlySoon);
  const [onlyFavorite, setOnlyFavorite] = useState(preset.onlyFavorite);
  const [status, setStatus] = useState<SearchStatusFilter>(preset.status);
  const [beginFrom, setBeginFrom] = useState(preset.beginFrom);
  const [beginTo, setBeginTo] = useState(preset.beginTo);
  const [advancedOpen, setAdvancedOpen] = useState(true);

  const [applied, setApplied] = useState(preset);

  const [rows, setRows] = useState<SearchListItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<SearchDetailItem>();
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(LIST_PAGE_SIZE);

  // 목록에서 선택한 행 기준으로 상세 패널에 보여줄 데이터를 계산한다.
  const selected = useMemo(() => rows.find((row) => row.id === selectedId), [rows, selectedId]);
  const detailForPanel = useMemo(() => {
    if (selectedDetail && selected?.apiId && selectedDetail.id === selected.apiId) return selectedDetail;
    if (!selected) return undefined;
    return {
      id: selected.apiId || "-",
      title: selected.title,
      complex: selected.complex,
      region: selected.region,
      address: selected.region,
      period: selected.period,
      status: selected.status,
      rawStatus: selected.status,
      ddayText: selected.ddayText,
      url: selected.url,
      isFavorite: selected.favored,
      announcementDateText: "-",
    } as SearchDetailItem;
  }, [selected, selectedDetail]);

  // 화면 상단의 "적용된 필터 칩" 문구를 생성한다.
  const appliedChips = useMemo(() => {
    const chips: string[] = [];
    if (applied.keyword.trim()) chips.push(`키워드: ${applied.keyword.trim()}`);
    chips.push(`상태: ${applied.status === "all" ? "전체" : applied.status}`);
    chips.push(`기간: ${applied.beginFrom} ~ ${applied.beginTo}`);
    if (applied.onlyOngoing) chips.push("진행중(접수중/예정)");
    if (applied.onlySoon) chips.push("D-7 이내");
    if (applied.onlyFavorite) chips.push("즐겨찾기만");
    return chips;
  }, [applied]);
  const visibleRows = useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount]);
  const hasMoreRows = visibleCount < rows.length;

  // 검색 버튼/엔터 입력 시 필터 유효성 검증 후 조회 조건을 확정한다.
  const handleSearch = () => {
    if (beginFrom && beginTo && beginFrom > beginTo) {
      setActionError("BeginFrom은 BeginTo보다 늦을 수 없습니다.");
      return;
    }
    setActionError(null);
    setApplied({ keyword: q, status, onlyOngoing, onlySoon, onlyFavorite, beginFrom, beginTo });
  };

  // URL 쿼리(from=dashboard 등)가 바뀌면 입력값과 적용조건을 동기화한다.
  useEffect(() => {
    setQ(preset.keyword);
    setStatus(preset.status);
    setOnlyOngoing(preset.onlyOngoing);
    setOnlySoon(preset.onlySoon);
    setOnlyFavorite(preset.onlyFavorite);
    setBeginFrom(preset.beginFrom);
    setBeginTo(preset.beginTo);
    setApplied(preset);
  }, [preset]);

  // 적용된 필터 조건(applied)이 바뀔 때마다 목록 API를 다시 조회한다.
  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    setError(null);

    fetchSearchList(applied, abortController.signal)
      .then((list) => {
        setRows(list);
        setVisibleCount(LIST_PAGE_SIZE);
        setSelectedId((prev) => {
          if (prev && list.some((row) => row.id === prev)) return prev;
          return list[0]?.id ?? "";
        });
      })
      .catch((err) => {
        if (abortController.signal.aborted) return;
        setRows([]);
        setSelectedId("");
        setSelectedDetail(undefined);
        setError(err instanceof Error ? err.message : "조회에 실패했습니다.");
      })
      .finally(() => {
        if (!abortController.signal.aborted) setLoading(false);
      });

    return () => abortController.abort();
  }, [applied]);

  // 선택된 공고의 apiId가 바뀌면 상세 API를 다시 조회한다.
  useEffect(() => {
    const apiId = selected?.apiId;
    if (!selectedId || !apiId) {
      setSelectedDetail(undefined);
      return;
    }

    const abortController = new AbortController();
    setDetailLoading(true);
    setActionError(null);

    fetchSearchDetail(apiId, abortController.signal)
      .then((detail) => setSelectedDetail(detail))
      .catch((err) => {
        if (abortController.signal.aborted) return;
        setActionError(err instanceof Error ? err.message : "상세 조회에 실패했습니다.");
      })
      .finally(() => {
        if (!abortController.signal.aborted) setDetailLoading(false);
      });

    return () => abortController.abort();
  }, [selectedId, selected?.apiId]);

  // 목록/상세에서 클릭한 즐겨찾기 상태를 낙관적 업데이트 후 서버에 반영한다.
  const handleToggleFavorite = async (row: SearchListItem) => {
    setActionError(null);
    if (!row.apiId) {
      setActionError("이 항목은 고유번호가 없어 즐겨찾기 처리를 할 수 없습니다.");
      return;
    }
    const nextFav = !row.favored;

    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, favored: nextFav } : item)));
    setSelectedDetail((prev) => (prev && prev.id === row.id ? { ...prev, isFavorite: nextFav } : prev));

    try {
      await toggleFavorite(row.apiId, row.favored);
      const toastId = toast(
        ({ closeToast }) => (
          <div className="search-favorite-toast-body">
            <div className="search-favorite-toast-icon" aria-hidden="true">
              {nextFav ? (
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 7L10 17L5 12"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 7H18"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 7V5.8C9 5.358 9.358 5 9.8 5H14.2C14.642 5 15 5.358 15 5.8V7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 9V18C8 18.552 8.448 19 9 19H15C15.552 19 16 18.552 16 18V9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
            <div className="search-favorite-toast-texts">
              <div className="search-favorite-toast-title">{nextFav ? "Success" : "Delete"}</div>
              <div className="search-favorite-toast-message">
                {nextFav ? "즐겨찾기에 추가되었습니다." : "즐겨찾기에서 딜리트되었습니다."}
              </div>
              <div className="search-favorite-toast-meaning">
                {nextFav
                  ? "이 공고를 즐겨찾기 목록에서 빠르게 확인할 수 있습니다."
                  : "이 공고는 즐겨찾기 목록에서 제거되었습니다."}
              </div>
            </div>
            <button
              type="button"
              className="search-favorite-toast-close"
              onClick={() => closeToast?.()}
              aria-label="알림 닫기"
            >
              ×
            </button>
          </div>
        ),
        {
          className: `search-favorite-toast is-${nextFav ? "success" : "delete"}`,
          autoClose: 2000,
          hideProgressBar: true,
          closeButton: false,
        },
      );
      window.setTimeout(() => toast.dismiss(toastId), 2100);
    } catch (err) {
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, favored: row.favored } : item)));
      setSelectedDetail((prev) => (prev && prev.id === row.id ? { ...prev, isFavorite: row.favored } : prev));
      setActionError(err instanceof Error ? err.message : "즐겨찾기 처리에 실패했습니다.");
    }
  };

  return (
    <div className="search-page">
      <ToastContainer
        position="top-right"
        className="search-toast-container"
        toastClassName="search-favorite-toast"
        draggable={false}
        closeOnClick
        newestOnTop
        autoClose={2000}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
      />

      <section className="search-hero panel-card">
        <h2>검색</h2>

        <div className="search-bar-row">
          <input
            className="search-hero-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="검색어를 입력해주세요."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button
            className="search-hero-btn"
            type="button"
            onClick={handleSearch}
            aria-label="검색 실행"
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : <FaSearch />}
          </button>

        <button
          type="button"
          className={`search-toggle-btn ${advancedOpen ? "is-open" : ""}`}
          onClick={() => setAdvancedOpen((prev) => !prev)}
          aria-expanded={advancedOpen}
        >
          상세보기
          <span className="search-toggle-arrow" aria-hidden="true">
            {advancedOpen ? "▴" : "▾"}
          </span>
        </button>
        </div>

        {advancedOpen ? (
          <FilterPanel
            onlySoon={onlySoon}
            setOnlySoon={setOnlySoon}
            onlyFavorite={onlyFavorite}
            setOnlyFavorite={setOnlyFavorite}
            beginFrom={beginFrom}
            setBeginFrom={setBeginFrom}
            beginTo={beginTo}
            setBeginTo={setBeginTo}
            status={status}
            setStatus={setStatus}
          />
        ) : null}
      </section>

      {error ? <Alert variant="danger" className="mt-3">{error}</Alert> : null}
      {actionError ? <Alert variant="warning" className="mt-3">{actionError}</Alert> : null}

      <section className="search-content panel-card">
        <div className="search-applied-wrap">
          <div className="search-applied-title">
            적용된 검색어 <strong>{applied.keyword.trim() || "전체"}</strong> / 검색 결과{" "}
            <strong>{rows.length.toLocaleString()}건</strong>
          </div>
          <div className="search-chip-row">
            {appliedChips.map((chip) => (
              <span key={chip} className="search-chip">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="search-main-grid">
          <ListPanel
            rows={visibleRows}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onToggleFavorite={handleToggleFavorite}
            hasMore={hasMoreRows}
            onLoadMore={() => setVisibleCount((prev) => prev + LIST_PAGE_SIZE)}
            totalCount={rows.length}
          />

          <DetailPanel
            selected={detailForPanel}
            detailLoading={detailLoading}
            toggleFav={() => {
              if (selected) handleToggleFavorite(selected);
            }}
          />
        </div>
      </section>
    </div>
  );
}
