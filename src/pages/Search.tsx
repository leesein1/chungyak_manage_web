import { useMemo, useState } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { FaExternalLinkAlt, FaHeart, FaRegHeart, FaSearch } from "react-icons/fa";

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
      <div className="page-title">
        조회
        <div className="page-sub">검색/필터/목록 + 상세 패널(샘플 UI)</div>
      </div>

      <Card className="panel-card mb-3">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={6} className="mb-2">
              <Form.Label>키워드</Form.Label>
              <div className="d-flex" style={{ gap: 8 }}>
                <Form.Control
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="공고명/단지/지역"
                />
                <button className="btn btn-purple" type="button">
                  <FaSearch />
                </button>
              </div>
            </Col>
            <Col md={3} className="mb-2">
              <Form.Label>상태</Form.Label>
              <Form.Control as="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">전체</option>
                <option value="예정">예정</option>
                <option value="접수중">접수중</option>
                <option value="마감">마감</option>
              </Form.Control>
            </Col>
            <Col md={3} className="mb-2">
              <Form.Check
                type="checkbox"
                id="onlySoon"
                label="D-7 이내만"
                checked={onlySoon}
                onChange={(e) => setOnlySoon(e.target.checked)}
                style={{ marginTop: 30 }}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        <Col lg={8} className="mb-3">
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
                        className={r.id === selected?.id ? "table-active" : ""}
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
                            {r.favored ? (
                              <FaHeart color="#ff4d6d" />
                            ) : (
                              <FaRegHeart color="#94a3b8" />
                            )}
                          </button>
                        </td>
                        <td>
                          <div className="font-weight-bold">{r.title}</div>
                          <div className="small text-muted">{r.complex} · {r.region}</div>
                          <div className="small text-muted">{r.period}</div>
                        </td>
                        <td><span className="status-pill">{r.status}</span></td>
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
        </Col>

        <Col lg={4} className="mb-3">
          <Card className="panel-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">상세</h5>
                {selected && (
                  <a className="btn btn-sm btn-outline-secondary" href={selected.url} target="_blank" rel="noreferrer">
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
                    onClick={() => setFav((p) => ({ ...p, [selected.id]: !p[selected.id] }))}
                  >
                    {fav[selected.id] ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                  </button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2" style={{ border: "1px solid #e6e7f2", borderRadius: 14 }}>
      <div className="small text-muted">{label}</div>
      <div className="font-weight-bold" style={{ lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  );
}

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
