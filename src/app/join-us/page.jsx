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
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

/* ---------------------------------------------------------
   FORM COMPONENT (Reusable Modal)
--------------------------------------------------------- */
const JoinFormModal = ({ type, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentStatus: "",
    duration: "",
    interest: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isVolunteer = type === "volunteer";
  const isIntern = type === "intern";
  const isEcoSci = type === "eco-scientist";

  // Reset form when modal closes or type changes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        currentStatus: "",
        duration: "",
        interest: "",
        message: "",
      });
      setIsSubmitting(false);
    }
  }, [isOpen, type]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("Please fill in all required fields (Name, Email, Phone)");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/join-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Include details in error message if available
        const errorMessage = data.error || "Failed to submit application";
        const errorDetails = data.details ? ` ${data.details}` : "";
        throw new Error(errorMessage + errorDetails);
      }

      toast.success("Application submitted successfully! We'll get back to you soon.");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6 text-stone-500" />
          </button>

          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-black text-emerald-900 mb-2 uppercase tracking-tight">
              {isVolunteer && "Volunteer with Us"}
              {isIntern && "Apply for Internship"}
              {isEcoSci && "Be an Eco वैज्ञानिक"}
            </h2>
            <p className="text-stone-500 mb-8 font-medium">
              Please fill out the details below and our team will get back to
              you shortly.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="+91 ..."
                />
              </div>

              {isIntern && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">
                      Current Status
                    </label>
                    <select
                      name="currentStatus"
                      value={formData.currentStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select status</option>
                      <option value="Student">Student</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">
                      Duration (Weeks)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. 8"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">
                  {isEcoSci ? "City / Region" : "Primary Interest"}
                </label>
                <input
                  type="text"
                  name="interest"
                  value={formData.interest}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={isEcoSci ? "Enter your city/region" : "Enter your primary interest"}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 uppercase mb-2">
                  Availability / Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none h-24 resize-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Tell us a bit about why you want to join..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 cursor-pointer bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Submit Application"
                )}
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
      subtitle:
        "Support environmental education, field activities, and community learning.",
      description:
        "Volunteers work closely with our team during nature walks, school programs, biodiversity surveys, and outreach. No prior expertise needed.",
      icon: <Users className="w-8 h-8" />,
      color: "bg-emerald-50",
      accent: "text-emerald-600",
      btnHover: "hover:bg-emerald-600",
      points: [
        "Nature Walks & Field Activities",
        "School Programs",
        "Workshops & Outreach",
        "Biodiversity Surveys",
      ],
    },
    {
      id: "intern",
      title: "Internship with Us",
      subtitle: "Learn by doing. Contribute to real ecological work.",
      description:
        "Designed for students and early-career professionals wanting hands-on exposure to fungal biodiversity, citizen science, and conservation education.",
      icon: <GraduationCap className="w-8 h-8" />,
      color: "bg-blue-50",
      accent: "text-blue-600",
      btnHover: "hover:bg-blue-600",
      points: [
        "Fungal Biodiversity Research",
        "Environmental Education",
        "Data & Technology",
        "Storytelling & Content",
      ],
    },
    {
      id: "eco-scientist",
      title: "Be an Eco वैज्ञानिक",
      subtitle: "Explore mushrooms around you. Map India’s fungal diversity.",
      description:
        "Join our Citizen Science program focused on fungi. Learn to document local biodiversity and help build regional mushroom trails and fungi maps.",
      icon: <Microscope className="w-8 h-8" />,
      color: "bg-orange-50",
      accent: "text-orange-600",
      btnHover: "hover:bg-orange-600",
      points: [
        "Mushroom Observation",
        "Responsible Photography",
        "Mapping Biodiversity",
        "Guided Learning Sessions",
      ],
    },
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
            At Eco Vigyan Foundation, we believe that care for nature grows
            through participation.
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
              // LIFT EFFECT ON HOVER
              whileHover={{ y: -10, transition: { duration: 0.1 } }}
              transition={{ delay: idx * 0.1 }}
              className={`${item.color} group relative rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-white flex flex-col transition-all duration-300 hover:shadow-2xl`}
            >
              <div
                className={`${item.accent} flex items-center mb-6 p-4 bg-white rounded-2xl shadow-sm w-fit mx-auto transition-transform duration-300 group-hover:scale-110`}
              >
                {item.icon}
              </div>
              
              <h2 className="text-2xl font-black text-stone-900 mb-2 uppercase text-center">
                {item.title}
              </h2>
              <p className="font-bold text-stone-600 mb-4 text-sm uppercase tracking-wide text-center">
                {item.subtitle}
              </p>
              <p className="text-stone-600 mb-8 leading-relaxed text-center">
                {item.description}
              </p>

              <div className="space-y-3 mb-10 flex-grow">
                {item.points.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-stone-700 font-medium"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${item.accent} flex-shrink-0 transition-transform group-hover:rotate-12`}
                    />
                    <span className="text-sm">{point}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setModalType(item.id)}
                className={`w-full py-4 cursor-pointer rounded-2xl bg-white text-stone-900 font-black flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 border-b-4 border-stone-200 group-hover:border-emerald-700 group-hover:bg-emerald-600 group-hover:text-white`}
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
              You don’t need to be a scientist to contribute. We guide you on
              how to observe, photograph, and record fungi responsibly.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 bg-emerald-800/50 p-3 rounded-xl hover:bg-emerald-700/50 transition-colors">
                <Camera className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Learn Photography
                </span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-800/50 p-3 rounded-xl hover:bg-emerald-700/50 transition-colors">
                <MapIcon className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Map Fungi
                </span>
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