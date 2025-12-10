"use client";

import React, { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { useInView } from "react-intersection-observer";

/* ---------------------------------------
   Count-up animation hook
---------------------------------------- */
const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const frameRef = useRef(null);

  useEffect(() => {
    // If end == start (e.g. still 0), don't animate
    if (end === start) {
      setCount(start);
      return;
    }

    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);

      const value = start + (end - start) * eased;
      setCount(Math.round(value));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, start]);

  return count;
};

/* ---------------------------------------
   Formatting helper
---------------------------------------- */
const formatCount = (count, endValue) => {
  // Big numbers like 20000 -> 20K+
  if (endValue >= 10000) {
    if (count >= endValue) return `${endValue / 1000}K+`; // final display
    return count.toLocaleString(); // intermediate values: 3,520, 7,830, etc.
  }

  // Others like 300 -> 300+
  if (count >= endValue) return `${endValue}+`;

  return count.toLocaleString();
};

/* ---------------------------------------
   Impact Card
---------------------------------------- */
export default function ImpactCard({ Icon: IconName, endValue, label, color }) {
  const Icon = Icons[IconName];

  // Observe when this card enters viewport
  const { ref, inView } = useInView({
    triggerOnce: true, // only once
    threshold: 0.3,    // 30% visible
  });

  const [hasStarted, setHasStarted] = useState(false);

  // When in view for the first time -> start animation
  useEffect(() => {
    if (inView && !hasStarted) {
      setHasStarted(true);
    }
  }, [inView, hasStarted]);

  const animatedCount = useCountUp(
    hasStarted ? endValue : 0, // 0 until we start
    2000,
    0
  );

  const formattedCount = formatCount(animatedCount, endValue);

  return (
    <div
      ref={ref}
      className={`bg-${color}-50 border border-${color}-100 p-6 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.05] cursor-default`}
    >
      <Icon className={`w-8 h-8 text-${color}-600 mb-4 mx-auto`} />

      <p className={`text-4xl md:text-5xl font-black text-${color}-900 drop-shadow-sm`}>
        {formattedCount}
      </p>

      <p className="uppercase text-xs md:text-sm font-bold text-slate-600 mt-2">
        {label}
      </p>
    </div>
  );
}
