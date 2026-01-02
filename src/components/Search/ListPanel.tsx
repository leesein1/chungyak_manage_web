/**
 * ListPanel
 * 용도: `Search` 페이지의 결과 목록(테이블) UI를 담당하는 컴포넌트입니다.
 * 위치: `src/pages/Search.tsx`의 리스트 영역에서 사용됩니다.
 */

import React from "react";
import { Card } from "react-bootstrap";
import { FaHeart, FaRegHeart } from "react-icons/fa";

type RowItem = {
  id: string;
  status: string;
  title: string;
  complex: string;
  region: string;
  period: string;
  dday: number;
  url: string;
  favored?: boolean;
};

type Props = {
  rows: RowItem[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  fav: Record<string, boolean>;
  setFav: (f: Record<string, boolean>) => void;
};

export default function ListPanel({
  rows,
  selectedId,
  setSelectedId,
  fav,
  setFav,
}: Props) {
  return (
    <Card className="panel-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">목록</h5>
          <div className="small text-muted">{rows.length}건</div>
        </div>

        <div className="table-wrap">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ width: 48 }}></th>
                <th>공고</th>
                <th style={{ width: 120 }}>상태</th>
                <th style={{ width: 90 }}>D-day</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  style={{ cursor: "pointer" }}
                  className={r.id === selectedId ? "table-active" : ""}
                  onClick={() => setSelectedId(r.id)}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-link p-0"
                      title="즐겨찾기"
                      onClick={() =>
                        setFav((prev) => ({ ...prev, [r.id]: !prev[r.id] }))
                      }
                    >
                      {fav[r.id] ? (
                        <FaHeart color="#ff4d6d" />
                      ) : (
                        <FaRegHeart color="#94a3b8" />
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="font-weight-bold">{r.title}</div>
                    <div className="small text-muted">
                      {r.complex} · {r.region}
                    </div>
                    <div className="small text-muted">{r.period}</div>
                  </td>
                  <td>
                    <span className="status-pill">{r.status}</span>
                  </td>
                  <td className="font-weight-bold">D-{r.dday}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted p-4">
                    조회 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card.Body>
    </Card>
  );
}
