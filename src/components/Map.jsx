"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";
import { generateCircleBoundary, generateRectangleBoundary } from "@/lib/geocoding";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export default function Map(props) {
  console.log("🗺️ Map component rendering with props:", { 
    hasData: !!props?.data, 
    dataLength: props?.data?.length || 0,
    view: "map"
  });
  
  // Destructure with defaults to handle undefined props
  const {
    data,
    filters = {},
    mode,
    onMarkerSelect,
    onMushroomClick, // Alias for onMarkerSelect for compatibility
    selectedZone,
    drawingMode,
    onDrawingComplete,
    onDrawingCancel,
    onGetCurrentBoundary,
    trailMode = false,
    trailMushrooms = [],
    trailCurrentLocation = null,
    onTrailMushroomAdd,
    onStartTrail,
  } = props || {};
  
  // Debug: Log when drawingMode prop changes
  useEffect(() => {
    console.log("🎨 Map component received drawingMode prop:", drawingMode);
  }, [drawingMode]);
  
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];
  // Use onMushroomClick if provided, otherwise fall back to onMarkerSelect
  const handleMarkerSelect = onMushroomClick || onMarkerSelect;
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const userLocationMarkerRef = useRef(null);
  const resizeHandlesRef = useRef([]);
  const drawingStateRef = useRef({
    isDrawing: false,
    isMoving: false,
    isResizing: false,
    startPoint: null,
    currentShape: null,
    currentCenter: null,
    currentSize: null,
    dragStart: null,
    initialCenter: null,
    initialSize: null,
    activeHandle: null,
    polygonPoints: [], // For polygon drawing mode
    polygonEditMode: false, // True after double-click, allows resizing vertices
    activeVertexIndex: undefined, // Index of vertex being dragged
  });

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(null);

  const isTokenMissing = useMemo(() => !MAPBOX_TOKEN, []);

  /* ---------------- FILTER ---------------- */
  // Data is now pre-filtered at the page level, so we show all items passed here
  const isItemActive = (item) => {
    return true; // All items in data array are already filtered
  };

  /* ---------------- MAP INIT ---------------- */
  useEffect(() => {
    console.log("🗺️ Map init useEffect running", { 
      isTokenMissing, 
      hasMapRef: !!mapRef.current, 
      hasContainer: !!mapContainerRef.current 
    });
    
    // Always clean up any existing map instance first
    if (mapRef.current) {
      console.log("🗑️ Cleaning up existing map instance");
      try {
        popupRef.current?.remove();
        popupRef.current = null;
        userLocationMarkerRef.current?.remove();
        userLocationMarkerRef.current = null;
        const existingMap = mapRef.current;
        existingMap.remove();
        mapRef.current = null;
        setMapLoaded(false);
        setMapError(null);
      } catch (e) {
        console.error("Error removing existing map:", e);
        mapRef.current = null;
      }
    }
    
    if (isTokenMissing || !mapContainerRef.current) {
      console.log("⏸️ Map init skipped:", { isTokenMissing, hasContainer: !!mapContainerRef.current });
      return;
    }
    
    console.log("✅ Initializing new map instance");

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [80.5, 23.0],
      zoom: 4.2,
       projection: "mercator", // 👈 THIS LINE
       minZoom: 2.5,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const handleZoomChange = () => {
      setCurrentZoom(map.getZoom());
    };

    map.on("load", () => {
      setMapLoaded(true);
      map.resize();
      setCurrentZoom(map.getZoom());
    });

    map.on("error", (e) => {
      setMapError(e?.error?.message || "Map failed to load");
    });

    // Track zoom changes for grid recalculation (use zoomend for better performance)
    map.on("zoomend", handleZoomChange);
    map.on("moveend", handleZoomChange); // Also update on pan in case bounds change significantly

    mapRef.current = map;

    return () => {
      console.log("🧹 Map cleanup running - removing map instance");
      popupRef.current?.remove();
      popupRef.current = null;
      userLocationMarkerRef.current?.remove();
      userLocationMarkerRef.current = null;
      if (map) {
        map.off("zoomend", handleZoomChange);
        map.off("moveend", handleZoomChange);
        map.remove();
      }
      mapRef.current = null;
      setMapLoaded(false);
      setMapError(null);
    };
  }, [isTokenMissing]);

  /* ---------------- DATA + LAYERS ---------------- */
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !mapRef.current.isStyleLoaded()) return;

    const map = mapRef.current;

    const features = safeData
      .filter((d) => d && d.latitude && d.longitude && isItemActive(d))
      .map((d) => ({
        type: "Feature",
        properties: d,
        geometry: {
          type: "Point",
          coordinates: [Number(d.longitude), Number(d.latitude)],
        },
      }));

    const geojson = {
      type: "FeatureCollection",
      features,
    };

    if (!map.getSource("mushrooms")) {
      map.addSource("mushrooms", { type: "geojson", data: geojson });
    } else {
      map.getSource("mushrooms").setData(geojson);
    }

    // Helper function to create grid-based heatmap
    const createGridHeatmap = (features, zoom) => {
      if (!features || features.length === 0) {
        return {
          type: "FeatureCollection",
          features: [],
        };
      }

      // Default zoom if not provided
      const currentZoomLevel = zoom !== null && zoom !== undefined ? zoom : 4;

      // Grid size based on zoom level - smaller cells at higher zoom
      // Grid continues dividing until zoom 9 when individual icons appear
      let gridSize;
      if (currentZoomLevel < 3) {
        gridSize = 2.0; // ~220km per cell
      } else if (currentZoomLevel < 5) {
        gridSize = 0.5; // ~55km per cell
      } else if (currentZoomLevel < 6) {
        gridSize = 0.2; // ~22km per cell
      } else if (currentZoomLevel < 7) {
        gridSize = 0.1; // ~11km per cell
      } else if (currentZoomLevel < 8) {
        gridSize = 0.05; // ~5.5km per cell
      } else if (currentZoomLevel < 9) {
        gridSize = 0.02; // ~2.2km per cell
      } else {
        gridSize = 0.01; // ~1.1km per cell (for zoom 9+, though icons will show)
      }

      // Create an object to store counts per grid cell (using object instead of Map to avoid naming conflict)
      const gridMap = {};

      // Count features in each grid cell
      features.forEach((feature) => {
        // Validate feature has valid geometry and coordinates
        if (!feature || !feature.geometry || !feature.geometry.coordinates) {
          return; // Skip invalid features
        }
        
        const coordinates = feature.geometry.coordinates;
        if (!Array.isArray(coordinates) || coordinates.length < 2) {
          return; // Skip invalid coordinates
        }
        
        const [lng, lat] = coordinates;
        
        // Validate coordinates are numbers
        if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
          return; // Skip invalid coordinates
        }
        
        // Calculate grid cell coordinates
        const gridX = Math.floor(lng / gridSize);
        const gridY = Math.floor(lat / gridSize);
        const cellKey = `${gridX}_${gridY}`;

        if (!gridMap[cellKey]) {
          gridMap[cellKey] = {
            count: 0,
            gridX,
            gridY,
          };
        }
        gridMap[cellKey].count++;
      });

      // Create polygon features for each grid cell (only include cells with data)
      const gridFeatures = Object.entries(gridMap)
        .filter(([key, data]) => data.count > 0) // Only include cells with mushrooms
        .map(([key, data]) => {
          const { count, gridX, gridY } = data;
          
          // Create square polygon for this grid cell
          const minLng = gridX * gridSize;
          const maxLng = (gridX + 1) * gridSize;
          const minLat = gridY * gridSize;
          const maxLat = (gridY + 1) * gridSize;

          return {
            type: "Feature",
            properties: {
              count,
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [minLng, minLat],
                [maxLng, minLat],
                [maxLng, maxLat],
                [minLng, maxLat],
                [minLng, minLat],
              ]],
            },
          };
        });

      return {
        type: "FeatureCollection",
        features: gridFeatures,
      };
    };

    // Create grid heatmap data
    // Safely get zoom - map.getZoom() might not be available if map isn't fully initialized
    let zoomLevel = currentZoom;
    if (zoomLevel === null || zoomLevel === undefined) {
      try {
        zoomLevel = map.getZoom();
      } catch (e) {
        zoomLevel = 4; // Default zoom
      }
    }
    const gridHeatmapData = createGridHeatmap(features, zoomLevel);

    // Add or update grid heatmap source
    if (!map.getSource("mushroom-grid-heat")) {
      map.addSource("mushroom-grid-heat", {
        type: "geojson",
        data: gridHeatmapData,
      });
    } else {
      map.getSource("mushroom-grid-heat").setData(gridHeatmapData);
    }

    // Add grid heatmap layer (show until zoom 9 when icons appear)
    if (!map.getLayer("mushroom-grid-heat")) {
      map.addLayer({
        id: "mushroom-grid-heat",
        type: "fill",
        source: "mushroom-grid-heat",
        maxzoom: 8.9,
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "count"],
            0,
            "rgba(0,0,0,0)",
            1,
            "#a7f3d0",
            5,
            "#34d399",
            10,
            "#10b981",
            20,
            "#059669",
            50,
            "#064e3b",
          ],
          "fill-opacity": [
            "interpolate",
            ["linear"],
            ["get", "count"],
            0,
            0,
            1,
            0.3,
            5,
            0.5,
            10,
            0.7,
            20,
            0.85,
          ],
        },
      });

      // Add grid outline for better visibility
      if (!map.getLayer("mushroom-grid-heat-outline")) {
        map.addLayer({
          id: "mushroom-grid-heat-outline",
          type: "line",
          source: "mushroom-grid-heat",
          maxzoom: 8.9,
          paint: {
            "line-color": "#10b981",
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              2,
              0.5,
              4,
              1,
              6,
              1.5,
              8,
              2,
            ],
            "line-opacity": 0.3,
          },
        });
      }
    }

    // Load mushroom icon if not already loaded
    if (!map.hasImage("mushroom-icon")) {
      map.loadImage("/icons/icon1.png", (err, img) => {
        if (!err && img && !map.hasImage("mushroom-icon")) {
          map.addImage("mushroom-icon", img);
        }
      });
    }

    // Remove existing layer if it exists (to update minzoom)
    if (map.getLayer("mushroom-points")) {
      map.removeLayer("mushroom-points");
    }
    
    // Create layer with higher minzoom (9) so icons only appear when zoomed in more
    // Previously was 6, now requires zoom level 9 or higher
    if (map.hasImage("mushroom-icon")) {
      map.addLayer({
        id: "mushroom-points",
        type: "symbol",
        source: "mushrooms",
        minzoom: 9,
        layout: {
          "icon-image": "mushroom-icon",
          "icon-size": 0.04,
          "icon-allow-overlap": true,
        },
      });
    }

    /* ---------------- ZONE BOUNDARY ---------------- */
    // Handle zone boundary - separate from data/filters updates
    if (selectedZone && selectedZone.boundary && selectedZone.boundary.length > 0) {
      const zoneGeoJSON = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [selectedZone.boundary],
            },
          },
        ],
      };

      if (map.getSource("zone")) {
        // Update existing zone source data
        map.getSource("zone").setData(zoneGeoJSON);
      } else {
        // Add zone source and layers if they don't exist
        map.addSource("zone", {
          type: "geojson",
          data: zoneGeoJSON,
        });

        // Add fill layer
        if (!map.getLayer("zone-fill")) {
          map.addLayer({
            id: "zone-fill",
            type: "fill",
            source: "zone",
            paint: {
              "fill-color": "#10b981",
              "fill-opacity": 0.1,
            },
          });
        }

        // Add boundary line
        if (!map.getLayer("zone-boundary")) {
          map.addLayer({
            id: "zone-boundary",
            type: "line",
            source: "zone",
            paint: {
              "line-color": "#10b981",
              "line-width": 3,
              "line-opacity": 0.8,
            },
          });
        }
      }

      // Auto-zoom for city boundaries, trail locations, and saved zones
      // Saved zones have types: rectangle, circle, polygon
      const shouldZoom = (selectedZone.type === "city" || 
                         selectedZone.type === "trail" || 
                         selectedZone.type === "rectangle" || 
                         selectedZone.type === "circle" || 
                         selectedZone.type === "polygon");
      
      if (shouldZoom && selectedZone.boundary) {
        const coordinates = selectedZone.boundary;
        const bounds = coordinates.reduce(
          (bounds, coord) => {
            return [
              [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
              [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
            ];
          },
          [
            [coordinates[0][0], coordinates[0][1]],
            [coordinates[0][0], coordinates[0][1]],
          ]
        );

        // Use center from selectedZone if available, otherwise calculate from bounds
        let centerLng, centerLat;
        if (selectedZone.center) {
          centerLng = selectedZone.center.lng;
          centerLat = selectedZone.center.lat;
        } else {
          // Calculate center of bounds as fallback
          centerLng = (bounds[0][0] + bounds[1][0]) / 2;
          centerLat = (bounds[0][1] + bounds[1][1]) / 2;
        }

        // For trail mode, ensure we zoom to at least level 9 so mushrooms are visible
        if (trailMode) {
          // Use fitBounds with minZoom option if the calculated zoom would be less than 9
          // First, let's try to fit bounds and then adjust if needed
          map.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            duration: 1000,
            maxZoom: 15,
          });
          
          // After animation completes, check and adjust zoom if needed
          const checkZoom = () => {
            const currentZoom = map.getZoom();
            if (currentZoom < 9) {
              // Zoom to level 9 centered on the city center (use the actual city center)
              map.flyTo({
                center: [centerLng, centerLat],
                zoom: 9,
                duration: 500,
              });
            }
          };
          
          // Use both moveend and a timeout as fallback
          map.once('moveend', checkZoom);
          setTimeout(checkZoom, 1200); // Fallback after animation should complete
        } else {
          map.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            duration: 1000,
          });
        }
      } else if (selectedZone.type === "trail" && selectedZone.center && !selectedZone.boundary) {
        // Handle trail with current location (no boundary, just center)
        const center = selectedZone.center;
        if (trailMode) {
          // Zoom to current location at level 9
          map.flyTo({
            center: [center.lng, center.lat],
            zoom: 9,
            duration: 1000,
          });
        }
      }
    } else {
      // Remove zone if not selected
      try {
        const zoneSource = map.getSource("zone");
        if (zoneSource) {
          // Clear source data first to make shape disappear immediately
          zoneSource.setData({
            type: "FeatureCollection",
            features: [],
          });
        }
        // Remove layers first (must be done before removing source)
        if (map.getLayer("zone-boundary")) {
          map.removeLayer("zone-boundary");
        }
        if (map.getLayer("zone-fill")) {
          map.removeLayer("zone-fill");
        }
        // Remove source after layers are removed
        if (map.getSource("zone")) {
          map.removeSource("zone");
        }
      } catch (error) {
        // If error occurs, try to force remove layers
        console.error("Error removing zone:", error);
        try {
          if (map.getLayer("zone-boundary")) {
            map.removeLayer("zone-boundary");
          }
          if (map.getLayer("zone-fill")) {
            map.removeLayer("zone-fill");
          }
          if (map.getSource("zone")) {
            map.removeSource("zone");
          }
        } catch (e) {
          console.error("Error force removing zone:", e);
        }
      }
    }

    /* ---------------- TRAIL LAYER ---------------- */
    // Helper function to create curved line between points using quadratic Bezier curve
    const createCurvedLine = (points) => {
      if (points.length < 2) return [];
      
      const curvedPoints = [];
      
      // Add first point
      curvedPoints.push(points[0]);
      
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        
        // Calculate midpoint
        const midLat = (p1[1] + p2[1]) / 2;
        const midLng = (p1[0] + p2[0]) / 2;
        
        // Calculate distance in degrees (approximate)
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Create a control point offset perpendicular to the line
        // This creates a natural curve
        const curveAmount = Math.min(distance * 0.4, 0.01); // Limit curve amount
        
        // Perpendicular vector (rotate 90 degrees)
        const perpX = -dy / distance;
        const perpY = dx / distance;
        
        // Control point (midpoint offset perpendicularly)
        const controlLat = midLat + perpY * curveAmount;
        const controlLng = midLng + perpX * curveAmount;
        
        // Generate points along the quadratic Bezier curve
        // Use more points for smoother curves
        const numPoints = Math.max(30, Math.min(100, Math.floor(distance * 5000)));
        const step = 1 / numPoints;
        
        for (let t = step; t < 1; t += step) {
          // Quadratic Bezier: (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
          const mt = 1 - t;
          const lat = mt * mt * p1[1] + 2 * mt * t * controlLat + t * t * p2[1];
          const lng = mt * mt * p1[0] + 2 * mt * t * controlLng + t * t * p2[0];
          curvedPoints.push([lng, lat]);
        }
        
        // Add the endpoint (avoid duplicates)
        if (i === points.length - 2) {
          curvedPoints.push(p2);
        }
      }
      
      return curvedPoints;
    };
    
    // Update trail line layer
    // Draw line from user's current location to mushrooms in sequence (if at least 1 mushroom)
    if (trailMode && trailMushrooms.length >= 1) {
      const trailPoints = [];
      
      // Start with user's current location if available
      if (trailCurrentLocation && trailCurrentLocation.lat && trailCurrentLocation.lng) {
        trailPoints.push([
          Number(trailCurrentLocation.lng),
          Number(trailCurrentLocation.lat),
        ]);
      }
      
      // Add all mushrooms in the trail in order (no duplicates)
      const addedCoordinates = new Set();
      trailMushrooms.forEach((m) => {
        const lng = Number(m.longitude || m.location?.longitude);
        const lat = Number(m.latitude || m.location?.latitude);
        if (!isNaN(lng) && !isNaN(lat)) {
          // Create a unique key for this coordinate to prevent duplicates
          const coordKey = `${lng.toFixed(6)},${lat.toFixed(6)}`;
          if (!addedCoordinates.has(coordKey)) {
            addedCoordinates.add(coordKey);
            trailPoints.push([lng, lat]);
          }
        }
      });
      
      // Only draw line if we have at least 2 points (user location + at least 1 mushroom, or 2+ mushrooms)
      // The line should go: user → mushroom1 → mushroom2 → ... → last mushroom (stops there)
      if (trailPoints.length >= 2) {
        // Create curved line connecting points in sequence
        const curvedLine = createCurvedLine(trailPoints);
        
        // Ensure the line ends at the last point (last mushroom) and doesn't continue
        const finalLine = curvedLine.length > 0 ? curvedLine : trailPoints;
        
        const trailGeoJSON = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: finalLine, // Single LineString from start to end
              },
            },
          ],
        };
        
        if (!map.getSource("trail-line")) {
          map.addSource("trail-line", {
            type: "geojson",
            data: trailGeoJSON,
          });
          
          if (!map.getLayer("trail-line-layer")) {
            map.addLayer({
              id: "trail-line-layer",
              type: "line",
              source: "trail-line",
              layout: {
                "line-cap": "round",
                "line-join": "round",
              },
              paint: {
                "line-color": "#3b82f6",
                "line-width": 4,
                "line-opacity": 0.8,
                "line-dasharray": [2, 2], // Creates a dotted/dashed line pattern
              },
            });
          }
        } else {
          map.getSource("trail-line").setData(trailGeoJSON);
        }
      }
    } else {
      // Remove trail line if not in trail mode or not enough mushrooms
      try {
        if (map.getLayer("trail-line-layer")) {
          map.removeLayer("trail-line-layer");
        }
        if (map.getSource("trail-line")) {
          map.removeSource("trail-line");
        }
      } catch (error) {
        // Ignore errors if layers don't exist
      }
    }
    
    // Update trail markers (highlight selected mushrooms)
    if (trailMode && trailMushrooms.length > 0) {
      const trailMarkerFeatures = trailMushrooms
        .filter((m) => m.latitude && m.longitude)
        .map((m) => ({
          type: "Feature",
          properties: { ...m, isTrailMarker: true },
          geometry: {
            type: "Point",
            coordinates: [
              Number(m.longitude || m.location?.longitude),
              Number(m.latitude || m.location?.latitude),
            ],
          },
        }));
      
      const trailMarkersGeoJSON = {
        type: "FeatureCollection",
        features: trailMarkerFeatures,
      };
      
      if (!map.getSource("trail-markers")) {
        map.addSource("trail-markers", {
          type: "geojson",
          data: trailMarkersGeoJSON,
        });
        
        // Load trail marker icon if not already loaded
        if (!map.hasImage("trail-marker-icon")) {
          map.loadImage("/icons/icon1.png", (err, img) => {
            if (!err && img && !map.hasImage("trail-marker-icon")) {
              map.addImage("trail-marker-icon", img);
            }
          });
        }
        
        if (map.hasImage("trail-marker-icon") && !map.getLayer("trail-markers-layer")) {
          map.addLayer({
            id: "trail-markers-layer",
            type: "symbol",
            source: "trail-markers",
            minzoom: 9,
            layout: {
              "icon-image": "trail-marker-icon",
              "icon-size": 0.06,
              "icon-allow-overlap": true,
            },
            paint: {
              "icon-color": "#3b82f6",
            },
          });
        }
      } else {
        map.getSource("trail-markers").setData(trailMarkersGeoJSON);
      }
    } else {
      // Remove trail markers if not in trail mode
      try {
        if (map.getLayer("trail-markers-layer")) {
          map.removeLayer("trail-markers-layer");
        }
        if (map.getSource("trail-markers")) {
          map.removeSource("trail-markers");
        }
      } catch (error) {
        // Ignore errors if layers don't exist
      }
    }

    // Update user location marker
    if (trailMode && trailCurrentLocation && trailCurrentLocation.lat && trailCurrentLocation.lng) {
      // Remove existing marker if it exists
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }

      // Create user location marker element
      const el = document.createElement("div");
      el.className = "user-location-marker";
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#3b82f6";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.cursor = "pointer";
      el.style.zIndex = "1000";
      
      // Add user icon SVG
      el.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="white"/>
          <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="white"/>
        </svg>
      `;

      // Create and add marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([trailCurrentLocation.lng, trailCurrentLocation.lat])
        .addTo(map);

      userLocationMarkerRef.current = marker;
    } else {
      // Remove user location marker if not in trail mode or no location
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }
    }

    /* ---------------- CLICK POPUP (NO ZOOM, iNATURALIST STYLE) ---------------- */
    const handleClick = (e) => {
      // Don't show popup if in drawing mode
      if (drawingMode) return;
      
      // Prevent event propagation to avoid multiple triggers
      if (e.originalEvent) {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
      }
      
      const f = e.features?.[0];
      if (!f) return;

      const item = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      
      // In trail mode, add mushroom to trail instead of showing popup
      if (trailMode && onTrailMushroomAdd) {
        // Use a small delay to prevent rapid multiple clicks
        const clickTime = Date.now();
        if (handleClick.lastClickTime && (clickTime - handleClick.lastClickTime) < 500) {
          return; // Ignore clicks within 500ms
        }
        handleClick.lastClickTime = clickTime;
        
        onTrailMushroomAdd(item);
        return;
      }

      // Only open popup, don't open details on marker click
      popupRef.current?.remove();

      const popupNode = document.createElement("div");

      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        closeOnMove: false,
        anchor: "bottom",
        offset: [0, -10],
        maxWidth: "400px",
        className: "mushroom-popup-container",
      })
        .setLngLat([lng, lat])
        .setDOMContent(popupNode)
        .addTo(map);

      popupRef.current = popup;

      // Format date
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        return d.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric", 
          year: "numeric" 
        });
      };

      const formatDateShort = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        const month = d.toLocaleDateString("en-US", { month: "short" });
        const year = d.getFullYear().toString().slice(-2);
        return `${month} '${year}`;
      };

      const observationDate = item.photoDateTime || item.createdAt;
      const displayDate = formatDate(observationDate);
      const shortDate = formatDateShort(observationDate);

      // Extract user ID and profile picture for profile link
      let userId = null;
      let profilePicture = null;
      
      // Helper to validate MongoDB ObjectId format (24 hex characters)
      const isValidObjectId = (id) => {
        if (!id) return false;
        const idStr = typeof id === 'string' ? id : id.toString();
        return /^[0-9a-fA-F]{24}$/.test(idStr);
      };
      
      // Extract user ID, profile picture, and username
      // Note: submittedBy might be a JSON string that needs parsing
      let submittedByData = item.submittedBy;
      let displayUsername = item.contributor; // Fallback to contributor name
      
      // If it's a string, try to parse it as JSON
      if (typeof submittedByData === 'string') {
        try {
          submittedByData = JSON.parse(submittedByData);
        } catch (e) {
          // If it's not JSON, treat it as a simple ID string
          if (isValidObjectId(submittedByData)) {
            userId = submittedByData;
          }
          submittedByData = null;
        }
      }
      
      // Now process the parsed object
      if (submittedByData) {
        // Handle string ID (already validated above)
        if (typeof submittedByData === "string") {
          if (isValidObjectId(submittedByData)) {
            userId = submittedByData;
          }
        } 
        // Handle object with _id or id
        else if (typeof submittedByData === 'object' && submittedByData !== null) {
          // Try _id first (most common)
          if (submittedByData._id !== undefined && submittedByData._id !== null) {
            const idValue = typeof submittedByData._id === "string" 
              ? submittedByData._id 
              : String(submittedByData._id);
            if (isValidObjectId(idValue)) {
              userId = idValue;
            }
          } 
          // Fallback to id property
          else if (submittedByData.id !== undefined && submittedByData.id !== null) {
            const idValue = typeof submittedByData.id === "string"
              ? submittedByData.id
              : String(submittedByData.id);
            if (isValidObjectId(idValue)) {
              userId = idValue;
            }
          }
          
          // Get username for display
          if (submittedByData.username) {
            displayUsername = submittedByData.username;
          } else if (submittedByData.name) {
            displayUsername = submittedByData.name;
          }
          
          // Get profile picture
          const dp = submittedByData.dp;
          if (dp && typeof dp === 'object' && dp !== null && !Array.isArray(dp) && dp.url) {
            if (typeof dp.url === 'string' && dp.url.trim().length > 0) {
              profilePicture = dp.url.trim();
            }
          }
        }
      }

      // Handle image click to show details
      const handleImageClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        popup.remove(); // Close popup
        handleMarkerSelect?.(item); // Trigger detail view
      };

      createRoot(popupNode).render(
        <div className="w-[380px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-stretch">
            {/* Left side - Image (clickable) */}
            {item.image && (
              <div 
                className="w-[150px] bg-gray-200 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
                onClick={handleImageClick}
                title="Click to view details"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover min-h-[150px]"
                />
              </div>
            )}

            {/* Right side - Content */}
            <div className="flex-1 p-4 flex flex-col min-w-0 min-h-[150px]">
              {/* Top section */}
              <div className="flex-1">
                {/* Species name */}
                <h3 className="text-lg font-semibold italic text-gray-900 leading-tight mb-1">
                  {item.name || "Unnamed Mushroom"}
                </h3>

                {/* Location and date */}
                <div className="text-xs text-gray-600 mb-2">
                  {item.location?.name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
                  {displayDate && ` • ${displayDate}`}
                </div>

                {/* Research Grade or Category tag */}
                {item.status === "approved" && (
                  <div className="inline-block mb-2">
                    <span className="bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                      Research Grade
                    </span>
                  </div>
                )}
                {item.category && item.status !== "approved" && (
                  <div className="inline-block mb-2">
                    <span className="bg-gray-400 text-white text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom section - Interaction icons and date */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {/* Contributor with profile picture and link */}
                  {item.contributor && (
                    <div className="flex items-center gap-2">
                      {/* Profile Picture */}
                      {profilePicture ? (
                        <a
                          href={userId ? `/user/${userId}` : '#'}
                          onClick={(e) => {
                            if (userId) {
                              e.preventDefault();
                              e.stopPropagation();
                              popup.remove();
                              setTimeout(() => {
                                window.location.href = `/user/${userId}`;
                              }, 100);
                            } else {
                              e.preventDefault();
                            }
                          }}
                          className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                          title={userId ? "View profile" : undefined}
                        >
                          <img
                            src={profilePicture}
                            alt={displayUsername}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      {/* Contributor username with link - always show as link if we have contributor */}
                      {displayUsername && (
                        <a
                          href={userId ? `/user/${userId}` : '#'}
                          onClick={(e) => {
                            if (userId) {
                              e.preventDefault();
                              e.stopPropagation();
                              popup.remove();
                              window.location.href = `/user/${userId}`;
                            } else {
                              e.preventDefault();
                            }
                          }}
                          className={`truncate max-w-[100px] transition-colors cursor-pointer ${
                            userId 
                              ? 'text-blue-600 hover:text-blue-800 hover:underline font-medium' 
                              : 'text-gray-500 cursor-not-allowed'
                          }`}
                          title={userId ? "View profile" : "Profile not available"}
                        >
                          {displayUsername}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Date icon */}
                {shortDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{shortDate}</span>
                  </div>
                )}
              </div>

              {/* Start Trail Button */}
              {!trailMode && onStartTrail && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      popup.remove();
                      onStartTrail(item);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span>Start Trail</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );

      // Check if popup is out of bounds and adjust map pan if needed
      const adjustPopupPosition = () => {
        const popupElement = popup.getElement();
        if (!popupElement) return;

        const popupRect = popupElement.getBoundingClientRect();
        const mapContainer = map.getContainer();
        const mapRect = mapContainer.getBoundingClientRect();

        const padding = 20;
        let panX = 0;
        let panY = 0;

        // Calculate how much we need to pan (positive = pan right/down, negative = pan left/up)
        if (popupRect.right > mapRect.right - padding) {
          // Popup extends beyond right edge - pan map RIGHT to move popup left
          panX = popupRect.right - (mapRect.right - padding);
        } else if (popupRect.left < mapRect.left + padding) {
          // Popup extends beyond left edge - pan map LEFT to move popup right
          panX = popupRect.left - (mapRect.left + padding);
        }

        if (popupRect.bottom > mapRect.bottom - padding) {
          // Popup extends beyond bottom edge - pan map DOWN to move popup up
          panY = popupRect.bottom - (mapRect.bottom - padding);
        } else if (popupRect.top < mapRect.top + padding) {
          // Popup extends beyond top edge - pan map UP to move popup down
          panY = popupRect.top - (mapRect.top + padding);
        }

        // Pan the map to bring popup into view
        if (panX !== 0 || panY !== 0) {
          const currentCenter = map.getCenter();
          const centerPixel = map.project(currentCenter);
          
          // Pan: add offset to center pixel (panning right/down moves center pixel right/down)
          const newCenterPixel = [
            centerPixel.x + panX,
            centerPixel.y + panY
          ];
          
          const newCenter = map.unproject(newCenterPixel);

          map.easeTo({
            center: newCenter,
            duration: 300,
            easing: (t) => t * (2 - t), // ease-out
          });
        }
      };

      // Check bounds after popup is fully rendered (use double RAF to ensure DOM is updated)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          adjustPopupPosition();
        });
      });
    };
    

    // IMPORTANT: prevent duplicate listeners
    map.off("click", "mushroom-points", handleClick);
    map.on("click", "mushroom-points", handleClick);

    /* ---------------- CURSOR POINTER ON HOVER ---------------- */
map.on("mouseenter", "mushroom-points", () => {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "mushroom-points", () => {
  map.getCanvas().style.cursor = "";
});

// Update cursor in trail mode
if (trailMode) {
  map.getCanvas().style.cursor = "crosshair";
} else {
  map.getCanvas().style.cursor = "";
}

  }, [data, filters, mode, mapLoaded, onMarkerSelect, onMushroomClick, selectedZone, currentZoom, trailMode, trailMushrooms, trailCurrentLocation, onTrailMushroomAdd, onStartTrail]);

  /* ---------------- DRAWING MODE ---------------- */
  useEffect(() => {
    console.log("🔵 DRAWING MODE useEffect triggered:", { 
      mapLoaded, 
      hasMap: !!mapRef.current, 
      isStyleLoaded: mapRef.current?.isStyleLoaded(), 
      drawingMode 
    });
    
    if (!mapLoaded || !mapRef.current) {
      console.log("❌ Map not loaded or doesn't exist, returning early");
      return;
    }
    
    const map = mapRef.current;
    
    if (!drawingMode) {
      console.log("❌ No drawing mode, cleaning up");
      // Clean up drawing state
      drawingStateRef.current.isDrawing = false;
      drawingStateRef.current.isMoving = false;
      drawingStateRef.current.isResizing = false;
      drawingStateRef.current.startPoint = null;
      drawingStateRef.current.currentShape = null;
      drawingStateRef.current.currentCenter = null;
      drawingStateRef.current.currentSize = null;
      drawingStateRef.current.dragStart = null;
      drawingStateRef.current.initialCenter = null;
      drawingStateRef.current.initialSize = null;
      drawingStateRef.current.activeHandle = null;
      drawingStateRef.current.polygonPoints = []; // Clear polygon points
      drawingStateRef.current.polygonEditMode = false;
      drawingStateRef.current.activeVertexIndex = undefined;
      
      try {
        // Remove resize handles
        resizeHandlesRef.current.forEach(handle => handle.remove());
        resizeHandlesRef.current = [];
        
        // Remove layers first (must be done before removing source)
        if (map.getLayer("drawing-fill")) {
          map.removeLayer("drawing-fill");
        }
        if (map.getLayer("drawing-outline")) {
          map.removeLayer("drawing-outline");
        }
        // Remove source after layers are removed
        if (map.getSource("drawing")) {
          map.removeSource("drawing");
        }
      } catch (error) {
        console.error("Error removing drawing layers:", error);
      }
      
      map.getCanvas().style.cursor = "";
      return;
    }

    // Function to set up drawing mode (defined first so it can be called by event handlers)
    const setupDrawingMode = () => {
      if (!map || !map.isStyleLoaded()) {
        console.log("❌ Map style still not loaded in setupDrawingMode");
        return;
      }
      
      console.log("✅ === ENTERING DRAWING MODE ===", { drawingMode, mapReady: map.isStyleLoaded() });
    
    // Reset drawing state first
    if (drawingMode === "polygon") {
      // For polygon, initialize with empty points array
      drawingStateRef.current.polygonPoints = [];
      drawingStateRef.current.polygonEditMode = false;
      drawingStateRef.current.activeVertexIndex = undefined;
      drawingStateRef.current.isDrawing = false;
      drawingStateRef.current.isMoving = false;
      drawingStateRef.current.isResizing = false;
      drawingStateRef.current.startPoint = null;
      drawingStateRef.current.dragStart = null;
      drawingStateRef.current.initialCenter = null;
      drawingStateRef.current.initialSize = null;
      drawingStateRef.current.activeHandle = null;
      drawingStateRef.current.currentCenter = null;
      drawingStateRef.current.currentSize = null;
    } else {
      const center = map.getCenter();
      drawingStateRef.current.currentCenter = { lat: center.lat, lng: center.lng };
      drawingStateRef.current.currentSize = drawingMode === "rectangle" 
        ? { width: 50, height: 50 } // 50km x 50km rectangle
        : { radius: 25 }; // 25km radius circle
      drawingStateRef.current.isDrawing = false;
      drawingStateRef.current.isMoving = false;
      drawingStateRef.current.isResizing = false;
      drawingStateRef.current.startPoint = null;
      drawingStateRef.current.dragStart = null;
      drawingStateRef.current.initialCenter = null;
      drawingStateRef.current.initialSize = null;
      drawingStateRef.current.activeHandle = null;
      drawingStateRef.current.polygonPoints = [];
    }

    // Initialize drawing source and layers
    if (!map.getSource("drawing")) {
      map.addSource("drawing", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
    }

    // Add drawing layers - these should be on top of other layers to be visible
    if (!map.getLayer("drawing-fill")) {
      map.addLayer({
        id: "drawing-fill",
        type: "fill",
        source: "drawing",
        paint: {
          "fill-color": "#10b981",
          "fill-opacity": 0.2,
        },
      });
      // Move to top to ensure visibility
      try {
        map.moveLayer("drawing-fill");
      } catch (e) {
        // Layer might already be on top
      }
    }

    if (!map.getLayer("drawing-outline")) {
      map.addLayer({
        id: "drawing-outline",
        type: "line",
        source: "drawing",
        paint: {
          "line-color": "#10b981",
          "line-width": 3,
          "line-opacity": 0.8,
          "line-dasharray": [2, 2],
        },
      });
      // Move to top to ensure visibility
      try {
        map.moveLayer("drawing-outline");
      } catch (e) {
        // Layer might already be on top
      }
    }


    const updateDrawingShape = (boundary, updateHandles = false) => {
      if (!boundary || !Array.isArray(boundary) || boundary.length === 0) {
        console.error("Invalid boundary data:", boundary);
        return;
      }
      
      // Ensure drawing source exists, create it if it doesn't
      if (!map.getSource("drawing")) {
        try {
          map.addSource("drawing", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });
        } catch (error) {
          console.error("Error creating drawing source:", error);
          return;
        }
      }
      
      // Ensure drawing layers exist
      if (!map.getLayer("drawing-fill")) {
        try {
          map.addLayer({
            id: "drawing-fill",
            type: "fill",
            source: "drawing",
            paint: {
              "fill-color": "#10b981",
              "fill-opacity": 0.2,
            },
          });
        } catch (error) {
          console.error("Error creating drawing-fill layer:", error);
        }
      }
      
      if (!map.getLayer("drawing-outline")) {
        try {
          map.addLayer({
            id: "drawing-outline",
            type: "line",
            source: "drawing",
            paint: {
              "line-color": "#10b981",
              "line-width": 3,
              "line-opacity": 0.8,
              "line-dasharray": [2, 2],
            },
          });
        } catch (error) {
          console.error("Error creating drawing-outline layer:", error);
        }
      }
      
      const geojson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [boundary],
            },
          },
        ],
      };
      
      try {
        const source = map.getSource("drawing");
        if (source) {
          source.setData(geojson);
          console.log("Drawing shape updated:", geojson);
        }
      } catch (error) {
        console.error("Error updating drawing shape:", error);
      }
    };

    const createInitialShape = () => {
      // For polygon mode, don't create initial shape - user will click to add points
      if (drawingMode === "polygon") {
        return null;
      }
      
      const center = drawingStateRef.current.currentCenter;
      const size = drawingStateRef.current.currentSize;
      
      if (!center || !size) {
        console.error("Missing center or size:", { center, size });
        return null;
      }
      
      let boundary;
      if (drawingMode === "rectangle") {
        boundary = generateRectangleBoundary(
          center.lat,
          center.lng,
          size.width,
          size.height
        );
      } else {
        boundary = generateCircleBoundary(
          center.lat,
          center.lng,
          size.radius
        );
      }
      
      console.log("Creating initial shape:", { drawingMode, center, size, boundaryLength: boundary?.length });
      updateDrawingShape(boundary);
      return boundary;
    };

    // Helper to calculate handle positions
    const getHandlePositions = () => {
      const handles = [];
      
      // For polygon mode, create handles at each vertex
      if (drawingMode === "polygon") {
        const points = drawingStateRef.current.polygonPoints;
        if (points.length >= 3) {
          // Create a handle for each vertex (excluding the closing point)
          points.forEach((point, index) => {
            handles.push({
              position: [point[0], point[1]],
              type: `vertex-${index}`,
              index: index,
            });
          });
        }
        return handles;
      }
      
      const center = drawingStateRef.current.currentCenter;
      const size = drawingStateRef.current.currentSize;

      if (drawingMode === "rectangle") {
        // Rectangle: handles at 4 corners
        // Convert km to degrees: width/height in km, need to convert to degrees
        const halfWidthKm = size.width / 2;
        const halfHeightKm = size.height / 2;
        const cosLat = Math.cos(center.lat * Math.PI / 180);
        
        // Latitude: 1 degree ≈ 111 km
        const halfHeightDeg = halfHeightKm / 111;
        // Longitude: 1 degree ≈ 111 * cos(latitude) km
        const halfWidthDeg = halfWidthKm / (111 * cosLat);
        
        handles.push(
          { position: [center.lng - halfWidthDeg, center.lat - halfHeightDeg], type: 'nw' },
          { position: [center.lng + halfWidthDeg, center.lat - halfHeightDeg], type: 'ne' },
          { position: [center.lng + halfWidthDeg, center.lat + halfHeightDeg], type: 'se' },
          { position: [center.lng - halfWidthDeg, center.lat + halfHeightDeg], type: 'sw' }
        );
      } else {
        // Circle: handles at 4 cardinal directions
        const radiusDeg = size.radius / 111;
        const cosLat = Math.cos(center.lat * Math.PI / 180);
        
        handles.push(
          { position: [center.lng, center.lat + radiusDeg], type: 's' },
          { position: [center.lng + radiusDeg / cosLat, center.lat], type: 'e' },
          { position: [center.lng, center.lat - radiusDeg], type: 'n' },
          { position: [center.lng - radiusDeg / cosLat, center.lat], type: 'w' }
        );
      }
      return handles;
    };

    // Create and update resize handles
    const updateResizeHandles = () => {
      // Remove existing handles
      resizeHandlesRef.current.forEach(handle => handle.remove());
      resizeHandlesRef.current = [];

      const handles = getHandlePositions();
      
      // If no handles (e.g., polygon with less than 3 points), return
      if (handles.length === 0) {
        return;
      }
      
      handles.forEach((handleData) => {
        const el = document.createElement('div');
        el.className = 'drawing-resize-handle';
        el.style.cssText = 'width: 32px; height: 32px; background-color: #10b981; border: 3px solid white; border-radius: 50%; cursor: grab; box-shadow: 0 2px 8px rgba(0,0,0,0.4); z-index: 1000; touch-action: none;';

        const marker = new mapboxgl.Marker({ element: el, draggable: true })
          .setLngLat(handleData.position)
          .addTo(map);

        marker.getElement().addEventListener('dragstart', () => {
          drawingStateRef.current.activeHandle = handleData.type;
          drawingStateRef.current.dragStart = { lat: handleData.position[1], lng: handleData.position[0] };
          
          // For polygon, store the vertex index
          if (drawingMode === "polygon" && handleData.index !== undefined) {
            drawingStateRef.current.activeVertexIndex = handleData.index;
          } else {
            drawingStateRef.current.initialCenter = { ...drawingStateRef.current.currentCenter };
            drawingStateRef.current.initialSize = drawingMode === "rectangle" 
              ? { width: drawingStateRef.current.currentSize.width, height: drawingStateRef.current.currentSize.height }
              : { radius: drawingStateRef.current.currentSize.radius };
          }
          map.dragPan.disable();
        });

        marker.on('drag', () => {
          const newLngLat = marker.getLngLat();
          const currentPoint = { lat: newLngLat.lat, lng: newLngLat.lng };
          
          // Handle polygon vertex dragging
          if (drawingMode === "polygon" && drawingStateRef.current.activeVertexIndex !== undefined) {
            const vertexIndex = drawingStateRef.current.activeVertexIndex;
            const points = drawingStateRef.current.polygonPoints;
            
            // Update the vertex position
            if (points[vertexIndex]) {
              points[vertexIndex] = [currentPoint.lng, currentPoint.lat];
              // Update the polygon shape
              updatePolygonShape();
            }
            return;
          }
          
          const initialCenter = drawingStateRef.current.initialCenter;
          
          if (drawingMode === "rectangle") {
            // Calculate the distance from center to the dragged corner
            // This must match the inverse of getHandlePositions calculation
            const latDiff = Math.abs(currentPoint.lat - initialCenter.lat);
            const lngDiff = Math.abs(currentPoint.lng - initialCenter.lng);
            
            // Convert degrees to km
            // For latitude: 1 degree ≈ 111 km
            const latDist = latDiff * 111;
            // For longitude: 1 degree ≈ 111 * cos(latitude) km
            const cosLat = Math.cos(initialCenter.lat * Math.PI / 180);
            const lngDist = lngDiff * 111 * cosLat;
            
            // The size is twice the distance from center to corner
            // Width corresponds to longitude (east-west), height to latitude (north-south)
            drawingStateRef.current.currentSize.width = Math.max(10, lngDist * 2);
            drawingStateRef.current.currentSize.height = Math.max(10, latDist * 2);
          } else {
            // Circle: radius is distance from initial center to current position
            const R = 6371;
            const dLat = ((currentPoint.lat - initialCenter.lat) * Math.PI) / 180;
            const dLng = ((currentPoint.lng - initialCenter.lng) * Math.PI) / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((initialCenter.lat * Math.PI) / 180) *
              Math.cos((currentPoint.lat * Math.PI) / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            drawingStateRef.current.currentSize.radius = Math.max(5, R * c);
          }
          
          // Update the shape immediately - this will redraw the shape
          createInitialShape();
        });

        marker.on('dragend', () => {
          drawingStateRef.current.activeHandle = null;
          if (drawingMode === "polygon") {
            drawingStateRef.current.activeVertexIndex = undefined;
          }
          map.dragPan.enable();
          updateResizeHandles();
        });

        resizeHandlesRef.current.push(marker);
      });
    };

    // Helper to check if point is near shape edge (for resizing)
    const getDistanceToEdge = (point, boundary) => {
      let minDist = Infinity;
      for (let i = 0; i < boundary.length - 1; i++) {
        const [x1, y1] = boundary[i];
        const [x2, y2] = boundary[i + 1];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const t = Math.max(0, Math.min(1, 
          ((point.lng - x1) * dx + (point.lat - y1) * dy) / (dx * dx + dy * dy)
        ));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        const dist = Math.sqrt(
          Math.pow(point.lng - projX, 2) + Math.pow(point.lat - projY, 2)
        );
        minDist = Math.min(minDist, dist);
      }
      return minDist;
    };

    // Helper to check if point is inside shape (for moving)
    const isPointInShape = (point, boundary) => {
      let inside = false;
      for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
        const [xi, yi] = boundary[i];
        const [xj, yj] = boundary[j];
        const intersect =
          yi > point.lat !== yj > point.lat &&
          point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    // Create initial shape - try multiple approaches to ensure it works
    const createShapeNow = () => {
      try {
        console.log("=== DRAWING MODE ACTIVATED ===", {
          drawingMode,
          center: drawingStateRef.current.currentCenter,
          size: drawingStateRef.current.currentSize,
          hasSource: !!map.getSource("drawing"),
          hasFillLayer: !!map.getLayer("drawing-fill"),
          hasOutlineLayer: !!map.getLayer("drawing-outline")
        });
        
        const boundary = createInitialShape();
        if (boundary) {
          console.log("Shape created successfully, boundary length:", boundary.length);
          updateResizeHandles();
          console.log("Resize handles created");
        } else {
          console.error("Failed to create shape - createInitialShape returned null");
        }
      } catch (error) {
        console.error("Error in createShapeNow:", error);
      }
    };
    
    // For polygon mode, set cursor and skip initial shape creation
    if (drawingMode === "polygon") {
      map.getCanvas().style.cursor = "crosshair";
    } else {
      // Try immediately
      createShapeNow();
      
      // Also try after a short delay as backup
      setTimeout(createShapeNow, 200);
      
      // And try when map is idle
      if (map.loaded()) {
        map.once('idle', createShapeNow);
      }
    }

    // Helper to update polygon shape
    const updatePolygonShape = () => {
      const points = drawingStateRef.current.polygonPoints;
      if (points.length < 2) {
        // Need at least 2 points to draw a line
        if (map.getSource("drawing")) {
          map.getSource("drawing").setData({
            type: "FeatureCollection",
            features: [],
          });
        }
        return;
      }
      
      // Create boundary: connect all points and close the polygon
      const boundary = [...points];
      if (points.length >= 3) {
        // Close the polygon by adding the first point at the end
        boundary.push([points[0][0], points[0][1]]);
      }
      
      updateDrawingShape(boundary);
    };

    // Event handlers for moving and resizing the shape
    const handleInteractionStart = (e) => {
      // For polygon mode, handle clicks differently
      if (drawingMode === "polygon") {
        // If in edit mode (after double-click), don't add new points
        if (drawingStateRef.current.polygonEditMode) {
          // Allow moving the entire polygon or other interactions
          // But don't add new points
          return;
        }
        
        const point = e.lngLat;
        if (!point) return;
        
        // Add point to polygon
        const newPoint = [point.lng, point.lat];
        drawingStateRef.current.polygonPoints.push(newPoint);
        
        // Update the polygon shape
        updatePolygonShape();
        
        // Change cursor to indicate we're drawing
        map.getCanvas().style.cursor = "crosshair";
        
        if (e.originalEvent && e.originalEvent.preventDefault) {
          e.originalEvent.preventDefault();
        }
        return;
      }
      
      // Get current boundary
      const source = map.getSource("drawing");
      if (!source) {
        console.log("No drawing source found");
        return;
      }
      const data = source.getData ? source.getData() : source._data;
      if (!data || !data.features || data.features.length === 0) {
        console.log("No drawing data found");
        return;
      }
      
      // Get coordinates from either mouse or touch event
      const point = e.lngLat;
      if (!point) {
        console.log("No point in event");
        return;
      }
      
      const boundary = data.features[0].geometry.coordinates[0];
      
      // Check if clicking near edge (for resizing)
      const edgeDist = getDistanceToEdge(point, boundary);
      const isTouch = e.originalEvent && (
        e.originalEvent.type && e.originalEvent.type.startsWith('touch') || 
        e.originalEvent.touches && e.originalEvent.touches.length > 0 ||
        window.matchMedia && window.matchMedia('(pointer: coarse)').matches
      );
      const threshold = (isTouch ? 10 : 5) / 111; // ~10km for touch, ~5km for mouse
      
      const isInside = isPointInShape(point, boundary);
      console.log("Click detected:", { edgeDist, threshold, isInside, point });
      
      if (edgeDist < threshold) {
        console.log("Starting resize");
        drawingStateRef.current.isResizing = true;
        drawingStateRef.current.dragStart = point;
        drawingStateRef.current.initialCenter = { ...drawingStateRef.current.currentCenter };
        drawingStateRef.current.initialSize = drawingMode === "rectangle" 
          ? { width: drawingStateRef.current.currentSize.width, height: drawingStateRef.current.currentSize.height }
          : { radius: drawingStateRef.current.currentSize.radius };
        map.getCanvas().style.cursor = "grabbing";
        map.dragPan.disable();
        if (e.originalEvent && e.originalEvent.preventDefault) {
          e.originalEvent.preventDefault();
        }
      } else if (isInside) {
        console.log("Starting move");
        drawingStateRef.current.isMoving = true;
        drawingStateRef.current.dragStart = point;
        drawingStateRef.current.initialCenter = { ...drawingStateRef.current.currentCenter };
        map.getCanvas().style.cursor = "grabbing";
        map.dragPan.disable();
        if (e.originalEvent && e.originalEvent.preventDefault) {
          e.originalEvent.preventDefault();
        }
      } else {
        console.log("Click outside shape, ignoring");
      }
    };

    const handleMouseDown = (e) => {
      handleInteractionStart(e);
    };

    const handleTouchStart = (e) => {
      if (!e.lngLat && e.point) {
        const point = map.unproject(e.point);
        e.lngLat = point;
      }
      if (e.lngLat) {
        handleInteractionStart(e);
      }
    };

    const handleInteractionMove = (e) => {
      // For polygon mode, just update cursor
      if (drawingMode === "polygon") {
        map.getCanvas().style.cursor = "crosshair";
        return;
      }
      
      if (!drawingStateRef.current.isMoving && !drawingStateRef.current.isResizing) {
        // Update cursor based on hover
        if (e.lngLat) {
          const source = map.getSource("drawing");
          if (source) {
            const data = source.getData ? source.getData() : source._data;
            if (data && data.features && data.features.length > 0) {
              const boundary = data.features[0].geometry.coordinates[0];
              const point = e.lngLat;
              const edgeDist = getDistanceToEdge(point, boundary);
              const threshold = 2 / 111;
              
              if (edgeDist < threshold) {
                map.getCanvas().style.cursor = "nwse-resize";
              } else if (isPointInShape(point, boundary)) {
                map.getCanvas().style.cursor = "move";
              } else {
                map.getCanvas().style.cursor = "default";
              }
            }
          }
        }
        return;
      }

      if (!drawingStateRef.current.dragStart) return;

      const currentPoint = e.lngLat;
      if (!currentPoint) return;

      if (drawingStateRef.current.isMoving) {
        // Move the shape
        const initialCenter = drawingStateRef.current.initialCenter;
        const latDiff = currentPoint.lat - drawingStateRef.current.dragStart.lat;
        const lngDiff = currentPoint.lng - drawingStateRef.current.dragStart.lng;
        drawingStateRef.current.currentCenter.lat = initialCenter.lat + latDiff;
        drawingStateRef.current.currentCenter.lng = initialCenter.lng + lngDiff;
        createInitialShape();
        if (e.originalEvent && e.originalEvent.preventDefault) {
          e.originalEvent.preventDefault();
        }
      } else if (drawingStateRef.current.isResizing) {
        // Resize the shape
        const initialCenter = drawingStateRef.current.initialCenter;
        if (drawingMode === "rectangle") {
          const latDiff = Math.abs(currentPoint.lat - initialCenter.lat);
          const lngDiff = Math.abs(currentPoint.lng - initialCenter.lng);
          const latDist = latDiff * 111;
          const lngDist = lngDiff * 111 * Math.cos(initialCenter.lat * Math.PI / 180);
          drawingStateRef.current.currentSize.width = Math.max(10, latDist * 2);
          drawingStateRef.current.currentSize.height = Math.max(10, lngDist * 2);
          createInitialShape();
          if (!drawingStateRef.current.activeHandle) {
            updateResizeHandles();
          }
        } else {
          const R = 6371;
          const dLat = ((currentPoint.lat - initialCenter.lat) * Math.PI) / 180;
          const dLng = ((currentPoint.lng - initialCenter.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((initialCenter.lat * Math.PI) / 180) *
              Math.cos((currentPoint.lat * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          drawingStateRef.current.currentSize.radius = Math.max(5, R * c);
          createInitialShape();
          if (!drawingStateRef.current.activeHandle) {
            updateResizeHandles();
          }
        }
        if (e.originalEvent && e.originalEvent.preventDefault) {
          e.originalEvent.preventDefault();
        }
      }
    };

    const handleMouseMove = (e) => {
      handleInteractionMove(e);
    };

    const handleTouchMove = (e) => {
      if (!e.lngLat && e.point) {
        const point = map.unproject(e.point);
        e.lngLat = point;
      }
      if (e.lngLat) {
        handleInteractionMove(e);
      }
    };

    const handleInteractionEnd = (e) => {
      if (drawingStateRef.current.isMoving || drawingStateRef.current.isResizing) {
        drawingStateRef.current.isMoving = false;
        drawingStateRef.current.isResizing = false;
        drawingStateRef.current.dragStart = null;
        map.getCanvas().style.cursor = "default";
        map.dragPan.enable();
        if (e.originalEvent && e.originalEvent.preventDefault) {
          e.originalEvent.preventDefault();
        }
      }
    };

    const handleMouseUp = (e) => {
      handleInteractionEnd(e);
    };

    const handleTouchEnd = (e) => {
      handleInteractionEnd(e);
    };

    const handleDoubleClick = (e) => {
      // For polygon mode, enter edit mode and show resize handles
      if (drawingMode === "polygon") {
        const points = drawingStateRef.current.polygonPoints;
        if (points.length < 3) {
          // Need at least 3 points to form a polygon
          return;
        }
        
        // Enter edit mode - this allows resizing by dragging vertices
        drawingStateRef.current.polygonEditMode = true;
        
        // Update polygon shape to ensure it's closed
        updatePolygonShape();
        
        // Show resize handles at vertices
        updateResizeHandles();
        
        // Change cursor back to default since we're now in edit mode
        map.getCanvas().style.cursor = "default";
        
        if (e.originalEvent && e.originalEvent.preventDefault) {
          e.originalEvent.preventDefault();
        }
        return;
      }
      
      const source = map.getSource("drawing");
      if (!source) return;
      const data = source.getData ? source.getData() : source._data;
      if (!data || !data.features || data.features.length === 0) return;
      
      const boundary = data.features[0].geometry.coordinates[0];
      const centerPoint = drawingMode === "circle" 
        ? drawingStateRef.current.currentCenter
        : undefined;
      
      drawingStateRef.current.currentCenter = null;
      drawingStateRef.current.currentSize = null;
      
      completeDrawing(boundary, drawingMode, centerPoint, true);
    };

    const cleanupAll = () => {
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseup", handleMouseUp);
      map.off("dblclick", handleDoubleClick);
      map.off("touchstart", handleTouchStart);
      map.off("touchmove", handleTouchMove);
      map.off("touchend", handleTouchEnd);
    };

    const completeDrawing = (boundary, shapeType, centerPoint, isFinal = false) => {
      if (isFinal) {
        cleanupAll();
        
        try {
          if (map.getLayer("drawing-fill")) {
            map.removeLayer("drawing-fill");
          }
          if (map.getLayer("drawing-outline")) {
            map.removeLayer("drawing-outline");
          }
          if (map.getSource("drawing")) {
            map.removeSource("drawing");
          }
        } catch (error) {
          console.error("Error removing drawing layers:", error);
        }
        
        resizeHandlesRef.current.forEach(handle => handle.remove());
        resizeHandlesRef.current = [];
        map.getCanvas().style.cursor = "";
      }
      
      onDrawingComplete?.({
        type: shapeType,
        boundary,
        center: centerPoint,
        isFinal,
      });
    };

    // Attach event listeners
    map.on("mousedown", handleMouseDown);
    map.on("mousemove", handleMouseMove);
    map.on("mouseup", handleMouseUp);
    map.on("dblclick", handleDoubleClick);
    map.on("touchstart", handleTouchStart);
    map.on("touchmove", handleTouchMove);
    map.on("touchend", handleTouchEnd);

    // Expose function to get current boundary
    if (onGetCurrentBoundary) {
      onGetCurrentBoundary.current = () => {
        // For polygon, get boundary from polygonPoints
        if (drawingMode === "polygon") {
          const points = drawingStateRef.current.polygonPoints;
          if (points.length < 3) return null;
          
          // Create closed boundary
          const boundary = [...points];
          boundary.push([points[0][0], points[0][1]]); // Close the polygon
          
          return {
            type: drawingMode,
            boundary,
            center: undefined,
          };
        }
        
        const source = map.getSource("drawing");
        if (!source) return null;
        const data = source.getData ? source.getData() : source._data;
        if (!data || !data.features || data.features.length === 0) return null;
        const boundary = data.features[0].geometry.coordinates[0];
        const centerPoint = drawingMode === "circle" 
          ? drawingStateRef.current.currentCenter
          : undefined;
        return {
          type: drawingMode,
          boundary,
          center: centerPoint,
        };
      };
      
      // Also expose a clear function
      onGetCurrentBoundary.clear = () => {
        // Clear polygon points
        drawingStateRef.current.polygonPoints = [];
        drawingStateRef.current.polygonEditMode = false;
        drawingStateRef.current.activeVertexIndex = undefined;
        
        // Clear drawing source data
        try {
          const source = map.getSource("drawing");
          if (source) {
            source.setData({
              type: "FeatureCollection",
              features: [],
            });
          }
        } catch (error) {
          console.error("Error clearing drawing source:", error);
        }
      };
    }

    // Return cleanup function for setupDrawingMode
    return () => {
      cleanupAll();
      if (onGetCurrentBoundary) {
        onGetCurrentBoundary.current = null;
      }
    };
    };
    
    // Wait for style to be loaded if it's not ready yet, then call setupDrawingMode
    if (!map.isStyleLoaded()) {
      console.log("⏳ Map style not loaded, waiting for style to load...");
      
      let cleanupDone = false;
      let timeoutId = null;
      
      const doCleanup = () => {
        if (cleanupDone) return;
        cleanupDone = true;
        map.off('style.load', onStyleLoad);
        map.off('load', onMapLoad);
        map.off('idle', onIdle);
        if (timeoutId) clearTimeout(timeoutId);
      };
      
      // Try multiple events to catch when style is ready
      const onStyleLoad = () => {
        console.log("✅ Map style loaded via style.load event");
        if (map.isStyleLoaded() && drawingMode) {
          doCleanup();
          setupDrawingMode();
        }
      };
      
      const onMapLoad = () => {
        console.log("✅ Map loaded via load event");
        if (map.isStyleLoaded() && drawingMode) {
          doCleanup();
          setupDrawingMode();
        }
      };
      
      const onIdle = () => {
        console.log("✅ Map idle");
        if (map.isStyleLoaded() && drawingMode) {
          doCleanup();
          setupDrawingMode();
        }
      };
      
      // Listen to multiple events
      map.on('style.load', onStyleLoad);
      map.on('load', onMapLoad);
      map.on('idle', onIdle);
      
      // Also try after a delay as fallback
      timeoutId = setTimeout(() => {
        console.log("⏰ Timeout fallback - checking if style is loaded");
        if (map.isStyleLoaded() && drawingMode) {
          doCleanup();
          setupDrawingMode();
        }
      }, 500);
      
      return () => {
        doCleanup();
      };
    }
    
    // If style is already loaded, proceed immediately
    console.log("✅ Style already loaded, proceeding immediately");
    setupDrawingMode();
    
    // Return cleanup for the useEffect
    return () => {
      // Cleanup will be handled by setupDrawingMode's return
    };
  }, [drawingMode, mapLoaded, onDrawingComplete, onDrawingCancel, onGetCurrentBoundary]);

  /* ---------------- UI ---------------- */
  return (
    <div className="absolute inset-0">
      {isTokenMissing ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-sm">
          Mapbox token missing
        </div>
      ) : mapError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-sm">
          {mapError}
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-full" />
      )}
    </div>
  );
}
