"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import Link from "next/link";
import "mapbox-gl/dist/mapbox-gl.css";
import { generateCircleBoundary, generateRectangleBoundary } from "@/lib/geocoding";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export default function Map({ 
  data = [], 
  filters = {}, 
  mode, 
  onMarkerSelect, 
  selectedZone,
  drawingMode,
  onDrawingComplete,
  onDrawingCancel,
  onGetCurrentBoundary,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
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
  });

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  const isTokenMissing = useMemo(() => !MAPBOX_TOKEN, []);

  /* ---------------- FILTER ---------------- */
  // Data is now pre-filtered at the page level, so we show all items passed here
  const isItemActive = (item) => {
    return true; // All items in data array are already filtered
  };

  /* ---------------- MAP INIT ---------------- */
  useEffect(() => {
    if (isTokenMissing || mapRef.current || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [80.5, 23.0],
      zoom: 4.2,
       projection: "mercator", // 👈 THIS LINE
       minZoom: 2.5,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
      map.resize();
    });

    map.on("error", (e) => {
      setMapError(e?.error?.message || "Map failed to load");
    });

    mapRef.current = map;

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [isTokenMissing]);

  /* ---------------- DATA + LAYERS ---------------- */
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !mapRef.current.isStyleLoaded()) return;

    const map = mapRef.current;

    const features = data
      .filter((d) => d.latitude && d.longitude && isItemActive(d))
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

    if (!map.getLayer("mushroom-heat")) {
      map.addLayer({
        id: "mushroom-heat",
        type: "heatmap",
        source: "mushrooms",
        maxzoom: 6,
        paint: {
          "heatmap-radius": 30,
          "heatmap-opacity": 0.85,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.3,
            "#a7f3d0",
            0.5,
            "#34d399",
            0.7,
            "#10b981",
            1,
            "#064e3b",
          ],
        },
      });
    }

    if (!map.hasImage("mushroom-icon")) {
      map.loadImage("/icons/icon1.png", (err, img) => {
        if (!err && img && !map.hasImage("mushroom-icon")) {
          map.addImage("mushroom-icon", img);
        }
      });
    }

    if (!map.getLayer("mushroom-points")) {
      map.addLayer({
        id: "mushroom-points",
        type: "symbol",
        source: "mushrooms",
        minzoom: 6,
        layout: {
          "icon-image": "mushroom-icon",
          "icon-size": 0.08,
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

      // Only auto-zoom for city boundaries, not manually drawn zones
      if (selectedZone.type === "city") {
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

        map.fitBounds(bounds, {
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
          duration: 1000,
        });
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

    /* ---------------- CLICK POPUP (CENTERED) ---------------- */
    const handleClick = (e) => {
      // Don't show popup if in drawing mode
      if (drawingMode) return;
      
      const f = e.features?.[0];
      if (!f) return;

      const item = f.properties;
      const [lng, lat] = f.geometry.coordinates;

      onMarkerSelect?.(item);
      popupRef.current?.remove();

      // FIRST: move map (no popup yet)
      // Add more top padding to account for header (header is ~150px tall)
      map.easeTo({
        center: [lng, lat],
        zoom: 9,
        duration: 800,
        padding: { top: 200, bottom: 120, left: 20, right: 20 },
        essential: true,
      });
      

      // THEN: open popup AFTER movement finishes
      map.once("moveend", () => {
        const popupNode = document.createElement("div");

        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: true,
          closeOnMove: false, // 🔒 critical
          anchor: "bottom", // 🔒 lock anchor
          offset: [0, -10], // Negative offset to move popup up from marker
          maxWidth: "none",
          className: "mushroom-popup-container",
        })
          .setLngLat([lng, lat])
          .setDOMContent(popupNode)
          .addTo(map);

        popupRef.current = popup;

        // Extract user ID and ensure it's a string
        let userId = null;
        if (item.submittedBy) {
          if (typeof item.submittedBy === 'string') {
            userId = item.submittedBy;
          } else if (item.submittedBy._id) {
            // Convert ObjectId to string if needed
            userId = typeof item.submittedBy._id === 'string' 
              ? item.submittedBy._id 
              : item.submittedBy._id.toString();
          }
        }
        const contributorName = item.contributor || item.submittedBy?.name || item.submittedBy?.username || "Anonymous";
        
        const handlePopupClick = (e) => {
          // Don't navigate if clicking on the contributor link (it has its own handler)
          if (e.target.closest('a')) {
            return;
          }
          // Navigate to user profile if userId exists
          if (userId) {
            window.location.href = `/user/${userId}`;
          }
        };

        createRoot(popupNode).render(
          <div 
            className={`w-[300px] sm:w-[350px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 z-[200] ${userId ? 'cursor-pointer hover:shadow-2xl transition-shadow' : ''}`}
            onClick={userId ? handlePopupClick : undefined}
          >
            {item.image && (
              <div className="w-full h-40 bg-gray-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {item.name}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded uppercase text-white ${
                    item.category === "food" ? "bg-green-600" : "bg-blue-600"
                  }`}
                >
                  {item.category}
                </span>
              </div>

              {userId ? (
                <Link
                  href={`/user/${userId}`}
                  className="text-xs text-emerald-700 font-semibold mb-3 hover:text-emerald-800 hover:underline transition-colors block"
                  onClick={(e) => e.stopPropagation()}
                >
                  By {contributorName}
                </Link>
              ) : (
                <p className="text-xs text-emerald-700 font-semibold mb-3">
                  By {contributorName}
                </p>
              )}

              <p className="text-sm text-gray-600 italic">
                {item.info || "No description provided."}
              </p>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-[10px] font-mono text-gray-400">
                <span>{lat.toFixed(5)}°N</span>
                <span>{lng.toFixed(5)}°E</span>
              </div>
              
              {userId && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-emerald-600 font-semibold text-center">
                    Click to view {contributorName}'s profile →
                  </p>
                </div>
              )}
            </div>
          </div>
        );
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

  }, [data, filters, mode, mapLoaded, onMarkerSelect, selectedZone]);

  /* ---------------- DRAWING MODE ---------------- */
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !mapRef.current.isStyleLoaded()) return;
    if (!drawingMode) {
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
      
      // Remove drawing layers and source
      const map = mapRef.current;
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

    const map = mapRef.current;
    
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
    }

    // Create initial shape centered on current map view (only if not already set)
    if (!drawingStateRef.current.currentCenter) {
      const center = map.getCenter();
      drawingStateRef.current.currentCenter = { lat: center.lat, lng: center.lng };
      drawingStateRef.current.currentSize = drawingMode === "rectangle" 
        ? { width: 200, height: 200 } // 200km x 200km rectangle
        : { radius: 100 }; // 100km radius circle
    }


    const updateDrawingShape = (boundary) => {
      if (!map.getSource("drawing")) return;
      
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
        map.getSource("drawing").setData(geojson);
      } catch (error) {
        console.error("Error updating drawing shape:", error);
      }
    };

    const createInitialShape = () => {
      let boundary;
      const center = drawingStateRef.current.currentCenter;
      const size = drawingStateRef.current.currentSize;
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
      updateDrawingShape(boundary);
      return boundary;
    };

    // Create initial shape
    createInitialShape();

    // Helper to calculate handle positions
    const getHandlePositions = () => {
      const center = drawingStateRef.current.currentCenter;
      const size = drawingStateRef.current.currentSize;
      const handles = [];

      if (drawingMode === "rectangle") {
        // Rectangle: handles at 4 corners
        const halfWidth = (size.width / 2) / 111; // Convert km to degrees
        const halfHeight = (size.height / 2) / 111;
        const cosLat = Math.cos(center.lat * Math.PI / 180);
        
        handles.push(
          { position: [center.lng - halfWidth / cosLat, center.lat - halfHeight], type: 'nw' },
          { position: [center.lng + halfWidth / cosLat, center.lat - halfHeight], type: 'ne' },
          { position: [center.lng + halfWidth / cosLat, center.lat + halfHeight], type: 'se' },
          { position: [center.lng - halfWidth / cosLat, center.lat + halfHeight], type: 'sw' }
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
      const handles = getHandlePositions();
      
      // Store handles as Map with type as key for easier lookup
      // Use global Map constructor to avoid conflict with component name
      const handlesByType = new globalThis.Map();
      handles.forEach(h => handlesByType.set(h.type, h));
      
      // If handles already exist, update their positions instead of recreating
      if (resizeHandlesRef.current.length === handles.length && resizeHandlesRef.current.length > 0) {
        // Update all markers - match by stored type (like iNaturalist does)
        // Update synchronously during shape movement for smooth real-time updates
        resizeHandlesRef.current.forEach((marker) => {
          const handleType = marker._handleType;
          if (handleType && handlesByType.has(handleType)) {
            const handleData = handlesByType.get(handleType);
            // Use setLngLat to update marker position - this should work on both PC and mobile
            marker.setLngLat(handleData.position);
          }
        });
        return;
      }

      // Remove existing handles if count doesn't match or we need to recreate
      resizeHandlesRef.current.forEach(handle => handle.remove());
      resizeHandlesRef.current = [];
      
      handles.forEach((handleData) => {
        const el = document.createElement('div');
        el.className = 'drawing-resize-handle';
        el.style.cssText = 'width: 32px; height: 32px; background-color: #10b981; border: 3px solid white; border-radius: 50%; cursor: grab; box-shadow: 0 2px 8px rgba(0,0,0,0.4); z-index: 1000; touch-action: none;';

        const marker = new mapboxgl.Marker({ element: el, draggable: true })
          .setLngLat(handleData.position)
          .addTo(map);

        // Store type on marker element for easier identification
        marker._handleType = handleData.type;

        marker.getElement().addEventListener('dragstart', () => {
          drawingStateRef.current.activeHandle = handleData.type;
          const pos = marker.getLngLat();
          drawingStateRef.current.dragStart = { lat: pos.lat, lng: pos.lng };
          drawingStateRef.current.initialCenter = { ...drawingStateRef.current.currentCenter };
          drawingStateRef.current.initialSize = drawingMode === "rectangle" 
            ? { width: drawingStateRef.current.currentSize.width, height: drawingStateRef.current.currentSize.height }
            : { radius: drawingStateRef.current.currentSize.radius };
          map.dragPan.disable();
        });

        marker.on('drag', () => {
          const newLngLat = marker.getLngLat();
          const currentPoint = { lat: newLngLat.lat, lng: newLngLat.lng };
          const initialCenter = drawingStateRef.current.initialCenter;
          
          if (drawingMode === "rectangle") {
            const latDiff = Math.abs(currentPoint.lat - initialCenter.lat);
            const lngDiff = Math.abs(currentPoint.lng - initialCenter.lng);
            const latDist = latDiff * 111;
            const lngDist = lngDiff * 111 * Math.cos(initialCenter.lat * Math.PI / 180);
            drawingStateRef.current.currentSize.width = Math.max(10, latDist * 2);
            drawingStateRef.current.currentSize.height = Math.max(10, lngDist * 2);
          } else {
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
          
          createInitialShape();
        });

        marker.on('dragend', () => {
          drawingStateRef.current.activeHandle = null;
          map.dragPan.enable();
          updateResizeHandles();
        });

        resizeHandlesRef.current.push(marker);
      });
    };

    // Initial handle creation
    updateResizeHandles();

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

    const handleInteractionStart = (e) => {
      // Get current boundary
      const source = map.getSource("drawing");
      if (!source) return;
      
      // Safely access source data - handle case where _data might be undefined
      let data;
      try {
        data = source._data;
      } catch (error) {
        console.error("Error accessing source data:", error);
        return;
      }
      
      if (!data || !data.features || data.features.length === 0) return;
      
      // Get coordinates from either mouse or touch event
      // Mapbox normalizes touch events to have lngLat property
      const point = e.lngLat;
      if (!point) return;
      
      // Safely access boundary coordinates
      if (!data.features[0] || !data.features[0].geometry || !data.features[0].geometry.coordinates) return;
      const boundary = data.features[0].geometry.coordinates[0];
      if (!boundary || boundary.length === 0) return;
      
      // Check if clicking near edge (for resizing) - larger threshold for mobile/touch
      const edgeDist = getDistanceToEdge(point, boundary);
      // Use larger threshold - check if touch device or use larger default for easier mobile interaction
      // Mapbox converts touch to mouse events, so check originalEvent.type or touches
      const isTouch = e.originalEvent && (
        e.originalEvent.type && e.originalEvent.type.startsWith('touch') || 
        e.originalEvent.touches && e.originalEvent.touches.length > 0 ||
        window.matchMedia && window.matchMedia('(pointer: coarse)').matches
      );
      // Much larger threshold for touch devices (10km) to make resizing easier on mobile
      // Also use larger default (5km) to make it easier overall
      const threshold = (isTouch ? 10 : 5) / 111; // ~10km for touch, ~5km for mouse
      
      if (edgeDist < threshold) {
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
      } else if (isPointInShape(point, boundary)) {
        drawingStateRef.current.isMoving = true;
        drawingStateRef.current.dragStart = point;
        drawingStateRef.current.initialCenter = { ...drawingStateRef.current.currentCenter };
        map.getCanvas().style.cursor = "grabbing";
        map.dragPan.disable();
        if (e.originalEvent && e.originalEvent.preventDefault) {
          e.originalEvent.preventDefault();
        }
      }
    };

    const handleMouseDown = (e) => {
      // Mapbox converts touch events to mouse events, so this handles both
      handleInteractionStart(e);
    };

    const handleTouchStart = (e) => {
      // Mapbox normalizes touch events - they should have lngLat
      // But if not, try to get it from point
      if (!e.lngLat && e.point) {
        const point = map.unproject(e.point);
        e.lngLat = point;
      }
      if (e.lngLat) {
        handleInteractionStart(e);
      }
    };

    const handleInteractionMove = (e) => {
      if (!drawingStateRef.current.isMoving && !drawingStateRef.current.isResizing) {
        // Update cursor based on hover (only for mouse)
        if (e.lngLat) {
          const source = map.getSource("drawing");
          if (source) {
            let data;
            try {
              data = source._data;
            } catch (error) {
              // Source data not available yet, skip cursor update
              return;
            }
            if (data && data.features && data.features.length > 0) {
              // Safely access boundary coordinates
              if (!data.features[0] || !data.features[0].geometry || !data.features[0].geometry.coordinates) return;
              const boundary = data.features[0].geometry.coordinates[0];
              if (!boundary || boundary.length === 0) return;
              
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

      // Get coordinates from either mouse or touch event
      // Mapbox normalizes touch events to have lngLat property
      const currentPoint = e.lngLat;
      if (!currentPoint) return;

      if (drawingStateRef.current.isMoving) {
        // Move the shape (like iNaturalist - handles move with shape in real-time)
        const initialCenter = drawingStateRef.current.initialCenter;
        const latDiff = currentPoint.lat - drawingStateRef.current.dragStart.lat;
        const lngDiff = currentPoint.lng - drawingStateRef.current.dragStart.lng;
        drawingStateRef.current.currentCenter.lat = initialCenter.lat + latDiff;
        drawingStateRef.current.currentCenter.lng = initialCenter.lng + lngDiff;
        createInitialShape();
        // Immediately update handles to move with the shape (synchronized like iNaturalist)
        updateResizeHandles();
        if (e.originalEvent && e.originalEvent.preventDefault) {
          e.originalEvent.preventDefault();
        }
      } else if (drawingStateRef.current.isResizing) {
        // Resize the shape
        const initialCenter = drawingStateRef.current.initialCenter;
        if (drawingMode === "rectangle") {
          // Calculate distance from initial center to current position
          const latDiff = Math.abs(currentPoint.lat - initialCenter.lat);
          const lngDiff = Math.abs(currentPoint.lng - initialCenter.lng);
          // Convert degrees to km and double for full width/height
          const latDist = latDiff * 111; // Convert degrees to km
          const lngDist = lngDiff * 111 * Math.cos(initialCenter.lat * Math.PI / 180); // Account for latitude
          drawingStateRef.current.currentSize.width = Math.max(10, latDist * 2); // Min 10km, double for full width
          drawingStateRef.current.currentSize.height = Math.max(10, lngDist * 2); // Min 10km, double for full height
          createInitialShape();
          // Don't update handles here - they're being dragged and will update themselves
        } else {
          // Circle: radius is distance from initial center to current position
          const R = 6371; // Earth radius in km
          const dLat = ((currentPoint.lat - initialCenter.lat) * Math.PI) / 180;
          const dLng = ((currentPoint.lng - initialCenter.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((initialCenter.lat * Math.PI) / 180) *
              Math.cos((currentPoint.lat * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          drawingStateRef.current.currentSize.radius = Math.max(5, R * c); // Min 5km
          createInitialShape();
          // Don't update handles here - they're being dragged and will update themselves
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
      // Mapbox normalizes touch events - they should have lngLat
      // But if not, try to get it from point
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
        const wasMoving = drawingStateRef.current.isMoving;
        drawingStateRef.current.isMoving = false;
        drawingStateRef.current.isResizing = false;
        drawingStateRef.current.dragStart = null;
        map.getCanvas().style.cursor = "default";
        map.dragPan.enable();
        // Ensure handles are in correct position after moving (final sync)
        if (wasMoving) {
          updateResizeHandles();
        }
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
      // Complete drawing on double click
      const source = map.getSource("drawing");
      if (!source) return;
      
      // Safely access source data
      let data;
      try {
        data = source._data;
      } catch (error) {
        console.error("Error accessing source data:", error);
        return;
      }
      
      if (!data || !data.features || data.features.length === 0) return;
      
      // Safely access boundary coordinates
      if (!data.features[0] || !data.features[0].geometry || !data.features[0].geometry.coordinates) return;
      const boundary = data.features[0].geometry.coordinates[0];
      if (!boundary || boundary.length === 0) return;
      const centerPoint = drawingMode === "circle" 
        ? drawingStateRef.current.currentCenter
        : undefined;
      
      // Reset drawing state ref
      drawingStateRef.current.currentCenter = null;
      drawingStateRef.current.currentSize = null;
      
      // Final completion - exit drawing mode
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
        
        // Remove drawing layers and source
        try {
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
        
        // Remove resize handles
        resizeHandlesRef.current.forEach(handle => handle.remove());
        resizeHandlesRef.current = [];
        map.getCanvas().style.cursor = "";
      }
      
      // Notify parent (always update zone, but only exit drawing mode if final)
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
    // Touch events for mobile
    map.on("touchstart", handleTouchStart);
    map.on("touchmove", handleTouchMove);
    map.on("touchend", handleTouchEnd);

    // Expose function to get current boundary
    if (onGetCurrentBoundary) {
      onGetCurrentBoundary.current = () => {
        const source = map.getSource("drawing");
        if (!source) return null;
        
        // Safely access source data
        let data;
        try {
          data = source._data;
        } catch (error) {
          console.error("Error accessing source data:", error);
          return null;
        }
        
        if (!data || !data.features || data.features.length === 0) return null;
        
        // Safely access boundary coordinates
        if (!data.features[0] || !data.features[0].geometry || !data.features[0].geometry.coordinates) return null;
        const boundary = data.features[0].geometry.coordinates[0];
        if (!boundary || boundary.length === 0) return null;
        const centerPoint = drawingMode === "circle" 
          ? drawingStateRef.current.currentCenter
          : undefined;
        return {
          type: drawingMode,
          boundary,
          center: centerPoint,
        };
      };
    }

    // Return cleanup function
    return () => {
      cleanupAll();
      if (onGetCurrentBoundary) {
        onGetCurrentBoundary.current = null;
      }
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
