import React from "react"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

/**
 * Mood-Themed Points Currency Icon: Dynamic Mind with Star Elements.
 * Represents points/rewards with a happy, orbiting, and sparkling design.
 */
const DynamicMindStarIcon: React.FC<IconProps> = ({
  size = 24,
  className = "",
  ...props
}) => {
  // SVG code for the updated icon
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5" // Slightly thinner stroke for detail
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Outer circle boundary - strokeWidth 2 for prominence */}
      <circle cx="12" cy="12" r="10" strokeWidth="2" />

      {/* The happy face center */}
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="currentColor"
        opacity="0.1"
        stroke="none"
      />
      <path d="M10 13c.8 1 2 1 3 0" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="11" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="14" cy="11" r="0.5" fill="currentColor" stroke="none" />

      {/* The three intersecting orbits (ellipses) */}
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        transform="rotate(0 12 12)"
        strokeWidth="1"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        transform="rotate(60 12 12)"
        strokeWidth="1"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        transform="rotate(120 12 12)"
        strokeWidth="1"
      />

      {/* Small Star/Sparkle Elements for "Points" Intuition */}
      {/* Star 1: Top-Right */}
      <path d="M18 6l-0.5 1 0.5 1M17.5 7h1" strokeWidth="0.8" />
      {/* Star 2: Bottom-Left */}
      <path d="M6 18l-0.5 1 0.5 1M5.5 19h1" strokeWidth="0.8" />
      {/* Star 3: Top-Left */}
      <path d="M6 6l-0.5 1 0.5 1M5.5 7h1" strokeWidth="0.8" />
      {/* Star 4: Bottom-Right */}
      <path d="M18 18l-0.5 1 0.5 1M17.5 19h1" strokeWidth="0.8" />
    </svg>
  )
}

export default DynamicMindStarIcon