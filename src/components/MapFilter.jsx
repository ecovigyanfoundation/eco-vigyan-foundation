"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Filter, ChevronDown, RotateCcw } from "lucide-react";
import {
  ECOLOGICAL_ROLES,
  TEXTURES,
  UNDERSIDES,
  FRUITING_SURFACES,
  STEM_PRESENCE,
  COMMON_USES,
} from "@/components/mushroomConstants";
import { getMushroomImage, getDisplayName } from "@/components/mushroomImageMap";

export default function MapFilter({
  onFilterToggle,
  onResetFilters,
  selectedFilters = {},
  onApplyFilter,
}) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pendingFilters, setPendingFilters] = useState(selectedFilters);

  const filterDropdownRef = useRef(null);
  const filterButtonClickedRef = useRef(false);

  // Sync pending filters with actual filters when menu opens
  useEffect(() => {
    if (filterMenuOpen) {
      setPendingFilters(selectedFilters);
    }
  }, [filterMenuOpen, selectedFilters]);

  /* ------------------------------
     CLICK OUTSIDE HANDLER
  ------------------------------ */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterButtonClickedRef.current) {
        filterButtonClickedRef.current = false;
        return;
      }

      if (
        filterMenuOpen &&
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setFilterMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    return () =>
      document.removeEventListener("click", handleClickOutside, true);
  }, [filterMenuOpen]);

  /* ------------------------------
     FILTER DATA
  ------------------------------ */
  const allFilterOptions = [
    ...ECOLOGICAL_ROLES,
    ...TEXTURES,
    ...UNDERSIDES,
    ...FRUITING_SURFACES,
    ...STEM_PRESENCE,
    ...COMMON_USES,
  ];

  const filterCategories = [
    { id: "all", label: "All Filters", options: allFilterOptions },
    { id: "ecological", label: "Ecological Roles", options: ECOLOGICAL_ROLES },
    { id: "texture", label: "Textures", options: TEXTURES },
    { id: "underside", label: "Undersides", options: UNDERSIDES },
    { id: "surface", label: "Fruiting Surfaces", options: FRUITING_SURFACES },
    { id: "stem", label: "Stem Presence", options: STEM_PRESENCE },
    { id: "use", label: "Common Uses", options: COMMON_USES },
  ];

  const currentOptions =
    filterCategories.find((c) => c.id === selectedCategory)?.options ||
    allFilterOptions;

  /* ------------------------------
     ACTIVE FILTER COUNT (based on pending filters while menu is open)
  ------------------------------ */
  const activeFilterCount = Object.values(filterMenuOpen ? pendingFilters : selectedFilters).reduce(
    (total, arr) => total + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  /* Auto-close menu when everything is cleared */
  useEffect(() => {
    if (activeFilterCount === 0) {
      setSelectedCategory("all");
      setFilterMenuOpen(false);
    }
  }, [activeFilterCount]);

  /* ------------------------------
     HELPERS
  ------------------------------ */
  const getFilterType = (value) => {
    if (ECOLOGICAL_ROLES.includes(value)) return "ecologicalRole";
    if (TEXTURES.includes(value)) return "texture";
    if (UNDERSIDES.includes(value)) return "underside";
    if (FRUITING_SURFACES.includes(value)) return "fruitingSurface";
    if (STEM_PRESENCE.includes(value)) return "stemPresence";
    if (COMMON_USES.includes(value)) return "commonUses";
    return null;
  };

  const isFilterSelected = (value) => {
    const type = getFilterType(value);
    return pendingFilters[type]?.includes(value);
  };

  const handleFilterClick = (value, e) => {
    e.stopPropagation();
    const type = getFilterType(value);
    if (!type) return;

    // Update pending filters (staging area)
    setPendingFilters((prev) => {
      const currentValues = prev[type] || [];
      const isSelected = currentValues.includes(value);
      const newValues = isSelected
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [type]: newValues };
    });
  };

  /* ------------------------------
     MEMOIZED PROCESSED OPTIONS
  ------------------------------ */
  const processedOptions = useMemo(() => {
    return currentOptions.map((option) => {
      const img = getMushroomImage(option);
      const label = getDisplayName(option);
      const selected = isFilterSelected(option);
      return { option, img, label, selected };
    });
  }, [currentOptions, pendingFilters]);

  /* ------------------------------
     RENDER
  ------------------------------ */
  return (
    <div className="relative">
      {/* FILTER BUTTON */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          filterButtonClickedRef.current = true;
          setFilterMenuOpen((prev) => !prev);
        }}
        className="relative flex items-center gap-1.5 px-3 py-2 bg-emerald-600/90 hover:bg-emerald-700 rounded-xl text-white"
      >
        <Filter size={20} className="md:w-4 md:h-4" />
        <ChevronDown
          size={14}
          className={`md:w-3 md:h-3 transition-transform ${
            filterMenuOpen ? "rotate-180" : ""
          }`}
        />

        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-emerald-600 text-[10px] font-black rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {filterMenuOpen && (
        <div
          ref={filterDropdownRef}
          className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="p-2 border-b text-xs font-bold text-gray-800">
            Filter Options
          </div>

          {/* CATEGORY + RESET */}
          <div className="p-2 space-y-1 border-b">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2 py-1 border rounded text-xs text-gray-700"
            >
              {filterCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Buttons Container - Flex Column on Mobile */}
            <div className="flex flex-col gap-1">

            <button
              onClick={(e) => {
                e.stopPropagation();
                setPendingFilters({
                  ecologicalRole: [],
                  texture: [],
                  underside: [],
                  fruitingSurface: [],
                  stemPresence: [],
                  commonUses: [],
                });
                onResetFilters();
                setSelectedCategory("all");
                setFilterMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1 px-2 py-2 md:py-1 text-xs md:text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <RotateCcw size={14} className="md:w-3 md:h-3" />
              Reset All Filters
            </button>

            {/* Apply Filter Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Apply pending filters to actual filters
                Object.keys(pendingFilters).forEach((filterType) => {
                  const pendingValues = pendingFilters[filterType] || [];
                  const currentValues = selectedFilters[filterType] || [];
                  
                  // Find values to remove (in current but not in pending)
                  const toRemove = currentValues.filter(v => !pendingValues.includes(v));
                  // Find values to add (in pending but not in current)
                  const toAdd = pendingValues.filter(v => !currentValues.includes(v));
                  
                  // Remove values
                  toRemove.forEach(value => onFilterToggle(filterType, value));
                  // Add values
                  toAdd.forEach(value => onFilterToggle(filterType, value));
                });
                
                if (onApplyFilter) {
                  // Pass pending filters so toast knows what's being applied
                  onApplyFilter(pendingFilters);
                }
                setFilterMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1 px-2 py-2 md:py-1 text-xs md:text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-bold"
            >
              <Filter size={14} className="md:w-3 md:h-3" />
              Apply Filter
            </button>
            </div>
          </div>

          {/* FILTER GRID */}
          <div className="p-2 max-h-72 overflow-y-auto grid grid-cols-5 gap-2">
            {processedOptions.map(({ option, img, label, selected }) => (
              <button
                key={option}
                onClick={(e) => handleFilterClick(option, e)}
                className={`flex flex-col items-center gap-1 p-1 rounded border ${
                  selected
                    ? "bg-emerald-50 border-emerald-500"
                    : "border-gray-200"
                }`}
              >
                {img && (
                  <img
                    src={img}
                    alt={label}
                    className="w-8 h-8 object-contain"
                  />
                )}
                <span className="text-[9px] font-bold text-center text-gray-700">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
