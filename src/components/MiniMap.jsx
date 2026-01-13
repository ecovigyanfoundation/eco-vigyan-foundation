"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export default function MiniMap({ latitude, longitude, name = "Location" }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || !latitude || !longitude || !MAPBOX_TOKEN) {
      return;
    }

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [longitude, latitude],
      zoom: 13,
      interactive: true,
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add marker
    const marker = new mapboxgl.Marker({ color: "#10b981" })
      .setLngLat([longitude, latitude])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${name}</strong>`))
      .addTo(map);

    // Open popup automatically
    marker.getPopup().addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    // Cleanup on unmount
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [latitude, longitude, name]);

  if (!latitude || !longitude) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
        <p className="text-sm font-medium">No location data available</p>
      </div>
    );
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
        <p className="text-sm font-medium">Map token not configured</p>
      </div>
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full" />;
}

