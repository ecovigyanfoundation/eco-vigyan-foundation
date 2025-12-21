"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  ArrowLeft,
  Play,
  MapPin,
  Quote,
  ExternalLink,
} from "lucide-react";

/* ---------------------------------------------------------
   DETAIL VIEW COMPONENT (Based on your image)
--------------------------------------------------------- */
const MushroomWalkDetail = ({ onBack }) => {
  const locations = [
    "Banglore",
    "Nalagarh",
    "Churdhar Peak",
    "Shali Peak",
    "Gurugram",
    "Mussoorie",
    "Dehradun",
    "Chandigarh",
    "Joshimath",
    "Manali",
    "Mandi",
    "Rudraprayag",
    "Ramnagar",
    "Shimla",
    "Bir",
    "Dharampur",
    "Solan",
    "Summerhill",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-emerald-100"
    >
      {/* Top Header Bar */}
      <div className="bg-white border-b border-stone-100 p-6 flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Programs
        </button>
        <h2 className="text-2xl font-black text-emerald-800 uppercase tracking-tighter">
          Guided Mushroom Walks
        </h2>
      </div>

      <div className="p-8 md:p-12">
        {/* Intro Text */}
        <p className="text-stone-600 text-lg mb-12 max-w-4xl">
          Discover biodiversity through year-round mushroom identification,
          focusing on the monsoon season. This exciting project helps demystify
          the ecological roles of fungi with six key features, followed by the
          creation of mobile mushroom museums.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Video/Action Area */}
          {/* Left: Video/Action Area */}
          <div className="space-y-6">
            <h4 className="text-emerald-600 font-bold italic">
              A look back at our walks from last year
            </h4>

            {/* Actual YouTube Embed */}
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-100">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/vqc6lOWicPE"
                title="Mushroom walks in Himachal"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Contextual Stat from the Video */}
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 font-bold">
                36/40
              </div>
              <p className="text-sm text-emerald-900 font-medium">
                In a pre-monsoon experiment, students tagged potential habitats;
                two months later, 36 out of 40 tags successfully fruited with
                mushrooms.
              </p>
            </div>
          </div>

          {/* Right: Location Grid */}
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-black text-stone-800 uppercase">
                Walk Locations <span className="text-emerald-600">2021-23</span>
              </h4>
              <MapPin className="text-emerald-500 w-5 h-5" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {locations.map((loc) => (
                <div
                  key={loc}
                  className="bg-white p-3 rounded-xl shadow-sm text-[10px] font-bold uppercase text-stone-500 border border-stone-100 hover:border-emerald-300 transition-colors"
                >
                  {loc}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Testimonial and CTA */}
        <div className="mt-16 pt-8 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex gap-4 max-w-2xl">
            <Quote className="w-12 h-12 text-emerald-200 flex-shrink-0" />
            <p className="text-stone-600 italic">
              "A very interesting and informative mushroom walk organised by
              Shrey and Ashish. Never knew a whole new, exciting world of fungi
              existed right beside the road which I had passed countless times."
              <span className="block mt-2 font-bold text-emerald-800 not-italic">
                — Padmini Parmar
              </span>
            </p>
          </div>

          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 flex items-center gap-3 transition-all active:scale-95">
            Register Here <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ---------------------------------------------------------
   MAIN COMPONENT
--------------------------------------------------------- */
const ProgramCard = ({ image, title, delay, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      onClick={onClick}
      className="flex flex-col group cursor-pointer"
    >
      <div className="overflow-hidden rounded-3xl aspect-[4/3] shadow-lg relative">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-transparent transition-colors duration-300" />
      </div>

      <div className="bg-white border border-emerald-100 py-5 px-4 text-center min-h-[80px] flex items-center justify-center mt-4 rounded-2xl shadow-sm group-hover:shadow-md group-hover:border-emerald-500 transition-all duration-300">
        <h3 className="text-emerald-900 font-black text-sm md:text-base uppercase tracking-tight leading-tight group-hover:text-emerald-600">
          {title}
        </h3>
      </div>
    </motion.div>
  );
};

const SustainabilityPrograms = () => {
  const [selectedProgram, setSelectedProgram] = useState(null);

  const programs = [
    {
      id: "mushroom-walk",
      title: "Guided Mushroom Walk",
      image: "/gallery/img7.jpeg",
    },
    {
      id: "grow-mushrooms",
      title: "Grow Your Own Mushrooms",
      image:
        "https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "demystify-fungi",
      title: "Demystify Your Local Fungi",
      image:
        "https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "wipro-earthian",
      title: "Wipro Earthian Program",
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "chemical-free",
      title: "Chemical Free Living Series",
      image:
        "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "waste-management",
      title: "Mastering Solid Waste Management",
      image:
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="bg-stone-50 py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 font-sans">
        {/* Animated Header Logic */}
        <AnimatePresence mode="wait">
          {!selectedProgram ? (
            <motion.div
              key="header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div className="max-w-2xl text-left">
                  <span className="text-emerald-600 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-2">
                    <Sprout className="w-4 h-4" /> Our Activities
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                    Sustainability <br />
                    <span className="text-emerald-600">Programs</span>
                  </h2>
                </div>
              </div>
              <div className="mb-16">
                <p className="text-xl md:text-2xl font-medium text-slate-600 max-w-3xl leading-relaxed">
                  Explore our{" "}
                  <span className="text-emerald-700 font-bold italic">
                    exciting sustainability programs
                  </span>{" "}
                  – where education meets adventure.
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Content Logic */}
        <AnimatePresence mode="wait">
          {selectedProgram === "mushroom-walk" ? (
            <MushroomWalkDetail onBack={() => setSelectedProgram(null)} />
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {programs.map((program, index) => (
                <ProgramCard
                  key={index}
                  image={program.image}
                  title={program.title}
                  delay={index * 0.1}
                  onClick={() => setSelectedProgram(program.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SustainabilityPrograms;
