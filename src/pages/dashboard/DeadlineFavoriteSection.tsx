import { useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import type { SoonItem } from "./types";

type Props = {
  loading: boolean;
  soonItems: SoonItem[];
  favoriteItems: SoonItem[];
};

export default function DeadlineFavoriteSection({
  loading,
  soonItems,
  favoriteItems,
}: Props) {
  const [activeTab, setActiveTab] = useState<"soon" | "favorite">("soon");
  const [expanded, setExpanded] = useState(false);

  const items = useMemo(
    () => (activeTab === "soon" ? soonItems : favoriteItems),
    [activeTab, soonItems, favoriteItems]
  );

  useEffect(() => {
    setExpanded(false);
  }, [activeTab]);

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

  const visibleItems = useMemo(
    () => (expanded ? items : items.slice(0, 5)),
    [expanded, items]
  );

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
          <button className="btn btn-sm btn-purple">전체보기</button>
        </div>

        <div className="table-wrap dash-table-scroll">
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th style={{ width: 70 }}>IDX</th>
                <th style={{ width: 130 }}>상태</th>
                <th style={{ width: 100 }}>남은날</th>
                <th style={{ width: 120 }}>공고일</th>
                <th style={{ minWidth: 360 }}>공고명</th>
              </tr>
            </thead>
            <tbody key={activeTab}>
              {visibleItems.map((item, index) => (
                <tr key={`${activeTab}-${item.id}-${index}`}>
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

        {!loading && items.length > 5 ? (
          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? "접기" : `더보기 (${items.length - 5}건)`}
            </button>
          </div>
        ) : null}
      </Card.Body>
    </Card>
  );
}
