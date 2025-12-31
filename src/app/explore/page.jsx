"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Plus, Menu, X, Home, Info, Users, FileText, Image, Calendar, FileCheck, Mail, User, Settings, Navigation, Heart, Layers, MapPin, CheckCircle } from "lucide-react";
import Link from "next/link";
import ExploreHeader from "@/components/ExploreHeader";
import MushroomGrid from "@/components/MushroomGrid";
import MushroomSubmissionForm from "@/components/MushroomSubmissionForm";
import MobileSearchModal from "@/components/MobileSearchModal";
import Leaderboard from "@/components/Leaderboard";
import ZoneModal from "@/components/ZoneModal";
import MapFilter from "@/components/MapFilter";
import { useAuth } from "@/context/AuthContext";
import { isPointInPolygon } from "@/lib/geocoding";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]); // Store all data for filtering
  const [mode, setMode] = useState("category");
  const [filters, setFilters] = useState({});
  const [headerFilters, setHeaderFilters] = useState({
    ecologicalRole: [],
    texture: [],
    underside: [],
    fruitingSurface: [],
    stemPresence: [],
    commonUses: [],
  });
  const [selectedMushroom, setSelectedMushroom] = useState(null);
  const [view, setView] = useState("map");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [drawingMode, setDrawingMode] = useState(null);
  const getCurrentBoundaryRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    fetch("/api/mushrooms")
      .then((res) => res.json())
      .then((d) => {
        const mushrooms = d.mushrooms || [];
        // Transform data to match Map component expectations
        const transformedMushrooms = mushrooms.map((m) => ({
          ...m,
          latitude: m.location?.latitude || m.latitude,
          longitude: m.location?.longitude || m.longitude,
          name: m.commonName || m.name || "Unnamed Mushroom",
          image: m.images?.[0]?.url || m.image,
          contributor:
            m.submittedBy?.name ||
            m.submittedBy?.username ||
            m.contributor ||
            "Anonymous",
          info: m.description || m.info || "",
          category: m.ecologicalRole || m.category || "Unknown",
          use: m.commonUses?.[0] || m.use || "",
        }));
        setAllData(transformedMushrooms);
        setData(transformedMushrooms);
        initializeFilters(transformedMushrooms, "category");
      })
      .catch(console.error);
  }, []);

  const initializeFilters = (dataset, filterMode) => {
    const f = {};
    dataset.forEach((item) => {
      const key =
        filterMode === "category"
          ? item.ecologicalRole || item.category
          : item.commonUses?.[0] || item.use;
      if (key) f[key] = true;
    });
    setFilters(f);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    initializeFilters(data, newMode);
  };

  const toggleFilter = (key) =>
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  // Handle filter selection from header
  const handleHeaderFilterToggle = (filterType, filterValue) => {
    setHeaderFilters((prev) => {
      const currentValues = prev[filterType] || [];
      const isSelected = currentValues.includes(filterValue);
      const newValues = isSelected
        ? currentValues.filter((v) => v !== filterValue)
        : [...currentValues, filterValue];
      return { ...prev, [filterType]: newValues };
    });
  };

  // Reset all header filters
  const handleResetFilters = () => {
    setHeaderFilters({
      ecologicalRole: [],
      texture: [],
      underside: [],
      fruitingSurface: [],
      stemPresence: [],
      commonUses: [],
    });
  };

  // Filter data based on header filters and zone
  useEffect(() => {
    let filtered = [...allData];

    // Apply zone filter first
    if (selectedZone && selectedZone.boundary) {
      filtered = filtered.filter((item) => {
        if (!item.latitude || !item.longitude) return false;
        return isPointInPolygon(item.latitude, item.longitude, selectedZone.boundary);
      });
    }

    // Apply header filters
    if (headerFilters.ecologicalRole.length > 0) {
      filtered = filtered.filter((item) =>
        headerFilters.ecologicalRole.includes(item.ecologicalRole)
      );
    }
    if (headerFilters.texture.length > 0) {
      filtered = filtered.filter((item) =>
        headerFilters.texture.includes(item.texture)
      );
    }
    if (headerFilters.underside.length > 0) {
      filtered = filtered.filter((item) =>
        headerFilters.underside.includes(item.underside)
      );
    }
    if (headerFilters.fruitingSurface.length > 0) {
      filtered = filtered.filter((item) =>
        headerFilters.fruitingSurface.includes(item.fruitingSurface)
      );
    }
    if (headerFilters.stemPresence.length > 0) {
      filtered = filtered.filter((item) =>
        headerFilters.stemPresence.includes(item.stemPresence)
      );
    }
    if (headerFilters.commonUses.length > 0) {
      filtered = filtered.filter((item) => {
        const itemUses = item.commonUses || [];
        return headerFilters.commonUses.some((use) => itemUses.includes(use));
      });
    }

    // Apply legacy filters (for backward compatibility with existing filter UI)
    if (Object.keys(filters).length > 0 && mode === "category") {
      filtered = filtered.filter((item) => {
        const key = item.ecologicalRole || item.category;
        return filters[key] !== false;
      });
    } else if (Object.keys(filters).length > 0 && mode === "use") {
      filtered = filtered.filter((item) => {
        const key = item.commonUses?.[0] || item.use;
        return filters[key] !== false;
      });
    }

    setData(filtered);
  }, [headerFilters, filters, mode, allData, selectedZone]);

  // Handle zone selection
  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    setDrawingMode(null);
  };

  // Handle drawing mode selection
  const handleDrawingModeSelect = (mode) => {
    setDrawingMode(mode);
    setSelectedZone(null); // Clear existing zone when starting new drawing
  };

  // Handle drawing completion
  const handleDrawingComplete = (drawnZone) => {
    setSelectedZone(drawnZone);
    setDrawingMode(null);
  };

  // Handle applying the drawn zone
  const handleApplyZone = () => {
    if (!drawingMode || !getCurrentBoundaryRef.current) return;
    
    const currentZone = getCurrentBoundaryRef.current();
    if (currentZone) {
      setSelectedZone(currentZone);
      setDrawingMode(null);
    }
  };

  // Handle drawing cancellation
  const handleDrawingCancel = () => {
    setDrawingMode(null);
  };

  // Clear selected zone
  const handleClearZone = () => {
    setSelectedZone(null);
    setDrawingMode(null);
    // Reset the boundary ref so the shape disappears
    if (getCurrentBoundaryRef.current) {
      getCurrentBoundaryRef.current = null;
    }
    // Reload the page to ensure all state is reset
    window.location.reload();
  };

  const handleSubmissionSuccess = async () => {
    // Refresh data after successful submission
    const refreshed = await fetch("/api/mushrooms");
    const refreshedData = await refreshed.json();
    const mushrooms = refreshedData.mushrooms || [];
    const transformedMushrooms = mushrooms.map((m) => ({
      ...m,
      latitude: m.location?.latitude || m.latitude,
      longitude: m.location?.longitude || m.longitude,
      name: m.commonName || m.name || "Unnamed Mushroom",
      image: m.images?.[0]?.url || m.image,
      contributor:
        m.submittedBy?.name ||
        m.submittedBy?.username ||
        m.contributor ||
        "Anonymous",
      info: m.description || m.info || "",
      category: m.ecologicalRole || m.category || "Unknown",
      use: m.commonUses?.[0] || m.use || "",
    }));
    setAllData(transformedMushrooms);
    setData(transformedMushrooms);
    initializeFilters(transformedMushrooms, "category");
  };

  return (
    <div className="flex flex-col min-h-dvh w-full bg-gray-950 overflow-x-hidden text-white">
      {/* HEADER */}
      <ExploreHeader
        view={view}
        setView={setView}
        onAddClick={() => setShowAddModal(true)}
        onMobileSearchClick={() => setShowMobileSearch(true)}
        onFilterToggle={handleHeaderFilterToggle}
        onResetFilters={handleResetFilters}
        selectedFilters={headerFilters}
        onZonesClick={() => setShowZoneModal(true)}
      />

      {/* DESKTOP SIDEBAR MENU */}
      <div className="hidden md:block fixed left-0 top-0 h-full z-[110]">
        {/* BACKDROP OVERLAY */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-[110]"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute left-4 top-24 z-[120] p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-r-2xl shadow-2xl transition-all duration-300 hover:shadow-emerald-500/50"
          aria-label="Toggle menu"
        >
          {showSidebar ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* SIDEBAR */}
        <div
          className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-md border-r border-gray-700 shadow-2xl transition-all duration-300 ease-in-out z-[120] ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } w-64`}
        >
          <div className="flex flex-col h-full">
            {/* HEADER */}
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-black text-white uppercase tracking-wider">
                Navigation
              </h2>
            </div>

            {/* MENU LINKS */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {/* MAIN PAGES */}
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-3">
                  Main Pages
                </p>
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-emerald-600 hover:text-white transition-all group"
                  onClick={() => setShowSidebar(false)}
                >
                  <Home size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/#about"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-emerald-600 hover:text-white transition-all group"
                  onClick={() => setShowSidebar(false)}
                >
                  <Info size={18} className="group-hover:scale-110 transition-transform" />
                  <span>About</span>
                </Link>
                <Link
                  href="/explore"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-600 text-white transition-all group"
                  onClick={() => setShowSidebar(false)}
                >
                  <Navigation size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Explore</span>
                </Link>
                <Link
                  href="/join-us"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-emerald-600 hover:text-white transition-all group"
                  onClick={() => setShowSidebar(false)}
                >
                  <Users size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Join Us</span>
                </Link>
              </div>

              {/* PROGRAMS */}
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-3">
                  Programs
                </p>
                <Link
                  href="/articles"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-emerald-600 hover:text-white transition-all group"
                  onClick={() => setShowSidebar(false)}
                >
                  <FileText size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Articles</span>
                </Link>
                <Link
                  href="/gallery"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-emerald-600 hover:text-white transition-all group"
                  onClick={() => setShowSidebar(false)}
                >
                  <Image size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Eco-Art Gallery</span>
                </Link>
                <Link
                  href="/programs"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-emerald-600 hover:text-white transition-all group"
                  onClick={() => setShowSidebar(false)}
                >
                  <Calendar size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Programs</span>
                </Link>
                <Link
                  href="/reports"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-emerald-600 hover:text-white transition-all group"
                  onClick={() => setShowSidebar(false)}
                >
                  <FileCheck size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Reports</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-emerald-600 hover:text-white transition-all group"
                  onClick={() => setShowSidebar(false)}
                >
                  <Mail size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Contact Us</span>
                </Link>
              </div>

              {/* USER PAGES */}
              {user && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-3">
                    My Account
                  </p>
                  <Link
                    href="/my-submissions"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-emerald-600 hover:text-white transition-all group"
                    onClick={() => setShowSidebar(false)}
                  >
                    <User size={18} className="group-hover:scale-110 transition-transform" />
                    <span>My Submissions</span>
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin/mushrooms"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-emerald-600 hover:text-white transition-all group"
                      onClick={() => setShowSidebar(false)}
                    >
                      <Settings size={18} className="group-hover:scale-110 transition-transform" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>
              )}
            </nav>

            {/* FOOTER */}
            <div className="p-4 border-t border-gray-700">
              <Link
                href="/donate"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                onClick={() => setShowSidebar(false)}
              >
                <Heart size={16} />
                <span>Donate Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-hidden">
        {view === "map" && isMounted && (
          <>
            <Map 
              data={data} 
              filters={filters} 
              mode={mode}
              selectedZone={selectedZone}
              drawingMode={drawingMode}
              onDrawingComplete={handleDrawingComplete}
              onDrawingCancel={handleDrawingCancel}
              onGetCurrentBoundary={getCurrentBoundaryRef}
            />

            {/* Map Controls - Top Left */}
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
              {/* Filter Button */}
              <MapFilter
                onFilterToggle={handleHeaderFilterToggle}
                onResetFilters={handleResetFilters}
                selectedFilters={headerFilters}
              />
              
              {/* Apply Zone Button (shown when in drawing mode) */}
              {drawingMode && (
                <button
                  onClick={handleApplyZone}
                  className="px-4 py-3 rounded-2xl bg-emerald-600/90 hover:bg-emerald-700/90 backdrop-blur-md border border-emerald-500 text-white shadow-2xl transition-all duration-300 hover:shadow-emerald-500/50 flex items-center gap-2 font-bold text-sm"
                >
                  <CheckCircle size={18} className="shrink-0" />
                  Apply Zone
                </button>
              )}
              
              {/* Zone filter indicator and clear button */}
              {selectedZone && !drawingMode && (
                <div className="p-3 rounded-2xl bg-emerald-600/90 backdrop-blur-md border border-emerald-500 shadow-2xl flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-white" />
                    <span className="text-white text-xs font-bold">
                      {selectedZone.name || "Zone Selected"}
                    </span>
                  </div>
                  <button
                    onClick={handleClearZone}
                    className="p-1.5 rounded-lg bg-emerald-700/50 hover:bg-emerald-700 transition-colors"
                    title="Clear zone filter"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Map Controls - Bottom Right (Zones and Trails) - Desktop Only */}
            <div className="hidden md:flex absolute bottom-6 right-6 z-20 flex-col gap-3">
              {/* Trails Button */}
              <button
                className="bg-blue-600/90 hover:bg-blue-700/90 text-white px-4 py-3 rounded-2xl flex items-center gap-2 shadow-2xl shadow-blue-900/50 transition-all active:scale-95 backdrop-blur-md border border-blue-500"
                aria-label="Trails"
                title="Trails"
              >
                <Navigation size={20} strokeWidth={3} />
                <span className="font-bold text-sm whitespace-nowrap">Trails</span>
              </button>
              
              {/* Zones Button */}
              <button
                onClick={() => setShowZoneModal(true)}
                className="bg-emerald-600/90 hover:bg-emerald-700/90 text-white px-4 py-3 rounded-2xl flex items-center gap-2 shadow-2xl shadow-emerald-900/50 transition-all active:scale-95 backdrop-blur-md border border-emerald-500"
                aria-label="Zones"
                title="Zones"
              >
                <Layers size={20} strokeWidth={3} />
                <span className="font-bold text-sm whitespace-nowrap">Zones</span>
              </button>
            </div>
          </>
        )}

        {view === "grid" && (
          <MushroomGrid
            data={data}
            onMushroomClick={setSelectedMushroom}
          />
        )}

        {view === "leaderboard" && <Leaderboard />}
      </main>

      {/* MODALS */}
      <MobileSearchModal
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
      />

      <MushroomSubmissionForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleSubmissionSuccess}
        selectedLocation={selectedLocation}
        onLocationSelect={setSelectedLocation}
      />

      <ZoneModal
        isOpen={showZoneModal}
        onClose={() => setShowZoneModal(false)}
        onZoneSelect={handleZoneSelect}
        onDrawingModeSelect={handleDrawingModeSelect}
      />

      {/* MOBILE FLOATING BUTTONS */}
      {view === "map" && (
        <div className="md:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          {/* Zones Button */}
          <button
            onClick={() => setShowZoneModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-2xl flex items-center gap-2 shadow-2xl shadow-emerald-900/50 transition-all active:scale-95"
            aria-label="Zones"
          >
            <Layers size={20} strokeWidth={3} />
            <span className="font-bold text-sm whitespace-nowrap">Zones</span>
          </button>
          
          {/* Trails Button */}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-2xl flex items-center gap-2 shadow-2xl shadow-blue-900/50 transition-all active:scale-95"
            aria-label="Trails"
          >
            <Navigation size={20} strokeWidth={3} />
            <span className="font-bold text-sm whitespace-nowrap">Trails</span>
          </button>
          
          {/* Add Observation Button */}
          {user && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-2xl flex items-center gap-2 shadow-2xl shadow-emerald-900/50 transition-all active:scale-95"
              aria-label="Add Observation"
            >
              <Plus size={20} strokeWidth={3} />
              <span className="font-bold text-sm whitespace-nowrap">Add</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
