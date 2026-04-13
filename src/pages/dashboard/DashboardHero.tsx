import { FaArrowUp, FaCheckCircle, FaClock } from "react-icons/fa";
import HeroArt from "./HeroArt";

type Props = {
  heroStatusText: string;
  totalCount: number;
  lastSyncLabel: string;
  error: string | null;
};

// 대시보드 상단 소개/상태 배지 영역입니다.
export default function DashboardHero({
  heroStatusText,
  totalCount,
  lastSyncLabel,
  error,
}: Props) {
  return (
    <section className="dash-hero mb-3">
      {/* 왼쪽 텍스트 영역: 타이틀/설명/배지/오류 메시지를 보여줍니다. */}
      <div className="dash-hero-content">
        <div className="dash-hero-eyebrow">CHUNGYAK MONITOR</div>
        <h1 className="dash-hero-title">인천의 마이홈 청약 흐름을 한눈에</h1>
        <p className="dash-hero-sub">
          마감 임박, 즐겨찾기, 신규 공고를 실시간으로 추적하고 중요한 일정만
          빠르게 확인하세요.
        </p>

        <div className="dash-hero-badges">
          {/* 상태 배지: 현재 모니터링 상태, 전체 공고 수, 마지막 갱신 시간 등을 보여줍니다. */}
          <span className="hero-badge">
            <FaCheckCircle /> {heroStatusText}
          </span>
          <span className="hero-badge">
            <FaArrowUp /> 전체 공고 {totalCount}건
          </span>
          <span className="hero-badge">
            <FaClock /> 마지막 갱신 {lastSyncLabel}
          </span>
        </div>

        {error ? <div className="dash-load-error">{error}</div> : null}
      </div>

      {/* 오른쪽 장식 영역: 대시보드 분위기를 만드는 SVG 일러스트입니다. */}
      <HeroArt />
    </section>
  );
}
