"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function LocationPickerMap({ onSelect }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [78.9629, 20.5937], // India default
      zoom: 4,
    });

    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      // Remove old marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      markerRef.current = new mapboxgl.Marker({ color: "#16a34a" })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      // Send coords to parent
      onSelect({
        latitude: lat,
        longitude: lng,
      });
    });

    return () => mapRef.current?.remove();
  }, [onSelect]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
