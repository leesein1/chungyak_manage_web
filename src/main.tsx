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
