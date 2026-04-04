import { Card, Col, Container, Row, Spinner } from "react-bootstrap";
import DashboardKpi from "@/components/dashboard/DashboardKpi";
import DashboardCalendar from "@/components/dashboard/DashboardCalendar";
import DashboardHero from "./dashboard/DashboardHero";
import DeadlineFavoriteSection from "./dashboard/DeadlineFavoriteSection";
import RecentUpdatesSection from "./dashboard/RecentUpdatesSection";
import { useDashboardData } from "./dashboard/useDashboardData";
import "./Dashboard.css";

function SectionLoader({ label, minHeight }: { label: string; minHeight: number }) {
  return (
    <Card className="panel-card dash-section-card dash-loader-card">
      <Card.Body className="dash-loader-inner" style={{ minHeight }}>
        <Spinner animation="border" size="sm" role="status" />
        <span>{label}</span>
      </Card.Body>
    </Card>
  );
}

function KpiLoader() {
  return (
    <Container fluid className="px-0 mb-3">
      <Row className="kpi gx-3">
        {[1, 2, 3, 4].map((idx) => (
          <Col key={`kpi-loader-${idx}`} lg={12} md={6} sm={12} className="mb-3">
            <SectionLoader label="지표 불러오는 중..." minHeight={134} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

// 대시보드 페이지 컨테이너입니다. 데이터 훅 결과를 각 섹션 UI로 전달만 합니다.
export default function Dashboard() {
  const { loading, error, state, heroStatusText } = useDashboardData();

  return (
    <div className="dashboard-page">
      {/* 상단 히어로: 페이지 요약 메시지와 상태 배지를 보여줍니다. */}
      {loading ? (
        <SectionLoader label="대시보드 헤더 불러오는 중..." minHeight={220} />
      ) : (
        <DashboardHero
          heroStatusText={heroStatusText}
          totalCount={state.totalCount}
          lastSyncLabel={state.lastSyncLabel}
          error={error}
        />
      )}

      {/* KPI 카드 영역: 핵심 지표 4개를 카드 형태로 보여줍니다. */}
      {loading ? (
        <KpiLoader />
      ) : (
        <DashboardKpi
          totalCount={state.totalCount}
          ongoingCount={state.ongoingCount}
          deadlineSoonCount={state.deadlineSoonCount}
          favoriteCount={state.favoriteCount}
          lastSyncLabel={state.lastSyncLabel}
          syncHealthy={state.syncHealthy}
        />
      )}

      {/* 캘린더 영역: 공고 접수 시작/마감 이벤트를 날짜로 시각화합니다. */}
      <div className="mb-3">
        {loading ? (
          <SectionLoader label="캘린더 불러오는 중..." minHeight={420} />
        ) : (
          <DashboardCalendar events={state.calendarEvents} />
        )}
      </div>

      {/* 하단 영역: 좌측은 D-7/즐겨찾기 공고 전환 목록, 우측은 최근 업데이트 로그를 보여줍니다. */}
      <Row>
        {/* 좌측 영역: D-7 임박/즐겨찾기 목록을 탭으로 전환해 보여줍니다. */}
        <Col lg={7} className="mb-3">
          {loading ? (
            <SectionLoader label="마감/즐겨찾기 목록 불러오는 중..." minHeight={300} />
          ) : (
            <DeadlineFavoriteSection
              loading={loading}
              soonItems={state.soonItems}
              favoriteItems={state.favoriteItems}
            />
          )}
        </Col>

        {/* 우측 영역: 최근 동기화/요약 업데이트 로그를 보여줍니다. */}
        <Col lg={5} className="mb-3">
          {loading ? (
            <SectionLoader label="최근 업데이트 불러오는 중..." minHeight={300} />
          ) : (
            <RecentUpdatesSection items={state.updates} />
          )}
        </Col>
      </Row>
    </div>
  );
}
