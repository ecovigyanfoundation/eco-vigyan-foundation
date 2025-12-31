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

export default function Map({ 
  data = [], 
  filters = {}, 
  mode, 
  onMarkerSelect, 
  selectedZone,
  drawingMode,
  onDrawingComplete,
  onDrawingCancel,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const drawingStateRef = useRef({
    isDrawing: false,
    startPoint: null,
    currentShape: null,
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
      if (map.getLayer("zone-boundary")) {
        map.removeLayer("zone-boundary");
      }
      if (map.getLayer("zone-fill")) {
        map.removeLayer("zone-fill");
      }
      if (map.getSource("zone")) {
        map.removeSource("zone");
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

        createRoot(popupNode).render(
          <div className="w-[300px] sm:w-[350px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 z-[200]">
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

              <p className="text-xs text-emerald-700 font-semibold mb-3">
                By {item.contributor || "Anonymous"}
              </p>

              <p className="text-sm text-gray-600 italic">
                {item.info || "No description provided."}
              </p>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-[10px] font-mono text-gray-400">
                <span>{lat.toFixed(5)}°N</span>
                <span>{lng.toFixed(5)}°E</span>
              </div>
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
      drawingStateRef.current.startPoint = null;
      drawingStateRef.current.currentShape = null;
      
      // Remove drawing layers
      const map = mapRef.current;
      if (map.getLayer("drawing-fill")) map.removeLayer("drawing-fill");
      if (map.getLayer("drawing-outline")) map.removeLayer("drawing-outline");
      if (map.getSource("drawing")) map.removeSource("drawing");
      
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

    // Set cursor based on drawing mode
    map.getCanvas().style.cursor = drawingMode === "rectangle" ? "crosshair" : "crosshair";

    // Clean up previous listeners
    const cleanup = () => {
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseup", handleMouseUp);
      map.off("dblclick", handleDoubleClick);
    };

    let isDrawing = false;
    let startPoint = null;

    const handleMouseDown = (e) => {
      if (drawingMode === "rectangle") {
        isDrawing = true;
        startPoint = e.lngLat;
        map.getCanvas().style.cursor = "crosshair";
      }
    };

    const handleMouseMove = (e) => {
      if (!isDrawing || !startPoint || drawingMode !== "rectangle") return;

      const currentPoint = e.lngLat;
      const boundary = [
        [startPoint.lng, startPoint.lat],
        [currentPoint.lng, startPoint.lat],
        [currentPoint.lng, currentPoint.lat],
        [startPoint.lng, currentPoint.lat],
        [startPoint.lng, startPoint.lat], // Close polygon
      ];

      updateDrawingShape(boundary);
    };

    const handleMouseUp = (e) => {
      if (drawingMode === "rectangle" && isDrawing && startPoint) {
        isDrawing = false;
        const currentPoint = e.lngLat;
        const boundary = [
          [startPoint.lng, startPoint.lat],
          [currentPoint.lng, startPoint.lat],
          [currentPoint.lng, currentPoint.lat],
          [startPoint.lng, currentPoint.lat],
          [startPoint.lng, startPoint.lat],
        ];

        completeDrawing(boundary, "rectangle");
        cleanup();
      }
    };

    const handleCircleMouseDown = (e) => {
      if (drawingMode === "circle") {
        isDrawing = true;
        startPoint = e.lngLat;
        map.getCanvas().style.cursor = "crosshair";
      }
    };

    const handleCircleMouseMove = (e) => {
      if (drawingMode === "circle" && isDrawing && startPoint) {
        const currentPoint = e.lngLat;
        // Calculate radius in km using Haversine formula
        const lat1 = startPoint.lat;
        const lng1 = startPoint.lng;
        const lat2 = currentPoint.lat;
        const lng2 = currentPoint.lng;
        
        const R = 6371; // Earth radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const radiusKm = R * c;

        const boundary = generateCircleBoundary(startPoint.lat, startPoint.lng, radiusKm);
        updateDrawingShape(boundary);
      }
    };

    const handleCircleMouseUp = (e) => {
      if (drawingMode === "circle" && isDrawing && startPoint) {
        isDrawing = false;
        const currentPoint = e.lngLat;
        const lat1 = startPoint.lat;
        const lng1 = startPoint.lng;
        const lat2 = currentPoint.lat;
        const lng2 = currentPoint.lng;
        
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const radiusKm = R * c;

        const boundary = generateCircleBoundary(startPoint.lat, startPoint.lng, radiusKm);
        completeDrawing(boundary, "circle");
        cleanup();
      }
    };

    const handleDoubleClick = (e) => {
      // Cancel drawing on double click
      cleanupAll();
      onDrawingCancel?.();
    };

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

    // Update cleanup to include circle handlers
    const cleanupAll = () => {
      cleanup();
      map.off("mousedown", handleCircleMouseDown);
      map.off("mousemove", handleCircleMouseMove);
      map.off("mouseup", handleCircleMouseUp);
      map.off("dblclick", handleDoubleClick);
    };

    const completeDrawing = (boundary, shapeType) => {
      // Capture center point before cleanup
      const centerPoint = shapeType === "circle" && startPoint ? {
        lat: startPoint.lat,
        lng: startPoint.lng,
      } : undefined;
      
      // Clean up drawing handlers first
      cleanupAll();
      
      // Remove drawing layers
      if (map.getLayer("drawing-fill")) map.removeLayer("drawing-fill");
      if (map.getLayer("drawing-outline")) map.removeLayer("drawing-outline");
      if (map.getSource("drawing")) map.removeSource("drawing");
      map.getCanvas().style.cursor = "";
      isDrawing = false;
      const savedStartPoint = startPoint;
      startPoint = null;
      
      // Notify parent - this will set selectedZone and the zone will be rendered
      onDrawingComplete?.({
        type: shapeType,
        boundary,
        center: centerPoint,
      });
    };

    // Attach event listeners
    if (drawingMode === "rectangle") {
      map.on("mousedown", handleMouseDown);
      map.on("mousemove", handleMouseMove);
      map.on("mouseup", handleMouseUp);
      map.on("dblclick", handleDoubleClick);
    } else if (drawingMode === "circle") {
      map.on("mousedown", handleCircleMouseDown);
      map.on("mousemove", handleCircleMouseMove);
      map.on("mouseup", handleCircleMouseUp);
      map.on("dblclick", handleDoubleClick);
    }

    // Return cleanup function
    return () => {
      cleanupAll();
    };
  }, [drawingMode, mapLoaded, onDrawingComplete, onDrawingCancel]);

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
