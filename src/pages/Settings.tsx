import { Card, Col, Form, Row } from "react-bootstrap";

export default function Settings() {
  return (
    <div>
      <div className="page-title">
        설정
        <div className="page-sub">알림/동기화/기본 필터 (샘플 UI)</div>
      </div>

      <Row>
        <Col lg={6} className="mb-3">
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
                    <Form.Check type="checkbox" label="마감 3일 전(D-3)" defaultChecked />
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
        </Col>

        <Col lg={6} className="mb-3">
          <Card className="panel-card">
            <Card.Body>
              <h5 className="mb-3">동기화</h5>
              <Form>
                <Form.Group>
                  <Form.Label>자동 동기화 주기</Form.Label>
                  <Form.Control as="select" defaultValue="30">
                    <option value="10">10분</option>
                    <option value="30">30분</option>
                    <option value="60">60분</option>
                    <option value="180">3시간</option>
                    <option value="1440">하루 1회</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label>기본 조회 필터</Form.Label>
                  <Row>
                    <Col md={6} className="mb-2">
                      <Form.Control placeholder="기본 지역 (예: 인천)" />
                    </Col>
                    <Col md={6} className="mb-2">
                      <Form.Control as="select" defaultValue="D7">
                        <option value="ALL">전체</option>
                        <option value="D7">D-7 이내</option>
                        <option value="ACTIVE">진행중</option>
                      </Form.Control>
                    </Col>
                  </Row>
                </Form.Group>

                <div className="mt-4 d-flex" style={{ gap: 10 }}>
                  <button className="btn btn-outline-secondary" type="button">
                    테스트 동기화
                  </button>
                  <button className="btn btn-purple" type="button">
                    저장
                  </button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
