/*
 * @file-overview
 * 파일: src/components\dashboard\DashboardKpi.tsx
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

import { Container, Col, Row } from "react-bootstrap";
import {
  FaBell,
  FaChartLine,
  FaHeart,
  FaSyncAlt,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import KpiCard from "./KpiCard";
import { useNavigate } from "react-router-dom";

type Props = {
  totalCount: number;
  ongoingCount: number;
  deadlineSoonCount: number;
  favoriteCount: number;
  lastSyncLabel: string;
  syncHealthy: boolean;
};

// DashboardKpi: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
export default function DashboardKpi({
  totalCount,
  ongoingCount,
  deadlineSoonCount,
  favoriteCount,
  lastSyncLabel,
  syncHealthy,
}: Props) {
  const navigate = useNavigate();

  // goSearchWithMode: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
  const goSearchWithMode = (mode: "ongoing" | "soon" | "favorite") => {
    const qs = new URLSearchParams();
    qs.set("from", "dashboard");
    qs.set("mode", mode);
    navigate(`/search?${qs.toString()}`);
  };

  // KPI 카드별 표시 문구/수치/톤을 한 번에 구성합니다.
  const kpis = [
    {
      title: "1. 진행중 공고",
      value: String(ongoingCount),
      icon: <FaChartLine />,
      hint: "접수중 / 접수예정",
      chip: (
        <>
          <FaArrowUp /> 총 {totalCount}
        </>
      ),
      tone: "indigo" as const,
      onClick: () => goSearchWithMode("ongoing"),
    },
    {
      title: "2. D-7 임박",
      value: String(deadlineSoonCount),
      icon: <FaBell />,
      hint: "마감 임박",
      chip: (
        <>
          <FaArrowDown /> 임박 {deadlineSoonCount}
        </>
      ),
      tone: "orange" as const,
      onClick: () => goSearchWithMode("soon"),
    },
    {
      title: "3. 즐겨찾기",
      value: String(favoriteCount),
      icon: <FaHeart />,
      hint: "관심 공고",
      chip: (
        <>
          <FaArrowUp /> 관심 {favoriteCount}
        </>
      ),
      tone: "rose" as const,
      onClick: () => goSearchWithMode("favorite"),
    },
    {
      title: "4. 마지막 동기화",
      value: lastSyncLabel,
      icon: <FaSyncAlt />,
      hint: syncHealthy ? "API 연결 정상" : "동기화 확인 필요",
      chip: (
        <>
          {syncHealthy ? <FaArrowUp /> : <FaArrowDown />} {syncHealthy ? "LIVE" : "WARN"}
        </>
      ),
      tone: "emerald" as const,
    },
  ];

  return (
    <Container fluid className="px-0 mb-3">
      {/* KPI 카드 그리드: 카드 배열을 순회하며 반응형으로 렌더링합니다. */}
      <Row className="kpi gx-3">
        {kpis.map((item) => (
          <Col key={item.title} lg={12} md={6} sm={12} className="mb-3">
            <KpiCard
              title={item.title}
              value={item.value}
              icon={item.icon}
              hint={item.hint}
              tone={item.tone}
              chip={item.chip}
              onClick={item.onClick}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
