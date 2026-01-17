"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Menu, X, Home, Info, Users, FileText, Image, Calendar, FileCheck, Mail, User, Settings, Navigation, Heart, Layers, MapPin, CheckCircle, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import ExploreHeader from "@/components/ExploreHeader";
import MushroomGrid from "@/components/MushroomGrid";
import MushroomSubmissionForm from "@/components/MushroomSubmissionForm";
import MobileSearchModal from "@/components/MobileSearchModal";
import Leaderboard from "@/components/Leaderboard";
import ZoneModal from "@/components/ZoneModal";
import TrailModal from "@/components/TrailModal";
import SaveTrailModal from "@/components/SaveTrailModal";
import SaveZoneModal from "@/components/SaveZoneModal";
import MapFilter from "@/components/MapFilter";
import MushroomDetailModal from "@/components/MushroomDetailModal";
import { useAuth } from "@/context/AuthContext";
import { isPointInPolygon, calculateDistance } from "@/lib/geocoding";
import { saveTrail } from "@/lib/trailStorage";
import toast from "react-hot-toast";

const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="text-lg font-bold mb-2">Loading map...</div>
        <div className="text-sm text-gray-400">Please wait</div>
      </div>
    </div>
  ),
  onError: (error) => {
    console.error("❌ Error loading Map component:", error);
    return <div className="absolute inset-0 flex items-center justify-center bg-red-900 text-white">Failed to load map</div>;
  }
});

function MapPageContent() {
  const router = useRouter();
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
  const [view, setViewState] = useState("map");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchParams = useSearchParams();
  const [mapKey, setMapKey] = useState(0);

  // Sync mushroom detail state with URL parameter (handles browser back/forward)
  useEffect(() => {
    const mushroomId = searchParams.get("mushroom");
    
    if (mushroomId) {
      // If we have data loaded, find the mushroom
      if (allData.length > 0) {
        const foundMushroom = allData.find(m => (m._id || m.id) === mushroomId);
        if (foundMushroom) {
          setDetailMushroom(foundMushroom);
          setShowDetailModal(true);
        }
      }
    } else {
      // No mushroom param, close modal if open
      if (showDetailModal) {
        setShowDetailModal(false);
        setDetailMushroom(null);
      }
    }
  }, [searchParams, allData]);

  // Handle opening mushroom detail with URL update
  const handleOpenMushroomDetail = (mushroom) => {
    const mushroomId = mushroom._id || mushroom.id;
    if (mushroomId) {
      setDetailMushroom(mushroom);
      setShowDetailModal(true);
      
      // Update URL preserving other params
      const params = new URLSearchParams(window.location.search);
      params.set("mushroom", mushroomId);
      router.push(`/explore?${params.toString()}`, { scroll: false });
    }
  };

  // Handle closing mushroom detail with URL update
  const handleCloseMushroomDetail = () => {
    setShowDetailModal(false);
    setDetailMushroom(null);
    
    // Update URL removing mushroom param
    const params = new URLSearchParams(window.location.search);
    params.delete("mushroom");
    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  // Custom setView that increments mapKey when switching to map view
  const setView = useCallback((newView) => {
    console.log("🔄 setView called:", newView, "current view:", view);
    
    // Update state FIRST, before URL
    if (newView === "map") {
      // Always increment mapKey when switching to map view to force remount
      setMapKey(prev => {
        const newKey = prev + 1;
        console.log("🔑 Incrementing mapKey:", prev, "->", newKey);
        return newKey;
      });
      // Clear scientific name search when switching to map to avoid filtering the map
      setScientificNameSearchTerm("");
    }
    
    // Set view state immediately
    setViewState(newView);
    console.log("✅ View state set to:", newView);
    
    // Update URL using Next.js router (this shouldn't cause a re-render that resets state)
    const newUrl = `/explore?view=${newView}`;
    router.replace(newUrl, { scroll: false });
    console.log("🔗 URL updated via router to:", newUrl);
  }, [view, router]);

  // Handle URL parameters for view on initial load only
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    if (viewParam && ["map", "grid", "leaderboard"].includes(viewParam)) {
      console.log("🔄 Initial load from URL, setting view to:", viewParam);
      setViewState(viewParam);
      if (viewParam === "map") {
        setMapKey(1);
      }
    }
  }, []); // Only run once on mount
  
  // Sync view state with URL when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      const currentView = viewParam && ["map", "grid", "leaderboard"].includes(viewParam) ? viewParam : "map";
      if (currentView !== view) {
        console.log("🔄 PopState - updating view from", view, "to", currentView);
        setViewState(currentView);
        if (currentView === "map") {
          setMapKey(prev => prev + 1);
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [view]);

  // URL is now updated immediately in setView function, so this useEffect is not needed

  // Debug: Log view changes
  useEffect(() => {
    console.log("🔍 View changed to:", view, "mapKey:", mapKey);
    if (view === "map") {
      console.log("🗺️ Map view active - Map component should render");
    }
  }, [view, mapKey]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showTrailModal, setShowTrailModal] = useState(false);
  const [showSaveTrailModal, setShowSaveTrailModal] = useState(false);
  const [showSaveZoneModal, setShowSaveZoneModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [drawingMode, setDrawingMode] = useState(null);
  const [trailMode, setTrailMode] = useState(false);
  const [trailLocation, setTrailLocation] = useState(null);
  const [trailCurrentLocation, setTrailCurrentLocation] = useState(null);
  const [trailMushrooms, setTrailMushrooms] = useState([]);
  const [speciesSearchTerm, setSpeciesSearchTerm] = useState("");
  const [scientificNameSearchTerm, setScientificNameSearchTerm] = useState("");
  const getCurrentBoundaryRef = useRef(null);
  const prevFiltersRef = useRef({ speciesSearchTerm: "", scientificNameSearchTerm: "", hasZone: false });
  const lastAddedMushroomRef = useRef(null);
  const trailModeRef = useRef(false);
  
  // Keep trailModeRef in sync with trailMode state
  useEffect(() => {
    trailModeRef.current = trailMode;
  }, [trailMode]);

  useEffect(() => {
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
    // Also clear species search and zone selection
    setSpeciesSearchTerm("");
    setScientificNameSearchTerm("");
    setSelectedZone(null);
    // Force map to reset zoom by incrementing mapKey
    setMapKey(prev => prev + 1);
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

    // Apply species search filter (common name)
    if (speciesSearchTerm.trim()) {
      const searchLower = speciesSearchTerm.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const commonName = (item.commonName || item.name || "").toLowerCase();
        return commonName.includes(searchLower);
      });
    }

    // Apply scientific name search filter (from Grid)
    if (scientificNameSearchTerm.trim()) {
      const searchLower = scientificNameSearchTerm.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const commonName = (item.commonName || item.name || "").toLowerCase();
        const scientificName = (item.scientificName || "").toLowerCase();
        return commonName.includes(searchLower) || scientificName.includes(searchLower);
      });
    }

    // Apply header filters
    if (headerFilters.ecologicalRole.length > 0) {
      filtered = filtered.filter((item) => {
        const itemRoles = Array.isArray(item.ecologicalRole) 
          ? item.ecologicalRole 
          : [item.ecologicalRole].filter(Boolean);
        // Check if mushroom has ALL selected roles (AND logic)
        return headerFilters.ecologicalRole.every((role) => itemRoles.includes(role));
      });
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
        // Check if mushroom has ALL selected uses (AND logic)
        return headerFilters.commonUses.every((use) => itemUses.includes(use));
      });
    }

    // Apply legacy filters (for backward compatibility with existing filter UI)
    if (Object.keys(filters).length > 0 && mode === "category") {
      // Check if any filters are explicitly disabled (set to false)
      const hasDisabledFilters = Object.values(filters).some(val => val === false);
      
      // Only apply filtering if some filters are disabled
      // (If all are true, it's the default state - show everything)
      if (hasDisabledFilters) {
        filtered = filtered.filter((item) => {
          // Handle multiple ecological roles
          const roles = Array.isArray(item.ecologicalRole) 
            ? item.ecologicalRole 
            : [item.ecologicalRole || item.category].filter(Boolean);
          
          // Show mushroom if it has at least one role that's not disabled
          return roles.some(role => filters[role] !== false);
        });
      }
    } else if (Object.keys(filters).length > 0 && mode === "use") {
      filtered = filtered.filter((item) => {
        const key = item.commonUses?.[0] || item.use;
        return filters[key] !== false;
      });
    }

    setData(filtered);

    // Show toast notification for species searches (automated - not manual)
    const hasSpeciesSearch = speciesSearchTerm.trim().length > 0;
    const hasZone = selectedZone && selectedZone.boundary;
    const prevHasSpecies = prevFiltersRef.current.speciesSearchTerm.trim().length > 0;
    const prevHasZone = prevFiltersRef.current.hasZone;
    const prevCount = prevFiltersRef.current.count || 0;
    const speciesChanged = speciesSearchTerm.trim() !== prevFiltersRef.current.speciesSearchTerm.trim();

    // Don't show automatic toast - only manual search should trigger toast now
    // (Manual search is triggered by clicking search button or selecting suggestion)

    // Update previous filters ref
    prevFiltersRef.current = {
      speciesSearchTerm: speciesSearchTerm,
      scientificNameSearchTerm: scientificNameSearchTerm,
      hasZone: !!hasZone,
      count: filtered.length,
      zoneId: selectedZone?.boundary?.length || null,
    };
  }, [headerFilters, filters, mode, allData, selectedZone, speciesSearchTerm, scientificNameSearchTerm]);

  // Manual search handler - triggered by search button or suggestion click
  const handleManualSearch = (searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return;

    const searchLower = searchTerm.toLowerCase().trim();
    const hasZone = selectedZone && selectedZone.boundary;

    // Filter data based on search term
    let searchResults = allData.filter((item) => {
      const commonName = (item.commonName || item.name || "").toLowerCase();
      const scientificName = (item.scientificName || "").toLowerCase();
      return commonName.includes(searchLower) || scientificName.includes(searchLower);
    });

    // Apply zone filter if active
    if (hasZone) {
      searchResults = searchResults.filter((item) => {
        if (!item.latitude || !item.longitude) return false;
        return isPointInPolygon(item.latitude, item.longitude, selectedZone.boundary);
      });
    }

    const count = searchResults.length;

    if (hasZone) {
      // When both species and location are searched
      const locationName = selectedZone.name || "this location";
      if (count > 0) {
        toast.success(
          `Found ${searchTerm} (${count === 1 ? '1 observation' : `${count} observations`}) in ${locationName}`,
          { duration: 4000, icon: '🍄' }
        );
      } else {
        // Show suggestions when no results in location
        const suggestions = allData
          .filter(item => {
            const commonName = (item.commonName || item.name || "").toLowerCase();
            return commonName.includes(searchLower.substring(0, 3));
          })
          .slice(0, 3)
          .map(item => item.commonName || item.name)
          .filter((name, index, self) => self.indexOf(name) === index);
        
        const suggestionText = suggestions.length > 0 
          ? ` Try: ${suggestions.join(', ')}` 
          : '';
        
        toast.error(
          `No "${searchTerm}" found in ${locationName}.${suggestionText}`,
          { duration: 5000 }
        );
      }
    } else {
      // When only species is searched (no location filter)
      if (count > 0) {
        toast.success(
          `Found ${searchTerm} (${count === 1 ? '1 observation' : `${count} observations`})`,
          { duration: 3000, icon: '🍄' }
        );
      } else {
        // Show suggestions when no results found at all
        const suggestions = allData
          .filter(item => {
            const commonName = (item.commonName || item.name || "").toLowerCase();
            const searchPrefix = searchLower.substring(0, Math.min(3, searchLower.length));
            return searchPrefix.length > 0 && commonName.includes(searchPrefix);
          })
          .slice(0, 3)
          .map(item => item.commonName || item.name)
          .filter((name, index, self) => self.indexOf(name) === index);
        
        const suggestionText = suggestions.length > 0 
          ? ` Did you mean: ${suggestions.join(', ')}?` 
          : ' Try different keywords.';
        
        toast.error(
          `No "${searchTerm}" found.${suggestionText}`,
          { duration: 5000 }
        );
      }
    }
  };

  // Handle zone selection
  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    setDrawingMode(null);
  };

  // Handle manual location search - triggered by location search button
  const handleManualLocationSearch = () => {
    if (!selectedZone || !selectedZone.boundary) {
      toast.error("Please select a location first", { duration: 2500 });
      return;
    }

    // Count observations in this zone
    const observationsInZone = allData.filter((item) => {
      if (!item.latitude || !item.longitude) return false;
      return isPointInPolygon(item.latitude, item.longitude, selectedZone.boundary);
    });
    
    const count = observationsInZone.length;
    const locationName = selectedZone.name || "this location";
    
    if (count > 0) {
      toast.success(
        `Found ${count === 1 ? '1 observation' : `${count} observations`} in ${locationName}`,
        { duration: 3500, icon: '📍' }
      );
    } else {
      toast.error(
        `No observations found in ${locationName}`,
        { duration: 3500 }
      );
    }
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

  // Handle adding mushroom to trail (ADD ONLY - no toggle/remove)
  const handleTrailMushroomAdd = (mushroom) => {
    // Early return if not in trail mode - don't process at all
    if (!trailMode) {
      return;
    }
    
    // Prevent rapid duplicate clicks
    const now = Date.now();
    if (handleTrailMushroomAdd.lastClick && (now - handleTrailMushroomAdd.lastClick) < 300) {
      return; // Ignore clicks within 300ms
    }
    handleTrailMushroomAdd.lastClick = now;
    
    // Normalize mushroom data for consistent comparison
    const normalizeMushroom = (m) => {
      const id = m._id || m.id;
      const lat = Number(m.latitude || m.location?.latitude);
      const lng = Number(m.longitude || m.location?.longitude);
      return { id, lat, lng };
    };
    
    const normalizedMushroom = normalizeMushroom(mushroom);
    
    // Validate coordinates
    if (isNaN(normalizedMushroom.lat) || isNaN(normalizedMushroom.lng) || 
        !isFinite(normalizedMushroom.lat) || !isFinite(normalizedMushroom.lng)) {
      console.warn("Invalid mushroom coordinates:", mushroom);
      return;
    }
    
    // Helper function to check if two mushrooms are the same (by ID only)
    const isSameMushroom = (m1, m2) => {
      const n1 = normalizeMushroom(m1);
      const n2 = normalizeMushroom(m2);
      
      // Only match by ID - both mushrooms must have IDs and they must match exactly
      if (n1.id && n2.id) {
        const id1 = String(n1.id).trim();
        const id2 = String(n2.id).trim();
        return id1 === id2 && id1 !== '' && id2 !== '';
      }
      
      return false;
    };
    
    // Create a unique key for this mushroom
    const mushroomKey = normalizedMushroom.id || `${normalizedMushroom.lat.toFixed(6)},${normalizedMushroom.lng.toFixed(6)}`;
    
    // Check if we just processed this mushroom
    if (lastAddedMushroomRef.current === mushroomKey) {
      return;
    }
    
    // Use functional update to ensure we're working with latest state
    let wasAdded = false;
    let wasAlreadyInTrail = false;
    
    setTrailMushrooms((prev) => {
      // Deduplicate trail first
      const uniqueTrail = [];
      const seenIds = new Set();
      for (const m of prev) {
        const n = normalizeMushroom(m);
        if (n.id) {
          const idStr = String(n.id).trim();
          if (!seenIds.has(idStr)) {
            seenIds.add(idStr);
            uniqueTrail.push(m);
          }
        } else {
          uniqueTrail.push(m);
        }
      }
      
      // Check if mushroom is already in trail
      const existingIndex = uniqueTrail.findIndex((m) => isSameMushroom(m, mushroom));
      
      if (existingIndex >= 0) {
        // Mushroom is already in trail - do nothing
        wasAlreadyInTrail = true;
        return uniqueTrail; // Return unchanged trail
      } else {
        // Mushroom is not in trail - add it
        wasAdded = true;
        return [...uniqueTrail, mushroom];
      }
    });
    
    // Show toast outside of setState callback to prevent render warnings
    lastAddedMushroomRef.current = mushroomKey;
    setTimeout(() => {
      if (trailModeRef.current) {
        if (wasAlreadyInTrail) {
          toast("Mushroom already in trail", { 
            id: `mushroom-already-${mushroomKey}`,
            icon: "ℹ️",
            duration: 2000
          });
        } else if (wasAdded) {
          toast.success("Mushroom added to trail", { id: `mushroom-${mushroomKey}` });
        }
      }
      setTimeout(() => {
        lastAddedMushroomRef.current = null;
      }, 500);
    }, 0);
  };

  // Handle removing mushroom from trail
  const handleTrailMushroomRemove = (mushroomId) => {
    if (!mushroomId) return;
    
    const currentTrail = trailMushrooms;
    const filtered = currentTrail.filter((m) => {
      const mId = m._id || m.id;
      return mId && String(mId).trim() !== String(mushroomId).trim();
    });
    
    const wasRemoved = filtered.length < currentTrail.length;
    
    if (wasRemoved) {
      setTrailMushrooms(filtered);
      // Show toast outside of setState to prevent render warnings
      setTimeout(() => {
        toast.success("Mushroom removed from trail");
      }, 0);
    }
  };

  // Handle loading a saved trail
  const handleLoadTrail = (trail) => {
    if (!trail || !trail.mushrooms || trail.mushrooms.length === 0) {
      toast.error("Trail has no mushrooms to load");
      return;
    }

    // Calculate bounds from all mushrooms in the trail for zooming
    const validMushrooms = trail.mushrooms.filter(m => {
      const lat = m.latitude || m.location?.latitude;
      const lng = m.longitude || m.location?.longitude;
      return lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng));
    });

    if (validMushrooms.length === 0) {
      toast.error("Trail mushrooms have no valid coordinates");
      return;
    }

    // Calculate center from mushrooms (for display only, no boundary needed)
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    validMushrooms.forEach(m => {
      const lat = Number(m.latitude || m.location?.latitude);
      const lng = Number(m.longitude || m.location?.longitude);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });

    // Calculate center from bounds
    const center = {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    };

    // Try to get current location (optional)
    if (navigator.geolocation) {
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
            center: center,
            boundary: null,
          });

          // Set selectedZone without boundary - Map component will zoom to mushrooms directly
          setSelectedZone({
            type: "trail",
            center: center,
            boundary: null,
            trailMushrooms: trail.mushrooms, // Pass mushrooms for zoom calculation
          });

          toast.success(`Loaded trail "${trail.name}" with ${trail.mushrooms.length} mushrooms`, { id: 'loading-trail' });
        },
        (err) => {
          // Location access denied or failed - continue without location
          setTrailCurrentLocation(null);
          setTrailMushrooms(trail.mushrooms);
          setTrailMode(true);
          setTrailLocation({
            type: "trail",
            currentLocation: null,
            center: center,
            boundary: null,
          });

          // Set selectedZone without boundary - Map component will zoom to mushrooms directly
          setSelectedZone({
            type: "trail",
            center: center,
            boundary: null,
            trailMushrooms: trail.mushrooms, // Pass mushrooms for zoom calculation
          });

          toast.success(`Loaded trail "${trail.name}" with ${trail.mushrooms.length} mushrooms`, { id: 'loading-trail' });
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000,
        }
      );
    } else {
      // Geolocation not supported - continue without location
      setTrailCurrentLocation(null);
      setTrailMushrooms(trail.mushrooms);
      setTrailMode(true);
      setTrailLocation({
        type: "trail",
        currentLocation: null,
        center: center,
        boundary: null,
      });

      // Set selectedZone without boundary - Map component will zoom to mushrooms directly
      setSelectedZone({
        type: "trail",
        center: center,
        boundary: null,
        trailMushrooms: trail.mushrooms, // Pass mushrooms for zoom calculation
      });

      toast.success(`Loaded trail "${trail.name}" with ${trail.mushrooms.length} mushrooms`);
    }
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
  const handleSaveTrailConfirm = async (trailName) => {
    const trailData = {
      name: trailName,
      location: trailLocation,
      mushrooms: trailMushrooms,
      createdAt: new Date().toISOString(),
    };

    try {
      const trailId = await saveTrail(trailData);
      if (trailId) {
        toast.success(`Trail "${trailName}" saved successfully!`);
      } else {
        toast.error("Failed to save trail. Please try again.");
      }
    } catch (error) {
      console.error('Error saving trail:', error);
      toast.error("Failed to save trail. Please try again.");
    }
  };

  // Handle starting trail to a specific mushroom
  const handleStartTrailToMushroom = (mushroom) => {
    // Get mushroom location for center
    const mushroomLat = mushroom.latitude || mushroom.location?.latitude;
    const mushroomLng = mushroom.longitude || mushroom.location?.longitude;
    const center = mushroomLat && mushroomLng ? { lat: Number(mushroomLat), lng: Number(mushroomLng) } : null;

    // Try to get current location (optional)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLoc = {
            lat: Number(latitude),
            lng: Number(longitude),
          };

          setTrailCurrentLocation(currentLoc);
          setTrailMushrooms([mushroom]);
          setTrailMode(true);
          setTrailLocation({
            type: "trail",
            currentLocation: currentLoc,
            center: center || currentLoc,
            boundary: null,
          });

          setSelectedZone({
            type: "trail",
            center: center || currentLoc,
            boundary: null,
          });

          toast.success(`Trail started to "${mushroom.name || mushroom.commonName || 'mushroom'}"!`, { id: 'starting-trail' });
        },
        (err) => {
          // Location access denied or failed - continue without location
          setTrailCurrentLocation(null);
          setTrailMushrooms([mushroom]);
          setTrailMode(true);
          setTrailLocation({
            type: "trail",
            currentLocation: null,
            center: center,
            boundary: null,
          });

          if (center) {
            setSelectedZone({
              type: "trail",
              center: center,
              boundary: null,
            });
          }

          toast.success(`Trail started to "${mushroom.name || mushroom.commonName || 'mushroom'}"!`, { id: 'starting-trail' });
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000,
        }
      );
    } else {
      // Geolocation not supported - continue without location
      setTrailCurrentLocation(null);
      setTrailMushrooms([mushroom]);
      setTrailMode(true);
      setTrailLocation({
        type: "trail",
        currentLocation: null,
        center: center,
        boundary: null,
      });

      if (center) {
        setSelectedZone({
          type: "trail",
          center: center,
          boundary: null,
        });
      }

      toast.success(`Trail started to "${mushroom.name || mushroom.commonName || 'mushroom'}"!`);
    }
  };

  // Handle ending trail mode
  const handleEndTrail = () => {
    // Reset all trail-related state without reloading
    setTrailMode(false);
    trailModeRef.current = false;
    setTrailLocation(null);
    setTrailCurrentLocation(null);
    setTrailMushrooms([]);
    setSelectedZone(null);
    lastAddedMushroomRef.current = null;
    
    toast.success("Trail mode ended", { id: 'trail-ended' });
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

  // Handle saving the zone
  const handleSaveZone = async (zoneData) => {
    try {
      const response = await fetch("/api/zones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(zoneData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save zone");
      }

      toast.success("Zone saved successfully!");
      setShowSaveZoneModal(false);
    } catch (error) {
      console.error("Error saving zone:", error);
      toast.error(error.message || "Failed to save zone");
    }
  };

  // Handle drawing cancellation
  const handleDrawingCancel = () => {
    window.location.reload();
  };

  // Handle clearing the current drawing (reset but keep drawing mode active)
  const handleClearDrawing = () => {
    // Clear the drawing source data immediately if clear function is available
    if (getCurrentBoundaryRef.current && getCurrentBoundaryRef.current.clear) {
      getCurrentBoundaryRef.current.clear();
    }
    
    // Reset the drawing mode to trigger a fresh start
    // We'll set it to null first, then back to the current mode to reset state
    const currentMode = drawingMode;
    setDrawingMode(null);
    
    // Use setTimeout to ensure cleanup happens before re-initializing
    setTimeout(() => {
      if (currentMode) {
        setDrawingMode(currentMode);
      }
    }, 50);
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

  // Handle zones button click with authentication check
  const handleZonesClick = () => {
    if (!user) {
      toast.error("Please login to explore");
      return;
    }
    setShowZoneModal(true);
  };

  // Handle trails button click with authentication check
  const handleTrailsClick = () => {
    if (!user) {
      toast.error("Please login to explore");
      return;
    }
    setShowTrailModal(true);
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
        onZonesClick={handleZonesClick}
        onTrailsClick={handleTrailsClick}
        onSpeciesSearch={setSpeciesSearchTerm}
        onLocationSearch={handleZoneSelect}
        allData={allData}
        onManualSearch={handleManualSearch}
        onManualLocationSearch={handleManualLocationSearch}
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
      <main className="flex-1 relative overflow-hidden" style={{ minHeight: "400px" }}>
        {view === "map" ? (
          <div key={`map-container-${mapKey}`} className="absolute inset-0 w-full h-full">
            <Map
              key={`map-${mapKey}`} 
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
                  onStartTrail={user?.role === "admin" ? handleStartTrailToMushroom : undefined}
                  onMushroomClick={(mushroom) => {
                    if (trailMode) {
                      handleTrailMushroomAdd(mushroom);
                    } else {
                      handleOpenMushroomDetail(mushroom);
                    }
                  }}
                />

                {/* Map Controls - Top Left */}
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-3 pointer-events-none">
                  {/* Filter Button */}
                  <div className="pointer-events-auto">
                    <MapFilter
                      onFilterToggle={handleHeaderFilterToggle}
                      onResetFilters={handleResetFilters}
                      selectedFilters={headerFilters}
                    />

                    
                  </div>
                  
                  {/* Drawing Controls (shown when in drawing mode) */}
                  {drawingMode && (
                    <div className="flex flex-col gap-2 pointer-events-auto">
                      <button
                        onClick={handleApplyZone}
                        className="px-4 py-3 rounded-2xl bg-emerald-600/90 hover:bg-emerald-700/90 backdrop-blur-md border border-emerald-500 text-white shadow-2xl transition-all duration-300 hover:shadow-emerald-500/50 flex items-center gap-2 font-bold text-sm"
                      >
                        <CheckCircle size={18} className="shrink-0" />
                        Apply Zone
                      </button>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => {
                            const currentZone = getCurrentBoundaryRef.current?.();
                            if (currentZone && currentZone.boundary) {
                              setShowSaveZoneModal(true);
                            } else {
                              toast.error("Please draw a zone first");
                            }
                          }}
                          className="px-4 py-3 rounded-2xl bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-md border border-blue-500 text-white shadow-2xl transition-all duration-300 hover:shadow-blue-500/50 flex items-center gap-2 font-bold text-sm"
                          title="Save zone"
                        >
                          <Save size={18} className="shrink-0" />
                          Save Zone
                        </button>
                      )}
                      <button
                        onClick={handleClearDrawing}
                        className="px-4 py-3 rounded-2xl bg-red-600/90 hover:bg-red-700/90 backdrop-blur-md border border-red-500 text-white shadow-2xl transition-all duration-300 hover:shadow-red-500/50 flex items-center gap-2 font-bold text-sm"
                        title="Clear current drawing"
                      >
                        <Trash2 size={18} className="shrink-0" />
                        Clear
                      </button>
                      <button
                        onClick={handleDrawingCancel}
                        className="px-4 py-3 rounded-2xl bg-gray-600/90 hover:bg-gray-700/90 backdrop-blur-md border border-gray-500 text-white shadow-2xl transition-all duration-300 hover:shadow-gray-500/50 flex items-center gap-2 font-bold text-sm"
                        title="Cancel drawing"
                      >
                        <X size={18} className="shrink-0" />
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {/* Zone filter indicator and clear button */}
                  {selectedZone && !drawingMode && !trailMode && (
                    <div className="p-3 rounded-2xl bg-emerald-600/90 backdrop-blur-md border border-emerald-500 shadow-2xl flex items-center gap-3 pointer-events-auto">
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
                    <div className="p-3 rounded-2xl bg-blue-600/90 backdrop-blur-md border border-blue-500 shadow-2xl pointer-events-auto max-w-[200px] md:max-w-xs">
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
                            <div className="space-y-1 mb-2">
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
                            <p className="text-white/70 text-[9px] mb-2">
                              Calculating distance...
                            </p>
                          );
                        }
                      })()}
                      {!trailCurrentLocation && (
                        <p className="text-white/70 text-[9px] mb-2">
                          Location not available
                        </p>
                      )}
                      
                      {/* Trail Mushrooms List with Remove Buttons */}
                      {trailMushrooms.length > 0 && (
                        <div className="mt-2 mb-2 border-t border-blue-500/50 pt-2">
                          <p className="text-white/90 text-[10px] font-semibold mb-2">Trail Mushrooms:</p>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {trailMushrooms.map((mushroom, index) => {
                              const mushroomId = mushroom._id || mushroom.id;
                              const mushroomName = mushroom.commonName || mushroom.name || `Mushroom ${index + 1}`;
                              return (
                                <div 
                                  key={mushroomId || index} 
                                  className="flex items-center justify-between gap-2 p-1.5 bg-blue-700/50 rounded-lg hover:bg-blue-700/70 transition-colors"
                                >
                                  <span className="text-white text-[9px] flex-1 truncate" title={mushroomName}>
                                    {index + 1}. {mushroomName}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTrailMushroomRemove(mushroomId);
                                    }}
                                    className="p-1 text-white/80 hover:text-white hover:bg-red-600/50 rounded transition-colors flex-shrink-0"
                                    title="Remove from trail"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-white/80 text-[10px] mt-1">
                        Click mushrooms on the map to add them to your trail
                      </p>

                      <div className="mt-3 flex gap-2">
                        {user?.role === "admin" && trailMushrooms.length > 0 && (
                          <button
                            onClick={handleSaveTrail}
                            className="flex-1 px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1.5 shadow-lg"
                            title="Save Trail"
                          >
                            <Save size={12} strokeWidth={2.5} />
                            SAVE
                          </button>
                        )}
                        <button
                          onClick={handleEndTrail}
                          className="flex-1 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1.5 shadow-lg"
                          title="End Trail"
                        >
                          <X size={12} strokeWidth={3} />
                          END
                        </button>
                      </div>
                    </div>
                  )}
                </div>

          </div>
        ) : null}

        {view === "grid" && (
          <MushroomGrid
            data={data}
            onMushroomClick={handleOpenMushroomDetail}
            onScientificNameSearch={setScientificNameSearchTerm}
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
        allData={allData}
        onManualSearch={handleManualSearch}
        onManualLocationSearch={handleManualLocationSearch}
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
        onClose={handleCloseMushroomDetail}
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

      <SaveZoneModal
        isOpen={showSaveZoneModal}
        onClose={() => setShowSaveZoneModal(false)}
        onSave={handleSaveZone}
        zoneData={selectedZone || (getCurrentBoundaryRef.current?.() || null)}
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
            onClick={handleTrailsClick}
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
          
          {/* Save Trail Button (shown when in trail mode with mushrooms - admin only) */}
          {trailMode && trailMushrooms.length > 0 && user?.role === "admin" && (
            <button
              onClick={handleSaveTrail}
              className="px-4 py-3 rounded-2xl bg-green-600/90 hover:bg-green-700/90 text-white shadow-2xl transition-all active:scale-95 backdrop-blur-md border border-green-500 flex items-center gap-2"
              aria-label="Save Trail"
              title="Save Trail"
            >
              <Save size={20} strokeWidth={3} />
              <span className="font-bold text-sm whitespace-nowrap">Save</span>
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
              <span className="font-bold text-sm whitespace-nowrap">End</span>
            </button>
          )}
          
          {/* Zones Button */}
          <button
            onClick={handleZonesClick}
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

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Loading explorer...</div>
        </div>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  );
}
