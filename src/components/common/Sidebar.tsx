/*
 * @file-overview
 * 파일: src/components\common\Sidebar.tsx
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

/**
 * SideItem
 * 용도: 사이드바 내 네비게이션 아이템 컴포넌트입니다.
 * - `MainLayout`의 사이드바에서 사용됩니다.
 */

import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

// SideItem: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
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
