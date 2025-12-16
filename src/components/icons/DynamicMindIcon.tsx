import React from "react"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

const DynamicMindIcon: React.FC<IconProps> = ({
  size = 24,
  className = "",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor" // Inherits parent's text color
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Outer circle boundary */}
      <circle cx="12" cy="12" r="10" />

      {/* The happy face center */}
      {/* Use 'fill="currentColor" opacity="0.1"' for a subtle effect */}
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.1" />
      <path d="M10 13c.8 1 2 1 3 0" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="11" r="0.5" fill="currentColor" />
      <circle cx="14" cy="11" r="0.5" fill="currentColor" />

      {/* The three intersecting orbits (ellipses) */}
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </svg>
  )
}

export default DynamicMindIcon