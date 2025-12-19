import React from "react"

type RoundedRectSvgProps = React.SVGProps<SVGSVGElement>

const TestIcon: React.FC<RoundedRectSvgProps> = (props) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 311 289"
      width={622}
      height={578}
      {...props}
    >
      <g
        strokeLinecap="round"
        transform="translate(10 10) rotate(0 145.5 134.5)"
      >
        <path
          d="M32 0 C83.19 5.23, 132.03 4.53, 259 0 
             M32 0 C84.6 3.05, 138.1 3.61, 259 0 
             M259 0 C281.12 2.32, 292.46 7.29, 291 32 
             M259 0 C283.89 0.36, 289.75 7.87, 291 32 
             M291 32 C285.8 101.24, 289.52 169.12, 291 237 
             M291 32 C295.69 106.56, 294.46 183.66, 291 237 
             M291 237 C289.25 255.99, 279.88 270.98, 259 269 
             M291 237 C289.15 261.11, 276.57 265.31, 259 269 
             M259 269 C183.15 270.5, 110.05 270.16, 32 269 
             M259 269 C168.71 270.69, 80.28 267.81, 32 269 
             M32 269 C11.37 267.62, 2.44 258.43, 0 237 
             M32 269 C13.97 266.64, 2.78 260.55, 0 237 
             M0 237 C-3.9 182.49, -2.98 126.37, 0 32 
             M0 237 C3.39 177.5, 2.59 116.53, 0 32 
             M0 32 C-1.83 10.99, 9.35 -1.07, 32 0 
             M0 32 C3.3 6.62, 9.92 -3.57, 32 0"
          stroke="#1e1e1e"
          strokeWidth={2}
          fill="none"
        />
      </g>
    </svg>
  )
}

export default TestIcon
