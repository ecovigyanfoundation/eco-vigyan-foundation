"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const HEADLINES = [
  {
    topic: "Sustainability Education",
    main: "Cultivating Eco-Conscious Schools Across India",
    tagline: "Empowering students to learn, explore, and care for nature.",
  },
  {
    topic: "Learning Through Nature",
    main: "Where Every Child Becomes a Budding Scientist",
    tagline:
      "Igniting curiosity through hands-on experiences in the natural world.",
  },
  {
    topic: "Fungi & Biodiversity Awareness",
    main: "Revealing Nature’s Hidden Heroes",
    tagline:
      "Exploring the unseen world of fungi to inspire wonder and understanding.",
  },
  {
    topic: "Eco-Club Transformation",
    main: "Building Stronger Eco-Clubs, One School at a Time",
    tagline:
      "Nurturing young changemakers through meaningful environmental action.",
  },
  {
    topic: "Head, Heart & Hand Learning",
    main: "Connecting Knowledge with Compassion and Action",
    tagline: "Learning that inspires students to care for the planet.",
  },
  {
    topic: "Community & Teacher Training",
    main: "Empowering Educators to Become Nature Guides",
    tagline:
      "Supporting teachers to lead sustainability journeys with confidence.",
  },
];

const textVariants = {
  enter: { opacity: 0, y: 20, transition: { duration: 0.6 } },
  center: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.6 } },
};

export default function AnimatedHeroText({ currentIndex }) {
  const current = HEADLINES[currentIndex];

  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.main}
          className="flex flex-col items-center justify-center"
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
