"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Palette, School, User } from "lucide-react";

/* ---------------------------------------------------------
   GALLERY DATA & CONFIG
--------------------------------------------------------- */
const IMAGES_PER_PAGE = 9;
const TOTAL_IMAGES = 25;

// Generate array of image objects [{id: 1, src: "/paintings/p1.jpg"}, ...]
const paintings = Array.from({ length: TOTAL_IMAGES }, (_, i) => {
  const id = i + 1;
  const extension = id >= 16 ? "jpeg" : "jpg";

  return {
    id,
    src: `/paintings/p${id}.${extension}`,
    studentName: "Student Name",
    schoolName: "Name of School",
  };
});

export default function EcoArtGallery() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(TOTAL_IMAGES / IMAGES_PER_PAGE);

  // Pagination Logic
  const indexOfLastItem = currentPage * IMAGES_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - IMAGES_PER_PAGE;
  const currentItems = paintings.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-stone-50 pb-20 font-sans">
      {/* --- Header Section --- */}
      <section className="bg-emerald-900 py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            <Palette className="w-96 h-96 absolute -bottom-20 -left-20 text-white" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight"
          >
            Eco-Art Gallery
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            className="h-1.5 bg-emerald-400 mx-auto mb-8 rounded-full"
          />
          <p className="text-xl md:text-2xl text-emerald-100 font-medium leading-relaxed">
            Art is where young minds speak for the Earth. This gallery features paintings created by students during our nature education programs.
          </p>
        </div>
      </section>

      {/* --- Gallery Grid --- */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="wait">
            {currentItems.map((painting) => (
              <motion.div
                key={painting.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-4 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all group"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100 mb-4">
                  <img
                    src={painting.src}
                    alt={`Painting by student ${painting.id}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="bg-white/90 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-900">
                        View Artwork
                     </span>
                  </div>
                </div>

                {/* Captions */}
                <div className="px-2 space-y-2">
                  <div className="flex items-center gap-2 text-stone-700">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold border-b border-stone-200 flex-grow pb-1 italic">
                      {painting.studentName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-500">
                    <School className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold uppercase tracking-tight">
                      {painting.schoolName}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* --- Pagination Controls --- */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-4">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-full bg-white shadow-md hover:bg-emerald-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-emerald-700" />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-12 h-12 rounded-full font-bold transition-all shadow-sm ${
                    currentPage === number
                      ? "bg-emerald-600 text-white scale-110 shadow-emerald-200"
                      : "bg-white text-stone-600 hover:bg-emerald-50"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-full bg-white shadow-md hover:bg-emerald-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-6 h-6 text-emerald-700" />
            </button>
          </div>
        )}
      </section>

      {/* --- Quote Footer --- */}
      <section className="max-w-3xl mx-auto px-4 mt-20 text-center">
        <p className="text-stone-400 italic font-medium">
          &ldquo;Every child is an artist. The problem is how to remain an artist once he grows up.&rdquo;
        </p>
      </section>
    </main>
  );
}