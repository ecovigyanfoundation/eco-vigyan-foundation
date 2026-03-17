"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Target, Sparkles } from 'lucide-react';

export default function VisionMission() {
  return (
    <section id="vision-mission" className="py-24 bg-gradient-to-br from-emerald-50 via-white to-amber-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 border border-emerald-200 rounded-full" />
        <div className="absolute bottom-20 right-10 w-96 h-96 border border-amber-200 rounded-full" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-amber-100 text-emerald-700 text-sm font-semibold mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Our Guiding Principles
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-serif text-emerald-950"
          >
            Vision & Mission
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[40px] opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
            <div className="relative bg-white border-2 border-emerald-200 rounded-[40px] p-8 md:p-12 group-hover:border-emerald-400 transition-all duration-300 shadow-lg group-hover:shadow-2xl">
              {/* Icon */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
              >
                <Eye className="w-8 h-8 text-white" />
              </motion.div>
              
              {/* Content */}
              <h3 className="text-2xl md:text-3xl font-bold font-serif text-emerald-950 mb-4 group-hover:text-emerald-700 transition-colors">
                Our Vision
              </h3>
              <p className="text-emerald-800/80 text-base md:text-lg leading-relaxed group-hover:text-emerald-900 transition-colors">
                We envision schools and communities where sustainability is integrated into everyday practices, fostering scientific inquiry
                and a deep appreciation for the natural world.
              </p>
              
              {/* Decorative Element */}
              <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-emerald-100 to-transparent rounded-full opacity-50 group-hover:opacity-100 transition-opacity -z-10" />
              
              {/* Corner accent */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-2 -right-2 w-16 h-16 bg-emerald-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
              />
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[40px] opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
            <div className="relative bg-white border-2 border-amber-200 rounded-[40px] p-8 md:p-12 group-hover:border-amber-400 transition-all duration-300 shadow-lg group-hover:shadow-2xl">
              {/* Icon */}
              <motion.div
                whileHover={{ rotate: [0, 10, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
              >
                <Target className="w-8 h-8 text-white" />
              </motion.div>
              
              {/* Content */}
              <h3 className="text-2xl md:text-3xl font-bold font-serif text-emerald-950 mb-4 group-hover:text-amber-700 transition-colors">
                Our Mission
              </h3>
              <p className="text-emerald-800/80 text-base md:text-lg leading-relaxed group-hover:text-emerald-900 transition-colors">
                We're on a mission to bridge the gap between humanity and nature. We believe in aligning one's head, heart, and hand
                to make this happen. So, we empower students, teachers, and communities with educational materials, spark curiosity and
                empathy through guided nature walks, and organize hands-on workshops on sustainable living practices.
              </p>
              
              {/* Decorative Element */}
              <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-amber-100 to-transparent rounded-full opacity-50 group-hover:opacity-100 transition-opacity -z-10" />
              
              {/* Corner accent */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-2 -right-2 w-16 h-16 bg-amber-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
              />
            </div>
          </motion.div>
        </div>

        {/* Connecting Element - Desktop Only */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 pointer-events-none"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-full h-full rounded-full bg-gradient-to-br from-emerald-200 to-amber-200 opacity-50 blur-xl"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 bg-white rounded-full border-4 border-emerald-300 shadow-lg"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
