import { FaHeart, FaRegHeart } from "react-icons/fa";
import type { SearchListItem } from "@/pages/search/types";

type Props = {
  rows: SearchListItem[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  onToggleFavorite: (row: SearchListItem) => void;
};

export default function ListPanel({ rows, selectedId, setSelectedId, onToggleFavorite }: Props) {
  if (rows.length === 0) {
    return <div className="search-empty">조회 결과가 없습니다.</div>;
  }

  return (
    <div className="search-result-list">
      {rows.map((row) => (
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
            <div className="search-status-pill">{row.status}</div>
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
  );
}
