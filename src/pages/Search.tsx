import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import FilterPanel from "@/components/Search/FilterPanel";
import ListPanel from "@/components/Search/ListPanel";
import DetailPanel from "@/components/Search/DetailPanel";
import { fetchSearchDetail, fetchSearchList, toggleFavorite } from "./search/api";
import type { SearchDetailItem, SearchListItem, SearchStatusFilter } from "./search/types";
import "./Search.css";

function formatYmd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDefaultRange() {
  const from = new Date();
  from.setMonth(from.getMonth() - 2);
  const to = new Date();
  to.setFullYear(to.getFullYear() + 1);
  return { beginFrom: formatYmd(from), beginTo: formatYmd(to) };
}

export default function Search() {
  const defaults = getDefaultRange();

  const [q, setQ] = useState("");
  const [onlySoon, setOnlySoon] = useState(true);
  const [status, setStatus] = useState<SearchStatusFilter>("all");
  const [beginFrom, setBeginFrom] = useState(defaults.beginFrom);
  const [beginTo, setBeginTo] = useState(defaults.beginTo);
  const [advancedOpen, setAdvancedOpen] = useState(true);

  const [applied, setApplied] = useState({
    keyword: "",
    status: "all" as SearchStatusFilter,
    onlySoon: true,
    beginFrom: defaults.beginFrom,
    beginTo: defaults.beginTo,
  });

  const [rows, setRows] = useState<SearchListItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<SearchDetailItem>();
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const selected = useMemo(() => rows.find((row) => row.id === selectedId), [rows, selectedId]);

  const appliedChips = useMemo(() => {
    const chips: string[] = [];
    if (applied.keyword.trim()) chips.push(`키워드: ${applied.keyword.trim()}`);
    chips.push(`상태: ${applied.status === "all" ? "전체" : applied.status}`);
    chips.push(`기간: ${applied.beginFrom} ~ ${applied.beginTo}`);
    if (applied.onlySoon) chips.push("D-7 이내");
    return chips;
  }, [applied]);

  const handleSearch = () => {
    if (beginFrom && beginTo && beginFrom > beginTo) {
      setActionError("BeginFrom은 BeginTo보다 늦을 수 없습니다.");
      return;
    }
    setActionError(null);
    setApplied({ keyword: q, status, onlySoon, beginFrom, beginTo });
  };

  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    setError(null);

    fetchSearchList(applied, abortController.signal)
      .then((list) => {
        setRows(list);
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

  useEffect(() => {
    if (!selectedId) {
      setSelectedDetail(undefined);
      return;
    }

    const abortController = new AbortController();
    setDetailLoading(true);
    setActionError(null);

    fetchSearchDetail(selectedId, abortController.signal)
      .then((detail) => setSelectedDetail(detail))
      .catch((err) => {
        if (abortController.signal.aborted) return;
        setActionError(err instanceof Error ? err.message : "상세 조회에 실패했습니다.");
      })
      .finally(() => {
        if (!abortController.signal.aborted) setDetailLoading(false);
      });

    return () => abortController.abort();
  }, [selectedId]);

  const handleToggleFavorite = async (row: SearchListItem) => {
    setActionError(null);
    const nextFav = !row.favored;

    setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, favored: nextFav } : item)));
    setSelectedDetail((prev) => (prev && prev.id === row.id ? { ...prev, isFavorite: nextFav } : prev));

    try {
      await toggleFavorite(row.id, row.favored);
    } catch (err) {
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, favored: row.favored } : item)));
      setSelectedDetail((prev) => (prev && prev.id === row.id ? { ...prev, isFavorite: row.favored } : prev));
      setActionError(err instanceof Error ? err.message : "즐겨찾기 처리에 실패했습니다.");
    }
  };

  return (
    <div className="search-page">
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
            rows={rows}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onToggleFavorite={handleToggleFavorite}
          />

          <DetailPanel
            selected={
              selectedDetail
                ? selectedDetail
                : selected
                  ? {
                      id: selected.id,
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
                    }
                  : undefined
            }
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
