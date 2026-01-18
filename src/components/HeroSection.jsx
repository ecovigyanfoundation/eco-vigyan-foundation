"use client";

import React, { useEffect, useState, useRef } from 'react'
import AnimatedHeroText, { HEADLINES } from "@/components/AnimatedHeroText";
import { motion } from "framer-motion";
import Image from 'next/image';

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

// Morphing blob background - simplified for performance
const MorphingBlob = ({ color, size, position, delay }) => (
  <div
    className="absolute rounded-full blur-3xl animate-pulse"
    style={{
      width: size,
      height: size,
      background: color,
      animationDelay: `${delay}s`,
      animationDuration: '8s',
      ...position,
    }}
  />
);

const HeroSection = () => {
  const [index, setIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Preload all images on mount
  useEffect(() => {
    const preloadImages = async () => {
      const promises = heroImages.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      
      try {
        await Promise.all(promises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        setImagesLoaded(true); // Continue anyway
      }
    };
    
    preloadImages();
  }, []);

  // Parallax mouse tracking (desktop only)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current && window.innerWidth > 768) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x: x * 15, y: y * 15 });
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [imagesLoaded]);

  // Get next index for preloading
  const nextIndex = (index + 1) % heroImages.length;

  return (
    <section 
      ref={containerRef}
      className="relative h-[100vh] flex items-center justify-center overflow-hidden bg-slate-900"
    >
      {/* Preload next image */}
      <link rel="preload" as="image" href={heroImages[nextIndex]} />
      
      {/* Dynamic morphing blobs */}
      <MorphingBlob 
        color="radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)" 
        size="500px" 
        position={{ top: '-10%', left: '-10%' }} 
        delay={0} 
      />
      <MorphingBlob 
        color="radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)" 
        size="400px" 
        position={{ bottom: '-15%', right: '-5%' }} 
        delay={2} 
      />

      {/* Hero images - with enhanced Ken Burns transition */}
      {heroImages.map((img, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{
            opacity: idx === index ? 1 : 0,
            zIndex: idx === index ? 1 : 0,
          }}
        >
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              transition: 'transform 6s ease-out',
              transform: idx === index ? 'scale(1.05)' : 'scale(1.15)',
              willChange: 'transform, opacity',
            }}
          >
            <Image
              src={img}
              alt={`Hero background ${idx + 1}`}
              fill
              priority={idx < 3}
              quality={90}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: 'center' }}
            />
          </div>
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Subtle animated gradient accent */}
      <motion.div 
        className="absolute inset-0 z-10 pointer-events-none opacity-30"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.2) 0%, transparent 50%)",
            "radial-gradient(ellipse at 80% 50%, rgba(6,182,212,0.2) 0%, transparent 50%)",
            "radial-gradient(ellipse at 50% 80%, rgba(168,85,247,0.15) 0%, transparent 50%)",
            "radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.2) 0%, transparent 50%)",
          ],
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />

      {/* Vignette effect */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

      {/* Content */}
      <motion.div 
        className="relative z-20 container mx-auto px-4 h-full flex justify-center items-center text-center"
        style={{
          x: mousePosition.x * -0.3,
          y: mousePosition.y * -0.3,
        }}
      >
        <AnimatedHeroText currentIndex={index % HEADLINES.length} />
      </motion.div>

      {/* Navigation dots */}
      <div className="absolute bottom-8 z-30">
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-5 py-3 rounded-full border border-white/10">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === index 
                  ? 'w-8 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/30' 
                  : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

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
              opacity: [1, 0.3, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default HeroSection