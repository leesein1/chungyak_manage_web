import type { ReactNode } from "react";
import { Card } from "react-bootstrap";

export default function KpiCard({
  title,
  value,
  icon,
  hint,
  chip,
  tone,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  hint: string;
  chip?: ReactNode;
  tone?: "indigo" | "orange" | "rose" | "emerald";
}) {
  return (
    <Card className={`kpi-card tone-${tone ?? "indigo"}`}>
      <Card.Body>
        <div className="kpi-head">
          <div className="kpi-title">{title}</div>
          <div className="kpi-icon-wrap">
            <span className="kpi-icon">{icon}</span>
          </div>
        </div>

        <div className="kpi-value">{value}</div>
        <div className="kpi-foot">
          <div className="kpi-hint">{hint}</div>
          {chip ? <span className="kpi-chip">{chip}</span> : null}
        </div>
      </Card.Body>
    </Card>
  );
}
