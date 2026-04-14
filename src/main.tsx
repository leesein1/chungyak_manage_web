/*
 * @file-overview
 * 파일: src/main.tsx
 * 설명: 앱 진입점으로 루트 렌더링과 전역 설정을 초기화합니다.
 */

/**
 * main.tsx
 * 용도: 앱 엔트리 포인트입니다. React 애플리케이션을 DOM에 마운트합니다.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
