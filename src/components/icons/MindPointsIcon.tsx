import React from "react"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

/**
 * Refined Mind Points Currency Icon: Matches the clean, minimal, orbiting style
 * with thin lines and edge dots for a sophisticated, theme-compatible look.
 */
const MindPointsIcon: React.FC<IconProps> = ({
  size = 24,
  className = "",
  ...props
}) => {
  // We use a strokeWidth of 1 for a very thin, technical look
  // And a combination of path and circle elements for the detail
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* 1. Outer Circle Boundary (Slightly thicker for frame) */}
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />

      {/* 2. Central Happy Core (Smiley face) */}
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="currentColor"
        opacity="0.1"
        stroke="none"
      />
      <path
        d="M10.5 13c.5 0.5 1.5 0.5 2.5 0"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="10" cy="11" r="0.4" fill="currentColor" stroke="none" />
      <circle cx="14" cy="11" r="0.4" fill="currentColor" stroke="none" />

      {/* 3. The Three Intersecting Orbits (Very thin lines) */}
      <ellipse
        cx="12"
        cy="12"
        rx="9.5"
        ry="4"
        transform="rotate(0 12 12)"
        strokeWidth="0.8"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="9.5"
        ry="4"
        transform="rotate(60 12 12)"
        strokeWidth="0.8"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="9.5"
        ry="4"
        transform="rotate(120 12 12)"
        strokeWidth="0.8"
      />

      {/* 4. Dots at the edges (Representing star/sparkle/points focus) */}
      {/* Small dots on the main horizontal ellipse (0 and 180 degrees) */}
      <circle
        cx="2.5"
        cy="12"
        r="1.5"
        fill="currentColor"
        stroke="none"
        opacity="0.6"
      />
      <circle
        cx="21.5"
        cy="12"
        r="1.5"
        fill="currentColor"
        stroke="none"
        opacity="0.6"
      />

      {/* Small dots near the intersections of the other orbits (Approx positions) */}
      <circle
        cx="7.7"
        cy="3.5"
        r="1.5"
        fill="currentColor"
        stroke="none"
        opacity="0.6"
      />
      <circle
        cx="16.3"
        cy="20.5"
        r="1.5"
        fill="currentColor"
        stroke="none"
        opacity="0.6"
      />
    </svg>
  )
}

export default MindPointsIcon
