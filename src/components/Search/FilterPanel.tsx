/**
 * FilterPanel
 * 용도: `Search` 페이지의 검색/필터 입력 UI를 분리한 컴포넌트입니다.
 * 위치: `src/pages/Search.tsx`에서 사용됩니다.
 */

import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

type Props = {
  q: string;
  setQ: (v: string) => void;
  onlySoon: boolean;
  setOnlySoon: (v: boolean) => void;
  status: string;
  setStatus: (v: string) => void;
};

export default function FilterPanel({
  q,
  setQ,
  onlySoon,
  setOnlySoon,
  status,
  setStatus,
}: Props) {
  return (
    <div>
      <div className="page-title">
        조회
        <div className="page-sub">검색/필터/목록 + 상세 패널(샘플 UI)</div>
      </div>

      <div className="panel-card mb-3 card">
        <div className="card-body">
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
              <Form.Control
                as="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
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
        </div>
      </div>
    </div>
  );
}
