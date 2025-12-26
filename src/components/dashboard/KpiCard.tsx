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
