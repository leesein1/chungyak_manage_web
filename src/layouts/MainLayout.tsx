/*
 * @file-overview
 * 파일: src/layouts/MainLayout.tsx
 * 설명: 공통 레이아웃(사이드바/상단바/Outlet)을 구성합니다.
 */

import { Outlet, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaSearch, FaClipboardList } from "react-icons/fa";
import SideItem from "@/components/common/Sidebar";

// AppLayout: 공통 프레임과 좌측 네비게이션을 렌더링한다.
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
          <SideItem to="/dashboard" icon={<FaTachometerAlt />} label="메인 관리" end />
          <SideItem to="/search" icon={<FaSearch />} label="조회" />
          <SideItem to="/sch-log" icon={<FaClipboardList />} label="SCHLog" />
        </nav>

        <div className="sidebar-footer" />
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

// Topbar: 상단 제목 클릭 시 대시보드 홈으로 이동시킨다.
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
