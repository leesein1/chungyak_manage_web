/**
 * KpiCard
 * 용도: KPI 요약 카드 단일 아이템 컴포넌트입니다.
 * - `DashboardKpi`에서 여러 개를 조합해 사용합니다.
 */

import { Card } from "react-bootstrap";

export default function KpiCard({
  title,
  value,
  icon,
  hint,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  hint: string;
}) {
  return (
    <Card className="kpi-card">
      <Card.Body>
        <div className="kpi-title">{title}</div>
        <div className="kpi-value">
          {value}
          <span className="kpi-icon">{icon}</span>
        </div>
        <div className="kpi-hint">{hint}</div>
      </Card.Body>
    </Card>
  );
}
