"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Loader2, Navigation, FolderOpen, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { getSavedTrails } from "@/lib/trailStorage";
import { useAuth } from "@/context/AuthContext";

export default function TrailModal({ isOpen, onClose, onLocationSelect, onLoadTrail }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [mode, setMode] = useState("select"); // "select", "create", "load"
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [savedTrails, setSavedTrails] = useState([]);
  const locationTimeoutRef = useRef(null);
  const gettingLocationRef = useRef(false);
  
  // Keep ref in sync with state
  useEffect(() => {
    gettingLocationRef.current = gettingLocation;
  }, [gettingLocation]);

  // Load saved trails when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadTrails = async () => {
        try {
          const trails = await getSavedTrails();
          setSavedTrails(trails);
        } catch (error) {
          console.error('Error loading trails:', error);
          setSavedTrails([]);
        }
      };
      loadTrails();
      setMode("select");
      setError(null);
      setGettingLocation(false);
    }
  }, [isOpen]);

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setGettingLocation(true);
    setError(null);
    
    // Clear any existing timeout
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }
    
    // Set a timeout to show toast if location isn't obtained within 8 seconds
    // (before the geolocation timeout of 10 seconds)
    locationTimeoutRef.current = setTimeout(() => {
      // Check if we're still trying to get location
      if (gettingLocationRef.current) {
        toast.error("Failed to get location. Please check your settings and try again.", {
          id: 'location-timeout',
          duration: 4000,
        });
        // Don't set gettingLocation to false here - let the geolocation error handler do it
      }
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Clear timeout since we got the location
        if (locationTimeoutRef.current) {
          clearTimeout(locationTimeoutRef.current);
          locationTimeoutRef.current = null;
        }
        
        const { latitude, longitude } = position.coords;
        setGettingLocation(false);
        // Pass current location - map will zoom to this location
        onLocationSelect({
          type: "trail",
          currentLocation: { lat: latitude, lng: longitude },
          center: { lat: latitude, lng: longitude },
          boundary: null,
        });
        onClose();
      },
      (err) => {
        // Clear timeout since we got an error response
        if (locationTimeoutRef.current) {
          clearTimeout(locationTimeoutRef.current);
          locationTimeoutRef.current = null;
        }
        
        setGettingLocation(false);
        let errorMessage = "";
        
        // Handle different error codes with user-friendly messages
        // PositionError codes: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        const errorCode = err?.code;
        if (errorCode === 1) {
          errorMessage = "Please enable your location to start the trail. Allow location access in your browser settings and try again.";
          toast.error("Failed to get location. Please enable location access and try again.", {
            id: 'location-permission-denied',
            duration: 4000,
          });
        } else if (errorCode === 2) {
          errorMessage = "Location information is unavailable. Please check your device's location settings and try again.";
          toast.error("Failed to get location. Please check your device settings and try again.", {
            id: 'location-unavailable',
            duration: 4000,
          });
        } else if (errorCode === 3) {
          errorMessage = "Location request timed out. Please check your connection and try again.";
          toast.error("Failed to get location. Request timed out. Please try again.", {
            id: 'location-timeout-error',
            duration: 4000,
          });
        } else {
          errorMessage = "Please enable your location to start the trail. Check your browser settings and try again.";
          toast.error("Failed to get location. Please check your settings and try again.", {
            id: 'location-error',
            duration: 4000,
          });
        }
        
        setError(errorMessage);
        
        // Error is handled and displayed to user, no need to log to console
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onLocationSelect, onClose]);

  // Automatically request location when creating new trail
  useEffect(() => {
    if (isOpen && mode === "create" && !gettingLocation && !error) {
      handleGetCurrentLocation();
    }
  }, [isOpen, mode, handleGetCurrentLocation, gettingLocation, error]);

  const handleRetry = useCallback(() => {
    setError(null);
    // Wait a moment before retrying to give user time to see the button click
    setTimeout(() => {
      handleGetCurrentLocation();
    }, 300);
  }, [handleGetCurrentLocation]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-100">
          <h2 className="text-xl font-black text-blue-950 uppercase tracking-wider">
            {mode === "select" ? "Trails" : mode === "load" ? "Load Trail" : "Create Trail"}
          </h2>
          <button
            onClick={() => {
              setMode("select");
              setError(null);
              setGettingLocation(false);
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-blue-50 text-blue-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {mode === "select" ? (
              <div className="space-y-3">
                {isAdmin && (
                  <button
                    onClick={() => setMode("create")}
                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3"
                  >
                    <Plus size={20} />
                    <span>Create New Trail</span>
                  </button>
                )}
                <button
                  onClick={() => setMode("load")}
                  className="w-full px-6 py-4 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  <FolderOpen size={20} />
                  <span>Load Saved Trail</span>
                </button>
              </div>
            ) : mode === "load" ? (
              <div className="space-y-3">
                {savedTrails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <FolderOpen size={48} className="text-blue-300 mb-4" />
                    <p className="text-sm font-bold text-blue-900 mb-2">
                      No Saved Trails
                    </p>
                    <p className="text-xs text-blue-600/70 text-center">
                      Create a new trail to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {savedTrails.map((trail) => (
                      <button
                        key={trail.id}
                        onClick={() => {
                          if (onLoadTrail) {
                            onLoadTrail(trail);
                            onClose();
                          }
                        }}
                        className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors text-left"
                      >
                        <p className="text-sm font-bold text-blue-900 mb-1">
                          {trail.name}
                        </p>
                        <p className="text-xs text-blue-600/70">
                          {trail.mushrooms?.length || 0} mushrooms • {new Date(trail.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : gettingLocation ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
                <p className="text-sm font-bold text-blue-900 mb-2">
                  Getting your location...
                </p>
                <p className="text-xs text-blue-600/70 text-center">
                  Please allow location access when prompted
                </p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Navigation size={32} className="text-blue-600" />
                  </div>
                  <p className="text-sm font-bold text-blue-900 mb-2 text-center">
                    Location Required
                  </p>
                  <p className="text-xs text-blue-700/80 text-center mb-4 leading-relaxed">
                    {error}
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Navigation size={18} />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Navigation size={32} className="text-blue-600" />
                </div>
                <p className="text-sm font-bold text-blue-900 mb-2">
                  Starting Trail...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {mode !== "select" && (
          <div className="p-6 border-t border-blue-100 bg-blue-50/30">
            <button
              onClick={() => {
                setMode("select");
                setError(null);
                setGettingLocation(false);
              }}
              className="w-full px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100 rounded-xl transition-colors"
            >
              {mode === "load" ? "Back" : "Cancel"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

