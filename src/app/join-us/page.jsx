"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  Microscope, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Map as MapIcon,
  X
} from "lucide-react";

/* ---------------------------------------------------------
   FORM COMPONENT (Reusable Modal)
--------------------------------------------------------- */
const JoinFormModal = ({ type, isOpen, onClose }) => {
  if (!isOpen) return null;

  const isVolunteer = type === "volunteer";
  const isIntern = type === "intern";
  const isEcoSci = type === "eco-scientist";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors z-10">
            <X className="w-6 h-6 text-stone-500" />
          </button>

          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-black text-emerald-900 mb-2 uppercase tracking-tight">
              {isVolunteer && "Volunteer with Us"}
              {isIntern && "Apply for Internship"}
              {isEcoSci && "Be an Eco वैज्ञानिक"}
            </h2>
            <p className="text-stone-500 mb-8 font-medium">Please fill out the details below and our team will get back to you shortly.</p>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">Full Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">Email Address</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="john@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">Phone Number</label>
                <input type="tel" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="+91 ..." />
              </div>

              {isIntern && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">Current Status</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none bg-white">
                      <option>Student</option>
                      <option>Graduate</option>
                      <option>Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">Duration (Weeks)</label>
                    <input type="number" className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none" placeholder="e.g. 8" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">
                  {isEcoSci ? "City / Region" : "Primary Interest"}
                </label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">Availability / Message</label>
                <textarea className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none h-24 resize-none" placeholder="Tell us a bit about why you want to join..."></textarea>
              </div>

              <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]">
                Submit Application
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* ---------------------------------------------------------
   MAIN PAGE
--------------------------------------------------------- */
export default function JoinUsPage() {
  const [modalType, setModalType] = useState(null);

  const sections = [
    {
      id: "volunteer",
      title: "Volunteer with Us",
      subtitle: "Support environmental education, field activities, and community learning.",
      description: "Volunteers work closely with our team during nature walks, school programs, biodiversity surveys, and outreach. No prior expertise needed—only curiosity.",
      icon: <Users className="w-8 h-8" />,
      color: "bg-emerald-50",
      accent: "text-emerald-600",
      points: ["Nature Walks & Field Activities", "School Programs", "Workshops & Outreach", "Biodiversity Surveys"]
    },
    {
      id: "intern",
      title: "Internship with Us",
      subtitle: "Learn by doing. Contribute to real ecological work.",
      description: "Designed for students and early-career professionals wanting hands-on exposure to fungal biodiversity, citizen science, and conservation education.",
      icon: <GraduationCap className="w-8 h-8" />,
      color: "bg-blue-50",
      accent: "text-blue-600",
      points: ["Fungal Biodiversity Research", "Environmental Education", "Data & Technology", "Storytelling & Content"]
    },
    {
      id: "eco-scientist",
      title: "Be an Eco वैज्ञानिक",
      subtitle: "Explore mushrooms around you. Map India’s fungal diversity.",
      description: "Join our Citizen Science program focused on fungi. Learn to document local biodiversity and help build regional mushroom trails and fungi maps.",
      icon: <Microscope className="w-8 h-8" />,
      color: "bg-orange-50",
      accent: "text-orange-600",
      points: ["Mushroom Observation", "Responsible Photography", "Mapping Biodiversity", "Guided Learning Sessions"]
    }
  ];

  return (
    <main className="min-h-screen bg-stone-50 font-sans pb-24">
      {/* Hero Section */}
      <section className="relative py-24 bg-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight"
          >
            Join Us
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-emerald-100 font-medium leading-relaxed"
          >
            At Eco Vigyan Foundation, we believe that care for nature grows through participation. 
            There is a meaningful way for everyone to be part of our journey.
          </motion.p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {sections.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`${item.color} rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-white flex flex-col`}
            >
              <div className={`${item.accent} mb-6 p-4 bg-white inline-block rounded-2xl shadow-sm w-fit`}>
                {item.icon}
              </div>
              <h2 className="text-2xl font-black text-stone-900 mb-2 uppercase">{item.title}</h2>
              <p className="font-bold text-stone-600 mb-4 text-sm uppercase tracking-wide">{item.subtitle}</p>
              <p className="text-stone-600 mb-8 leading-relaxed">
                {item.description}
              </p>

              <div className="space-y-3 mb-10 flex-grow">
                {item.points.map((point, i) => (
                  <div key={i} className="flex items-center gap-3 text-stone-700 font-medium">
                    <CheckCircle2 className={`w-5 h-5 ${item.accent} flex-shrink-0`} />
                    <span className="text-sm">{point}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setModalType(item.id)}
                className={`w-full py-4 rounded-2xl bg-white text-stone-900 font-black flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95 group border-b-4 border-stone-200`}
              >
                {item.id === "volunteer" && "Volunteer with Eco Vigyan"}
                {item.id === "intern" && "Apply for Internship"}
                {item.id === "eco-scientist" && "Be an Eco वैज्ञानिक"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Citizen Science Highlight */}
      <section className="max-w-5xl mx-auto px-4 mt-24">
        <div className="bg-emerald-900 rounded-[3rem] p-8 md:p-16 text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-10">
            <Microscope className="w-64 h-64 -mr-20 -mt-20" />
          </div>
          
          <div className="md:w-1/2 relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-6 uppercase leading-tight">
              Explore mushrooms around you.
            </h2>
            <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
              You don’t need to be a scientist to contribute. We guide you on how to observe, 
              photograph, and record fungi responsibly—starting right where you live.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 bg-emerald-800/50 p-3 rounded-xl">
                <Camera className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Learn Photography</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-800/50 p-3 rounded-xl">
                <MapIcon className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Map Fungi</span>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
             <img 
               src="/api/placeholder/600/400" 
               alt="Citizen Science" 
               className="rounded-3xl shadow-2xl border-4 border-emerald-800"
             />
          </div>
        </div>
      </section>

      {/* Modals */}
      <JoinFormModal 
        isOpen={modalType !== null} 
        type={modalType} 
        onClose={() => setModalType(null)} 
      />
    </main>
  );
}