// HomePage.js

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ImpactCard from "@/components/ImpactCard";
import FramerAnimation from "@/components/FramerAnimation";
import TestimonialSection from "@/components/TestimonialSection";
import HeroSection from "@/components/HeroSection";
import { BookOpen, Heart, Map as MapIcon, Users, Activity } from "lucide-react";

export default function HomePage() {
  const [playVideo, setPlayVideo] = useState(false);

  return (
    <div className="min-h-screen font-sans bg-stone-50 text-slate-800 selection:bg-emerald-500 selection:text-white">
      <HeroSection />

      {/* -------------------------------------------------------------------
        VISION & MISSION (Reduced py-24 to py-12, reduced mb-10 to mb-6)
      ------------------------------------------------------------------- */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <FramerAnimation delay={0.3}>
            <div className="bg-blue-50 border-t-8 border-pink-500 rounded-[2.5rem] p-8 mb-6 shadow-2xl shadow-blue-200/50">
              <div className="flex justify-center mb-4">
                <h3 className="text-3xl font-bold text-pink-500 uppercase tracking-wider">
                  Our Vision
                </h3>
              </div>
              <p className="text-xl text-slate-700 max-w-4xl mx-auto leading-relaxed">
                We envision schools and communities where sustainability is
                integrated into everyday practices, fostering scientific inquiry
                and a deep appreciation for the natural world.
              </p>
            </div>
          </FramerAnimation>

          <FramerAnimation delay={0.4}>
            <div className="bg-emerald-50 border-t-8 border-emerald-500 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-200/50">
              <div className="flex justify-center mb-4">
                <h3 className="text-3xl font-bold text-emerald-700 uppercase tracking-wider">
                  Our Mission
                </h3>
              </div>
              <p className="text-xl text-slate-700 max-w-4xl mx-auto leading-relaxed">
                We&apos;re on a mission to bridge the gap between humanity and
                nature. We believe in aligning one&apos;s head, heart, and hand
                to make this happen. So, we empower students, teachers, and
                communities with educational materials, spark curiosity and
                empathy through guided nature walks, and organize hands-on
                workshops on sustainable living practices.
              </p>
            </div>
          </FramerAnimation>
        </div>
      </section>

      {/* -------------------------------------------------------------------
        ABOUT SECTION (Reduced py-24 to py-12, mb-16 to mb-10)
      ------------------------------------------------------------------- */}
      <section id="about" className="py-12 bg-stone-50 relative scroll-mt-24">
        <div className="absolute top-0 left-0 w-64 h-64 bg-sky-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <FramerAnimation delay={0.2}>
            <div className="text-center mb-10">
              <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-slate-900">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 drop-shadow-md">
                  Who We Are
                </span>
              </h2>
            </div>
          </FramerAnimation>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <FramerAnimation delay={0.3}>
              <div className="space-y-6 text-xl lg:text-left text-slate-700 leading-relaxed mx-auto font-semibold tracking-[0.1px] text-center ">
                <p>
                  Eco Vigyan Foundation came into existence just last year with
                  a clear purpose – to enhance eco-club activities in schools
                  throughout India. We hold a special fascination for unveiling
                  the hidden significance of fungi in the grand tapestry of
                  nature.
                </p>
                <p>
                  This endeavour was co-founded by{" "}
                  <Link
                    href="https://wiprofoundation.org/earthian/earthjust/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                  >
                    Shrey Gupta & Ashish Palyal
                  </Link>
                  , sustainability educators with a profound commitment to
                  environmental causes. Their expertise spans biodiversity
                  conservation, waste management, and fostering learning through
                  nature.
                </p>

                <p>
                  Together, they&apos;ve collaborated with
                  <strong className="text-emerald-700">
                    {" "}
                    over 200 schools
                  </strong>
                  , reached more than
                  <strong className="text-emerald-700"> 10,000 students</strong>
                  , partnered with
                  <strong className="text-emerald-700"> 300+ teachers</strong>,
                  and shared their knowledge with
                  <strong className="text-emerald-700">
                    {" "}
                    over 100 community members and naturalists
                  </strong>
                  .
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
                  We&apos;ve only just begun—and we invite you to join us in
                  building a greener, more eco-conscious future. Every school,
                  student, and community member plays a part in this shared
                  mission.
                </p>
              </div>
            </FramerAnimation>

            <FramerAnimation delay={0.4}>
              <div className="relative group">
                <div className="absolute -inset-3 bg-gradient-to-r from-sky-500 to-emerald-500 opacity-30 blur-xl rounded-3xl group-hover:opacity-60 transition duration-700"></div>
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
                        <div className="w-16 h-16 bg-white/90 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-4 border-white/50">
                          <div className="ml-1 w-0 h-0 border-l-[20px] border-l-emerald-600 border-t-[12px] border-b-[12px] border-t-transparent border-b-transparent" />
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
        IMPACT SECTION (Reduced py-24 to py-12)
      ------------------------------------------------------------------- */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <FramerAnimation delay={0.4}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <ImpactCard
                Icon="BookOpen"
                endValue={300}
                label="Schools Partnered"
                color="blue"
              />
              <ImpactCard
                Icon="Users"
                endValue={450}
                label="Teachers Trained"
                color="green"
              />
              <ImpactCard
                Icon="Activity"
                endValue={20000}
                label="Students Reached"
                color="emerald"
              />
              <ImpactCard
                Icon="Heart"
                endValue={100}
                label="Community Initiatives"
                color="pink"
              />
              <ImpactCard
                Icon="MapIcon"
                endValue={5000}
                label="Mushrooms Mapped"
                color="purple"
              />

              <div className="mt-6 col-span-2 md:col-span-5 rounded-3xl shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 transition-transform group-hover:scale-[1.02] duration-500"></div>
                <div className="relative p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-3xl font-extrabold text-white mb-2">
                      Be Part of the Change
                    </h3>
                    <p className="text-emerald-50 text-lg">
                      Your contribution directly supports our mushroom mapping &
                      education kits.
                    </p>
                  </div>
                  <Link
                    href="/donate"
                    className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-full shadow-lg hover:bg-stone-100 transition-all hover:scale-105 active:scale-95 flex items-center"
                  >
                    Donate Now{" "}
                    <Heart className="ml-2 w-5 h-5 fill-pink-500 text-pink-500 border-none" />
                  </Link>
                </div>
              </div>
            </div>
          </FramerAnimation>
        </div>
      </section>

      <TestimonialSection />
    </div>
  );
}
