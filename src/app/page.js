// HomePage.js

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import FramerAnimation from "@/components/FramerAnimation";
import AnimatedHeroText from "@/components/AnimatedHeroText";
import TestimonialSection from "@/components/TestimonialSection";
import {
  BookOpen,
  Heart,
  CheckCircle,
  Map as MapIcon,
  Sprout,
  ArrowRight,
  Leaf,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";

import Footer from "@/components/Footer";

/* ---------------------------------------------------------
    HERO SECTION
--------------------------------------------------------- */
function HeroSection() {
  const heroImages = [
    "/gallery/img1.jpeg",
    "/gallery/img2.jpeg",
    "/gallery/img3.jpeg",
    "/gallery/img4.jpg",
    "/gallery/img5.jpeg",
    "/gallery/img6.jpeg",
    "/gallery/img6.jpeg",
    "/gallery/img7.jpeg",
    "/gallery/img8.jpeg",
    "/gallery/img9.jpeg",
    "/gallery/img10.jpeg",
    "/gallery/img11.jpeg",
  ];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <section className="relative h-[85vh] flex items-center justify-center overflow-hidden will-change-transform">
      {heroImages.map((img, idx) => (
        <div
          key={idx}
          style={{ backgroundImage: `url(${img})` }}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
            idx === currentImage
              ? "opacity-100 scale-105"
              : "opacity-0 scale-100"
          }`}
        />
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
      {/* Beautification: Subtle texture overlay */}
      <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-10" />

      {/* Animated Text */}
      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
        <AnimatedHeroText
          onTextChange={(i) => setCurrentImage(i % heroImages.length)}
        />
      </div>

      {/* Indicators */}
      <div className="absolute bottom-10 z-30 flex space-x-3 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentImage(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentImage
                ? "w-8 bg-orange-500 shadow-lg shadow-orange-500/50"
                : "w-2 bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
    HOME PAGE
--------------------------------------------------------- */
export default function HomePage() {
  const [playVideo, setPlayVideo] = useState(false);

  return (
    <div className="min-h-screen font-sans bg-stone-50 text-slate-800 selection:bg-orange-500 selection:text-white">
      {/* -------------------------------------------------------------------
        HERO SECTION
      ------------------------------------------------------------------- */}
      <HeroSection />

      {/* -------------------------------------------------------------------
        VISION & MISSION
      ------------------------------------------------------------------- */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <FramerAnimation delay={0.1}>
            {/* Beautification: Applied text shadow for depth */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 drop-shadow-sm">
              Our Vision & Core Mission
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto mt-4 mb-16">
              We connect people and planet by uniting head, heart, and hand in
              everything we do.
            </p>
          </FramerAnimation>

          {/* Vision */}
          <FramerAnimation delay={0.3}>
            {/* Beautification: Rounded corners increased for softer look */}
            <div className="bg-orange-50 border-t-8 border-orange-500 rounded-[2.5rem] p-12 mb-10 shadow-2xl shadow-orange-200/50">
              <div className="flex justify-center mb-6">
                <Leaf className="w-10 h-10 text-orange-600 mr-4" />
                <h3 className="text-3xl font-bold text-orange-700 uppercase tracking-wider">
                  Our Vision
                </h3>
              </div>

              <p className="text-xl text-slate-700 max-w-4xl mx-auto leading-relaxed">
                We envision schools and communities where{" "}
                <strong className="text-orange-800">
                  sustainability is integrated
                </strong>{" "}
                into everyday practices, fostering scientific inquiry and a deep
                appreciation for the natural world.
              </p>
            </div>
          </FramerAnimation>

          {/* Mission */}
          <FramerAnimation delay={0.4}>
            {/* Beautification: Rounded corners increased for softer look */}
            <div className="bg-emerald-50 border-t-8 border-emerald-500 rounded-[2.5rem] p-12 shadow-2xl shadow-emerald-200/50">
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600 mr-4" />
                <h3 className="text-3xl font-bold text-emerald-700 uppercase tracking-wider">
                  Our Mission
                </h3>
              </div>

              <p className="text-xl text-slate-700 max-w-4xl mx-auto leading-relaxed">
                We're on a mission to bridge the gap ​between humanity and
                nature. We believe in ​aligning one's head, heart, and hand to
                make ​this happen. So, we empower students, ​teachers, and
                communities with educational ​materials, spark curiosity and
                empathy ​through guided nature walks, and organize ​hands-on
                workshops on sustainable living ​practices.
              </p>
            </div>
          </FramerAnimation>
        </div>
      </section>

      {/* -------------------------------------------------------------------
        ABOUT SECTION
      ------------------------------------------------------------------- */}
      <section id="about" className="py-24 bg-stone-50 relative scroll-mt-24">
        {/* Background Blob */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        {/* Beautification: Added a second blob for visual interest */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <FramerAnimation delay={0.2}>
            <div className="text-center mb-16">
              <span className="text-orange-600 font-bold uppercase tracking-wider text-sm">
                Who We Are
              </span>

              <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-slate-900">
                Eco Vigyan for{" "}
                {/* Beautification: Stronger gradient and deeper shadow */}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 drop-shadow-md">
                  Underprivileged Children
                </span>
              </h2>

              <div className="w-24 h-1.5 mx-auto mt-6 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full" />

              <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Eco Vigyan Foundation came into existence just last year with a
                clear purpose – to enhance eco-club activities in schools
                throughout India. We hold a special fascination for unveiling
                the hidden significance of fungi in the grand tapestry of
                nature.
              </p>
            </div>
          </FramerAnimation>

          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* LEFT TEXT BLOCK */}
            <FramerAnimation delay={0.3}>
              <div className="space-y-8 text-[1.05rem] text-slate-700 leading-[1.75] font-normal tracking-[0.1px]">
                <p>
                  This endeavour was co-founded by{" "}
                  <Link
                    href="https://www.google.com/url?q=https://wiprofoundation.org/earthian/earthjust/%23:~:text%3DShrey%2520Gupta%2520(Cohort%25203).%25202020%2520%252D%25202022.,while%2520collectively%2520exploring%2520the%2520hidden%2520world%2520of&sa=D&source=docs&ust=1765376479270642&usg=AOvVaw2GJfiBsdoIrWgYs5pAJS0C"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                  >
                    Shrey Gupta & Ashish Playal
                  </Link>
                  , sustainability educators with a profound commitment to
                  environmental causes. Their expertise spans biodiversity
                  conservation, waste management, and fostering learning through
                  nature.
                </p>

                <p>
                  Together, they've collaborated with
                  <strong> over 200 schools</strong>, reached more than
                  <strong> 10,000 students</strong>, partnered with
                  <strong> 300+ teachers</strong>, and shared their knowledge
                  with
                  <strong> over 100 community members and naturalists</strong>.
                </p>

                <p>
                  Our journey is rooted in the belief that{" "}
                  <strong>
                    every child harbours a budding scientist within
                  </strong>{" "}
                  and{" "}
                  <strong>
                    every educator has the potential to be a nature guide
                  </strong>
                  . Our mission is to foster a culture of sustainability and
                  learning through nature in schools across India.
                </p>

                <p>
                  We've only just begun—and we invite you to join us in building
                  a greener, more eco-conscious future. Every school, student,
                  and community member plays a part in this shared mission.
                </p>

                <Link
                  href="/about"
                  className="group inline-flex items-center text-orange-600 font-bold"
                >
                  <span className="border-b-2 border-transparent group-hover:border-orange-600">
                    Read our full story
                  </span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </FramerAnimation>

            {/* VIDEO SECTION */}
            <FramerAnimation delay={0.4}>
              <div className="relative group">
                {/* Beautification: Stronger glow border */}
                <div className="absolute -inset-3 bg-gradient-to-r from-orange-500 to-emerald-500 opacity-30 blur-xl rounded-3xl group-hover:opacity-60 transition duration-700"></div>

                {/* VIDEO CARD */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden rounded-2xl shadow-2xl">
                  {!playVideo && (
                    <>
                      <img
                        src="https://img.youtube.com/vi/cZVHtG2_Vhs/maxresdefault.jpg"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                        alt="Eco Vigyan Activity"
                      />
                      <div
                        onClick={() => setPlayVideo(true)}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 hover:bg-black/10 transition"
                      >
                        {/* Beautification: Play button styling */}
                        <div className="w-20 h-20 bg-white/90 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-4 border-white/50">
                          <div className="ml-1 w-0 h-0 border-l-[24px] border-l-orange-600 border-t-[14px] border-b-[14px] border-t-transparent border-b-transparent" />
                        </div>
                      </div>
                    </>
                  )}

                  {playVideo && (
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/cZVHtG2_Vhs?autoplay=1&controls=1"
                      title="Eco Vigyan Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            </FramerAnimation>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
        IMPACT SECTION (UPDATED DATA + Beautified)
      ------------------------------------------------------------------- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <FramerAnimation delay={0.2}>
            <div className="text-center mb-16">
              {/* Beautification: Title with stronger gradient */}
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
                Measuring Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                  Impact
                </span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg mt-4">
                Thanks to supporters like you, we continue to grow our reach and
                deepen our commitment to environmental education.
              </p>
            </div>
          </FramerAnimation>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {/* Impact Card Beautification: Added transform scale and deeper shadow on hover */}

            {/* 300+ Schools */}
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.05] cursor-default">
              <BookOpen className="w-8 h-8 text-blue-600 mb-4 mx-auto" />
              <p className="text-4xl md:text-5xl font-black text-blue-900 drop-shadow-sm">
                300+
              </p>
              <p className="uppercase text-xs md:text-sm font-bold text-slate-600 mt-2">
                Schools Partnered
              </p>
            </div>

            {/* 450+ Teachers */}
            <div className="p-6 bg-green-50 border border-green-100 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.05] cursor-default">
              <Users className="w-8 h-8 text-green-600 mb-4 mx-auto" />
              <p className="text-4xl md:text-5xl font-black text-green-900 drop-shadow-sm">
                450+
              </p>
              <p className="uppercase text-xs md:text-sm font-bold text-slate-600 mt-2">
                Teachers Trained
              </p>
            </div>

            {/* 20000+ Students */}
            <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.05] cursor-default">
              <Activity className="w-8 h-8 text-orange-600 mb-4 mx-auto" />
              <p className="text-4xl md:text-5xl font-black text-orange-900 drop-shadow-sm">
                20K+
              </p>
              <p className="uppercase text-xs md:text-sm font-bold text-slate-600 mt-2">
                Students Reached
              </p>
            </div>

            {/* 100+ Community Engagement Initiatives */}
            <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.05] cursor-default">
              <Heart className="w-8 h-8 text-yellow-600 mb-4 mx-auto" />
              <p className="text-4xl md:text-5xl font-black text-yellow-900 drop-shadow-sm">
                100+
              </p>
              <p className="uppercase text-xs md:text-sm font-bold text-slate-600 mt-2">
                Community Initiatives
              </p>
            </div>

            {/* 5000+ Mushrooms mapped */}
            <div className="p-6 bg-purple-50 border border-purple-100 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:scale-[1.05] cursor-default">
              <MapIcon className="w-8 h-8 text-purple-600 mb-4 mx-auto" />
              <p className="text-4xl md:text-5xl font-black text-purple-900 drop-shadow-sm">
                5000+
              </p>
              <p className="uppercase text-xs md:text-sm font-bold text-slate-600 mt-2">
                Mushrooms Mapped
              </p>
            </div>

            {/* CTA (Spanning all columns) */}
            <div className="mt-8 col-span-2 md:col-span-5 rounded-3xl shadow-2xl overflow-hidden relative group">
              {/* Beautification: Stronger CTA background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-red-700 transition-transform group-hover:scale-[1.02] duration-500"></div>

              <div className="relative p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-extrabold text-white mb-2">
                    Be Part of the Change
                  </h3>
                  <p className="text-orange-100 text-lg">
                    Your contribution directly supports our mushroom mapping &
                    education kits.
                  </p>
                </div>

                <Link
                  href="/donate"
                  className="px-8 py-4 bg-white text-red-600 font-bold rounded-full shadow-lg hover:bg-stone-100 transition-all hover:scale-105 active:scale-95 flex items-center"
                >
                  Donate Now <Heart className="ml-2 w-5 h-5 fill-red-600" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
        TESTIMONIAL SECTION
      ------------------------------------------------------------------- */}
      <TestimonialSection />

      <Footer />
    </div>
  );
}
