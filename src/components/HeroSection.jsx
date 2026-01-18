"use client";

import React, { useEffect, useState, useRef } from 'react'
import AnimatedHeroText, { HEADLINES } from "@/components/AnimatedHeroText";
import { motion, AnimatePresence } from "framer-motion";

// Floating particle component for organic feel
const FloatingParticle = ({ delay, duration, size, startX, startY }) => (
  <motion.div
    className="absolute rounded-full bg-white/20 backdrop-blur-sm"
    style={{ 
      width: size, 
      height: size,
      left: `${startX}%`,
      bottom: 0,
    }}
    initial={{ y: 0, opacity: 0, scale: 0 }}
    animate={{
      y: [0, -200, -400],
      x: [0, 30, -20],
      opacity: [0, 0.7, 0],
      scale: [0, 1.2, 0.5],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      repeatDelay: 2,
      ease: "easeInOut",
    }}
  />
);

// Morphing blob background
const MorphingBlob = ({ color, size, position, delay }) => (
  <motion.div
    className="absolute rounded-full blur-3xl"
    style={{
      width: size,
      height: size,
      background: color,
      ...position,
    }}
    animate={{
      scale: [1, 1.3, 0.9, 1.1, 1],
      opacity: [0.3, 0.5, 0.3, 0.6, 0.3],
      x: [0, 30, -20, 10, 0],
      y: [0, -20, 30, -10, 0],
    }}
    transition={{
      duration: 15,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const HeroSection = () => {
  const heroImages = [
    "/gallery/img1.jpeg",
    "/gallery/img2.jpeg",
    "/gallery/img3.jpeg",
    "/gallery/img4.jpg",
    "/gallery/img5.jpeg",
    "/gallery/img6.jpeg",
    "/gallery/img7.jpeg",
    "/gallery/img8.jpeg",
    "/gallery/img9.jpeg",
    "/gallery/img10.jpeg",
    "/gallery/img11.jpeg",
  ];

  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x: x * 20, y: y * 20 });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % heroImages.length);
        setIsTransitioning(false);
      }, 600);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Generate particles with deterministic positions based on index
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: i * 0.4,
    duration: 4 + (i % 4),
    size: 4 + (i % 6) * 1.5,
    startX: (i * 137) % 100, // percentage-based for SSR compatibility
    startY: 100, // start from bottom as percentage
  }));

  return (
    <section 
      ref={containerRef}
      className="relative h-[100vh] flex items-center justify-center overflow-hidden"
    >
      {/* Dynamic morphing blobs */}
      <MorphingBlob 
        color="radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)" 
        size="600px" 
        position={{ top: '-10%', left: '-10%' }} 
        delay={0} 
      />
      <MorphingBlob 
        color="radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)" 
        size="500px" 
        position={{ bottom: '-15%', right: '-5%' }} 
        delay={3} 
      />
      <MorphingBlob 
        color="radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)" 
        size="400px" 
        position={{ top: '30%', right: '10%' }} 
        delay={6} 
      />

      {/* Hero image with advanced transitions */}
      <AnimatePresence mode="sync">
        {heroImages.map((img, idx) => (
          idx === index && (
            <motion.div
              key={`bg-${idx}`}
              className="absolute inset-0"
              initial={{ 
                opacity: 0, 
                scale: 1.15,
                filter: "blur(12px) saturate(0.5)",
              }}
              animate={{ 
                opacity: 1, 
                scale: 1.05,
                filter: "blur(0px) saturate(1.1)",
                x: mousePosition.x,
                y: mousePosition.y,
              }}
              exit={{ 
                opacity: 0, 
                scale: 1,
                filter: "blur(8px) saturate(0.3)",
              }}
              transition={{ 
                duration: 1.2, 
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ 
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )
        ))}
      </AnimatePresence>

      {/* Prismatic overlay with animated gradient */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(16,185,129,0.1) 50%, rgba(0,0,0,0.8) 100%)",
            "linear-gradient(225deg, rgba(0,0,0,0.7) 0%, rgba(6,182,212,0.15) 50%, rgba(0,0,0,0.8) 100%)",
            "linear-gradient(315deg, rgba(0,0,0,0.7) 0%, rgba(168,85,247,0.1) 50%, rgba(0,0,0,0.8) 100%)",
            "linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(236,72,153,0.1) 50%, rgba(0,0,0,0.8) 100%)",
            "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(16,185,129,0.1) 50%, rgba(0,0,0,0.8) 100%)",
          ],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />

      {/* Mesh grid overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Content container with parallax */}
      <motion.div 
        className="relative z-20 container mx-auto px-4 h-full flex justify-center items-center text-center"
        style={{
          x: mousePosition.x * -0.5,
          y: mousePosition.y * -0.5,
        }}
      >
        <AnimatedHeroText currentIndex={index % HEADLINES.length} />
      </motion.div>

      {/* Enhanced navigation dots */}
      <motion.div 
        className="absolute bottom-8 z-30"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-5 py-3 rounded-full border border-white/10">
          {heroImages.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setIndex(idx);
                  setIsTransitioning(false);
                }, 100);
              }}
              className="relative h-3 rounded-full overflow-hidden transition-all duration-500"
              animate={{
                width: idx === index ? 36 : 12,
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Background */}
              <div className={`absolute inset-0 transition-all duration-300 ${
                idx === index 
                  ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400' 
                  : 'bg-white/40 hover:bg-white/60'
              }`} />
              
              {/* Shimmer effect for active dot */}
              {idx === index && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  animate={{ x: [-40, 40] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    repeatDelay: 0.5,
                    ease: "easeInOut" 
                  }}
                />
              )}
              
              {/* Glow effect */}
              {idx === index && (
                <div className="absolute inset-0 bg-emerald-400/50 blur-sm -z-10 scale-150" />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-3 bg-white/60 rounded-full"
            animate={{ 
              y: [0, 12, 0],
              opacity: [1, 0, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default HeroSection