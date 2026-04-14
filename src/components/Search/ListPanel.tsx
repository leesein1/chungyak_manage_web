/*
 * @file-overview
 * 파일: src/components\Search\ListPanel.tsx
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

import { FaHeart, FaRegHeart } from "react-icons/fa";
import type { SearchListItem } from "@/pages/search/types";

type Props = {
  rows: SearchListItem[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  onToggleFavorite: (row: SearchListItem) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  totalCount: number;
};

// ListPanel: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
export default function ListPanel({
  rows,
  selectedId,
  setSelectedId,
  onToggleFavorite,
  hasMore,
  onLoadMore,
  totalCount,
}: Props) {
  // 6건 이상부터는 카드 목록 영역만 스크롤되도록 전환한다.
  const shouldScroll = rows.length > 5;

  if (rows.length === 0) {
    return <div className="search-empty">조회 결과가 없습니다.</div>;
  }

  return (
    <div>
      <div className={`search-result-list-shell ${shouldScroll ? "is-scroll" : ""}`}>
        <div className="search-result-list">
          {rows.map((row, idx) => (
            <article
              key={row.id}
              className={`search-result-item ${selectedId === row.id ? "is-active" : ""}`}
              onClick={() => setSelectedId(row.id)}
              onDoubleClick={() =>
                window.open(row.url || "https://www.myhome.go.kr/", "_blank", "noopener,noreferrer")
              }
              title="더블클릭하면 모집공고 페이지로 이동합니다."
            >
              <div className="search-result-top">
                <div className="search-result-top-left">
                  <div className="search-result-idx">#{idx + 1}</div>
                  <div className="search-status-pill">{row.status}</div>
                </div>
                <button
                  className="search-fav-btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(row);
                  }}
                  title="즐겨찾기"
                >
                  {row.favored ? <FaHeart color="#ff4d6d" /> : <FaRegHeart color="#94a3b8" />}
                </button>
              </div>

              <h4 className="search-result-title">{row.title}</h4>
              <div className="search-result-meta">
                {row.complex} · {row.region}
              </div>
              <div className="search-result-meta">{row.period}</div>
              <div className="search-result-dday">{row.ddayText}</div>
            </article>
          ))}
        </div>
      </div>

      {hasMore ? (
        <div className="search-loadmore-wrap">
          <button className="search-loadmore-btn" type="button" onClick={onLoadMore}>
            더보기 (현재 {rows.length} / 전체 {totalCount})
          </button>
        </div>
      ) : null}
    </div>
  );
}
