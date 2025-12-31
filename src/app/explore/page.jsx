"use client";

import { useEffect, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import dynamic from "next/dynamic";
import { Filter, Plus, Menu, X, Home, Info, Users, FileText, Image, Calendar, FileCheck, Mail, User, Settings, Navigation, Heart } from "lucide-react";
import Link from "next/link";
import ExploreHeader from "@/components/ExploreHeader";
import MushroomGrid from "@/components/MushroomGrid";
import MushroomSubmissionForm from "@/components/MushroomSubmissionForm";
import MobileSearchModal from "@/components/MobileSearchModal";
import Leaderboard from "@/components/Leaderboard";
import { useAuth } from "@/context/AuthContext";

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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

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

  // Filter data based on header filters
  useEffect(() => {
    let filtered = [...allData];

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
  }, [headerFilters, filters, mode, allData]);

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
            <Map data={data} filters={filters} mode={mode} />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute top-6 left-6 z-20 p-4 rounded-2xl bg-gray-800 border border-gray-700 shadow-2xl hover:bg-gray-700"
            >
              <Filter
                size={20}
                className={showFilters ? "text-green-500" : "text-white"}
              />
            </button>
            {showFilters && (
              <div className="absolute top-20 left-6 z-20 w-64 bg-gray-800/95 backdrop-blur-md p-5 rounded-[2rem] border border-gray-700 shadow-2xl animate-in fade-in slide-in-from-top-2">
                <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-700 mb-4">
                  <button
                    onClick={() => switchMode("category")}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      mode === "category"
                        ? "bg-green-600 text-white"
                        : "text-gray-500"
                    }`}
                  >
                    Category
                  </button>
                  <button
                    onClick={() => switchMode("use")}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      mode === "use"
                        ? "bg-green-600 text-white"
                        : "text-gray-500"
                    }`}
                  >
                    Use
                  </button>
                </div>
                <CategoryFilter
                  categories={Object.keys(filters)}
                  filters={filters}
                  toggle={toggleFilter}
                />
              </div>
            )}
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

      {/* MOBILE FLOATING ADD BUTTON */}
      {user && (
        <button
          onClick={() => setShowAddModal(true)}
          className="md:hidden fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/50 transition-all active:scale-95"
          aria-label="Add Observation"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
