"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Plus, Menu, X, Home, Info, Users, FileText, Image, Calendar, FileCheck, Mail, User, Settings, Navigation, Heart, Layers, MapPin, CheckCircle, Save } from "lucide-react";
import Link from "next/link";
import ExploreHeader from "@/components/ExploreHeader";
import MushroomGrid from "@/components/MushroomGrid";
import MushroomSubmissionForm from "@/components/MushroomSubmissionForm";
import MobileSearchModal from "@/components/MobileSearchModal";
import Leaderboard from "@/components/Leaderboard";
import ZoneModal from "@/components/ZoneModal";
import TrailModal from "@/components/TrailModal";
import SaveTrailModal from "@/components/SaveTrailModal";
import MapFilter from "@/components/MapFilter";
import MushroomDetailModal from "@/components/MushroomDetailModal";
import { useAuth } from "@/context/AuthContext";
import { isPointInPolygon, calculateDistance } from "@/lib/geocoding";
import { saveTrail } from "@/lib/trailStorage";
import toast from "react-hot-toast";

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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMushroom, setDetailMushroom] = useState(null);
  const [view, setView] = useState("map");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showTrailModal, setShowTrailModal] = useState(false);
  const [showSaveTrailModal, setShowSaveTrailModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [drawingMode, setDrawingMode] = useState(null);
  const [trailMode, setTrailMode] = useState(false);
  const [trailLocation, setTrailLocation] = useState(null);
  const [trailCurrentLocation, setTrailCurrentLocation] = useState(null);
  const [trailMushrooms, setTrailMushrooms] = useState([]);
  const [speciesSearchTerm, setSpeciesSearchTerm] = useState("");
  const getCurrentBoundaryRef = useRef(null);
  const prevFiltersRef = useRef({ speciesSearchTerm: "", hasZone: false });
  const lastAddedMushroomRef = useRef(null);
  const trailModeRef = useRef(false);
  
  // Keep trailModeRef in sync with trailMode state
  useEffect(() => {
    trailModeRef.current = trailMode;
  }, [trailMode]);

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
          // Preserve submittedBy for navigation
          submittedBy: m.submittedBy,
          // Preserve full images array with originalDriveLink
          images: m.images || [],
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

  // Filter data based on header filters, zone, and species search
  useEffect(() => {
    let filtered = [...allData];

    // Apply zone filter first
    if (selectedZone && selectedZone.boundary) {
      filtered = filtered.filter((item) => {
        if (!item.latitude || !item.longitude) return false;
        return isPointInPolygon(item.latitude, item.longitude, selectedZone.boundary);
      });
    }

    // Apply species search filter
    if (speciesSearchTerm.trim()) {
      const searchLower = speciesSearchTerm.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const commonName = (item.commonName || item.name || "").toLowerCase();
        const scientificName = (item.scientificName || "").toLowerCase();
        return commonName.includes(searchLower) || scientificName.includes(searchLower);
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

    // Show toast notification when both species and location are searched
    const hasSpeciesSearch = speciesSearchTerm.trim().length > 0;
    const hasZone = selectedZone && selectedZone.boundary;
    const prevHasSpecies = prevFiltersRef.current.speciesSearchTerm.trim().length > 0;
    const prevHasZone = prevFiltersRef.current.hasZone;
    const prevCount = prevFiltersRef.current.count || 0;

    // Show toast when both filters are active and something changed
    if (hasSpeciesSearch && hasZone) {
      const count = filtered.length;
      const locationName = selectedZone.name || "this location";
      const speciesName = speciesSearchTerm.trim();
      const speciesChanged = speciesSearchTerm.trim() !== prevFiltersRef.current.speciesSearchTerm.trim();
      const zoneChanged = !prevHasZone || (selectedZone && prevFiltersRef.current.zoneId !== selectedZone.boundary?.length);
      const countChanged = count !== prevCount;

      // Show toast when:
      // 1. Both are newly set (wasn't both before)
      // 2. Species search changed
      // 3. Zone changed (new location selected)
      if ((!prevHasSpecies || !prevHasZone) || speciesChanged || zoneChanged) {
        if (count > 0) {
          toast.success(
            `Found ${count} ${count === 1 ? 'species' : 'species'} of "${speciesName}" in ${locationName}`,
            { duration: 4000 }
          );
        } else {
          toast.error(
            `No species "${speciesName}" found in ${locationName}`,
            { duration: 4000 }
          );
        }
      }
    }

    // Update previous filters ref
    prevFiltersRef.current = {
      speciesSearchTerm: speciesSearchTerm,
      hasZone: !!hasZone,
      count: filtered.length,
      zoneId: selectedZone?.boundary?.length || null,
    };
  }, [headerFilters, filters, mode, allData, selectedZone, speciesSearchTerm]);

  // Handle zone selection
  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    setDrawingMode(null);
  };

  // Handle trail location selection
  const handleTrailLocationSelect = (location) => {
    // Store current location for distance calculation
    if (location.currentLocation) {
      const currentLoc = {
        lat: Number(location.currentLocation.lat),
        lng: Number(location.currentLocation.lng),
      };
      setTrailCurrentLocation(currentLoc);
      console.log("Trail current location set:", currentLoc);
    } else {
      console.warn("No current location in location object:", location);
    }
    
    setTrailLocation(location);
    setTrailMode(true);
    setTrailMushrooms([]);
    
    // Set the zone to zoom to user's location
    setSelectedZone({
      type: "trail",
      center: location.currentLocation 
        ? { lat: Number(location.currentLocation.lat), lng: Number(location.currentLocation.lng) }
        : location.center,
      boundary: location.boundary || null,
    });
    
    toast.success("Trail mode started! Click mushrooms on the map to add them to your trail.");
  };

  // Handle adding mushroom to trail
  const handleTrailMushroomAdd = (mushroom) => {
    // Early return if not in trail mode - don't process at all
    if (!trailMode) {
      return;
    }
    
    // Get mushroom coordinates for comparison
    const mushroomLat = Number(mushroom.latitude || mushroom.location?.latitude);
    const mushroomLng = Number(mushroom.longitude || mushroom.location?.longitude);
    const mushroomId = mushroom._id || mushroom.id;
    
    // Check if mushroom is already in trail using multiple criteria
    const isAlreadyAdded = trailMushrooms.some((m) => {
      // Check by ID if available
      if (mushroomId && (m._id === mushroomId || m.id === mushroomId)) {
        return true;
      }
      
      // Check by coordinates (with small tolerance for floating point comparison)
      const mLat = Number(m.latitude || m.location?.latitude);
      const mLng = Number(m.longitude || m.location?.longitude);
      
      if (!isNaN(mLat) && !isNaN(mLng) && !isNaN(mushroomLat) && !isNaN(mushroomLng)) {
        const latDiff = Math.abs(mLat - mushroomLat);
        const lngDiff = Math.abs(mLng - mushroomLng);
        // Consider same if within 0.0001 degrees (~11 meters)
        if (latDiff < 0.0001 && lngDiff < 0.0001) {
          return true;
        }
      }
      
      return false;
    });
    
    if (isAlreadyAdded) {
      toast.error("This mushroom is already in your trail", { id: 'duplicate-mushroom' });
      return;
    }
    
    // Create a unique key for this mushroom to prevent duplicate toasts
    const mushroomKey = mushroomId || `${mushroomLat.toFixed(6)},${mushroomLng.toFixed(6)}`;
    
    // Check if we just added this mushroom (prevent duplicate toasts)
    if (lastAddedMushroomRef.current === mushroomKey) {
      return; // Already processing this mushroom
    }
    
    // Use functional update to ensure we're working with latest state
    setTrailMushrooms((prev) => {
      // Double-check in the update function to prevent race conditions
      const alreadyInList = prev.some((m) => {
        if (mushroomId && (m._id === mushroomId || m.id === mushroomId)) {
          return true;
        }
        const mLat = Number(m.latitude || m.location?.latitude);
        const mLng = Number(m.longitude || m.location?.longitude);
        if (!isNaN(mLat) && !isNaN(mLng) && !isNaN(mushroomLat) && !isNaN(mushroomLng)) {
          const latDiff = Math.abs(mLat - mushroomLat);
          const lngDiff = Math.abs(mLng - mushroomLng);
          if (latDiff < 0.0001 && lngDiff < 0.0001) {
            return true;
          }
        }
        return false;
      });
      
      if (alreadyInList) {
        return prev; // Don't add if already in list
      }
      
      // Mark this mushroom as being added
      lastAddedMushroomRef.current = mushroomKey;
      
      // Show toast only once - check trail mode is still active using ref
      setTimeout(() => {
        // Double-check trail mode is still active before showing toast (use ref to get current value)
        if (trailModeRef.current) {
          toast.success("Mushroom added to trail", { id: `mushroom-${mushroomKey}` });
        }
        // Clear the ref after a short delay to allow re-adding if needed
        setTimeout(() => {
          lastAddedMushroomRef.current = null;
        }, 1000);
      }, 0);
      
      return [...prev, mushroom];
    });
  };

  // Handle removing mushroom from trail
  const handleTrailMushroomRemove = (mushroomId) => {
    setTrailMushrooms((prev) => prev.filter((m) => 
      m._id !== mushroomId && 
      !(m.latitude === trailMushrooms.find(tm => tm._id === mushroomId)?.latitude && 
        m.longitude === trailMushrooms.find(tm => tm._id === mushroomId)?.longitude)
    ));
  };

  // Handle loading a saved trail
  const handleLoadTrail = (trail) => {
    if (!trail || !trail.mushrooms || trail.mushrooms.length === 0) {
      toast.error("Trail has no mushrooms to load");
      return;
    }

    // Get current location first
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    toast.loading("Getting your location...", { id: 'loading-trail' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLoc = {
          lat: Number(latitude),
          lng: Number(longitude),
        };

        setTrailCurrentLocation(currentLoc);
        setTrailMushrooms(trail.mushrooms);
        setTrailMode(true);
        setTrailLocation({
          type: "trail",
          currentLocation: currentLoc,
          center: currentLoc,
          boundary: null,
        });

        // Set the zone to zoom to user's location
        setSelectedZone({
          type: "trail",
          center: currentLoc,
          boundary: null,
        });

        toast.success(`Loaded trail "${trail.name}" with ${trail.mushrooms.length} mushrooms`, { id: 'loading-trail' });
      },
      (err) => {
        toast.error("Failed to get location. Please enable location access and try again.", { id: 'loading-trail' });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Handle saving current trail
  const handleSaveTrail = () => {
    if (trailMushrooms.length === 0) {
      toast.error("Cannot save an empty trail. Add some mushrooms first!");
      return;
    }
    setShowSaveTrailModal(true);
  };

  // Handle save trail confirmation
  const handleSaveTrailConfirm = (trailName) => {
    const trailData = {
      name: trailName,
      location: trailLocation,
      mushrooms: trailMushrooms,
      createdAt: new Date().toISOString(),
    };

    const trailId = saveTrail(trailData);
    if (trailId) {
      toast.success(`Trail "${trailName}" saved successfully!`);
    } else {
      toast.error("Failed to save trail. Please try again.");
    }
  };

  // Handle ending trail mode
  const handleEndTrail = () => {
    // Refresh the page to completely clear all state
    window.location.reload();
  };

  // Calculate distance and estimated time to next mushroom in trail
  const getDistanceToNextMushroom = () => {
    if (!trailCurrentLocation || trailMushrooms.length === 0) {
      return null;
    }
    
    // Get the first mushroom in the trail (next one to visit)
    const nextMushroom = trailMushrooms[0];
    
    // Try multiple ways to get coordinates
    const mushroomLat = nextMushroom.latitude 
      || nextMushroom.location?.latitude 
      || (nextMushroom.location && typeof nextMushroom.location === 'object' && nextMushroom.location.latitude);
    const mushroomLng = nextMushroom.longitude 
      || nextMushroom.location?.longitude 
      || (nextMushroom.location && typeof nextMushroom.location === 'object' && nextMushroom.location.longitude);
    
    if (!mushroomLat || !mushroomLng || isNaN(mushroomLat) || isNaN(mushroomLng)) {
      console.warn("Mushroom coordinates not found:", nextMushroom);
      return null;
    }
    
    // Ensure current location has valid coordinates
    if (!trailCurrentLocation.lat || !trailCurrentLocation.lng || 
        isNaN(trailCurrentLocation.lat) || isNaN(trailCurrentLocation.lng)) {
      console.warn("Current location invalid:", trailCurrentLocation);
      return null;
    }
    
    const distance = calculateDistance(
      trailCurrentLocation.lat,
      trailCurrentLocation.lng,
      Number(mushroomLat),
      Number(mushroomLng)
    );
    
    // Calculate estimated time (assuming average walking speed of 5 km/h)
    const walkingSpeedKmh = 5; // km/h
    const walkingSpeedKms = walkingSpeedKmh / 3600; // km/s
    const estimatedTimeSeconds = distance / walkingSpeedKms;
    
    return {
      distance,
      estimatedTimeSeconds,
    };
  };

  // Handle drawing mode selection (admin only)
  const handleDrawingModeSelect = (mode) => {
    // Only allow admins to use drawing mode
    if (!user || user.role !== "admin") {
      toast.error("Drawing zones is only available for administrators.");
      return;
    }
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
      // Preserve submittedBy for navigation
      submittedBy: m.submittedBy,
      // Preserve full images array with originalDriveLink
      images: m.images || [],
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
        onTrailsClick={() => setShowTrailModal(true)}
        onSpeciesSearch={setSpeciesSearchTerm}
        onLocationSearch={handleZoneSelect}
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
              trailMode={trailMode}
              trailMushrooms={trailMushrooms}
              trailCurrentLocation={trailCurrentLocation}
              onTrailMushroomAdd={handleTrailMushroomAdd}
              onMushroomClick={(mushroom) => {
                if (trailMode) {
                  handleTrailMushroomAdd(mushroom);
                } else {
                  setDetailMushroom(mushroom);
                  setShowDetailModal(true);
                }
              }}
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
              {selectedZone && !drawingMode && !trailMode && (
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
              
              {/* Trail mode indicator */}
              {trailMode && (
                <div className="p-3 rounded-2xl bg-blue-600/90 backdrop-blur-md border border-blue-500 shadow-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation size={16} className="text-white" />
                    <span className="text-white text-xs font-bold">
                      Trail Mode: {trailMushrooms.length} mushroom{trailMushrooms.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  {trailCurrentLocation && (
                    <p className="text-white/70 text-[9px] mb-1">
                      Your location: {trailCurrentLocation.lat?.toFixed(4)}, {trailCurrentLocation.lng?.toFixed(4)}
                    </p>
                  )}
                  {trailCurrentLocation && trailMushrooms.length > 0 && (() => {
                    const result = getDistanceToNextMushroom();
                    if (result !== null) {
                      const { distance, estimatedTimeSeconds } = result;
                      const distanceText = distance < 1 
                        ? `${(distance * 1000).toFixed(0)} m` 
                        : `${distance.toFixed(2)} km`;
                      
                      // Format estimated time
                      let timeText = "";
                      if (estimatedTimeSeconds < 60) {
                        timeText = `${Math.round(estimatedTimeSeconds)} sec`;
                      } else if (estimatedTimeSeconds < 3600) {
                        const minutes = Math.round(estimatedTimeSeconds / 60);
                        timeText = `${minutes} min`;
                      } else {
                        const hours = Math.floor(estimatedTimeSeconds / 3600);
                        const minutes = Math.round((estimatedTimeSeconds % 3600) / 60);
                        timeText = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
                      }
                      
                      return (
                        <div className="space-y-1">
                          <p className="text-white/90 text-[10px] font-semibold">
                            Distance: {distanceText}
                          </p>
                          <p className="text-white/80 text-[9px]">
                            Est. time: {timeText} (walking)
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <p className="text-white/70 text-[9px]">
                          Calculating distance...
                        </p>
                      );
                    }
                  })()}
                  {!trailCurrentLocation && (
                    <p className="text-white/70 text-[9px] mb-1">
                      Location not available
                    </p>
                  )}
                  <p className="text-white/80 text-[10px] mt-1">
                    Click mushrooms on the map to add them to your trail
                  </p>
                </div>
              )}
            </div>

            {/* Map Controls - Bottom Right (Zones and Trails) - Desktop Only */}
            <div className="hidden md:flex absolute bottom-6 right-6 z-20 flex-col gap-3">
              {/* Trails Button */}
              <button
                onClick={() => setShowTrailModal(true)}
                className={`px-4 py-3 rounded-2xl flex items-center gap-2 shadow-2xl transition-all active:scale-95 backdrop-blur-md border ${
                  trailMode
                    ? "bg-blue-700 hover:bg-blue-800 border-blue-600 text-white"
                    : "bg-blue-600/90 hover:bg-blue-700/90 border-blue-500 text-white"
                }`}
                aria-label="Trails"
                title="Trails"
              >
                <Navigation size={20} strokeWidth={3} />
                <span className="font-bold text-sm whitespace-nowrap">Trails</span>
              </button>
              
              {/* Save Trail Button (shown when in trail mode with mushrooms) */}
              {trailMode && trailMushrooms.length > 0 && (
                <button
                  onClick={handleSaveTrail}
                  className="px-4 py-3 rounded-2xl bg-green-600/90 hover:bg-green-700/90 text-white shadow-2xl transition-all active:scale-95 backdrop-blur-md border border-green-500 flex items-center gap-2"
                  aria-label="Save Trail"
                  title="Save Trail"
                >
                  <Save size={20} strokeWidth={3} />
                  <span className="font-bold text-sm whitespace-nowrap">Save Trail</span>
                </button>
              )}
              
              {/* End Trail Button (shown when in trail mode) */}
              {trailMode && (
                <button
                  onClick={handleEndTrail}
                  className="px-4 py-3 rounded-2xl bg-red-600/90 hover:bg-red-700/90 text-white shadow-2xl transition-all active:scale-95 backdrop-blur-md border border-red-500 flex items-center gap-2"
                  aria-label="End Trail"
                  title="End Trail"
                >
                  <X size={20} strokeWidth={3} />
                  <span className="font-bold text-sm whitespace-nowrap">End Trail</span>
                </button>
              )}
              
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
            onMushroomClick={(mushroom) => {
              setDetailMushroom(mushroom);
              setShowDetailModal(true);
            }}
          />
        )}

        {view === "leaderboard" && <Leaderboard />}
      </main>

      {/* MODALS */}
      <MobileSearchModal
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
        onSpeciesSearch={setSpeciesSearchTerm}
        onLocationSearch={handleZoneSelect}
      />

      <MushroomSubmissionForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleSubmissionSuccess}
        selectedLocation={selectedLocation}
        onLocationSelect={setSelectedLocation}
      />

      <MushroomDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setDetailMushroom(null);
        }}
        mushroom={detailMushroom}
      />

      <ZoneModal
        isOpen={showZoneModal}
        onClose={() => setShowZoneModal(false)}
        onZoneSelect={handleZoneSelect}
        onDrawingModeSelect={handleDrawingModeSelect}
      />

      <TrailModal
        isOpen={showTrailModal}
        onClose={() => setShowTrailModal(false)}
        onLocationSelect={handleTrailLocationSelect}
        onLoadTrail={handleLoadTrail}
      />

      <SaveTrailModal
        isOpen={showSaveTrailModal}
        onClose={() => setShowSaveTrailModal(false)}
        onSave={handleSaveTrailConfirm}
        mushroomCount={trailMushrooms.length}
      />

      {/* MOBILE FLOATING BUTTONS */}
      {view === "map" && (
        <div className="md:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          {/* Add Observation Button - Moved to top and made bigger */}
          {user && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-4 rounded-2xl flex items-center gap-2 shadow-2xl shadow-emerald-900/50 transition-all active:scale-95"
              aria-label="Add Observation"
            >
              <Plus size={24} strokeWidth={3} />
              <span className="font-bold text-base whitespace-nowrap">Add</span>
            </button>
          )}
          
          {/* Trails Button */}
          <button
            onClick={() => setShowTrailModal(true)}
            className={`px-4 py-3 rounded-2xl flex items-center gap-2 shadow-2xl transition-all active:scale-95 backdrop-blur-md border ${
              trailMode
                ? "bg-blue-700 hover:bg-blue-800 border-blue-600 text-white"
                : "bg-blue-600/90 hover:bg-blue-700/90 border-blue-500 text-white"
            }`}
            aria-label="Trails"
            title="Trails"
          >
            <Navigation size={20} strokeWidth={3} />
            <span className="font-bold text-sm whitespace-nowrap">Trails</span>
          </button>
          
          {/* End Trail Button (shown when in trail mode) */}
          {trailMode && (
            <button
              onClick={handleEndTrail}
              className="px-4 py-3 rounded-2xl bg-red-600/90 hover:bg-red-700/90 text-white shadow-2xl transition-all active:scale-95 backdrop-blur-md border border-red-500 flex items-center gap-2"
              aria-label="End Trail"
              title="End Trail"
            >
              <X size={20} strokeWidth={3} />
              <span className="font-bold text-sm whitespace-nowrap">End</span>
            </button>
          )}
          
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
      )}
    </div>
  );
}
