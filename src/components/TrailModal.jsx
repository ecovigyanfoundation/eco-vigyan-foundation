"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Loader2, Navigation, FolderOpen, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { getSavedTrails, deleteTrail } from "@/lib/trailStorage";

export default function TrailModal({ isOpen, onClose, onLocationSelect, onLoadTrail }) {
  const [mode, setMode] = useState("select"); // "select", "create", "load"
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [savedTrails, setSavedTrails] = useState([]);
  const [trailToDelete, setTrailToDelete] = useState(null);
  const [selectedTrailToLoad, setSelectedTrailToLoad] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const locationTimeoutRef = useRef(null);
  const gettingLocationRef = useRef(false);
  
  // Keep ref in sync with state
  useEffect(() => {
    gettingLocationRef.current = gettingLocation;
  }, [gettingLocation]);

  // Load saved trails function
  const loadTrails = useCallback(async () => {
    try {
      const trails = await getSavedTrails();
      setSavedTrails(trails);
    } catch (error) {
      console.error('Error loading trails:', error);
      setSavedTrails([]);
    }
  }, []);

  // Load saved trails when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTrails();
      setMode("select");
      setError(null);
      setGettingLocation(false);
      setTrailToDelete(null);
      setSelectedTrailToLoad(null);
    }
  }, [isOpen, loadTrails]);

  // Delete trail handler
  const handleDeleteTrail = async (trailId) => {
    setDeleting(true);
    try {
      const success = await deleteTrail(trailId);
      if (success) {
        toast.success('Trail deleted successfully');
        await loadTrails(); // Refresh the list
        setTrailToDelete(null);
      } else {
        toast.error('Failed to delete trail');
      }
    } catch (error) {
      console.error('Error deleting trail:', error);
      toast.error('Failed to delete trail');
    } finally {
      setDeleting(false);
    }
  };

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
        
        // If loading a trail, load it with the location
        if (selectedTrailToLoad && onLoadTrail) {
          onLoadTrail(selectedTrailToLoad);
        }
        
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
  }, [onLocationSelect, onClose, selectedTrailToLoad, onLoadTrail]);

  // Location request is now manual - removed automatic request to make location optional

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
                <button
                  onClick={() => setMode("create")}
                  className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  <Plus size={20} />
                  <span>Create New Trail</span>
                </button>
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
                {/* Show location options if a trail is selected */}
                {selectedTrailToLoad ? (
                  <div className="space-y-3">
                    <p className="text-sm text-blue-900 font-semibold text-center mb-2">
                      Loading: {selectedTrailToLoad.name}
                    </p>
                    <p className="text-xs text-blue-600/70 text-center mb-4">
                      Would you like to use your current location?
                    </p>
                    <button
                      onClick={handleGetCurrentLocation}
                      className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3"
                    >
                      <Navigation size={20} />
                      <span>Use Current Location</span>
                    </button>
                    <button
                      onClick={() => {
                        // Load trail without updating location
                        if (onLoadTrail) {
                          onLoadTrail(selectedTrailToLoad);
                          onClose();
                        }
                      }}
                      className="w-full px-6 py-4 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-3"
                    >
                      <Plus size={20} />
                      <span>Skip Location</span>
                    </button>
                    <button
                      onClick={() => setSelectedTrailToLoad(null)}
                      className="w-full px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      ← Back to Trail List
                    </button>
                  </div>
                ) : savedTrails.length === 0 ? (
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
                      <div
                        key={trail.id}
                        className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl transition-colors flex items-center justify-between gap-3"
                      >
                        <button
                          onClick={() => {
                            setSelectedTrailToLoad(trail);
                          }}
                          className="flex-1 text-left hover:text-blue-700 transition-colors"
                        >
                          <p className="text-sm font-bold text-blue-900 mb-1">
                            {trail.name}
                          </p>
                          <p className="text-xs text-blue-600/70">
                            {trail.mushrooms?.length || 0} mushrooms • {new Date(trail.createdAt).toLocaleDateString()}
                          </p>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTrailToDelete(trail);
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
                          title="Delete trail"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : mode === "create" && !gettingLocation && !error ? (
              <div className="space-y-3">
                <p className="text-sm text-blue-900 font-semibold text-center mb-4">
                  How would you like to create your trail?
                </p>
                <button
                  onClick={handleGetCurrentLocation}
                  className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  <Navigation size={20} />
                  <span>Use Current Location</span>
                </button>
                <button
                  onClick={() => {
                    // Start trail without location
                    onLocationSelect({
                      type: "trail",
                      currentLocation: null,
                      center: null,
                      boundary: null,
                    });
                    onClose();
                  }}
                  className="w-full px-6 py-4 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  <Plus size={20} />
                  <span>Skip Location</span>
                </button>
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
                    Location Error
                  </p>
                  <p className="text-xs text-blue-700/80 text-center mb-4 leading-relaxed">
                    {error}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleRetry}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Navigation size={18} />
                      <span>Try Again</span>
                    </button>
                    <button
                      onClick={() => {
                        // Skip location after error
                        setError(null);
                        
                        // Load trail if one was selected
                        if (selectedTrailToLoad && onLoadTrail) {
                          onLoadTrail(selectedTrailToLoad);
                        }
                        
                        onLocationSelect({
                          type: "trail",
                          currentLocation: null,
                          center: null,
                          boundary: null,
                        });
                        onClose();
                      }}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                    >
                      Skip Location
                    </button>
                  </div>
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

      {/* Delete Confirmation Dialog */}
      {trailToDelete && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm rounded-2xl">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-black text-gray-900 mb-2">
              Delete Trail?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{trailToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTrailToDelete(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTrail(trailToDelete.id)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
