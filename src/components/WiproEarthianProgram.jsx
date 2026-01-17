"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  School,
  Target,
  Award,
  ExternalLink,
} from "lucide-react";

const WiproEarthianProgram = ({ onBack }) => {
  const router = useRouter();
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
          Wipro Earthian Program
        </h2>
      </div>

      <div className="p-8 md:p-12">
        {/* Intro Text */}
        <p className="text-stone-600 text-lg mb-12 max-w-4xl">
          A comprehensive school engagement program in partnership with Wipro Foundation, 
          fostering environmental stewardship and sustainability awareness among students 
          and educators across the country.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Program Focus Areas */}
          <div className="space-y-6">
            <h4 className="text-emerald-600 font-bold text-xl mb-6">
              Focus Areas
            </h4>

            <div className="space-y-4">
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <School className="w-5 h-5" />
                  School Collaborations
                </h5>
                <p className="text-sm text-stone-600">
                  Work directly with schools to integrate environmental education into their curriculum.
                </p>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Project-Based Learning
                </h5>
                <p className="text-sm text-stone-600">
                  Students undertake real-world sustainability projects addressing local environmental challenges.
                </p>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Recognition & Awards
                </h5>
                <p className="text-sm text-stone-600">
                  Outstanding projects are recognized and awarded at national level competitions.
                </p>
              </div>
            </div>

            {/* Program Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-black">100+</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-90">Schools</div>
                </div>
                <div>
                  <div className="text-2xl font-black">5000+</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-90">Students</div>
                </div>
                <div>
                  <div className="text-2xl font-black">50+</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-90">Projects</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Program Benefits */}
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
            <h4 className="font-black text-stone-800 uppercase mb-6">
              Program <span className="text-emerald-600">Benefits</span>
            </h4>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">For Students</h5>
                <ul className="text-sm text-stone-600 space-y-1">
                  <li>• Hands-on environmental learning</li>
                  <li>• Critical thinking and problem-solving skills</li>
                  <li>• National recognition opportunities</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">For Teachers</h5>
                <ul className="text-sm text-stone-600 space-y-1">
                  <li>• Professional development workshops</li>
                  <li>• Curriculum integration resources</li>
                  <li>• Network with fellow educators</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">For Schools</h5>
                <ul className="text-sm text-stone-600 space-y-1">
                  <li>• Enhanced environmental curriculum</li>
                  <li>• Free training and resources</li>
                  <li>• Visibility and recognition</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: CTA */}
        <div className="mt-16 pt-8 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-stone-600 text-lg">
              Join hands with Wipro Earthian to create environmentally conscious 
              future leaders committed to sustainability!
            </p>
          </div>

          <button 
            onClick={() => router.push('/register?program=wipro-earthian')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 flex items-center gap-3 transition-all active:scale-95"
          >
            Partner With Us <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default WiproEarthianProgram;
