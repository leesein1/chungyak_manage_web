/**
 * NotificationSettings
 * 용도: `Settings` 페이지의 알림 관련 설정(UI) 컴포넌트입니다.
 * - Slack Webhook URL 입력
 * - 알림 조건 토글
 * 위치: `src/pages/Settings.tsx`에서 사용됩니다.
 */

import React from "react";
import { Card, Form } from "react-bootstrap";

export default function NotificationSettings() {
  return (
    <Card className="panel-card">
      <Card.Body>
        <h5 className="mb-3">알림 채널</h5>
        <Form>
          <Form.Group>
            <Form.Label>Slack Webhook URL</Form.Label>
            <Form.Control placeholder="https://hooks.slack.com/services/..." />
            <Form.Text className="text-muted">
              나중에 서버(API)에서 이 값으로 알림을 보냅니다.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>알림 조건</Form.Label>
            <div className="d-flex flex-column" style={{ gap: 8 }}>
              <Form.Check type="checkbox" label="접수 시작 시" defaultChecked />
              <Form.Check
                type="checkbox"
                label="마감 3일 전(D-3)"
                defaultChecked
              />
              <Form.Check type="checkbox" label="마감 1일 전(D-1)" />
              <Form.Check type="checkbox" label="당첨자 발표일" />
            </div>
          </Form.Group>

          <div className="mt-4">
            <button className="btn btn-purple" type="button">
              저장
            </button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
