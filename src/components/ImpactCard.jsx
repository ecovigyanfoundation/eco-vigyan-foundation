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
  if (endValue >= 10000) {
    if (count >= endValue) return `${endValue / 1000}K+`;
    return count.toLocaleString();
  }

  if (count >= endValue) return `${endValue}+`;

  return count.toLocaleString();
};

/* ---------------------------------------
   Tailwind-safe color styles
---------------------------------------- */
const colorStyles = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    text: "text-blue-900",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "text-green-600",
    text: "text-green-900",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    text: "text-emerald-900",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    icon: "text-pink-600",
    text: "text-pink-900",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: "text-purple-600",
    text: "text-purple-900",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: "text-orange-600",
    text: "text-orange-900",
  },
};

/* ---------------------------------------
   Impact Card Component
---------------------------------------- */
export default function ImpactCard({ Icon: IconName, endValue, label, color }) {
  const Icon = Icons[IconName];
  const styles = colorStyles[color] || colorStyles.blue;

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (inView && !hasStarted) {
      setHasStarted(true);
    }
  }, [inView, hasStarted]);

  const animatedCount = useCountUp(hasStarted ? endValue : 0, 2000, 0);
  const formattedCount = formatCount(animatedCount, endValue);

  return (
    <div
      ref={ref}
      className={`${styles.bg} ${styles.border} border p-6 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.05] cursor-default`}
    >
      {Icon && (
        <Icon className={`w-8 h-8 ${styles.icon} mb-4 mx-auto`} />
      )}

      <p className={`text-4xl md:text-5xl font-black ${styles.text} drop-shadow-sm`}>
        {formattedCount}
      </p>

      <p className="uppercase text-xs md:text-sm font-bold text-slate-600 mt-2">
        {label}
      </p>
    </div>
  );
}
