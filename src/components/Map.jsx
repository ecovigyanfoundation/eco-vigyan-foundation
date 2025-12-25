"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export default function Map({ data = [], filters = {}, mode, onMarkerSelect }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  const isTokenMissing = useMemo(() => !MAPBOX_TOKEN, []);

  /* ---------------- FILTER ---------------- */
  const isItemActive = (item) => {
    if (!filters || Object.keys(filters).length === 0) return true;
    const key = mode === "category" ? item.category : item.use;
    return filters[key] !== false;
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
      map.loadImage("/icons/mushroom.png", (err, img) => {
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
          "icon-size": 0.05,
          "icon-allow-overlap": true,
        },
      });
    }

    /* ---------------- CLICK POPUP (CENTERED) ---------------- */
    const handleClick = (e) => {
      const f = e.features?.[0];
      if (!f) return;

      const item = f.properties;
      const [lng, lat] = f.geometry.coordinates;

      onMarkerSelect?.(item);
      popupRef.current?.remove();

      // FIRST: move map (no popup yet)
      map.easeTo({
        center: [lng, lat],
        zoom: 9,
        duration: 800,
        padding: { top: 120, bottom: 120 },
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
          offset: [0, 12], // stable offset
          maxWidth: "none",
          className: "mushroom-popup-container",
        })
          .setLngLat([lng, lat])
          .setDOMContent(popupNode)
          .addTo(map);

        popupRef.current = popup;

        createRoot(popupNode).render(
          <div className="w-[300px] sm:w-[350px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
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

  }, [data, filters, mode, mapLoaded, onMarkerSelect]);

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
