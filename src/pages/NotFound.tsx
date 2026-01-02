/**
 * NotFound
 * 용도: 잘못된 라우트 접근 시 보여줄 404 페이지입니다.
 * 위치: `src/App.tsx`의 catch-all(`*`) 라우트에 연결됩니다.
 */

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center" style={{ padding: 48 }}>
      <h3 className="mb-3">페이지를 찾을 수 없습니다.</h3>
      <p className="text-muted">
        주소가 잘못되었거나, 페이지가 이동되었습니다.
      </p>
      <Link className="btn btn-purple" to="/">
        대시보드로
      </Link>
    </div>
  );
}
