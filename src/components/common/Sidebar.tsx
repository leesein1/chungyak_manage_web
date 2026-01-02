/**
 * SideItem
 * 용도: 사이드바 내 네비게이션 아이템 컴포넌트입니다.
 * - `MainLayout`의 사이드바에서 사용됩니다.
 */

import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

export default function SideItem({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </NavLink>
  );
}
