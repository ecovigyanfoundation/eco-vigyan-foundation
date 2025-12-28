"use client";

import { useEffect, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import dynamic from "next/dynamic";
import { Filter } from "lucide-react";
import ExploreHeader from "@/components/ExploreHeader";
import MushroomGrid from "@/components/MushroomGrid";
import MushroomSubmissionForm from "@/components/MushroomSubmissionForm";
import MobileSearchModal from "@/components/MobileSearchModal";
import Leaderboard from "@/components/Leaderboard";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapPage() {
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("category");
  const [filters, setFilters] = useState({});
  const [selectedMushroom, setSelectedMushroom] = useState(null);
  const [view, setView] = useState("map");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

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
    setData(transformedMushrooms);
    initializeFilters(transformedMushrooms, "category");
  };

  return (
    <div className="flex flex-col min-h-dvh w-screen bg-gray-950 overflow-x-hidden text-white">
      {/* HEADER */}
      <ExploreHeader
        view={view}
        setView={setView}
        onAddClick={() => setShowAddModal(true)}
        onMobileSearchClick={() => setShowMobileSearch(true)}
      />

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
    </div>
  );
}
