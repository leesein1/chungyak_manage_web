/*
 * @file-overview
 * 파일: src/components\dashboard\KpiCard.tsx
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

import type { ReactNode } from "react";
import { Card } from "react-bootstrap";

// KpiCard: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
export default function KpiCard({
  title,
  value,
  icon,
  hint,
  chip,
  tone,
  onClick,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  hint: string;
  chip?: ReactNode;
  tone?: "indigo" | "orange" | "rose" | "emerald";
  onClick?: () => void;
}) {
  return (
    // KPI 단일 카드: 타이틀/값/아이콘/보조지표(chip)를 한 카드로 묶어 렌더링합니다.
    <Card
      className={`kpi-card tone-${tone ?? "indigo"}${onClick ? " is-clickable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={onClick ? `${title} 조건으로 조회 이동` : undefined}
    >
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
