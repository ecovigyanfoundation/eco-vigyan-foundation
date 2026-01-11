"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout } from "lucide-react";
import GuidedMushroomWalk from "@/components/GuidedMushroomWalk";
import GrowYourOwnMushrooms from "@/components/GrowYourOwnMushrooms";
import DemystifyLocalFungi from "@/components/DemystifyLocalFungi";
import WiproEarthianProgram from "@/components/WiproEarthianProgram";
import ChemicalFreeLivingSeries from "@/components/ChemicalFreeLivingSeries";
import MasteringSolidWasteManagement from "@/components/MasteringSolidWasteManagement";

/* ---------------------------------------------------------
   MAIN COMPONENT
--------------------------------------------------------- */
const ProgramCard = ({ image, title, delay, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }} // Lift effect
      transition={{ duration: 0.2, delay }}
      viewport={{ once: true }}
      onClick={onClick}
      className="group cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] shadow-sm">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            View Details
          </span>
        </div>
      </div>

      {/* Text Content */}
      <div className="mt-4 flex flex-col flex-grow px-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors duration-300">
            {title}
          </h3>
          <div className="mt-1 flex-shrink-0 bg-emerald-50 p-2 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Decorative Line */}
        <div className="mt-3 w-8 h-[2px] bg-emerald-200 group-hover:w-full transition-all duration-500 ease-in-out" />
      </div>
    </motion.div>
  );
};

const SustainabilityProgramsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Sync state with URL parameter (handles browser back/forward)
  useEffect(() => {
    const programParam = searchParams.get("program");
    setSelectedProgram(programParam || null);
  }, [searchParams]);

  // Handle program selection with URL update
  const handleProgramSelect = (programId) => {
    setSelectedProgram(programId);
    router.push(`/programs?program=${programId}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle back to programs grid
  const handleBackToPrograms = () => {
    setSelectedProgram(null);
    router.push("/programs", { scroll: false });
  };

  const programs = [
    {
      id: "mushroom-walk",
      title: "Guided Mushroom Walk",
      image: "/programs/gmw.png",
    },
    {
      id: "grow-mushrooms",
      title: "Grow Your Own Mushrooms",
      image: "/programs/cyom.png",
    },
    {
      id: "demystify-fungi",
      title: "Demystify Your Local Fungi",
      image: "/programs/dlf.png",
    },
    {
      id: "wipro-earthian",
      title: "Wipro Earthian Program",
      image: "/programs/wep.png",
    },
    {
      id: "chemical-free",
      title: "Chemical Free Living Series",
      image: "/programs/cfl.png",
    },
    {
      id: "waste-management",
      title: "Mastering Solid Waste Management",
      image: "/programs/swm.png",
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
            <GuidedMushroomWalk onBack={handleBackToPrograms} />
          ) : selectedProgram === "grow-mushrooms" ? (
            <GrowYourOwnMushrooms onBack={handleBackToPrograms} />
          ) : selectedProgram === "demystify-fungi" ? (
            <DemystifyLocalFungi onBack={handleBackToPrograms} />
          ) : selectedProgram === "wipro-earthian" ? (
            <WiproEarthianProgram onBack={handleBackToPrograms} />
          ) : selectedProgram === "chemical-free" ? (
            <ChemicalFreeLivingSeries onBack={handleBackToPrograms} />
          ) : selectedProgram === "waste-management" ? (
            <MasteringSolidWasteManagement onBack={handleBackToPrograms} />
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
                  onClick={() => handleProgramSelect(program.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default function SustainabilityPrograms() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <SustainabilityProgramsContent />
    </Suspense>
  );
}
