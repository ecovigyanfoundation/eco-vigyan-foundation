"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Map as MapIcon,
  Plus,
  Trophy,
  Grid,
  Navigation,
  Layers,
  LogOut,
  User,
  Menu,
  X,
  Filter,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  ECOLOGICAL_ROLES,
  TEXTURES,
  UNDERSIDES,
  FRUITING_SURFACES,
  STEM_PRESENCE,
  COMMON_USES,
} from "@/components/mushroomConstants";
import { getMushroomImage, getDisplayName } from "@/components/mushroomImageMap";

export default function ExploreHeader({
  view,
  setView,
  onAddClick,
  onMobileSearchClick,
  onFilterToggle,
  onResetFilters,
  selectedFilters = {},
  onZonesClick,
}) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const userMenuRef = useRef(null);
  const filterMenuRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const filterButtonClickedRef = useRef(false);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleUserMenuClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

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

    document.addEventListener("mousedown", handleUserMenuClickOutside);
    // Use 'click' for filter menu - button click will set the ref to skip closing
    document.addEventListener("click", handleFilterMenuClickOutside, true);
    
    return () => {
      document.removeEventListener("mousedown", handleUserMenuClickOutside);
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
    (total, filters) => total + (filters?.length || 0),
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
    <header className="z-[100] bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm shrink-0 sticky top-0 overflow-visible">
      {/* TOP ROW: BRANDING, SEARCH, ACTIONS */}
      <div className="border-b border-emerald-50/50 overflow-visible">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-4 md:py-1 flex items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-5 overflow-visible relative">
          {/* LEFT: BRANDING */}
          <a
            href="/"
            className="flex items-center gap-3 sm:gap-3 md:gap-4 lg:gap-5 shrink-0 hover:opacity-90 transition-opacity group min-w-0"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              <img
                src="/icons/icon2.png"
                alt="Mushroom Mania Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-emerald-950 leading-none uppercase tracking-tighter">
                Mushroom <span className="text-emerald-500">Mania</span>
              </h2>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-700/60 font-black uppercase tracking-[0.25em]">
                <span className="text-emerald-500 italic lowercase font-medium text-[12px] tracking-normal">
                  An initiative of
                </span>
                Eco Vigyan
              </div>
            </div>
          </a>

          {/* CENTER: SEARCH BAR AND FILTER */}
          <div className="hidden md:flex flex-1 items-center gap-2 min-w-0 max-w-full">
            {/* SEARCH BAR */}
            <div className="flex-1 flex items-center bg-emerald-50/60 rounded-2xl border border-emerald-100/50 overflow-hidden px-3 gap-2 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-300 min-w-0">
              <Search size={16} className="text-emerald-400 shrink-0" />
              <input
                placeholder="Search Species..."
                className="bg-transparent flex-1 py-2.5 text-xs outline-none text-emerald-900 placeholder:text-emerald-300 font-medium min-w-0"
              />
              <div className="w-px h-4 bg-emerald-200 mx-0.5 shrink-0" />
              <MapPin size={16} className="text-emerald-400 shrink-0" />
              <input
                placeholder="Location..."
                className="bg-transparent flex-1 py-2.5 text-xs outline-none text-emerald-900 placeholder:text-emerald-300 font-medium min-w-0"
              />
            </div>

            {/* FILTER BUTTON */}
            <div className="relative shrink-0" ref={filterMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  filterButtonClickedRef.current = true;
                  setFilterMenuOpen(prev => !prev);
                }}
                className="relative flex items-center gap-1 px-2.5 py-2.5 bg-emerald-50/60 hover:bg-emerald-100/80 rounded-2xl border border-emerald-100/50 text-emerald-700 transition-all duration-300 hover:border-emerald-300 hover:shadow-md shrink-0"
              >
                <Filter size={16} className="text-emerald-600 shrink-0" />
                <ChevronDown
                  size={12}
                  className={`text-emerald-600 transition-transform shrink-0 ${
                    filterMenuOpen ? "rotate-180" : ""
                  }`}
                />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* FILTER DROPDOWN */}
              {filterMenuOpen && (
                <div 
                  ref={filterDropdownRef}
                  className="absolute right-0 mt-2 w-80 max-w-[min(320px,calc(100vw-1rem))] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 md:block hidden"
                >
                  <div className="p-4 border-b border-emerald-50 bg-emerald-50/30">
                    <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
                      Filter Options
                    </h3>
                  </div>

                  {/* CATEGORY SELECTOR AND RESET */}
                  <div className="p-3 border-b border-emerald-50 bg-emerald-50/20 space-y-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm font-medium text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                        disabled={activeFilterCount === 0}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                          activeFilterCount > 0
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        title={activeFilterCount > 0 ? "Reset all filters" : "No filters to reset"}
                      >
                        <RotateCcw size={14} />
                        <span>Reset All Filters</span>
                        {activeFilterCount > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-bold">
                            {activeFilterCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* FILTER OPTIONS GRID */}
                  <div className="p-4 max-h-[450px] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                      {currentOptions.map((option) => {
                        const imagePath = getMushroomImage(option);
                        const displayName = getDisplayName(option);
                        const isSelected = isFilterSelected(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all group ${
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
                              <div className="w-12 h-12 flex items-center justify-center relative">
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
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                                    <span className="text-white text-[10px] font-black">✓</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <span
                              className={`text-xs font-medium text-center leading-tight ${
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
          </div>

          {/* RIGHT: NAVIGATION & ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 shrink-0">
            {!user ? (
              <Link
                href="/login"
                className="text-[12px] font-black uppercase tracking-[0.2em] text-emerald-800/40 hover:text-emerald-600 transition-colors shrink-0 whitespace-nowrap"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                {/* USER PROFILE */}
                <div className="relative shrink-0" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((p) => !p)}
                    className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-100 hover:ring-4 hover:ring-emerald-100 transition-all"
                  >
                    {user.dp?.url ? (
                      <img
                        src={user.dp.url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 mt-4 w-64 max-w-[calc(100vw-2rem)] sm:max-w-none bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-6 py-5 border-b border-emerald-50 bg-emerald-50/30">
                        <p className="text-sm font-black text-emerald-950 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs font-medium text-emerald-600/70 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/my-submissions"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-6 py-4 text-sm font-black text-emerald-700 hover:bg-emerald-50 transition-colors border-b border-emerald-50"
                      >
                        <User className="w-4 h-4" />
                        My Submissions
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          href="/admin/mushrooms"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-6 py-4 text-sm font-black text-emerald-700 hover:bg-emerald-50 transition-colors border-b border-emerald-50"
                        >
                          <User className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-6 py-4 text-sm font-black text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* ADD OBSERVATION BUTTON - Desktop */}
                <button
                  onClick={onAddClick}
                  className="hidden md:flex bg-emerald-600 hover:bg-emerald-700 text-white px-6 lg:px-8 py-4 rounded-2xl font-black text-[11px] items-center gap-3 shadow-xl shadow-emerald-200/60 transition-all active:scale-95 uppercase tracking-widest shrink-0"
                >
                  <Plus size={20} strokeWidth={3} />
                  <span className="hidden xl:inline">Add Observation</span>
                </button>

                {/* ADMIN LINK */}
                {user?.role === "admin" && (
                  <Link
                    href="/admin/mushrooms"
                    className="hidden md:flex bg-gray-800 hover:bg-gray-700 text-white px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[10px] md:text-[11px] items-center gap-2 sm:gap-2 md:gap-3 shadow-xl transition-all active:scale-95 uppercase tracking-widest shrink-0"
                  >
                    <User size={18} strokeWidth={3} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
                    <span className="hidden sm:inline xl:hidden">Admin</span>
                    <span className="hidden xl:inline">Admin</span>
                  </Link>
                )}
              </div>
            )}

            {/* MOBILE SEARCH ICON */}
            <button
              onClick={onMobileSearchClick}
              className="md:hidden p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 active:bg-emerald-100 transition-colors shrink-0"
            >
              <Search size={22} />
            </button>

            {/* MOBILE FILTER ICON */}
            <div className="relative md:hidden shrink-0" ref={filterMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  filterButtonClickedRef.current = true;
                  setFilterMenuOpen(prev => !prev);
                }}
                className="relative p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 active:bg-emerald-100 transition-colors"
              >
                <Filter size={22} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* MOBILE FILTER DROPDOWN */}
              {filterMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 max-h-[70vh] flex flex-col"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2.5 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between">
                    <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Filters
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {activeFilterCount > 0 && onResetFilters && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onResetFilters();
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-md transition-colors"
                          title="Reset all filters"
                        >
                          <RotateCcw size={11} />
                          <span>Reset</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFilterMenuOpen(false);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-1 rounded-md hover:bg-emerald-100 transition-colors"
                      >
                        <X size={14} className="text-emerald-700" />
                      </button>
                    </div>
                  </div>

                  {/* CATEGORY SELECTOR */}
                  <div className="px-3 pt-2.5 pb-2 border-b border-emerald-50 bg-emerald-50/20">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-[11px] font-medium text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {filterCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* FILTER OPTIONS GRID */}
                  <div className="flex-1 p-2.5 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-1.5">
                      {currentOptions.map((option) => {
                        const imagePath = getMushroomImage(option);
                        const displayName = getDisplayName(option);
                        const isSelected = isFilterSelected(option);
                        return (
                          <button
                            key={option}
                            className={`flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg border transition-all group active:scale-95 min-h-[75px] ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                : "border-emerald-100 active:border-emerald-300 active:bg-emerald-50/50"
                            }`}
                            onClick={(e) => handleFilterClick(option, e)}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            {imagePath && (
                              <div className="w-8 h-8 flex items-center justify-center relative flex-shrink-0">
                                <img
                                  src={imagePath}
                                  alt={displayName}
                                  className={`w-full h-full object-contain transition-transform ${
                                    isSelected
                                      ? "scale-110"
                                      : "group-active:scale-110"
                                  }`}
                                />
                                {isSelected && (
                                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center border border-white">
                                    <span className="text-white text-[8px] font-black">✓</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <span
                              className={`text-[9px] font-medium text-center leading-tight px-0.5 line-clamp-2 ${
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

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 active:bg-emerald-100 transition-colors shrink-0"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>


      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
            {/* Navigation Links */}
            <div className="flex flex-col space-y-2">
              <Link
                href="/#about"
                className="text-lg font-medium text-slate-700 w-full text-center py-2 hover:text-emerald-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/explore"
                className="text-lg font-medium text-slate-700 w-full text-center py-2 hover:text-emerald-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href="/join-us"
                className="text-lg font-medium text-slate-700 w-full text-center py-2 hover:text-emerald-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Join Us
              </Link>
            </div>

            {/* Programs Section */}
            <div className="w-full pt-4 border-t border-emerald-200">
              <p className="text-sm uppercase text-emerald-600 mb-3 font-semibold text-center">
                Our Programs
              </p>
              <div className="flex flex-col space-y-1">
                <Link
                  href="/articles"
                  className="block py-2 text-slate-700 text-center hover:text-emerald-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Articles
                </Link>
                <Link
                  href="/gallery"
                  className="block py-2 text-slate-700 text-center hover:text-emerald-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Eco-Art Gallery
                </Link>
                <Link
                  href="/programs"
                  className="block py-2 text-slate-700 text-center hover:text-emerald-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Programs
                </Link>
                <Link
                  href="/reports"
                  className="block py-2 text-slate-700 text-center hover:text-emerald-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Reports
                </Link>
                <Link
                  href="/contact"
                  className="block py-2 text-slate-700 text-center hover:text-emerald-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Donate Button */}
            <div className="w-full pt-4 border-t border-emerald-200">
              <Link
                href="/donate"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold rounded-lg hover:opacity-90 active:opacity-80 transition shadow-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Donate Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SECOND ROW: GREENISH TAB NAVIGATION */}
      <div className="bg-emerald-50/20">
        <div className="max-w-7xl mx-auto h-12 sm:h-14 md:h-16 px-3 sm:px-4 md:px-6 lg:px-10 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center h-full overflow-x-auto no-scrollbar flex-1 min-w-0">
            <nav className="flex h-full gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-14">
              {[
                { id: "map", label: "Explore Map", icon: MapIcon },
                { id: "grid", label: "Observations", icon: Grid },
                {
                  id: "leaderboard",
                  label: "Top Contributors",
                  icon: Trophy,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 md:gap-3.5 h-full transition-all text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap border-b-4 shrink-0 ${
                    view === tab.id
                      ? "text-emerald-700 border-emerald-500"
                      : "text-emerald-900/40 hover:text-emerald-700 border-transparent"
                  }`}
                >
                  <tab.icon
                    size={16}
                    className={`sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                      view === tab.id ? "text-emerald-500" : "text-emerald-300"
                    }`}
                  />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* SECONDARY ACTION BUTTONS */}
          <div className="hidden sm:flex items-center gap-2 md:gap-4 ml-2 md:ml-4 lg:ml-10 shrink-0">
            <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl bg-white border border-emerald-100 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-500 hover:text-white transition-all shadow-sm shadow-emerald-100/50 whitespace-nowrap">
              <Navigation size={12} className="sm:w-3.5 sm:h-3.5 md:w-[14px] md:h-[14px]" /> <span className="hidden md:inline">Trails</span>
            </button>
            <button 
              onClick={onZonesClick}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl bg-white border border-emerald-100 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-500 hover:text-white transition-all shadow-sm shadow-emerald-100/50 whitespace-nowrap"
            >
              <Layers size={12} className="sm:w-3.5 sm:h-3.5 md:w-[14px] md:h-[14px]" /> <span className="hidden md:inline">Zones</span>
            </button>
          </div>
        </div>
      </div>

    </header>
  );
}









