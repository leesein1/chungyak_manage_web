import { Card } from "react-bootstrap";
import type { UpdateItem } from "./types";

type Props = {
  items: UpdateItem[];
};

// 최근 동기화/요약 로그를 보여주는 섹션입니다.
export default function RecentUpdatesSection({ items }: Props) {
  return (
    <Card className="panel-card dash-section-card">
      <Card.Body>
        {/* 섹션 헤더: 최근 업데이트 영역의 제목과 설명을 표시합니다. */}
        <h5 className="mb-2">최근 업데이트</h5>
        <div className="small text-muted mb-3">
          스케줄 변경과 공고 동기화 이력을 시간순으로 확인합니다.
        </div>

        {/* 업데이트 목록: 동기화 상태/요약 로그를 카드로 렌더링합니다. */}
        <div className="d-flex flex-column" style={{ gap: 12 }}>
          {items.map((item) => (
            <div key={item.id} className="dash-update-item">
              <div className="d-flex justify-content-between">
                <div className="font-weight-bold">{item.title}</div>
                <span className="badge badge-light">{item.when}</span>
              </div>
              <div className="small text-muted mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
