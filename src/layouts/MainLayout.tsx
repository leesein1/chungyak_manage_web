/*
 * @file-overview
 * 파일: src/layouts/MainLayout.tsx
 * 설명: 공통 레이아웃(사이드바/상단바/Outlet)을 구성합니다.
 */

import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaTachometerAlt, FaSearch, FaClipboardList, FaBars, FaChevronDown } from "react-icons/fa";
import SideItem from "@/components/common/Sidebar";

// AppLayout: 공통 프레임과 좌측 네비게이션을 렌더링한다.
export default function AppLayout() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [logMenuOpen, setLogMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 980) setMobileNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className={`app-shell ${mobileNavOpen ? "nav-open" : ""}`}>
      <aside className={`sidebar ${mobileNavOpen ? "open" : ""}`}>
        <button
          type="button"
          className="sidebar-brand sidebar-brand-btn"
          onClick={() => {
            navigate("/dashboard");
            setMobileNavOpen(false);
          }}
          aria-label="메인 대시보드로 이동"
        >
          <div className="sidebar-brand-badge">
            <img src="/favicon.svg" alt="우리청약노트 로고" />
          </div>
          <div className="sidebar-brand-texts">
            <span className="sidebar-brand-title">우리청약노트</span>
            <span className="sidebar-brand-sub">Housing Monitor</span>
          </div>
        </button>

        <nav className="sidebar-nav" onClick={() => setMobileNavOpen(false)}>
          <div className="sidebar-section-label">메뉴</div>
          <SideItem to="/dashboard" icon={<FaTachometerAlt />} label="메인 관리" end />
          <SideItem to="/search" icon={<FaSearch />} label="조회" />

          <div className={`nav-group ${logMenuOpen ? "open" : ""}`}>
            <button
              type="button"
              className="nav-group-title nav-group-btn"
              onClick={() => setLogMenuOpen((prev) => !prev)}
              aria-expanded={logMenuOpen}
              aria-controls="nav-log-submenu"
            >
              <span className="nav-icon"><FaClipboardList /></span>
              <span className="nav-label">로그</span>
              <span className="nav-caret"><FaChevronDown /></span>
            </button>
            <div id="nav-log-submenu" className={`nav-submenu ${logMenuOpen ? "open" : ""}`}>
              <SideItem to="/sch-log" label="스케줄 로그" nested />
              <SideItem to="/alarm-log" label="조회 로그" nested />
            </div>
          </div>
        </nav>

        <div className="sidebar-footer" />
      </aside>
      <button
        type="button"
        className={`mobile-nav-backdrop ${mobileNavOpen ? "show" : ""}`}
        onClick={() => setMobileNavOpen(false)}
        aria-label="메뉴 닫기"
      />

      <div className="main">
        <Topbar
          onGoDashboard={() => navigate("/dashboard")}
          onToggleNav={() => setMobileNavOpen((prev) => !prev)}
        />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Topbar: 상단 제목 클릭 시 대시보드 홈으로 이동시킨다.
function Topbar({
  onGoDashboard,
  onToggleNav,
}: {
  onGoDashboard: () => void;
  onToggleNav: () => void;
}) {
  return (
    <header className="topbar" style={{ marginBottom: 10 }}>
      <button type="button" className="topbar-menu-btn" onClick={onToggleNav} aria-label="모바일 메뉴 열기">
        <FaBars />
      </button>
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
