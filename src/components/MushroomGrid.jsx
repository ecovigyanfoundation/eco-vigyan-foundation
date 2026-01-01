"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapIcon, Navigation, Loader2 } from "lucide-react";
import MushroomBadge from "./MushroomBadge";

const ITEMS_PER_PAGE = 30; // Load 30 items at a time

export default function MushroomGrid({ data, onMushroomClick }) {
  const router = useRouter();
  const [displayedItems, setDisplayedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef(null);
  const dataLengthRef = useRef(data.length);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  // Reset pagination when data changes (e.g., filters applied)
  useEffect(() => {
    if (dataLengthRef.current !== data.length) {
      setCurrentPage(1);
      setDisplayedItems([]);
      dataLengthRef.current = data.length;
    }
  }, [data.length]);

  // Load items for current page
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const itemsToShow = data.slice(startIndex, endIndex);
    setDisplayedItems(itemsToShow);
  }, [data, currentPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (currentPage >= totalPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);
          // Simulate loading delay for smooth UX
          setTimeout(() => {
            setCurrentPage((prev) => prev + 1);
            setIsLoading(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [currentPage, totalPages, isLoading]);
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
          {displayedItems.map((item, index) => {
            // Extract user ID and ensure it's a string
            // Skip profile link for system-imported mushrooms
            let userId = null;
            const contributorName = item.contributor ||
              item.submittedBy?.name ||
              item.submittedBy?.username ||
              "Guest Scientist";
            const isSystemUser = item.submittedBy?.email === "system@ecovigyan.org" || 
                                 item.submittedBy?.username === "system" ||
                                 item.submittedBy?.name === "System Import" ||
                                 contributorName === "System Import" ||
                                 contributorName === "system";
            
            if (item.submittedBy && !isSystemUser) {
              if (typeof item.submittedBy === 'string') {
                userId = item.submittedBy;
              } else if (item.submittedBy._id) {
                // Convert ObjectId to string if needed
                const idString = typeof item.submittedBy._id === 'string' 
                  ? item.submittedBy._id 
                  : item.submittedBy._id.toString();
                // Validate it's a proper MongoDB ObjectId format (24 hex chars)
                if (/^[0-9a-fA-F]{24}$/.test(idString)) {
                  userId = idString;
                }
              }
            }
            
            // Get original Google Drive link for system imports
            let originalDriveLink = item.images?.[0]?.originalDriveLink || null;
            
            // Fallback: If originalDriveLink doesn't exist but it's a system import,
            // try to extract file ID from the converted image URL and reconstruct the link
            if (isSystemUser && !originalDriveLink) {
              const imageUrl = item.image || item.images?.[0]?.url;
              if (imageUrl && imageUrl.includes('drive.google.com/uc?')) {
                // Extract file ID from converted URL: https://drive.google.com/uc?export=view&id=FILE_ID
                const idMatch = imageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                if (idMatch && idMatch[1]) {
                  // Reconstruct a Google Drive sharing link
                  originalDriveLink = `https://drive.google.com/file/d/${idMatch[1]}/view`;
                }
              }
            }
            
            // Handle details click - opens detail modal
            const handleDetailsClick = (e) => {
              e.stopPropagation();
              onMushroomClick?.(item);
            };

            const cardContent = (
              <>
                {/* IMAGE AREA */}
                <div className="aspect-square bg-stone-100 rounded-[2rem] mb-4 overflow-hidden relative shadow-inner">
                {item.image || item.images?.[0]?.url ? (
                  <img
                    src={item.image || item.images?.[0]?.url}
                    alt={item.name || item.commonName || "Mushroom"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
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
                <h3 className={`font-black text-sm text-slate-800 transition-colors uppercase tracking-tight truncate mb-1 ${userId ? 'group-hover:text-emerald-700' : ''}`}>
                  {item.name || item.commonName || "Unknown Species"}
                </h3>
                <p className="text-[8px] text-emerald-600 font-semibold mb-1">
                  Click to view full details →
                </p>

                <div className="flex items-center justify-between">
                  {(() => {
                    return userId ? (
                      <Link
                        href={`/user/${userId}`}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-1.5 h-1.5 bg-stone-200 rounded-full group-hover:bg-emerald-400 transition-colors" />
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest truncate max-w-[80px] group-hover:text-emerald-600 transition-colors">
                          {contributorName}
                        </p>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-stone-200 rounded-full group-hover:bg-emerald-400 transition-colors" />
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest truncate max-w-[80px]">
                          {contributorName}
                        </p>
                      </div>
                    );
                  })()}

                  {/* LOCATION ICON */}
                  <Navigation
                    size={10}
                    className="text-stone-300 group-hover:text-emerald-500 transition-colors"
                  />
                </div>
              </div>

                {/* HOVER GLOW EFFECT */}
                <div className="absolute inset-0 rounded-[2.5rem] border-2 border-emerald-500/0 group-hover:border-emerald-500/10 pointer-events-none transition-all" />
              </>
            );

            return (
              <motion.div
                key={item.id || item._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, ease: "easeOut" }}
                className="group bg-white border border-stone-200 rounded-[2.5rem] p-3 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all relative cursor-pointer"
                onClick={handleDetailsClick}
              >
                {cardContent}
              </motion.div>
            );
          })}
        </div>

        {/* LOADING INDICATOR */}
        {currentPage < totalPages && (
          <div ref={observerTarget} className="col-span-full flex justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Loading more observations...
              </p>
            </div>
          </div>
        )}

        {/* END OF LIST INDICATOR */}
        {currentPage >= totalPages && displayedItems.length > 0 && (
          <div className="col-span-full flex justify-center py-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              All {data.length} observations loaded
            </p>
          </div>
        )}

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










