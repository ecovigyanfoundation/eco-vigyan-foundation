"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Quote,
  ExternalLink,
} from "lucide-react";

const GuidedMushroomWalk = ({ onBack }) => {
  const router = useRouter();
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

          <button 
            onClick={() => router.push('/register?program=mushroom-walk')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 flex items-center gap-3 transition-all active:scale-95"
          >
            Register Here <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GuidedMushroomWalk;
