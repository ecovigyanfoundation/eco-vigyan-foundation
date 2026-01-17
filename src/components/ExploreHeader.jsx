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
} from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

              </div>
            )}

            {/* MOBILE SEARCH ICON */}
            <button
              onClick={onMobileSearchClick}
              className="md:hidden p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 active:bg-emerald-100 transition-colors shrink-0"
            >
              <Search size={22} />
            </button>

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
            {/* Navigation Links - Same as Desktop Navbar */}
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="text-xl font-medium text-slate-700 w-full text-center py-3 hover:text-emerald-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/#about"
                className="text-xl font-medium text-slate-700 w-full text-center py-3 hover:text-emerald-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/explore"
                className="text-xl font-medium text-slate-700 w-full text-center py-3 hover:text-emerald-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href="/join-us"
                className="text-xl font-medium text-slate-700 w-full text-center py-3 hover:text-emerald-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Join Us
              </Link>
            </div>

            {/* Programs Section */}
            <div className="w-full pt-4 border-t border-emerald-200">
              <p className="text-base uppercase text-emerald-600 mb-4 font-semibold text-center">
                Our Programs
              </p>
              <div className="flex flex-col space-y-2">
                <Link
                  href="/articles"
                  className="block py-3 text-lg text-slate-700 text-center hover:text-emerald-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Articles
                </Link>
                <Link
                  href="/gallery"
                  className="block py-3 text-lg text-slate-700 text-center hover:text-emerald-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Eco-Art Gallery
                </Link>
                <Link
                  href="/programs"
                  className="block py-3 text-lg text-slate-700 text-center hover:text-emerald-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Programs
                </Link>
                <Link
                  href="/reports"
                  className="block py-3 text-lg text-slate-700 text-center hover:text-emerald-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Reports
                </Link>
                <Link
                  href="/contact"
                  className="block py-3 text-lg text-slate-700 text-center hover:text-emerald-700 transition"
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
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold text-lg rounded-lg hover:opacity-90 active:opacity-80 transition shadow-lg"
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









