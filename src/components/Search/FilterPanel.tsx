import type { SearchStatusFilter } from "@/pages/search/types";

type Props = {
  onlySoon: boolean;
  setOnlySoon: (v: boolean) => void;
  onlyFavorite: boolean;
  setOnlyFavorite: (v: boolean) => void;
  beginFrom: string;
  setBeginFrom: (v: string) => void;
  beginTo: string;
  setBeginTo: (v: string) => void;
  status: SearchStatusFilter;
  setStatus: (v: SearchStatusFilter) => void;
};

export default function FilterPanel({
  onlySoon,
  setOnlySoon,
  onlyFavorite,
  setOnlyFavorite,
  beginFrom,
  setBeginFrom,
  beginTo,
  setBeginTo,
  status,
  setStatus,
}: Props) {
  return (
    <div className="search-advanced">
      <div className="search-advanced-title">상세 조건</div>

      <div className="search-advanced-row">
        <div className="search-advanced-label">검색기간</div>
        <div className="search-advanced-controls">
          <input type="date" value={beginFrom} onChange={(e) => setBeginFrom(e.target.value)} />
          <span className="search-sep">~</span>
          <input type="date" value={beginTo} onChange={(e) => setBeginTo(e.target.value)} />
        </div>
      </div>

      <div className="search-advanced-row">
        <div className="search-advanced-label">검색상태</div>
        <div className="search-advanced-controls">
          <label className="search-radio">
            <input type="radio" checked={status === "all"} onChange={() => setStatus("all")} />
            <span>전체</span>
          </label>
          <label className="search-radio">
            <input
              type="radio"
              checked={status === "접수예정"}
              onChange={() => setStatus("접수예정")}
            />
            <span>접수예정</span>
          </label>
          <label className="search-radio">
            <input
              type="radio"
              checked={status === "접수중"}
              onChange={() => setStatus("접수중")}
            />
            <span>접수중</span>
          </label>
          <label className="search-radio">
            <input
              type="radio"
              checked={status === "접수마감"}
              onChange={() => setStatus("접수마감")}
            />
            <span>접수마감</span>
          </label>
        </div>
      </div>

      <div className="search-advanced-row">
        <div className="search-advanced-label">검색옵션</div>
        <div className="search-advanced-controls">
          <label className="search-check">
            <input type="checkbox" checked={onlySoon} onChange={(e) => setOnlySoon(e.target.checked)} />
            <span>D-7 이내만 보기</span>
          </label>
          <label className="search-check">
            <input
              type="checkbox"
              checked={onlyFavorite}
              onChange={(e) => setOnlyFavorite(e.target.checked)}
            />
            <span>즐겨찾기만 보기</span>
          </label>
        </div>
      </div>
    </div>
  );
}
