"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

export const HEADLINES = [
  {
    topic: "Child Labour and Protection",
    main: "Working for elimination of Child Labour",
    tagline: "Working for a better tomorrow.",
  },
  {
    topic: "Mission Education",
    main: "Empowering Futures with Quality Education",
    tagline: "Every child deserves a chance to learn.",
  },
  {
    topic: "Health and Nutrition",
    main: "Ensuring a Healthy Start for Every Child",
    tagline: "Nourishing bodies, strengthening futures.",
  },
];

const textVariants = {
  enter: { opacity: 0, y: 20, transition: { duration: 0.8 } },
  center: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.8 } },
};

export default function AnimatedHeroText({ onTextChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  useEffect(() => {
    if (!inView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % HEADLINES.length;

        // 🛠 Fix React warning (async)
        if (onTextChange) setTimeout(() => onTextChange(next), 0);

        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [inView, onTextChange]);

  const current = HEADLINES[currentIndex];

  return (
    <div
      ref={ref}
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                 w-full h-full pt-40 pb-20 flex items-center justify-center text-center"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.main}
          className="absolute flex flex-col items-center justify-center"
          initial="enter"
          animate="center"
          exit="exit"
          variants={textVariants}
        >
          <p className="text-xl font-medium tracking-widest mb-3 text-white">
            {current.topic}
          </p>

          <h2 className="text-6xl font-extrabold leading-tight mb-4 text-white">
            {current.main}
          </h2>

          <p className="text-lg italic font-light text-white">
            {current.tagline}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
