/*
 * @file-overview
 * 파일: src/App.tsx
 * 설명: 라우팅 구조와 최상위 페이지 연결을 담당합니다.
 */

/**
 * App
 * 용도: 애플리케이션 라우팅을 정의하는 엔트리 컴포넌트입니다.
 * - 로그인 라우트와 인증 후 메인 레이아웃 내 페이지들을 연결합니다.
 * 위치: `src/main.tsx`에서 렌더링됩니다.
 */

import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// App: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 */}
        <Route path="/" element={<Login />} />

        {/* 로그인 이후 */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
