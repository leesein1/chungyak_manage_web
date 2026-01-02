/**
 * SyncSettings
 * 용도: `Settings` 페이지의 동기화 및 기본 조회 필터 설정 UI를 담당하는 컴포넌트입니다.
 * - 자동 동기화 주기 선택
 * - 기본 지역/기본 필터 설정
 * 위치: `src/pages/Settings.tsx`에서 사용됩니다.
 */

import React from "react";
import { Card, Col, Form, Row } from "react-bootstrap";

export default function SyncSettings() {
  return (
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
  );
}
