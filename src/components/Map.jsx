"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export default function Map({ data = [], filters = {}, mode, onMarkerSelect }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

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
    map.on("mouseenter", "mushroom-points", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "mushroom-points", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("load", () => {
      setMapLoaded(true);
      map.resize();
    });

    map.on("error", (e) => {
      setMapError(e?.error?.message || "Map failed to load");
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isTokenMissing]);

  /* ---------------- DATA + LAYERS ---------------- */
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

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

    /* SOURCE */
    if (!map.getSource("mushrooms")) {
      map.addSource("mushrooms", {
        type: "geojson",
        data: geojson,
      });
    } else {
      map.getSource("mushrooms").setData(geojson);
    }

    /* HEATMAP */
    if (!map.getLayer("mushroom-heat")) {
      map.addLayer({
        id: "mushroom-heat",
        type: "heatmap",
        source: "mushrooms",
        maxzoom: 6,
        paint: {
          "heatmap-radius": 30,
          "heatmap-intensity": 1,
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

    /* ICON IMAGE (SAFE LOAD) */
    if (!map.hasImage("mushroom-icon")) {
      map.loadImage("/icons/mushroom.png", (err, img) => {
        if (err || !img) return;
        if (!map.hasImage("mushroom-icon")) {
          map.addImage("mushroom-icon", img);
        }
      });
    }

    /* SYMBOL LAYER */
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

    /* CLICK */
    map.on("click", "mushroom-points", (e) => {
      const f = e.features?.[0];
      if (!f) return;

      const item = f.properties;
      const [lng, lat] = f.geometry.coordinates;

      onMarkerSelect?.(item);

      map.flyTo({
        center: [lng, lat],
        zoom: 8.5,
        speed: 0.9,
        curve: 1.4,
        offset: [0, -80],
        essential: true,
      });
    });
  }, [data, filters, mode, mapLoaded, onMarkerSelect]);

  /* ---------------- UI ---------------- */
  return (
    <div className="absolute inset-0">
      {isTokenMissing ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-sm">
          Mapbox token missing (check Vercel env vars)
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
