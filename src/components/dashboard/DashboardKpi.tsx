import React from "react";
import { Container, Col, Row } from "react-bootstrap";
import { FaBell, FaHeart, FaPlayCircle, FaSyncAlt } from "react-icons/fa";
import KpiCard from "@/components/dashboard/Kpicard"; // 경로는 너 프로젝트에 맞게 수정

export default function DashboardKpi() {
  return (
    <Container fluid className="px-0">
      {/* gx-3: 컬럼 간격, 필요하면 gx-0(간격없음) / gx-2(조금) */}
      <Row className="kpi gx-3">
        {/* ✅ 4개 가로 배치: lg=3 / md=6 / sm=12 */}
        <Col lg={12} md={6} sm={12} className="mb-3">
          <KpiCard
            title="진행중"
            value="18"
            icon={<FaPlayCircle />}
            hint="접수중/진행중"
          />
        </Col>

        <Col lg={12} md={6} sm={12} className="mb-3">
          <KpiCard
            title="D-7 임박"
            value="5"
            icon={<FaBell />}
            hint="마감 임박"
          />
        </Col>

        <Col lg={12} md={6} sm={12} className="mb-3">
          <KpiCard
            title="즐겨찾기"
            value="12"
            icon={<FaHeart />}
            hint="관심 공고"
          />
        </Col>

        <Col lg={12} md={6} sm={12} className="mb-3">
          <KpiCard
            title="마지막 동기화"
            value="방금"
            icon={<FaSyncAlt />}
            hint="API 연결 전"
          />
        </Col>
      </Row>
    </Container>
  );
}
