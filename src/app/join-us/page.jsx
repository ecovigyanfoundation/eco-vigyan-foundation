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
  Heart,
  Calendar,
  MapPin,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

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
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
      setSubmitSuccess(false);
    }
  }, [isOpen, type]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const volunteerInterests = [
    "Nature Walks & Field Activities",
    "School Programs",
    "Workshops & Outreach",
    "Biodiversity Surveys",
    "Other"
  ];

  const internshipInterests = [
    "Fungal Biodiversity Research",
    "Environmental Education",
    "Data & Technology",
    "Storytelling & Content",
    "Other"
  ];

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

      // Show success screen instead of toast
      setSubmitSuccess(true);
      setIsSubmitting(false);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Failed to submit application. Please try again.");
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
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors z-20 text-white"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Gradient Header */}
          <div className={`relative bg-gradient-to-br ${
            isVolunteer ? 'from-emerald-500 to-teal-600' : 
            isIntern ? 'from-blue-500 to-indigo-600' : 
            'from-amber-500 to-orange-600'
          } p-8 text-white`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                {isVolunteer && <Users className="w-8 h-8" />}
                {isIntern && <GraduationCap className="w-8 h-8" />}
                {isEcoSci && <Microscope className="w-8 h-8" />}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {isVolunteer && "VOLUNTEER WITH US"}
                {isIntern && "APPLY FOR INTERNSHIP"}
                {isEcoSci && "BE AN ECO वैज्ञानिक"}
              </h2>
              <p className="text-white/90 text-lg">
                Please fill out the details below and our team will get back to you shortly.
              </p>
            </div>
          </div>

          <div className="overflow-y-auto p-8 md:p-12">
            {!submitSuccess ? (
              <>

                <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-teal-900 mb-2">
                    FULL NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-teal-900 mb-2">
                    EMAIL ADDRESS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-teal-900 mb-2">
                  PHONE NUMBER <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  pattern="^(\+91|91)?[6-9]\d{9}$"
                  title="Please enter a valid Indian phone number (10 digits starting with 6-9, optionally prefixed with +91 or 91)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="+91 9876543210"
                />
                <p className="text-xs text-gray-500 mt-1">10 digits starting with 6-9 (e.g., 9876543210 or +91 9876543210)</p>
              </div>

              {isIntern && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-teal-900 mb-2">
                      CURRENT STATUS
                    </label>
                    <select
                      name="currentStatus"
                      value={formData.currentStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white transition-all"
                    >
                      <option value="">Select your current status</option>
                      <option value="Student">Student</option>
                      <option value="Early Career Professional">Early Career Professional</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-teal-900 mb-2">
                      DURATION (WEEKS)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-teal-900 mb-2">
                  {isEcoSci ? "CITY/REGION" : "PRIMARY INTEREST"}
                </label>
                {isEcoSci ? (
                  <input
                    type="text"
                    name="interest"
                    value={formData.interest}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  />
                ) : (
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white transition-all"
                  >
                    <option value="">Select your primary interest</option>
                    {(isVolunteer ? volunteerInterests : internshipInterests).map((interest) => (
                      <option key={interest} value={interest}>{interest}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-teal-900 mb-2">
                  TELL US ABOUT YOUR AVAILABILITY & WHY YOU'D LIKE TO JOIN
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none transition-all"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
              </>
            ) : (
              <div className="py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h3>
                <p className="text-gray-600">Thank you for your interest. We'll get back to you soon.</p>
              </div>
            )}
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
    <div className="min-h-screen bg-[#F9FAF8] font-sans">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-teal-800 to-teal-900 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-700/50 text-white text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Join Our Community
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold font-serif mb-6"
            >
              Join Us in Building a Greener Future
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed"
            >
              Whether you're a student, professional, or nature enthusiast, there's a place for you at Eco Vigyan Foundation. Choose how you'd like to contribute to environmental conservation.
            </motion.p>
          </div>
        </section>

        {/* Opportunities Grid */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {sections.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-br ${item.id === 'volunteer' ? 'from-emerald-500 to-teal-600' : item.id === 'intern' ? 'from-blue-500 to-indigo-600' : 'from-amber-500 to-orange-600'} p-8 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    {item.icon}
                    <h3 className="text-2xl font-bold mb-2 relative z-10">{item.title}</h3>
                    <p className="text-white/90 text-sm relative z-10 leading-relaxed">{item.subtitle}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-8">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mb-6">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Key Activities
                      </h4>
                      <ul className="space-y-2">
                        {item.points.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-emerald-600 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                      <Clock className="w-4 h-4" />
                      <span>
                        {item.id === 'volunteer' && 'Flexible hours, 4-8 hours per week'}
                        {item.id === 'intern' && '3-6 months, 20-25 hours per week'}
                        {item.id === 'eco-scientist' && 'Self-paced, contribute anytime'}
                      </span>
                    </div>

                    <button
                      onClick={() => setModalType(item.id)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all flex items-center justify-center gap-2 group-hover:scale-105"
                    >
                      {item.id === "volunteer" && "Volunteer with Eco Vigyan"}
                      {item.id === "intern" && "Apply for Internship"}
                      {item.id === "eco-scientist" && "Be an Eco वैज्ञानिक"}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Join Section */}
        <section className="py-24 px-4 bg-gradient-to-br from-emerald-50 via-white to-amber-50/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold font-serif text-emerald-950 mb-4"
              >
                Why Join Eco Vigyan?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Be part of a passionate community working towards environmental conservation
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Real-World Impact',
                  description: 'Work on actual conservation projects that make a tangible difference in local communities and ecosystems.',
                  icon: Heart
                },
                {
                  title: 'Learn from Experts',
                  description: 'Collaborate with experienced researchers, mycologists, and environmental educators.',
                  icon: GraduationCap
                },
                {
                  title: 'Flexible Engagement',
                  description: 'Choose how and when you contribute, whether full-time, part-time, or on a project basis.',
                  icon: Calendar
                },
                {
                  title: 'Pan-India Network',
                  description: 'Connect with like-minded individuals across India working towards the same environmental goals.',
                  icon: MapPin
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-emerald-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="py-24 px-4 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-6">
                Can't Volunteer? Support Us Instead
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Your financial contribution helps fund research equipment, field studies, educational materials, and conservation projects across India.
              </p>
              
              <Link href="/donate">
                <button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-5 px-10 rounded-2xl text-lg hover:from-amber-600 hover:to-orange-700 transition-all inline-flex items-center gap-3 shadow-xl hover:scale-105">
                  Support Our Research
                  <Heart className="w-6 h-6" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

      {/* Modals */}
      <JoinFormModal
        isOpen={modalType !== null}
        type={modalType}
        onClose={() => setModalType(null)}
      />
    </div>
  );
}
