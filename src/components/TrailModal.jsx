"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, Navigation } from "lucide-react";

export default function TrailModal({ isOpen, onClose, onLocationSelect }) {
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState(null);

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
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
        setGettingLocation(false);
        let errorMessage = "";
        
        // Handle different error codes with user-friendly messages
        // PositionError codes: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        const errorCode = err?.code;
        if (errorCode === 1) {
          errorMessage = "Please enable your location to start the trail. Allow location access in your browser settings and try again.";
        } else if (errorCode === 2) {
          errorMessage = "Location information is unavailable. Please check your device's location settings and try again.";
        } else if (errorCode === 3) {
          errorMessage = "Location request timed out. Please check your connection and try again.";
        } else {
          errorMessage = "Please enable your location to start the trail. Check your browser settings and try again.";
        }
        
        setError(errorMessage);
        
        // Only log error details in development (not user-facing)
        if (process.env.NODE_ENV === 'development' && err) {
          console.error("Geolocation error:", {
            code: err.code,
            message: err.message || "Unknown error",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onLocationSelect, onClose]);

  // Automatically request location when modal opens
  useEffect(() => {
    if (isOpen && !gettingLocation && !error) {
      handleGetCurrentLocation();
    }
  }, [isOpen, handleGetCurrentLocation, gettingLocation, error]);

  const handleRetry = useCallback(() => {
    setError(null);
    handleGetCurrentLocation();
  }, [handleGetCurrentLocation]);

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
            Create Trail
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-50 text-blue-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {gettingLocation ? (
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
        <div className="p-6 border-t border-blue-100 bg-blue-50/30">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

