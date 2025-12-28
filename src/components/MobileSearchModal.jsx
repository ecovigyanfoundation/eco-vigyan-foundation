"use client";

import { X, Search, MapPin } from "lucide-react";

export default function MobileSearchModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-emerald-950/40 backdrop-blur-md flex items-start p-4 md:hidden">
      <div className="w-full bg-white border border-stone-200 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-500 rounded-full" />
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-emerald-900">
              Search Species
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* SEARCH INPUTS */}
        <div className="space-y-4">
          {/* Species Search */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-2xl px-4 gap-3 focus-within:bg-white focus-within:border-emerald-500 transition-all">
            <Search size={18} className="text-emerald-600" />
            <input
              placeholder="What did you find?"
              className="bg-transparent flex-1 py-4 text-sm outline-none text-stone-800 placeholder:text-stone-400 font-medium"
            />
          </div>

          {/* Location Search */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-2xl px-4 gap-3 focus-within:bg-white focus-within:border-emerald-500 transition-all">
            <MapPin size={18} className="text-emerald-600" />
            <input
              placeholder="Where?"
              className="bg-transparent flex-1 py-4 text-sm outline-none text-stone-800 placeholder:text-stone-400 font-medium"
            />
          </div>

          {/* Search Action Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all mt-2"
          >
            Explore Now
          </button>
        </div>
      </div>
    </div>
  );
}

