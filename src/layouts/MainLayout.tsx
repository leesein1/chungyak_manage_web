import { Outlet } from "react-router-dom";
import { FaTachometerAlt, FaSearch, FaCog } from "react-icons/fa";
import SideItem from "@/components/common/Sidebar";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-badge">
            <img src="/favicon.svg" alt="우리청약노트 로고" />
          </div>
          <span>우리청약노트</span>
        </div>

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
      <div className="topbar-title">우리청약노트</div>
    </header>
  );
}
