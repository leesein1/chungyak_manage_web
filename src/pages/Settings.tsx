/*
 * @file-overview
 * 파일: src/pages\Settings.tsx
 * 설명: 앱 기능을 구성하는 모듈입니다.
 */

import { Col, Row } from "react-bootstrap";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SyncSettings from "@/components/settings/SyncSettings";

// Settings: 이 파일에서 해당 기능 흐름을 처리하는 함수입니다.
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
