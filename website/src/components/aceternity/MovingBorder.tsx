"use client";

import { useRef, type ReactNode } from "react";
import { useAnimationFrame } from "framer-motion";

interface MovingBorderProps {
  children: ReactNode;
  duration?: number;
  className?: string;
  borderColor?: string;
}

export default function MovingBorder({
  children,
  duration = 3000,
  className = "",
  borderColor = "#B45309",
}: MovingBorderProps) {
  const pathRef = useRef<SVGRectElement>(null);
  const progressRef = useRef(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      progressRef.current = (time / duration) % 1;
      const point = pathRef.current?.getPointAtLength(progressRef.current * length);
      if (point) {
        const el = document.getElementById("moving-dot");
        if (el) {
          el.setAttribute("cx", String(point.x));
          el.setAttribute("cy", String(point.y));
        }
      }
    }
  });

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          ref={pathRef}
          x="1"
          y="1"
          rx="15"
          ry="15"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          fill="none"
          stroke="transparent"
        />
        <circle
          id="moving-dot"
          r="60"
          fill={`${borderColor}30`}
          filter="blur(20px)"
        />
      </svg>
      <div className="relative border border-border rounded-2xl bg-card">
        {children}
      </div>
    </div>
  );
}
