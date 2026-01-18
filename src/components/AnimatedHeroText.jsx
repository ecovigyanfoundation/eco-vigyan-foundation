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

// Unique 3D text reveal animation
const textVariants = {
  enter: { 
    opacity: 0, 
    y: 40, 
    scale: 0.95,
    filter: "blur(8px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
  center: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  },
  exit: { 
    opacity: 0, 
    y: -30, 
    scale: 1.02,
    filter: "blur(6px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
  },
};

// Staggered children animation
const containerVariants = {
  enter: { opacity: 0 },
  center: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.12,
      delayChildren: 0.1,
    }
  },
  exit: { opacity: 0 },
};

const itemVariants = {
  enter: { 
    opacity: 0, 
    y: 30,
    filter: "blur(4px)",
  },
  center: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    filter: "blur(4px)",
    transition: { duration: 0.4 }
  },
};

export default function AnimatedHeroText({ currentIndex }) {
  const current = HEADLINES[currentIndex];

  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.main}
          className="flex flex-col items-center justify-center"
          variants={containerVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {/* Topic - Original Styling */}
          <motion.p 
            className="text-xl font-medium tracking-widest mb-3 text-white"
            variants={itemVariants}
          >
            {current.topic}
          </motion.p>

          {/* Main Headline - Original Styling */}
          <motion.h2 
            className="text-6xl font-extrabold leading-tight mb-4 text-white"
            variants={itemVariants}
          >
            {current.main}
          </motion.h2>

          {/* Tagline - Original Styling */}
          <motion.p 
            className="text-lg italic font-light text-white"
            variants={itemVariants}
          >
            {current.tagline}
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
