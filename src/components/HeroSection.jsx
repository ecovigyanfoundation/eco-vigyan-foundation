import React, { useEffect, useState } from 'react'
import AnimatedHeroText, { HEADLINES } from "@/components/AnimatedHeroText";
import { BookOpen, Heart, Map as MapIcon, Users, Activity } from "lucide-react";

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

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000); 

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
      {heroImages.map((img, idx) => (
        <div
          key={idx}
          style={{ backgroundImage: `url(${img})` }}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
            idx === index ? "opacity-100 scale-105" : "opacity-0 scale-100"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
      <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      <div className="relative z-20 container mx-auto px-4 h-full flex justify-center items-center text-center">
        <AnimatedHeroText currentIndex={index % HEADLINES.length} />
      </div>

      <div className="absolute bottom-6 z-30 flex space-x-3 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === index
                ? "w-8 bg-emerald-500 shadow-lg shadow-emerald-500/50"
                : "w-2 bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroSection