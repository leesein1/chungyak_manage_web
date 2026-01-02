import { useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import FilterPanel from "@/components/search/FilterPanel";
import ListPanel from "@/components/search/ListPanel";
import DetailPanel from "@/components/search/DetailPanel";

type RowItem = {
  id: string;
  status: "예정" | "접수중" | "마감";
  title: string;
  complex: string;
  region: string;
  period: string;
  dday: number;
  url: string;
  favored?: boolean;
};

const mock: RowItem[] = [
  {
    id: "PBLANC-10001",
    status: "접수중",
    title: "검단 센트레빌 에듀시티",
    complex: "센트레빌 에듀시티",
    region: "인천 서구",
    period: "2025-12-29 ~ 2026-01-02",
    dday: 2,
    url: "https://example.com",
  },
  {
    id: "PBLANC-10002",
    status: "예정",
    title: "간석동 포레나 더샵 인천시청역",
    complex: "포레나 더샵",
    region: "인천 남동구",
    period: "2026-01-02 ~ 2026-01-04",
    dday: 6,
    url: "https://example.com",
  },
  {
    id: "PBLANC-10003",
    status: "마감",
    title: "인천시 공공임대 예시",
    complex: "예시 단지",
    region: "인천 부평구",
    period: "2025-12-01 ~ 2025-12-05",
    dday: 0,
    url: "https://example.com",
  },
];

export default function Search() {
  const [q, setQ] = useState("");
  const [onlySoon, setOnlySoon] = useState(true);
  const [status, setStatus] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string>(mock[0]?.id ?? "");
  const [fav, setFav] = useState<Record<string, boolean>>({
    [mock[0].id]: true,
  });

  const rows = useMemo(() => {
    let r = mock.map((x) => ({ ...x, favored: !!fav[x.id] }));
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      r = r.filter((x) =>
        (x.title + " " + x.complex + " " + x.region).toLowerCase().includes(k)
      );
    }
    if (onlySoon) r = r.filter((x) => x.dday <= 7);
    if (status !== "all") r = r.filter((x) => x.status === status);
    return r;
  }, [q, onlySoon, status, fav]);

  const selected = rows.find((x) => x.id === selectedId) ?? rows[0];

  return (
    <div>
      <FilterPanel
        q={q}
        setQ={setQ}
        onlySoon={onlySoon}
        setOnlySoon={setOnlySoon}
        status={status}
        setStatus={setStatus}
      />

      <Row>
        <Col lg={8} className="mb-3">
          <ListPanel
            rows={rows}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            fav={fav}
            setFav={setFav}
          />
        </Col>

        <Col lg={4} className="mb-3">
          <DetailPanel
            selected={selected}
            fav={fav}
            toggleFav={(id) => setFav((p) => ({ ...p, [id]: !p[id] }))}
          />
        </Col>
      </Row>
    </div>
  );
}
