"use client";

import { useRef, useState, useEffect } from "react";
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
}) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const filterDropdownRef = useRef(null);
  const filterButtonClickedRef = useRef(false);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleFilterMenuClickOutside = (event) => {
      // Skip if button was just clicked (button's onClick handles the toggle)
      if (filterButtonClickedRef.current) {
        filterButtonClickedRef.current = false;
        return;
      }
      
      if (filterMenuOpen && filterDropdownRef.current) {
        const isClickInsideDropdown = filterDropdownRef.current.contains(event.target);
        if (!isClickInsideDropdown) {
          setFilterMenuOpen(false);
        }
      }
    };

    document.addEventListener("click", handleFilterMenuClickOutside, true);
    
    return () => {
      document.removeEventListener("click", handleFilterMenuClickOutside, true);
    };
  }, [filterMenuOpen]);

  // Combine all filter options
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

  const currentOptions = filterCategories.find((cat) => cat.id === selectedCategory)?.options || allFilterOptions;

  // Count active filters
  const activeFilterCount = Object.values(selectedFilters || {}).reduce(
    (total, arr) => total + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  // Determine filter type for a given value
  const getFilterType = (value) => {
    if (ECOLOGICAL_ROLES.includes(value)) return "ecologicalRole";
    if (TEXTURES.includes(value)) return "texture";
    if (UNDERSIDES.includes(value)) return "underside";
    if (FRUITING_SURFACES.includes(value)) return "fruitingSurface";
    if (STEM_PRESENCE.includes(value)) return "stemPresence";
    if (COMMON_USES.includes(value)) return "commonUses";
    return null;
  };

  // Check if a filter is selected
  const isFilterSelected = (value) => {
    const filterType = getFilterType(value);
    if (!filterType) return false;
    const selected = selectedFilters[filterType] || [];
    return selected.includes(value);
  };

  // Handle filter click
  const handleFilterClick = (value, event) => {
    if (event) {
      event.stopPropagation();
    }
    const filterType = getFilterType(value);
    if (filterType && onFilterToggle) {
      onFilterToggle(filterType, value);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          filterButtonClickedRef.current = true;
          setFilterMenuOpen(prev => !prev);
        }}
        className="relative flex items-center gap-1.5 px-3 py-2 bg-emerald-600/90 hover:bg-emerald-700/90 backdrop-blur-md rounded-xl border border-emerald-500 text-white shadow-2xl transition-all duration-300 hover:shadow-emerald-500/50"
      >
        <Filter size={16} className="shrink-0" />
        <ChevronDown
          size={12}
          className={`transition-transform shrink-0 ${
            filterMenuOpen ? "rotate-180" : ""
          }`}
        />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-emerald-600 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-emerald-600">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* FILTER DROPDOWN */}
      {filterMenuOpen && (
        <div 
          ref={filterDropdownRef}
          className="absolute left-0 mt-1 mb-4 w-80 max-w-[min(340px,calc(100vw-2rem))] max-h-[calc(100vh-200px)] bg-white rounded-xl shadow-2xl border border-emerald-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1 border-b border-emerald-50 bg-emerald-50/30">
            <h3 className="text-[10px] font-black text-emerald-950 uppercase tracking-wider">
              Filter Options
            </h3>
          </div>

          {/* CATEGORY SELECTOR AND RESET */}
          <div className="p-1.5 border-b border-emerald-50 bg-emerald-50/20 space-y-1">
            <select
              value={selectedCategory}
              onChange={(e) => {
                e.stopPropagation();
                setSelectedCategory(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 bg-white border border-emerald-200 rounded-md text-[12px] font-medium text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {filterCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            {onResetFilters && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResetFilters();
                }}
                className="w-full flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                title="Reset all filters"
              >
                <RotateCcw size={10} />
                <span>Reset All Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1 py-0.5 bg-white/20 rounded text-[9px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* FILTER OPTIONS GRID */}
          <div className="p-1 max-h-[280px] overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {currentOptions.map((option) => {
                const imagePath = getMushroomImage(option);
                const displayName = getDisplayName(option);
                const isSelected = isFilterSelected(option);
                return (
                  <button
                    key={option}
                    type="button"
                    className={`flex flex-col items-center gap-1.5  rounded-lg border transition-all group ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : "border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFilterClick(option, e);
                    }}
                  >
                    {imagePath && (
                      <div className="w-10 h-8 flex items-center justify-center relative">
                        <img
                          src={imagePath}
                          alt={displayName}
                          className={`w-full h-full object-contain transition-transform ${
                            isSelected
                              ? "scale-110"
                              : "group-hover:scale-110"
                          }`}
                        />
                        {isSelected && (
                          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                            <span className="text-white text-[8px] font-black">✓</span>
                          </div>
                        )}
                      </div>
                    )}
                    <span
                      className={`text-[8px] font-bold text-center leading-tight ${
                        isSelected
                          ? "text-emerald-700 font-bold"
                          : "text-emerald-900"
                      }`}
                    >
                      {displayName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

