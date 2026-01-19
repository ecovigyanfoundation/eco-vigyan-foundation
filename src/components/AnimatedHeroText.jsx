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
    main: "Revealing Nature's Hidden Heroes",
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

// Staggered letter animation for main headline
const letterContainerVariants = {
  enter: { transition: { staggerChildren: 0.03 } },
  center: { transition: { staggerChildren: 0.03 } },
  exit: { transition: { staggerChildren: 0.01, staggerDirection: -1 } },
};

const letterVariants = {
  enter: { y: 20, opacity: 0, scale: 0.8, filter: "blur(4px)" },
  center: { 
    y: 0, 
    opacity: 1, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 100, damping: 10 } 
  },
  exit: { 
    y: -20, 
    opacity: 0, 
    filter: "blur(4px)",
    transition: { duration: 0.2 } 
  },
};

// Smooth slide-up for topic and tagline
const slideUpVariants = {
  enter: { y: 20, opacity: 0, filter: "blur(4px)" },
  center: { 
    y: 0, 
    opacity: 1, 
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
  exit: { 
    y: -20, 
    opacity: 0, 
    filter: "blur(4px)",
    transition: { duration: 0.4 } 
  },
};

export default function AnimatedHeroText({ currentIndex }) {
  const current = HEADLINES[currentIndex];

  // Helper to split text into words and then characters
  const splitText = (text) => {
    return text.split(" ").map((word, wordIndex) => (
      <span key={wordIndex} className="inline-block whitespace-nowrap mr-2 sm:mr-3 lg:mr-4 last:mr-0">
        {word.split("").map((char, charIndex) => (
          <motion.span
            key={`${wordIndex}-${charIndex}`}
            variants={letterVariants}
            className="inline-block"
          >
            {char}
          </motion.span>
        ))}
      </span>
    ));
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-center z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="flex flex-col items-center justify-center max-w-5xl px-4"
          initial="enter"
          animate="center"
          exit="exit"
        >
          {/* Topic - Elegant Fade In */}
          <motion.div
            className="overflow-hidden mb-4"
            variants={slideUpVariants}
          >
            <span className="inline-block px-4 py-1.5 text-white font-medium uppercase shadow-lg">
              {current.topic}
            </span>
          </motion.div>

          {/* Main Headline - Character Reveal */}
          <motion.h2
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-white drop-shadow-xl"
            variants={letterContainerVariants}
          >
            {splitText(current.main)}
          </motion.h2>

          {/* Tagline - Smooth Slide Up */}
          <motion.p
            className="text-xl md:text-2xl font-light text-emerald-50 max-w-3xl leading-relaxed drop-shadow-md"
            variants={slideUpVariants}
          >
            {current.tagline}
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
