/*
 * @file-overview
 * 파일: src/App.tsx
 * 설명: 라우팅 구조와 최상위 페이지 연결을 담당합니다.
 */

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import SCHLog from "./pages/SCHLog";
import ALMLog from "./pages/ALMLog";
import NotFound from "./pages/NotFound";

// App: 라우트 진입 규칙(로그인 우회, SCHLog 메뉴 포함)을 정의한다.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/sch-log" element={<SCHLog />} />
          <Route path="/alarm-log" element={<ALMLog />} />
          {/* 기존 logs/settings 진입은 SCHLog로 이관 */}
          <Route path="/logs" element={<Navigate to="/sch-log" replace />} />
          <Route path="/settings" element={<Navigate to="/sch-log" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
