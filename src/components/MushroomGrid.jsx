"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapIcon, Navigation, Loader2, X } from "lucide-react";
import MushroomBadge from "./MushroomBadge";
import { MushroomGridSkeleton } from "./MushroomCardSkeleton";

const ITEMS_PER_PAGE = 30; // 5 rows on XL screens (6 cols × 5 rows)

const MushroomGrid = React.memo(function MushroomGrid({ data, onMushroomClick, onScientificNameSearch }) {
  const router = useRouter();
  const [displayedItems, setDisplayedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [scientificNameSearch, setScientificNameSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const observerTarget = useRef(null);
  const dataLengthRef = useRef(data.length);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  // Reset pagination when data changes (e.g., filters applied)
  useEffect(() => {
    if (dataLengthRef.current !== data.length) {
      setCurrentPage(1);
      dataLengthRef.current = data.length;
    }
  }, [data.length]);

  // Turn off initial loading once we have data
  useEffect(() => {
    if (data.length > 0 && isInitialLoading) {
      // Small delay to show the shimmer effect briefly
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data.length, isInitialLoading]);

  // Load items for current page only
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToShow = data.slice(startIndex, endIndex);
    setDisplayedItems(itemsToShow);
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [data, currentPage]);

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(scientificNameSearch);
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [scientificNameSearch]);

  // Generate suggestions based on debounced search term
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchLower = debouncedSearch.toLowerCase().trim();
    const uniqueMatches = new Map();

    // Limit data processing for performance
    const maxItemsToCheck = Math.min(data.length, 500);
    
    for (let i = 0; i < maxItemsToCheck && uniqueMatches.size < 10; i++) {
      const item = data[i];
      const commonName = (item.commonName || item.name || "").toLowerCase();
      const scientificName = (item.scientificName || "").toLowerCase();
      
      // Check if either name matches
      if (commonName.includes(searchLower) || scientificName.includes(searchLower)) {
        // Use scientific name as key to avoid duplicates
        const key = item.scientificName || item.commonName || item.name;
        if (!uniqueMatches.has(key)) {
          uniqueMatches.set(key, {
            commonName: item.commonName || item.name || "Unknown",
            scientificName: item.scientificName || "",
          });
        }
      }
    }

    const matchArray = Array.from(uniqueMatches.values());
    setSuggestions(matchArray);
    setShowSuggestions(matchArray.length > 0);
  }, [debouncedSearch, data]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scientific name search with immediate UI update
  const handleScientificNameSearchChange = (value) => {
    setScientificNameSearch(value);
    setSelectedSuggestionIndex(-1);
    // Don't call parent handler immediately - wait for debounce
  };

  // Call parent handler only when debounced search changes
  useEffect(() => {
    if (onScientificNameSearch) {
      onScientificNameSearch(debouncedSearch);
    }
  }, [debouncedSearch, onScientificNameSearch]);

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    const searchTerm = suggestion.scientificName || suggestion.commonName;
    setScientificNameSearch(searchTerm);
    setDebouncedSearch(searchTerm); // Update immediately for suggestions
    setShowSuggestions(false);
    if (onScientificNameSearch) {
      onScientificNameSearch(searchTerm);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };
  return (
    <div className="p-8 h-full overflow-y-auto bg-stone-50 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-b border-stone-200 pb-8">
          <div>
            <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Database
            </span>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Community <span className="text-emerald-600">Observations</span>
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            {/* Autocomplete Search */}
            <div className="relative w-full sm:w-auto">
              <div className="flex items-center bg-white border border-stone-200 rounded-2xl px-4 gap-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all w-full sm:w-auto">
                <Search size={16} className="text-emerald-600 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={scientificNameSearch}
                  onChange={(e) => handleScientificNameSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search by name (common or scientific)..."
                  className="bg-transparent flex-1 sm:w-80 py-2.5 text-xs outline-none text-slate-800 placeholder:text-stone-400 font-medium"
                />
                {scientificNameSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      handleScientificNameSearchChange("");
                      setShowSuggestions(false);
                    }}
                    className="shrink-0 p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-emerald-600 transition-colors"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-50 py-2"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b border-stone-100 last:border-b-0 ${
                        index === selectedSuggestionIndex ? "bg-emerald-50" : ""
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-800">
                          {suggestion.commonName}
                        </span>
                        {suggestion.scientificName && (
                          <span className="text-xs italic text-emerald-600">
                            {suggestion.scientificName}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Specimens Count */}
            <p className="text-stone-400 font-bold text-xs uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-stone-100 shadow-sm whitespace-nowrap">
              {data.length} Specimens Documented
            </p>
          </div>
        </div>

        {/* THE GRID */}
        {isInitialLoading ? (
          // Show skeleton loaders while initially loading
          <MushroomGridSkeleton count={ITEMS_PER_PAGE} />
        ) : (
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
              
              // Handle details click - navigates to dedicated details page
              const handleDetailsClick = (e) => {
                e.stopPropagation();
                const mushroomId = item._id || item.id;
                if (mushroomId) {
                  router.push(`/mushroom/${mushroomId}`);
                }
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

                  {/* CAT EGORY BADGE */}
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
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 mb-8">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                currentPage === 1
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-white border border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-sm"
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-2">
              {(() => {
                const pages = [];
                const maxPagesToShow = 5;
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
                
                // Adjust start if we're near the end
                if (endPage - startPage < maxPagesToShow - 1) {
                  startPage = Math.max(1, endPage - maxPagesToShow + 1);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                        currentPage === i
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                          : "bg-white border border-stone-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                currentPage === totalPages
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-white border border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-sm"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Page Info */}
        {data.length > 0 && (
          <div className="text-center mb-8">
            <p className="text-xs text-stone-400 font-medium">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, data.length)} of {data.length} observations
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
});

export default MushroomGrid;
