"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export default function MiniMap({ latitude, longitude, name = "Location", locations = [], currentId }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Normalize input to a list of locations
  const points = locations.length > 0 
    ? locations 
    : (latitude && longitude ? [{ lat: latitude, lng: longitude, name }] : []);

  useEffect(() => {
    if (!mapContainerRef.current || points.length === 0 || !MAPBOX_TOKEN) {
      return;
    }

    // Initialize map
    // If we have points, center on the first one initially, but bounds will override
    const initialCenter = [points[0].lng, points[0].lat];
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: initialCenter,
      zoom: 13,
      interactive: true,
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add markers
    points.forEach((pt) => {
      const isCurrent = currentId && pt.id === currentId;
      // Use different color for the current mushroom vs others
      const color = isCurrent ? "#10b981" : "#059669"; // Emerald-500 vs Emerald-600
      
      const marker = new mapboxgl.Marker({ 
        color: color,
        scale: isCurrent ? 1.2 : 1.0 
      })
        .setLngLat([pt.lng, pt.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${pt.name}</strong>`))
        .addTo(map);
      
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (points.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      points.forEach(pt => bounds.extend([pt.lng, pt.lat]));
      
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15 // Don't zoom in too close if only one point
      });
    }

    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [points.length, JSON.stringify(points), currentId]); // Depend on content of points

  if (points.length === 0) {
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

