import { Col, Row } from "react-bootstrap";
import DashboardKpi from "@/components/dashboard/DashboardKpi";
import DashboardCalendar from "@/components/dashboard/DashboardCalendar";
import DashboardHero from "./dashboard/DashboardHero";
import DeadlineSoonSection from "./dashboard/DeadlineSoonSection";
import RecentUpdatesSection from "./dashboard/RecentUpdatesSection";
import { useDashboardData } from "./dashboard/useDashboardData";
import "./Dashboard.css";

// 대시보드 페이지 컨테이너입니다. 데이터 훅 결과를 각 섹션 UI로 전달만 합니다.
export default function Dashboard() {
  const { loading, error, state, heroStatusText } = useDashboardData();

  return (
    <div className="dashboard-page">
      {/* 상단 히어로: 페이지 요약 메시지와 상태 배지를 보여줍니다. */}
      <DashboardHero
        heroStatusText={heroStatusText}
        totalCount={state.totalCount}
        lastSyncLabel={state.lastSyncLabel}
        error={error}
      />

      {/* KPI 카드 영역: 핵심 지표 4개를 카드 형태로 보여줍니다. */}
      <DashboardKpi
        totalCount={state.totalCount}
        ongoingCount={state.ongoingCount}
        deadlineSoonCount={state.deadlineSoonCount}
        favoriteCount={state.favoriteCount}
        lastSyncLabel={state.lastSyncLabel}
        syncHealthy={state.syncHealthy}
      />

      {/* 캘린더 영역: 공고 접수 시작/마감 이벤트를 날짜로 시각화합니다. */}
      <div className="mb-3">
        <DashboardCalendar events={state.calendarEvents} />
      </div>

      <Row>
        {/* 좌측 영역: D-7 임박 공고 목록을 표로 보여줍니다. */}
        <Col lg={7} className="mb-3">
          <DeadlineSoonSection loading={loading} items={state.soonItems} />
        </Col>

        {/* 우측 영역: 최근 동기화/요약 업데이트 로그를 보여줍니다. */}
        <Col lg={5} className="mb-3">
          <RecentUpdatesSection items={state.updates} />
        </Col>
      </Row>
    </div>
  );
}
