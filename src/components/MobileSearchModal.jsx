"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, MapPin, Loader2 } from "lucide-react";
import { getCityBoundary } from "@/lib/geocoding";

export default function MobileSearchModal({ isOpen, onClose, onSpeciesSearch, onLocationSearch, allData = [], onManualSearch, onManualLocationSearch }) {
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [speciesSuggestions, setSpeciesSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationSearchTimeoutRef = useRef(null);
  const lastSuccessfulLocationRef = useRef(null);
  const onLocationSearchRef = useRef(onLocationSearch);
  const suggestionsRef = useRef(null);

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

  // Handle species search change with autocomplete
  useEffect(() => {
    if (onSpeciesSearch) {
      onSpeciesSearch(speciesSearch);
    }

    // Update autocomplete suggestions
    if (speciesSearch.trim().length > 0) {
      const searchLower = speciesSearch.toLowerCase();
      const matches = allData
        .map(item => item.commonName || item.name)
        .filter((name, index, self) => name && self.indexOf(name) === index) // Unique names
        .filter(name => name.toLowerCase().includes(searchLower))
        .slice(0, 8); // Show up to 8 suggestions
      setSpeciesSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSpeciesSuggestions([]);
      setShowSuggestions(false);
    }
  }, [speciesSearch, onSpeciesSearch, allData]);

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setSpeciesSearch(suggestion);
    setShowSuggestions(false);
    if (onSpeciesSearch) {
      onSpeciesSearch(suggestion);
    }
    // Trigger manual search to show toast
    if (onManualSearch) {
      setTimeout(() => onManualSearch(suggestion), 100);
    }
  };

  // Handle manual search button click
  const handleSearchButtonClick = () => {
    if (speciesSearch.trim() && onManualSearch) {
      onManualSearch(speciesSearch.trim());
    }
    setShowSuggestions(false);
  };

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
          <div className="relative" ref={suggestionsRef}>
            <div className="flex items-center bg-stone-100 border border-stone-200 rounded-2xl px-4 gap-3 focus-within:bg-white focus-within:border-emerald-500 transition-all">
              <Search size={18} className="text-emerald-600 shrink-0" />
              <input
                type="text"
                value={speciesSearch}
                onChange={(e) => setSpeciesSearch(e.target.value)}
                onFocus={() => speciesSuggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search Species..."
                className="bg-transparent flex-1 py-4 text-sm outline-none text-stone-800 placeholder:text-stone-400 font-medium"
              />
              {speciesSearch && (
                <button
                  type="button"
                  onClick={() => setSpeciesSearch("")}
                  className="shrink-0 p-1 rounded-full hover:bg-stone-200 text-stone-500 hover:text-emerald-600 transition-colors"
                  title="Clear species search"
                >
                  <X size={16} />
                </button>
              )}
              {/* Search Button */}
              {speciesSearch.trim() && (
                <button
                  type="button"
                  onClick={handleSearchButtonClick}
                  className="shrink-0 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all active:scale-95 shadow-sm"
                  title="Search for species"
                >
                  <Search size={16} />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showSuggestions && speciesSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-emerald-200 rounded-xl shadow-xl max-h-64 overflow-y-auto z-[250]">
                {speciesSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left text-sm text-stone-800 hover:bg-emerald-50 transition-colors border-b border-stone-50 last:border-b-0 flex items-center gap-2"
                  >
                    <Search size={14} className="text-emerald-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Search */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-2xl px-4 gap-3 focus-within:bg-white focus-within:border-emerald-500 transition-all">
            <MapPin size={18} className="text-emerald-600 shrink-0" />
            <input
              type="text"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              placeholder="Location..."
              className="bg-transparent flex-1 py-4 text-sm outline-none text-stone-800 placeholder:text-stone-400 font-medium"
            />
            {locationSearch && (
              <button
                type="button"
                onClick={() => setLocationSearch("")}
                className="shrink-0 p-1 rounded-full hover:bg-stone-200 text-stone-500 hover:text-emerald-600 transition-colors"
                title="Clear location search"
              >
                <X size={16} />
              </button>
            )}
            {/* Location Search Button */}
            {locationSearch.trim() && (
              <button
                type="button"
                onClick={onManualLocationSearch}
                className="shrink-0 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all active:scale-95 shadow-sm"
                title="Search in this location"
              >
                <Search size={16} />
              </button>
            )}
            {isSearchingLocation && (
              <Loader2 size={16} className="text-emerald-600 animate-spin shrink-0" />
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










