import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center" style={{ padding: 48 }}>
      <h3 className="mb-3">페이지를 찾을 수 없습니다.</h3>
      <p className="text-muted">주소가 잘못되었거나, 페이지가 이동되었습니다.</p>
      <Link className="btn btn-purple" to="/">
        대시보드로
      </Link>
    </div>
  );
}
