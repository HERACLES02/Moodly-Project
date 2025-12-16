// components/MoodCurrencyIcon.jsx
export default function MoodCurrencyIcon({
  className,
  size = 24,
}: {
  className: string
  size: number
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer star points */}
      <path
        d="M50 10 L54 35 L50 35 L46 35 Z"
        fill="url(#gradient1)"
        opacity="0.8"
      />
      <path
        d="M90 50 L65 54 L65 50 L65 46 Z"
        fill="url(#gradient2)"
        opacity="0.8"
      />
      <path
        d="M50 90 L46 65 L50 65 L54 65 Z"
        fill="url(#gradient1)"
        opacity="0.8"
      />
      <path
        d="M10 50 L35 46 L35 50 L35 54 Z"
        fill="url(#gradient2)"
        opacity="0.8"
      />

      {/* Main circle with gradient */}
      <circle
        cx="50"
        cy="50"
        r="22"
        fill="url(#mainGradient)"
        stroke="url(#strokeGradient)"
        strokeWidth="2"
      />

      {/* Inner sparkle */}
      <path d="M50 35 L52 48 L50 48 L48 48 Z" fill="white" opacity="0.6" />
      <path d="M65 50 L52 52 L52 50 L52 48 Z" fill="white" opacity="0.6" />
      <path d="M50 65 L48 52 L50 52 L52 52 Z" fill="white" opacity="0.6" />
      <path d="M35 50 L48 48 L48 50 L48 52 Z" fill="white" opacity="0.6" />

      {/* Small accent stars */}
      <circle cx="50" cy="50" r="3" fill="white" opacity="0.9" />
      <circle cx="42" cy="42" r="1.5" fill="#E94FC1" opacity="0.7" />
      <circle cx="58" cy="58" r="1.5" fill="#4A9FF5" opacity="0.7" />

      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E94FC1" stopOpacity="1" />
          <stop offset="50%" stopColor="#D946B8" stopOpacity="1" />
          <stop offset="100%" stopColor="#C837DC" stopOpacity="1" />
        </linearGradient>

        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A9FF5" stopOpacity="1" />
          <stop offset="50%" stopColor="#5BB4FF" stopOpacity="1" />
          <stop offset="100%" stopColor="#6FC5FF" stopOpacity="1" />
        </linearGradient>

        <radialGradient id="mainGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5CFFF" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#E8B4FF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#D99EFF" stopOpacity="0.6" />
        </radialGradient>

        <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E94FC1" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#D946B8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4A9FF5" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  )
}