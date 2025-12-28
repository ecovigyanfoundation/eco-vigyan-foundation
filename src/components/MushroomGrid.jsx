"use client";

import { motion } from "framer-motion";
import { Search, MapIcon, Navigation } from "lucide-react";
import MushroomBadge from "./MushroomBadge";

export default function MushroomGrid({ data, onMushroomClick }) {
  return (
    <div className="p-8 h-full overflow-y-auto bg-stone-50 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-stone-200 pb-8">
          <div>
            <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Database
            </span>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Community <span className="text-emerald-600">Observations</span>
            </h2>
          </div>
          <p className="text-stone-400 font-bold text-xs uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-stone-100 shadow-sm">
            {data.length} Specimens Documented
          </p>
        </div>

        {/* THE GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {data.map((item, index) => (
            <motion.div
              key={item.id || item._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, ease: "easeOut" }}
              onClick={() => onMushroomClick?.(item)}
              className="group bg-white border border-stone-200 rounded-[2.5rem] p-3 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all cursor-pointer relative"
            >
              {/* IMAGE AREA */}
              <div className="aspect-square bg-stone-100 rounded-[2rem] mb-4 overflow-hidden relative shadow-inner">
                {item.image || item.images?.[0]?.url ? (
                  <img
                    src={item.image || item.images?.[0]?.url}
                    alt={item.name || item.commonName || "Mushroom"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-2">
                    <MapIcon size={40} strokeWidth={1} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">
                      No Photo
                    </span>
                  </div>
                )}

                {/* CATEGORY BADGE */}
                <div className="absolute top-3 left-3 scale-90 origin-top-left transition-transform group-hover:scale-100">
                  <MushroomBadge
                    category={
                      item.category || item.ecologicalRole || "Unknown"
                    }
                    use={item.use || item.commonUses?.[0] || "Unknown"}
                  />
                </div>

                {/* DATE OVERLAY */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[8px] font-black text-emerald-900 shadow-sm border border-white/50">
                    {new Date(item.createdAt || Date.now()).toLocaleDateString(
                      "en-GB"
                    )}
                  </div>
                </div>
              </div>

              {/* INFO AREA */}
              <div className="px-3 pb-2">
                <h3 className="font-black text-sm text-slate-800 group-hover:text-emerald-700 transition-colors uppercase tracking-tight truncate mb-1">
                  {item.name || item.commonName || "Unknown Species"}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-stone-200 rounded-full group-hover:bg-emerald-400 transition-colors" />
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest truncate max-w-[80px]">
                      {item.contributor ||
                        item.submittedBy?.name ||
                        item.submittedBy?.username ||
                        "Guest Scientist"}
                    </p>
                  </div>

                  {/* LOCATION ICON */}
                  <Navigation
                    size={10}
                    className="text-stone-300 group-hover:text-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* HOVER GLOW EFFECT */}
              <div className="absolute inset-0 rounded-[2.5rem] border-2 border-emerald-500/0 group-hover:border-emerald-500/10 pointer-events-none transition-all" />
            </motion.div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-white p-8 rounded-full shadow-xl border border-stone-100 mb-6">
              <Search size={48} className="text-stone-200" />
            </div>
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">
              No observations found
            </h3>
            <p className="text-stone-400 text-sm mt-2">
              Try adjusting your filters or add a new specimen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

