/**
 * Login
 * 용도: 관리자 로그인 페이지입니다.
 * - 현재는 샘플 UI로, 실제 인증은 추후 API 연동 예정입니다.
 * 위치: `src/App.tsx`의 `/` 라우트에 연결됩니다.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: API 로그인 연동
    // 지금은 성공했다고 가정
    navigate("/dashboard"); // 로그인 성공 후 메인관제페이지
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="title">청약알리미</h2>
        <p className="subtitle">관리자 로그인</p>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            로그인
          </button>
        </form>

        <div className="login-footer">
          <span>ⓒ Chungyak Manager</span>
        </div>
      </div>
    </div>
  );
}
