/*
 * @file-overview
 * 파일: src/pages\dashboard\DeadlineFavoriteSection.tsx
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { SoonItem } from "./types";

type Props = {
  loading: boolean;
  soonItems: SoonItem[];
  favoriteItems: SoonItem[];
};

const INITIAL_VISIBLE_COUNT = 5;
const LOAD_CHUNK = 5;

// DeadlineFavoriteSection: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
export default function DeadlineFavoriteSection({
  loading,
  soonItems,
  favoriteItems,
}: Props) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"soon" | "favorite">("soon");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // 하단 목록에서 더블클릭한 제목/현재 탭 정보를 search 페이지 쿼리로 넘긴다.
  const navigateToSearch = (keyword?: string) => {
    const mode = activeTab === "soon" ? "soon" : "favorite";
    const qs = new URLSearchParams();
    qs.set("from", "dashboard");
    qs.set("mode", mode);
    if (keyword?.trim()) qs.set("keyword", keyword.trim());
    navigate(`/search?${qs.toString()}`);
  };

  // 탭 전환 시 데이터 소스를 바꾼다. (마감임박 / 즐겨찾기)
  const items = useMemo(
    () => (activeTab === "soon" ? soonItems : favoriteItems),
    [activeTab, soonItems, favoriteItems]
  );

  // 탭이 바뀌면 첫 5건부터 다시 보여준다.
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [activeTab]);

  // 데이터 길이가 줄었을 때 visibleCount가 범위를 벗어나지 않도록 보정한다.
  useEffect(() => {
    setVisibleCount((prev) => {
      const clamped = Math.min(prev, items.length || INITIAL_VISIBLE_COUNT);
      return Math.max(clamped, INITIAL_VISIBLE_COUNT);
    });
  }, [items.length]);

  // 현재 내려온 데이터를 콘솔에서 빠르게 검증하기 위한 디버깅 로그.
  useEffect(() => {
    console.groupCollapsed("[Dashboard] Deadline/Favorite data");
    console.log("D-7 items:", soonItems.length);
    console.table(
      soonItems.map((item, idx) => ({
        idx: idx + 1,
        status: item.status,
        dday: item.dday,
        RCRIT_PBLANC_DE: item.RCRIT_PBLANC_DE,
        title: item.title,
      }))
    );

    console.log("Favorite items:", favoriteItems.length);
    console.table(
      favoriteItems.map((item, idx) => ({
        idx: idx + 1,
        status: item.status,
        dday: item.dday,
        RCRIT_PBLANC_DE: item.RCRIT_PBLANC_DE,
        title: item.title,
      }))
    );
    console.groupEnd();
  }, [soonItems, favoriteItems]);

  // 현재 화면에 노출할 실제 행 개수만큼 슬라이스한다.
  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );
  const hasMore = visibleCount < items.length;

  // 더보기 버튼/스크롤 자동 로딩에서 공통으로 쓰는 5건 증가 함수.
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + LOAD_CHUNK, items.length));
  }, [items.length]);

  // 스크롤이 바닥 근처에 도달하면 다음 5건을 자동으로 붙인다.
  const handleTableScroll = useCallback(() => {
    const node = scrollContainerRef.current;
    if (!node || loading || !hasMore) return;

    const isNearBottom =
      node.scrollTop + node.clientHeight >= node.scrollHeight - 24;

    if (isNearBottom) {
      loadMore();
    }
  }, [hasMore, loadMore, loading]);

  const emptyLabel =
    activeTab === "soon"
      ? "마감 임박 데이터가 없습니다."
      : "즐겨찾기 데이터가 없습니다.";

  return (
    <Card className="panel-card dash-section-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
          <div className="dash-segmented-tabs" role="tablist" aria-label="공고 목록 전환">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "soon"}
              className={`dash-segment-btn ${activeTab === "soon" ? "is-active" : ""}`}
              onClick={() => setActiveTab("soon")}
            >
              마감 임박 (D-7)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "favorite"}
              className={`dash-segment-btn ${activeTab === "favorite" ? "is-active" : ""}`}
              onClick={() => setActiveTab("favorite")}
            >
              즐겨찾기
            </button>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-purple"
            onClick={() => navigateToSearch()}
          >
            전체보기
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          className="table-wrap dash-table-scroll"
          onScroll={handleTableScroll}
        >
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th style={{ width: 70 }}>IDX</th>
                <th style={{ width: 130 }}>상태</th>
                <th style={{ width: 100 }}>남은일</th>
                <th style={{ width: 120 }}>공고일</th>
                <th style={{ minWidth: 360 }}>공고명</th>
              </tr>
            </thead>
            <tbody key={activeTab}>
              {visibleItems.map((item, index) => (
                <tr
                  key={`${activeTab}-${item.id}-${index}`}
                  className="dash-clickable-row"
                  onDoubleClick={() => navigateToSearch(item.title)}
                  title="더블클릭하면 조회 화면에서 해당 제목으로 검색합니다."
                >
                  <td className="font-weight-bold text-muted">{index + 1}</td>
                  <td>
                    <span className="status-pill">{item.status}</span>
                  </td>
                  <td className="font-weight-bold">
                    {item.dday > 998 ? "-" : `D-${item.dday}`}
                  </td>
                  <td className="font-weight-bold">{item.RCRIT_PBLANC_DE}</td>
                  <td>
                    <div className="font-weight-bold">{item.title}</div>
                    <div className="small text-muted">
                      {item.region} · {item.period}
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted p-4">
                    {emptyLabel}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {!loading && items.length > INITIAL_VISIBLE_COUNT ? (
          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={loadMore}
              disabled={!hasMore}
            >
              {hasMore ? `더보기 (${items.length - visibleCount}건)` : "모두 불러옴"}
            </button>
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
}
