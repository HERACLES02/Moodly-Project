import React from "react"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  // We extend SVGProps to allow passing standard SVG/HTML attributes like className, size, etc.
  size?: number | string
}

const AuraIcon: React.FC<IconProps> = ({
  size = 24,
  className = "",
  ...props
}) => {
  return (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M12 2a4 4 0 0 1 4 4c0 4-4 8-4 8s-4-4-4-8a4 4 0 0 1 4-4z"/>
  <path d="M12 16v6"/>
  <path d="M10 18h4"/>
</svg>
  )
}

export default AuraIcon
