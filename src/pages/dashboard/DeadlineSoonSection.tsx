import { Card } from "react-bootstrap";
import type { SoonItem } from "./types";

type Props = {
  loading: boolean;
  items: SoonItem[];
};

// 마감 임박 공고 테이블 섹션입니다.
export default function DeadlineSoonSection({ loading, items }: Props) {
  return (
    <Card className="panel-card dash-section-card">
      <Card.Body>
        {/* 섹션 헤더: 제목과 액션 버튼을 표시합니다. */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">마감 임박 (D-7)</h5>
          <button className="btn btn-sm btn-purple">전체보기</button>
        </div>

        <div className="table-wrap">
          {/* 데이터 테이블: 마감 임박 공고 목록을 렌더링합니다. */}
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th style={{ width: 110 }}>D-Day</th>
                <th>공고명</th>
                <th style={{ width: 140 }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="font-weight-bold">D-{item.dday}</td>
                  <td>
                    <div className="font-weight-bold">{item.title}</div>
                    <div className="small text-muted">
                      {item.region} · {item.period}
                    </div>
                  </td>
                  <td>
                    <span className="status-pill">{item.status}</span>
                  </td>
                </tr>
              ))}

              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-muted p-4">
                    마감 임박 데이터가 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card.Body>
    </Card>
  );
}
