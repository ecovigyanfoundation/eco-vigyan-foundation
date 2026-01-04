"use client";

import { useState, useEffect } from "react";
import { X, FolderOpen, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { getSavedTrails, deleteTrail } from "@/lib/trailStorage";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function TrailModal({ isOpen, onClose, onLocationSelect, onLoadTrail }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [mode, setMode] = useState("select"); // "select", "create", "load"
  const [savedTrails, setSavedTrails] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, trailId: null, trailName: null });

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
    }
  }, [isOpen]);

  // Handle create trail button click - start trail immediately
  const handleCreateTrail = () => {
    onLocationSelect({
      type: "trail",
      currentLocation: null,
      center: null,
      boundary: null,
    });
    onClose();
  };

  const handleDeleteClick = (e, trailId, trailName) => {
    e.stopPropagation(); // Prevent triggering the load trail action
    setDeleteConfirm({ isOpen: true, trailId, trailName });
  };

  const handleDeleteConfirm = async () => {
    const { trailId } = deleteConfirm;
    if (!trailId) return;

    try {
      const success = await deleteTrail(trailId);
      if (success) {
        toast.success("Trail deleted successfully");
        // Reload trails
        const trails = await getSavedTrails();
        setSavedTrails(trails);
      } else {
        toast.error("Failed to delete trail");
      }
    } catch (error) {
      console.error("Error deleting trail:", error);
      toast.error("Failed to delete trail");
    } finally {
      setDeleteConfirm({ isOpen: false, trailId: null, trailName: null });
    }
  };

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
                    onClick={handleCreateTrail}
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
                      <div
                        key={trail.id}
                        className="relative group"
                      >
                        <button
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
                        {isAdmin && (
                          <button
                            onClick={(e) => handleDeleteClick(e, trail.id, trail.name)}
                            className="absolute top-2 right-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete trail"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        {mode !== "select" && (
          <div className="p-6 border-t border-blue-100 bg-blue-50/30">
            <button
              onClick={() => {
                setMode("select");
              }}
              className="w-full px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100 rounded-xl transition-colors"
            >
              {mode === "load" ? "Back" : "Cancel"}
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, trailId: null, trailName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Trail"
        message={`Are you sure you want to delete "${deleteConfirm.trailName || "this trail"}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />
    </div>
  );
}
