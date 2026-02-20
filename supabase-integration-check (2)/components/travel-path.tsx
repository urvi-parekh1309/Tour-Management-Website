"use client"

import { useEffect, useRef } from "react"

export function TravelPath({ onComplete }: { onComplete: () => void }) {
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    const length = path.getTotalLength()
    path.style.strokeDasharray = `${length}`
    path.style.strokeDashoffset = `${length}`

    const timeout = setTimeout(() => {
      path.style.transition = `stroke-dashoffset 2.5s ease-in-out`
      path.style.strokeDashoffset = "0"
    }, 600)

    const completeTimeout = setTimeout(() => {
      onComplete()
    }, 3200)

    return () => {
      clearTimeout(timeout)
      clearTimeout(completeTimeout)
    }
  }, [onComplete])

  // The girl is at left:0, her map-holding hand extends to about 12-15% from left.
  // The path starts from that point and snakes all the way to ~90% where the pin sits.

  return (
    <svg
      viewBox="0 0 1000 180"
      className="absolute left-[10%] top-[28%] w-[78%] h-auto z-10 pointer-events-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      {/* Dashed background trail */}
      <path
        d="M 0,70 C 80,10 160,130 260,75 C 360,20 440,140 540,80 C 640,20 720,130 820,75 C 890,40 950,70 1000,60"
        stroke="#D4C0AA"
        strokeWidth="3"
        strokeDasharray="8 12"
        fill="none"
        opacity="0.4"
      />
      {/* Main animated snake path */}
      <path
        ref={pathRef}
        d="M 0,70 C 80,10 160,130 260,75 C 360,20 440,140 540,80 C 640,20 720,130 820,75 C 890,40 950,70 1000,60"
        stroke="#6B4423"
        strokeWidth="3.5"
        strokeDasharray="12 8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Small accent dots along the wave */}
      {[130, 400, 670, 910].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={i % 2 === 0 ? 35 : 110}
          r="4"
          fill="#FF9933"
          opacity="0.5"
          className="animate-pulse"
        />
      ))}
    </svg>
  )
}
