/**
 * DetailPanel
 * 용도: `Search` 페이지에서 선택된 공고의 상세 정보를 보여주는 패널 컴포넌트입니다.
 * 위치: `src/pages/Search.tsx`의 상세(우측) 패널로 사용됩니다.
 */

import React from "react";
import { Card } from "react-bootstrap";
import { FaExternalLinkAlt } from "react-icons/fa";

type RowItem = {
  id: string;
  status: string;
  title: string;
  complex: string;
  region: string;
  period: string;
  dday: number;
  url: string;
};

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="p-2"
      style={{ border: "1px solid #e6e7f2", borderRadius: 14 }}
    >
      <div className="small text-muted">{label}</div>
      <div className="font-weight-bold" style={{ lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  );
}

type Props = {
  selected?: RowItem;
  fav: Record<string, boolean>;
  toggleFav: (id: string) => void;
};

export default function DetailPanel({ selected, fav, toggleFav }: Props) {
  return (
    <Card className="panel-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">상세</h5>
          {selected && (
            <a
              className="btn btn-sm btn-outline-secondary"
              href={selected.url}
              target="_blank"
              rel="noreferrer"
            >
              <FaExternalLinkAlt />
            </a>
          )}
        </div>

        {!selected ? (
          <div className="text-muted">선택된 공고가 없습니다.</div>
        ) : (
          <div className="d-flex flex-column" style={{ gap: 10 }}>
            <Info label="고유번호" value={selected.id} />
            <Info label="상태" value={selected.status} />
            <Info label="공고명" value={selected.title} />
            <Info label="단지명" value={selected.complex} />
            <Info label="지역" value={selected.region} />
            <Info label="접수기간" value={selected.period} />
            <Info label="D-day" value={`D-${selected.dday}`} />

            <button
              className="btn btn-purple btn-block"
              type="button"
              onClick={() => selected && toggleFav(selected.id)}
            >
              {selected && fav[selected.id] ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            </button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
