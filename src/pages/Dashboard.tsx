import { Card, Col, Row } from "react-bootstrap";
import DashboardKpi from "@/components/dashboard/DashboardKpi";

// 추가
import DashboardCalendar, {
  type CalendarEvent,
} from "@/components/dashboard/DashboardCalendar";

type SoonItem = {
  id: string;
  dday: number;
  title: string;
  region: string;
  period: string;
  status: string;
};

type UpdateItem = {
  id: string;
  title: string;
  when: string;
  desc: string;
};

const sampleSoon: SoonItem[] = [
  {
    id: "soon-1",
    dday: 1,
    title: "검단 센트레빌 에듀시티 (샘플)",
    region: "인천 서구",
    period: "2025-12-27 ~ 2025-12-30",
    status: "접수예정",
  },
  {
    id: "soon-2",
    dday: 3,
    title: "송도 유승한내들 (샘플)",
    region: "인천 연수구",
    period: "2025-12-29 ~ 2026-01-02",
    status: "접수예정",
  },
];

const sampleUpdates: UpdateItem[] = [
  {
    id: "up-1",
    title: "동기화 완료",
    when: "방금",
    desc: "공고 12건 신규/변경 사항 반영 (샘플)",
  },
  {
    id: "up-2",
    title: "즐겨찾기 반영",
    when: "10분 전",
    desc: "관심 공고 1건이 즐겨찾기에 추가됨 (샘플)",
  },
];

export default function Dashboard() {
  // 달력에 찍을 이벤트 (나중에 API로 교체)
  const calendarEvents: CalendarEvent[] = [
    {
      date: "2025-12-26",
      type: "ANNOUNCE",
      title: "2025년 영천시 천원주택(청년 매입임대주택) 입주자 모집",
      badgeText: "매입임대",
      badgeTone: "green",
    },
    {
      date: "2025-12-26",
      type: "ANNOUNCE",
      title: "청주산남2-1 주거복지동 영구임대 예비입주자 모집",
      badgeText: "영구임대",
      badgeTone: "red",
    },
    {
      date: "2025-12-26",
      type: "RECEIVE",
      title: "청약 접수 시작(샘플)",
      badgeText: "접수",
      badgeTone: "red",
    },
    {
      date: "2025-12-26",
      type: "RESULT",
      title: "당첨자 발표(샘플)",
      badgeText: "발표",
      badgeTone: "gray",
    },
  ];

  return (
    <div>
      {/* KPI 컴포넌트 */}
      <DashboardKpi />

      {/* KPI 아래에 달력  */}
      <div className="mb-3">
        <DashboardCalendar events={calendarEvents} />
      </div>

      {/* 아래 두개 유지 */}
      <Row>
        <Col lg={7} className="mb-3">
          <Card className="panel-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">마감 임박 (D-7)</h5>
                <button className="btn btn-sm btn-purple">새로고침</button>
              </div>

              <div className="table-wrap">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 110 }}>D-Day</th>
                      <th>공고명</th>
                      <th style={{ width: 140 }}>상태</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sampleSoon.map((x: SoonItem) => (
                      <tr key={x.id}>
                        <td className="font-weight-bold">D-{x.dday}</td>
                        <td>
                          <div className="font-weight-bold">{x.title}</div>
                          <div className="small text-muted">
                            {x.region} · {x.period}
                          </div>
                        </td>
                        <td>
                          <span className="status-pill">{x.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5} className="mb-3">
          <Card className="panel-card">
            <Card.Body>
              <h5 className="mb-2">최근 업데이트</h5>
              <div className="small text-muted mb-3">
                실제로는 동기화/변경이력(TB_RCVHOME_HIST)을 붙여서 보여주면 됨.
              </div>

              <div className="d-flex flex-column" style={{ gap: 12 }}>
                {sampleUpdates.map((u: UpdateItem) => (
                  <div
                    key={u.id}
                    className="p-3"
                    style={{ border: "1px solid #e6e7f2", borderRadius: 14 }}
                  >
                    <div className="d-flex justify-content-between">
                      <div className="font-weight-bold">{u.title}</div>
                      <span className="badge badge-light">{u.when}</span>
                    </div>
                    <div className="small text-muted mt-1">{u.desc}</div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
