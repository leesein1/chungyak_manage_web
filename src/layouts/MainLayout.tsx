/**
 * MainLayout
 * 용도: 로그인 이후 공통 레이아웃(사이드바 + 상단 바 + 콘텐츠 영역)을 제공하는 컴포넌트입니다.
 * - 라우터의 Outlet을 통해 각 페이지를 렌더링합니다.
 * 위치: `src/App.tsx`의 메인 레이아웃으로 사용됩니다.
 */

import { Outlet } from "react-router-dom";
import { FaTachometerAlt, FaSearch, FaCog } from "react-icons/fa";
import SideItem from "@/components/common/Sidebar";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-badge">C</div>
          <span>Chungyak</span>
        </div>

        <nav className="sidebar-nav">
          <SideItem
            to="/dashboard"
            icon={<FaTachometerAlt />}
            label="메인 관제"
            end
          />
          <SideItem to="/search" icon={<FaSearch />} label="조회" />
          <SideItem to="/settings" icon={<FaCog />} label="설정" />
        </nav>

        <div className="sidebar-footer">
          <div className="small" style={{ color: "rgba(203,213,225,.7)" }}>
            UI only · API는 추후 진행
          </div>
        </div>
      </aside>

      <div className="main">
        <Topbar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <header className="topbar" style={{ marginBottom: 10 }}>
      <div className="topbar-title">청약 알리미</div>
      {/*       
      <div className="d-flex align-items-center" style={{ gap: 10 }}>
        <span
          className="badge badge-light"
          style={{ borderRadius: 999, padding: "7px 10px" }}
        >
          Dev
        </span>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            background: "rgba(255,255,255,.2)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          SI
        </div> 
      </div>
      */}
    </header>
  );
}
