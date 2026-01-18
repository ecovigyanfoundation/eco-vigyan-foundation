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
  Settings,
  Menu,
  X,
  Loader2,
  Home,
  Info,
  FileText,
  Image,
  Calendar,
  FileCheck,
  Mail,
  Heart,
  Users,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { getCityBoundary } from "@/lib/geocoding";

export default function ExploreHeader({
  view,
  setView,
  onAddClick,
  onMobileSearchClick,
  onFilterToggle,
  onResetFilters,
  selectedFilters = {},
  onZonesClick,
  onTrailsClick,
  onSpeciesSearch,
  onLocationSearch,
  allData = [],
  onManualSearch,
  onManualLocationSearch,
}) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [speciesSearch, setSpeciesSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [speciesSuggestions, setSpeciesSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const userMenuRef = useRef(null);
  const speciesSearchTimeoutRef = useRef(null);
  const locationSearchTimeoutRef = useRef(null);
  const lastSuccessfulLocationRef = useRef(null);
  const onLocationSearchRef = useRef(onLocationSearch);
  const suggestionsRef = useRef(null);

  // Keep ref updated
  useEffect(() => {
    onLocationSearchRef.current = onLocationSearch;
  }, [onLocationSearch]);

  // Close user menu and suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle species search with debouncing and autocomplete
  const handleSpeciesSearchChange = (value) => {
    setSpeciesSearch(value);

    // Update autocomplete suggestions
    if (value.trim().length > 0) {
      const searchLower = value.toLowerCase();
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

    // Clear any pending timeout
    if (speciesSearchTimeoutRef.current) {
      clearTimeout(speciesSearchTimeoutRef.current);
    }

    // Debounce the actual search call
    speciesSearchTimeoutRef.current = setTimeout(() => {
      if (onSpeciesSearch) {
        onSpeciesSearch(value);
      }
    }, 300); // 300ms debounce
  };

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


  return (
    <header className="z-[100] bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm shrink-0 sticky top-0 overflow-visible overflow-x-visible overflow-y-visible">
      {/* TOP ROW: BRANDING, SEARCH, ACTIONS */}
      <div className="border-b border-emerald-50/50 overflow-visible">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-4 md:py-0 flex items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-5 overflow-visible relative">
          {/* LEFT: BRANDING */}
          <a
            href="/explore"
            className="flex items-center gap-3 sm:gap-3 md:gap-4 lg:gap-5 shrink-0 hover:opacity-90 transition-opacity group min-w-0"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
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
          <div className="hidden md:flex flex-1 items-center gap-2 min-w-0 max-w-full relative">
            {/* SEARCH BAR */}
            <div className="flex-1 flex items-center bg-emerald-50/60 rounded-2xl border border-emerald-100/50 overflow-visible px-3 gap-2 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-300 min-w-0 relative" ref={suggestionsRef}>
              <Search size={16} className="text-emerald-400 shrink-0" />
              <div className="flex-1 flex items-center gap-1 min-w-0 relative">
                <input
                  type="text"
                  value={speciesSearch}
                  onChange={(e) => handleSpeciesSearchChange(e.target.value)}
                  onFocus={() => speciesSuggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search Species..."
                  className="bg-transparent flex-1 py-2.5 text-xs outline-none text-emerald-900 placeholder:text-emerald-300 font-medium min-w-0"
                />
                {speciesSearch && (
                  <button
                    type="button"
                    onClick={() => handleSpeciesSearchChange("")}
                    className="shrink-0 p-1 rounded-full hover:bg-emerald-100 text-emerald-400 hover:text-emerald-600 transition-colors"
                    title="Clear species search"
                  >
                    <X size={14} />
                  </button>
                )}
                {/* Search Button */}
                {speciesSearch.trim() && (
                  <button
                    type="button"
                    onClick={handleSearchButtonClick}
                    className="shrink-0 p-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all active:scale-95 shadow-sm"
                    title="Search for species"
                  >
                    <Search size={14} />
                  </button>
                )}

                {/* Autocomplete Dropdown */}
                {showSuggestions && speciesSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-emerald-200 rounded-xl shadow-xl max-h-64 overflow-y-auto z-[150]">
                    {speciesSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-2.5 text-left text-sm text-emerald-900 hover:bg-emerald-50 transition-colors border-b border-emerald-50 last:border-b-0 flex items-center gap-2"
                      >
                        <Search size={12} className="text-emerald-400" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-px h-4 bg-emerald-200 mx-0.5 shrink-0" />
              <MapPin size={16} className="text-emerald-400 shrink-0" />
              <div className="flex-1 flex items-center gap-1 min-w-0">
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Location..."
                  className="bg-transparent flex-1 py-2.5 text-xs outline-none text-emerald-900 placeholder:text-emerald-300 font-medium min-w-0"
                />
                {locationSearch && (
                  <button
                    type="button"
                    onClick={() => setLocationSearch("")}
                    className="shrink-0 p-1 rounded-full hover:bg-emerald-100 text-emerald-400 hover:text-emerald-600 transition-colors"
                    title="Clear location search"
                  >
                    <X size={14} />
                  </button>
                )}
                {/* Location Search Button */}
                {locationSearch.trim() && (
                  <button
                    type="button"
                    onClick={onManualLocationSearch}
                    className="shrink-0 p-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all active:scale-95 shadow-sm"
                    title="Search in this location"
                  >
                    <Search size={14} />
                  </button>
                )}
              </div>
              {isSearchingLocation && (
                <Loader2 size={14} className="text-emerald-400 shrink-0 animate-spin" />
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
                      <Link
                        href={`/user/${user.id || user._id?.toString() || user._id}`}
                        onClick={() => setUserMenuOpen(false)}
                        className="px-6 py-5 border-b border-emerald-50 bg-emerald-50/30 hover:bg-emerald-100/50 transition-colors block"
                      >
                        <p className="text-sm font-black text-emerald-950 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs font-medium text-emerald-600/70 truncate">
                          {user.email}
                        </p>
                      </Link>
                      <Link
                        href="/my-submissions"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-6 py-4 text-sm font-black text-emerald-700 hover:bg-emerald-50 transition-colors border-b border-emerald-50"
                      >
                        <User className="w-4 h-4" />
                        My Submissions
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-6 py-4 text-sm font-black text-emerald-700 hover:bg-emerald-50 transition-colors border-b border-emerald-50"
                      >
                        <Settings className="w-4 h-4" />
                        Account Settings
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

                {/* NAVIGATION MENU TOGGLE (Now in Header) */}
                <button
                  onClick={() => setShowSidebar(true)}
                  className="hidden md:flex bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-4 rounded-xl shadow-xl transition-all active:scale-95 shrink-0 items-center justify-center"
                  title="Open Navigation"
                >
                  <Menu size={20} />
                </button>

                {/* SIDEBAR (Relocated to Header) */}
                {/* SIDEBAR (Relocated to Header) */}
                {/* SIDEBAR (Relocated to Header) */}
                {mounted && createPortal(
                  <div className={`fixed inset-0 z-[99999] ${showSidebar ? "pointer-events-auto" : "pointer-events-none"}`}>
                    {/* BACKDROP */}
                    <div 
                      className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${showSidebar ? "opacity-100" : "opacity-0"}`}
                      onClick={() => setShowSidebar(false)}
                    />

                    {/* DRAWER - RIGHT SIDE */}
                    <div
                      className={`absolute right-0 top-0 h-[100dvh] bg-white/95 backdrop-blur-md border-l border-emerald-100 shadow-2xl transition-transform duration-300 ease-in-out w-72 flex flex-col ${
                        showSidebar ? "translate-x-0" : "translate-x-full"
                      }`}
                    >
                      {/* HEADER */}
                      <div className="p-6 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50 shrink-0">
                        <h2 className="text-lg font-black text-emerald-950 uppercase tracking-widest">
                          Navigation
                        </h2>
                        <button 
                          onClick={() => setShowSidebar(false)}
                          className="p-2 rounded-full bg-white border border-emerald-100 text-emerald-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95 z-50 cursor-pointer"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* MENU LINKS */}
                      <nav className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-1">
                        {/* MAIN PAGES */}
                        <div className="mb-6">
                          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 px-3">
                            Main Pages
                          </p>
                          <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                            onClick={() => setShowSidebar(false)}
                          >
                            <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Home size={18} /></span></div>
                            <span>Home</span>
                          </Link>
                          <Link
                            href="/#about"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                            onClick={() => setShowSidebar(false)}
                          >
                             <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Info size={18} /></span></div>
                            <span>About</span>
                          </Link>
                          <Link
                            href="/explore"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-200 group ring-4 ring-emerald-50"
                            onClick={() => setShowSidebar(false)}
                          >
                             <div className="p-2 bg-white/20 rounded-lg transition-transform text-white"><span className="lucide-icon"><Navigation size={18} /></span></div>
                            <span>Explore</span>
                          </Link>
                          <Link
                            href="/join-us"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                            onClick={() => setShowSidebar(false)}
                          >
                             <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Users size={18} /></span></div>
                            <span>Join Us</span>
                          </Link>
                        </div>

                        {/* PROGRAMS */}
                        <div className="mb-6">
                          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 px-3">
                            Programs
                          </p>
                          <Link
                            href="/articles"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                            onClick={() => setShowSidebar(false)}
                          >
                             <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Layers size={18} /></span></div>
                            <span>Articles</span>
                          </Link>
                          <Link
                            href="/gallery"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                            onClick={() => setShowSidebar(false)}
                          >
                             <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Trophy size={18} /></span></div>
                            <span>Eco-Art Gallery</span>
                          </Link>
                          <Link
                            href="/programs"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                            onClick={() => setShowSidebar(false)}
                          >
                             <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Grid size={18} /></span></div>
                            <span>Programs</span>
                          </Link>
                          <Link
                            href="/reports"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                            onClick={() => setShowSidebar(false)}
                          >
                             <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><FileText size={18} /></span></div>
                            <span>Reports</span>
                          </Link>
                          <Link
                            href="/contact"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                            onClick={() => setShowSidebar(false)}
                          >
                             <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Mail size={18} /></span></div>
                            <span>Contact Us</span>
                          </Link>
                        </div>

                        {/* USER PAGES */}
                        {user && (
                          <div className="mb-6">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 px-3">
                              My Account
                            </p>
                            <Link
                              href="/my-submissions"
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                              onClick={() => setShowSidebar(false)}
                            >
                               <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><User size={18} /></span></div>
                              <span>My Submissions</span>
                            </Link>
                            {user.role === "admin" && (
                              <Link
                                href="/admin/mushrooms"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                                onClick={() => setShowSidebar(false)}
                              >
                                 <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Settings size={18} /></span></div>
                                <span>Admin Panel</span>
                              </Link>
                            )}
                          </div>
                        )}
                      </nav>

                      {/* FOOTER */}
                      <div className="p-4 border-t border-emerald-100 bg-emerald-50/30 shrink-0">
                        <Link
                          href="/donate"
                          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 active:to-emerald-700 text-white font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-95"
                          onClick={() => setShowSidebar(false)}
                        >
                          <span className="lucide-icon"><Heart size={16} fill="currentColor" /></span>
                          <span>Donate Now</span>
                        </Link>
                      </div>
                    </div>
                  </div>,
                  document.body
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

            {/* MOBILE MENU BUTTON - Opens Sidebar */}
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 active:bg-emerald-100 transition-colors shrink-0 shadow-sm"
              title="Open Navigation"
            >
              <Menu size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

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
                  className={`flex items-center gap-1.5 sm:gap-2 md:gap-3.5 h-full transition-all text-xs sm:text-sm md:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap border-b-4 shrink-0 ${
                    view === tab.id
                      ? "text-emerald-700 border-emerald-500"
                      : "text-emerald-900/40 hover:text-emerald-700 border-transparent"
                  }`}
                >
                  <tab.icon
                    size={18}
                    className={`sm:w-5 sm:h-5 md:w-5 md:h-5 ${
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
            <button 
              onClick={onTrailsClick}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl bg-white border border-emerald-100 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-500 hover:text-white transition-all shadow-sm shadow-emerald-100/50 whitespace-nowrap"
            >
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









