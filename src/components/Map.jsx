"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

const ICONS = {
  food: "/icons/mushroom.png",
  education: "/icons/book.png",
  health: "/icons/health.png",
  shelter: "/icons/home.png",
};

const DEFAULT_ICON_PATH = "/icons/mushroom.png";

export default function Map({ data = [], filters = {}, mode, onMarkerSelect }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [mapLoaded, setMapLoaded] = useState(false); // 🔥 FIX
  const [mapError, setMapError] = useState(null);

  const isTokenMissing = useMemo(() => !MAPBOX_TOKEN, []);
  const INDIA_CENTER = [77.41, 23.25];

  /* ---------------- FILTER LOGIC ---------------- */
  const isItemActive = (item) => {
    if (!filters || Object.keys(filters).length === 0) return true;
    const key = mode === "category" ? item.category : item.use;
    return filters[key] !== false;
  };

  /* ---------------- MAP INIT ---------------- */
  useEffect(() => {
    if (isTokenMissing) return;
    if (mapRef.current) return;
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [80.5, 23.0],
      zoom: 4.2,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      setMapLoaded(true); // 🔥 STATE, not ref
      setTimeout(() => map.resize(), 0);
    });

    map.on("error", (event) => {
      if (event?.error) {
        setMapError(
          event.error.message ||
            "Map failed to load. Check Mapbox token or network."
        );
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isTokenMissing]);

  /* ---------------- MARKERS ---------------- */
  useEffect(() => {
    if (isTokenMissing) return;
    if (!mapRef.current || !mapLoaded) return; // 🔥 now reacts to state

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const activeItems = data.filter((item) => {
      if (!item) return false;
      if (item.latitude == null || item.longitude == null) return false;
      return isItemActive(item);
    });

    if (!activeItems.length) return;

    const bounds = new mapboxgl.LngLatBounds();

    activeItems.forEach((item) => {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const iconPath = ICONS[item.category] || DEFAULT_ICON_PATH;

      const el = document.createElement("div");
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.backgroundImage = `url(${iconPath})`;
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.cursor = "pointer";

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(`
        <div style="min-width:200px;font-family:system-ui">
          <h3 style="margin:0;font-size:16px;font-weight:700">
            ${item.name}
          </h3>
          <p style="margin:4px 0;font-size:12px;color:#555">
            ${item.category} • ${item.use}
          </p>
          <p style="margin:0;font-size:11px;color:#777">
            Contributor: ${item.contributor}
          </p>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      el.addEventListener("click", () => {
        onMarkerSelect?.(item);
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 8.5, // ⬅️ REAL zoom-in
          speed: 0.9, // smooth animation
          curve: 1.4, // natural easing
          essential: true,
          offset: [0, -80], // ⬅️ lifts marker slightly up (optional)
        });
      });

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });
  }, [data, filters, mode, mapLoaded, onMarkerSelect, isTokenMissing]);

  /* ---------------- UI ---------------- */
  return (
    <div className="absolute inset-0">
      {isTokenMissing ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-sm">
          <p>Mapbox token missing</p>
        </div>
      ) : mapError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-sm">
          <p>{mapError}</p>
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-full" />
      )}
    </div>
  );
}
