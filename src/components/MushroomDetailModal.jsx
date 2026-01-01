"use client";

import { X, MapPin, Calendar, User, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Helper function to format enum values for display
function formatLabel(value) {
  if (!value) return null;
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function MushroomDetailModal({ isOpen, onClose, mushroom }) {
  const router = useRouter();

  if (!isOpen || !mushroom) return null;

  // Extract user ID and check if it's a system user
  let userId = null;
  const contributorName =
    mushroom.contributor ||
    mushroom.submittedBy?.name ||
    mushroom.submittedBy?.username ||
    "Anonymous";
  const isSystemUser =
    mushroom.submittedBy?.email === "system@ecovigyan.org" ||
    mushroom.submittedBy?.username === "system" ||
    mushroom.submittedBy?.name === "System Import" ||
    contributorName === "System Import" ||
    contributorName === "system";

  if (mushroom.submittedBy && !isSystemUser) {
    if (typeof mushroom.submittedBy === "string") {
      userId = mushroom.submittedBy;
    } else if (mushroom.submittedBy._id) {
      const idString =
        typeof mushroom.submittedBy._id === "string"
          ? mushroom.submittedBy._id
          : mushroom.submittedBy._id.toString();
      if (/^[0-9a-fA-F]{24}$/.test(idString)) {
        userId = idString;
      }
    }
  }

  // Get original Google Drive link for system imports
  let originalDriveLink =
    mushroom.images?.[0]?.originalDriveLink || null;

  // Fallback: reconstruct from image URL if needed
  if (isSystemUser && !originalDriveLink) {
    const imageUrl = mushroom.image || mushroom.images?.[0]?.url;
    if (imageUrl && imageUrl.includes("drive.google.com/uc?")) {
      const idMatch = imageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        originalDriveLink = `https://drive.google.com/file/d/${idMatch[1]}/view`;
      }
    }
  }

  const handleUsernameClick = (e) => {
    e.stopPropagation();
    if (userId) {
      router.push(`/user/${userId}`);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between z-10">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">
            Mushroom Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6 space-y-4">
          {/* IMAGE */}
          {mushroom.image || mushroom.images?.[0]?.url ? (
            <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={mushroom.image || mushroom.images?.[0]?.url}
                alt={mushroom.name || mushroom.commonName || "Mushroom"}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          {/* GOOGLE DRIVE LINK BUTTON - Only for system imports */}
          {isSystemUser && originalDriveLink && (
            <div className="flex justify-center">
              <button
                onClick={() => window.open(originalDriveLink, "_blank", "noopener,noreferrer")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <ExternalLink size={16} />
                Open in Google Drive
              </button>
            </div>
          )}

          {/* BASIC INFO */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* LEFT COLUMN */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Common Name
                </label>
                <p className="text-base font-bold text-gray-900">
                  {mushroom.name || mushroom.commonName || "Unnamed Mushroom"}
                </p>
              </div>

              {mushroom.scientificName && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Scientific Name
                  </label>
                  <p className="text-base font-medium text-gray-700 italic">
                    {mushroom.scientificName}
                  </p>
                </div>
              )}

              {mushroom.description && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Description
                  </label>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {mushroom.description}
                  </p>
                </div>
              )}

              {/* UPLOADER INFO */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Uploaded By
                </label>
                {userId ? (
                  <button
                    onClick={handleUsernameClick}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors group"
                  >
                    <User size={16} />
                    <span className="group-hover:underline">
                      {contributorName}
                    </span>
                    <span className="text-xs text-gray-400 group-hover:text-emerald-600">
                      → View Profile
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={16} />
                    <span>{contributorName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-3">
              {/* LOCATION */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Location
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin size={16} className="text-emerald-600" />
                  <span>
                    {mushroom.location?.latitude?.toFixed(5) ||
                      mushroom.latitude?.toFixed(5)}
                    °N,{" "}
                    {mushroom.location?.longitude?.toFixed(5) ||
                      mushroom.longitude?.toFixed(5)}
                    °E
                  </span>
                </div>
              </div>

              {/* DATE */}
              {(mushroom.photoDateTime || mushroom.createdAt) && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    {mushroom.photoDateTime ? "Photo Date" : "Submitted"}
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar size={16} className="text-emerald-600" />
                    <span>
                      {new Date(
                        mushroom.photoDateTime || mushroom.createdAt
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* ECOLOGICAL ROLE */}
              {mushroom.ecologicalRole && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Ecological Role
                  </label>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                    {formatLabel(mushroom.ecologicalRole)}
                  </span>
                </div>
              )}

              {/* TEXTURE */}
              {mushroom.texture && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Texture
                  </label>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                    {formatLabel(mushroom.texture)}
                  </span>
                </div>
              )}

              {/* UNDERSIDE */}
              {mushroom.underside && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Underside
                  </label>
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                    {formatLabel(mushroom.underside)}
                  </span>
                </div>
              )}

              {/* FRUITING SURFACE */}
              {mushroom.fruitingSurface && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Fruiting Surface
                  </label>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    {formatLabel(mushroom.fruitingSurface)}
                  </span>
                </div>
              )}

              {/* STEM PRESENCE */}
              {mushroom.stemPresence && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Stem Presence
                  </label>
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                    {formatLabel(mushroom.stemPresence)}
                  </span>
                </div>
              )}

              {/* COMMON USES */}
              {(() => {
                // Handle commonUses - could be array, string, or undefined
                let usesArray = [];
                if (Array.isArray(mushroom.commonUses)) {
                  usesArray = mushroom.commonUses;
                } else if (typeof mushroom.commonUses === 'string') {
                  usesArray = [mushroom.commonUses];
                } else if (mushroom.use) {
                  // Fallback to single use value
                  usesArray = [mushroom.use];
                }
                
                return usesArray.length > 0 ? (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                      Common Uses
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {usesArray.map((use, index) => (
                        <span
                          key={index}
                          className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"
                        >
                          {formatLabel(use)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

