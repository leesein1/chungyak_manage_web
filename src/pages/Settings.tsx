import { Col, Row } from "react-bootstrap";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SyncSettings from "@/components/settings/SyncSettings";

export default function Settings() {
  return (
    <div>
      <div className="page-title">
        설정
        <div className="page-sub">알림/동기화/기본 필터 (샘플 UI)</div>
      </div>

      <Row>
        <Col lg={6} className="mb-3">
          <NotificationSettings />
        </Col>

        <Col lg={6} className="mb-3">
          <SyncSettings />
        </Col>
      </Row>
    </div>
  );
}
