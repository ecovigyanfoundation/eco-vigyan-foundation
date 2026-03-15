"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { getCityBoundary } from "@/lib/geocoding";

export default function LocationSearchInput({ 
  selectedZone, 
  onZoneSelect, 
  onZoneClear 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [zones, setZones] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const lastSuccessfulSearchRef = useRef(null);
  const onZoneSelectRef = useRef(onZoneSelect);

  // Keep ref updated
  useEffect(() => {
    onZoneSelectRef.current = onZoneSelect;
  }, [onZoneSelect]);

  // Fetch saved zones on mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await fetch("/api/zones");
        if (response.ok) {
          const data = await response.json();
          setZones(data.zones || []);
        }
      } catch (error) {
        console.error("Error fetching zones:", error);
      }
    };
    fetchZones();
  }, []);

  // Update search term when selectedZone changes
  useEffect(() => {
    if (selectedZone?.name) {
      setSearchTerm(selectedZone.name);
    } else {
      setSearchTerm("");
    }
  }, [selectedZone]);

  // Debounced city/location search with geocoding
  useEffect(() => {
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmedSearch = searchTerm.trim();

    // If empty, clear after debounce
    if (!trimmedSearch) {
      searchTimeoutRef.current = setTimeout(() => {
        if (lastSuccessfulSearchRef.current !== null) {
          lastSuccessfulSearchRef.current = null;
          if (onZoneSelectRef.current) {
            onZoneSelectRef.current(null);
          }
        }
        setIsSearching(false);
        setShowSuggestions(false);
      }, 800);
      return;
    }

    // If same as last successful, don't refetch
    if (trimmedSearch === lastSuccessfulSearchRef.current) {
      return;
    }

    // Show saved zones as suggestions if they match
    const matchingZones = zones.filter((zone) =>
      zone.name.toLowerCase().includes(trimmedSearch.toLowerCase())
    );
    
    if (matchingZones.length > 0) {
      setSuggestions(matchingZones.slice(0, 8));
      setShowSuggestions(true);
    }

    // Debounce the geocoding search
    searchTimeoutRef.current = setTimeout(async () => {
      // Double check it's still the same after debounce
      if (searchTerm.trim() !== trimmedSearch) {
        return;
      }

      setIsSearching(true);
      try {
        const boundary = await getCityBoundary(trimmedSearch);
        if (boundary && boundary.boundary) {
          lastSuccessfulSearchRef.current = trimmedSearch;
          if (onZoneSelectRef.current) {
            onZoneSelectRef.current(boundary);
          }
        }
      } catch (error) {
        console.error("Error fetching location boundary:", error);
      } finally {
        setIsSearching(false);
      }
    }, 800);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, zones]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleZoneClick = (zone) => {
    setSearchTerm(zone.name);
    setShowSuggestions(false);
    onZoneSelect(zone);
  };

  const handleClear = () => {
    setSearchTerm("");
    setShowSuggestions(false);
    if (onZoneClear) {
      onZoneClear();
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputFocus = () => {
    if (searchTerm.trim().length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input Container */}
      <div className="relative group">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within:text-purple-600 transition-colors z-10" size={18} />
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search location (city, region, country)..."
          className="w-full bg-purple-50/50 rounded-2xl py-3 pl-12 pr-10 text-sm focus:outline-none border border-transparent focus:border-purple-200 focus:bg-white transition-all shadow-inner"
        />

        {/* Loading or Clear Button */}
        {isSearching ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <Loader2 size={16} className="text-purple-400 animate-spin" />
          </div>
        ) : searchTerm ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-purple-100 rounded-lg transition-colors z-10"
          >
            <X size={16} className="text-purple-400" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Suggestions (Saved Zones) */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((zone, index) => (
            <button
              key={zone._id || index}
              onClick={() => handleZoneClick(zone)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-emerald-50 transition-colors border-b border-emerald-100 last:border-b-0 flex items-center gap-3"
            >
              <MapPin size={14} className="text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-emerald-950 truncate">
                  {zone.name}
                </div>
                {zone.description && (
                  <div className="text-xs text-emerald-600 truncate mt-0.5">
                    {zone.description}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-2 text-xs text-emerald-600">
        {selectedZone ? (
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            Filtering by "{selectedZone.name}"
          </span>
        ) : (
          <span>
            Search for cities, locations, or {zones.length > 0 ? `${zones.length} saved zone${zones.length !== 1 ? 's' : ''}` : 'saved zones'}
          </span>
        )}
      </div>
    </div>
  );
}
