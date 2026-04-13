// 히어로 오른쪽에 배치되는 장식용 SVG 컴포넌트입니다.
export default function HeroArt() {
  return (
    <svg
      className="dash-hero-art"
      viewBox="0 0 420 280"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="dashboard illustration"
    >
      <defs>
        <linearGradient id="dashCard" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5f8ff" />
          <stop offset="100%" stopColor="#dbe6ff" />
        </linearGradient>
        <linearGradient id="dashLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd29d" />
          <stop offset="100%" stopColor="#ff9f66" />
        </linearGradient>
      </defs>

      <rect x="40" y="28" width="330" height="220" rx="22" fill="url(#dashCard)" />
      <rect x="70" y="58" width="120" height="72" rx="12" fill="#fff" opacity="0.95" />
      <rect x="206" y="58" width="134" height="28" rx="10" fill="#fff" opacity="0.95" />
      <rect x="206" y="94" width="90" height="12" rx="6" fill="#b9c8ef" />
      <rect x="70" y="146" width="270" height="16" rx="8" fill="#c7d6f5" />
      <rect x="70" y="174" width="222" height="16" rx="8" fill="#d6e1f8" />
      <rect x="70" y="202" width="146" height="16" rx="8" fill="#e2e9fa" />

      <path
        d="M86 118 C122 88, 142 146, 176 112 S236 98, 268 122 S324 138, 350 110"
        fill="none"
        stroke="url(#dashLine)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="86" cy="118" r="7" fill="#ff9f66" />
      <circle cx="176" cy="112" r="7" fill="#ff9f66" />
      <circle cx="268" cy="122" r="7" fill="#ff9f66" />
      <circle cx="350" cy="110" r="7" fill="#ff9f66" />
    </svg>
  );
}
