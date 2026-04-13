import { Spinner } from "react-bootstrap";
import { FaExternalLinkAlt } from "react-icons/fa";
import type { SearchDetailItem } from "@/pages/search/types";
import DetailMap from "./DetailMap";

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="search-detail-row">
      <dt>{label}</dt>
      <dd>{value || "-"}</dd>
    </div>
  );
}

type Props = {
  selected?: SearchDetailItem;
  detailLoading: boolean;
  toggleFav: (id: string) => void;
};

export default function DetailPanel({ selected, detailLoading, toggleFav }: Props) {
  return (
    <section className="search-detail-card panel-card">
      <div className="search-detail-head">
        <h3>상세 정보</h3>
        {detailLoading && selected ? (
          <span className="search-detail-head-loading">
            <Spinner animation="border" size="sm" />
            업데이트 중
          </span>
        ) : null}
        {selected?.url ? (
          <a
            className="search-detail-link"
            href={selected.url}
            target="_blank"
            rel="noreferrer"
            title="원문 보기"
          >
            <FaExternalLinkAlt />
          </a>
        ) : null}
      </div>

      {!selected && detailLoading ? (
        <div className="search-detail-loading">
          <Spinner animation="border" size="sm" />
          <span>상세 정보를 불러오는 중입니다.</span>
        </div>
      ) : !selected ? (
        <div className="search-empty">선택된 공고가 없습니다.</div>
      ) : (
        <>
          <dl className="search-detail-list">
            <RowItem label="고유번호" value={selected.id} />
            <RowItem label="공고명" value={selected.title} />
            <RowItem label="단지명" value={selected.complex} />
            <RowItem label="상태" value={selected.status} />
            <RowItem label="지역" value={selected.region} />
            <RowItem label="주소" value={selected.address} />
            <RowItem label="접수기간" value={selected.period} />
            <RowItem label="공고일" value={selected.announcementDateText} />
            <RowItem label="D-day" value={selected.ddayText} />
          </dl>
          <button className="btn btn-purple search-detail-fav" type="button" onClick={() => toggleFav(selected.id)}>
            {selected.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          </button>
          <DetailMap selected={selected} />
        </>
      )}
    </section>
  );
}
