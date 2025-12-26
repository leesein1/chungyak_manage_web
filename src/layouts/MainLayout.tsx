import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaTachometerAlt, FaSearch, FaCog } from "react-icons/fa";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-badge">C</div>
          <span>Chungyak</span>
        </div>

        <nav className="sidebar-nav">
          <SideItem to="/" icon={<FaTachometerAlt />} label="메인 관제" end />
          <SideItem to="/search" icon={<FaSearch />} label="조회" />
          <SideItem to="/settings" icon={<FaCog />} label="설정" />
        </nav>

        <div className="sidebar-footer">
          <div className="small" style={{ color: "rgba(203,213,225,.7)" }}>
            UI only · API는 다음 단계
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

function SideItem({
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
