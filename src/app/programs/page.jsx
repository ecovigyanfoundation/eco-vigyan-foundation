"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
} from "lucide-react";
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

export default SustainabilityPrograms;
