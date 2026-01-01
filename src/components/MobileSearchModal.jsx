"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, MapPin, Loader2 } from "lucide-react";
import { getCityBoundary } from "@/lib/geocoding";

export default function MobileSearchModal({ isOpen, onClose, onSpeciesSearch, onLocationSearch }) {
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const locationSearchTimeoutRef = useRef(null);
  const lastSuccessfulLocationRef = useRef(null);
  const onLocationSearchRef = useRef(onLocationSearch);

  // Keep ref updated
  useEffect(() => {
    onLocationSearchRef.current = onLocationSearch;
  }, [onLocationSearch]);

  // Debounce location search
  useEffect(() => {
    // Clear any pending timeout
    if (locationSearchTimeoutRef.current) {
      clearTimeout(locationSearchTimeoutRef.current);
    }

    const trimmedLocation = locationSearch.trim();

    // If empty, clear after debounce
    if (!trimmedLocation) {
      locationSearchTimeoutRef.current = setTimeout(() => {
        // Only clear if still empty and different from last successful
        if (lastSuccessfulLocationRef.current !== null) {
          lastSuccessfulLocationRef.current = null;
          if (onLocationSearchRef.current) {
            onLocationSearchRef.current(null);
          }
        }
        setIsSearchingLocation(false);
      }, 800);
      return () => {
        if (locationSearchTimeoutRef.current) {
          clearTimeout(locationSearchTimeoutRef.current);
        }
      };
    }

    // If same as last successful, don't refetch
    if (trimmedLocation === lastSuccessfulLocationRef.current) {
      return;
    }

    locationSearchTimeoutRef.current = setTimeout(async () => {
      // Double check it's still the same after debounce
      if (locationSearch.trim() !== trimmedLocation) {
        return;
      }

      setIsSearchingLocation(true);
      try {
        const boundary = await getCityBoundary(trimmedLocation);
        if (boundary && boundary.boundary) {
          lastSuccessfulLocationRef.current = trimmedLocation;
          if (onLocationSearchRef.current) {
            onLocationSearchRef.current(boundary);
          }
        }
      } catch (error) {
        console.error("Error fetching location boundary:", error);
        // Don't clear existing boundary on error
      } finally {
        setIsSearchingLocation(false);
      }
    }, 800);

    return () => {
      if (locationSearchTimeoutRef.current) {
        clearTimeout(locationSearchTimeoutRef.current);
      }
    };
  }, [locationSearch]);

  // Handle species search change
  useEffect(() => {
    if (onSpeciesSearch) {
      onSpeciesSearch(speciesSearch);
    }
  }, [speciesSearch, onSpeciesSearch]);

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
              type="text"
              value={speciesSearch}
              onChange={(e) => setSpeciesSearch(e.target.value)}
              placeholder="Search Species..."
              className="bg-transparent flex-1 py-4 text-sm outline-none text-stone-800 placeholder:text-stone-400 font-medium"
            />
          </div>

          {/* Location Search */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-2xl px-4 gap-3 focus-within:bg-white focus-within:border-emerald-500 transition-all">
            <MapPin size={18} className="text-emerald-600" />
            <input
              type="text"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              placeholder="Location..."
              className="bg-transparent flex-1 py-4 text-sm outline-none text-stone-800 placeholder:text-stone-400 font-medium"
            />
            {isSearchingLocation && (
              <Loader2 size={16} className="text-emerald-600 animate-spin" />
            )}
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










