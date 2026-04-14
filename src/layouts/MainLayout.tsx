/*
 * @file-overview
 * 파일: src/layouts\MainLayout.tsx
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

import { Outlet, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaSearch, FaCog } from "react-icons/fa";
import SideItem from "@/components/common/Sidebar";

// AppLayout: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
export default function AppLayout() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          type="button"
          className="sidebar-brand sidebar-brand-btn"
          onClick={() => navigate("/dashboard")}
          aria-label="메인 대시보드로 이동"
        >
          <div className="sidebar-brand-badge">
            <img src="/favicon.svg" alt="우리청약노트 로고" />
          </div>
          <span>우리청약노트</span>
        </button>

        <nav className="sidebar-nav">
          <SideItem to="/dashboard" icon={<FaTachometerAlt />} label="메인 관제" end />
          <SideItem to="/search" icon={<FaSearch />} label="조회" />
          <SideItem to="/settings" icon={<FaCog />} label="설정" />
        </nav>

        <div className="sidebar-footer">
          {/*
          <div className="small" style={{ color: "rgba(203,213,225,.7)" }}>
            UI only · API는 추후 진행
          </div>
          */}
        </div>
      </aside>

      <div className="main">
        <Topbar onGoDashboard={() => navigate("/dashboard")} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Topbar: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
function Topbar({ onGoDashboard }: { onGoDashboard: () => void }) {
  return (
    <header className="topbar" style={{ marginBottom: 10 }}>
      <button
        type="button"
        className="topbar-title topbar-title-btn"
        onClick={onGoDashboard}
        aria-label="메인 대시보드로 이동"
      >
        우리청약노트
      </button>
    </header>
  );
}
