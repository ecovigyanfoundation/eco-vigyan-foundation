"use client";

import { useState } from "react";
import { X, Camera, MapPin, Search, Navigation } from "lucide-react";
import toast from "react-hot-toast";
import MushroomSelectField from "./MushroomSelectField";
import LocationPickerModal from "./LocationPickerModal";
import { extractExifData } from "@/lib/exifUtils";
import { geocodeCity } from "@/lib/geocoding";
import {
  ECOLOGICAL_ROLES,
  TEXTURES,
  UNDERSIDES,
  FRUITING_SURFACES,
  STEM_PRESENCE,
  COMMON_USES,
} from "./mushroomConstants";

export default function MushroomSubmissionForm({
  isOpen,
  onClose,
  onSuccess,
  selectedLocation,
  onLocationSelect,
}) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationInputMethod, setLocationInputMethod] = useState("map"); // map, city, manual
  const [hasExifGps, setHasExifGps] = useState(false);
  const [cityName, setCityName] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [exifDateTime, setExifDateTime] = useState(null);
  const [commonName, setCommonName] = useState("");
  const [ecologicalRole, setEcologicalRole] = useState("");
  const [texture, setTexture] = useState("");
  const [underside, setUnderside] = useState("");
  const [fruitingSurface, setFruitingSurface] = useState("");
  const [stemPresence, setStemPresence] = useState("");
  const [commonUses, setCommonUses] = useState([]);

  if (!isOpen) return null;

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Extract EXIF data
    try {
      const { gps, dateTime } = await extractExifData(file);

      // If GPS found in EXIF, use it
      if (gps && gps.latitude && gps.longitude) {
        onLocationSelect?.(gps);
        setHasExifGps(true);
        setLocationInputMethod("map"); // Reset to default for next time
        toast.success("Location found in image EXIF data!");
      } else {
        // No GPS in EXIF, allow manual selection
        setHasExifGps(false);
        setLocationInputMethod("map");
      }

      // Set date/time if found
      if (dateTime) {
        setExifDateTime(dateTime);
      }
    } catch (error) {
      console.error("Error reading EXIF:", error);
      setHasExifGps(false);
      setLocationInputMethod("map");
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExifDateTime(null);
    setHasExifGps(false);
    onLocationSelect?.(null);
  };

  const handleCitySearch = async () => {
    if (!cityName.trim()) {
      toast.error("Please enter a city name");
      return;
    }

    setIsGeocoding(true);
    try {
      const coords = await geocodeCity(cityName);
      if (coords) {
        onLocationSelect?.(coords);
        toast.success(`Location found for ${cityName}`);
      } else {
        toast.error(
          "City not found. Please try a different name or use map picker."
        );
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to find city. Please try again.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid latitude and longitude");
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    onLocationSelect?.({ latitude: lat, longitude: lng });
    toast.success("Location set manually");
  };

  const getCurrentLocation = () => {
    if (!selectedLocation) return null;
    return selectedLocation;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const location = getCurrentLocation();
    if (!location) {
      toast.error("Please provide a location");
      return;
    }

    if (!imageFile) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("latitude", location.latitude);
      fd.append("longitude", location.longitude);
      fd.append("image1", imageFile);

      // Add date/time from EXIF if available
      if (exifDateTime) {
        fd.append("dateTime", exifDateTime.toISOString());
      }

      // Optional fields - only append if filled
      if (commonName) fd.append("commonName", commonName);
      if (ecologicalRole) fd.append("ecologicalRole", ecologicalRole);
      if (texture) fd.append("texture", texture);
      if (underside) fd.append("underside", underside);
      if (fruitingSurface) fd.append("fruitingSurface", fruitingSurface);
      if (stemPresence) fd.append("stemPresence", stemPresence);
      commonUses.forEach((use) => fd.append("commonUses", use));

      const res = await fetch("/api/mushrooms", {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Submission failed: ${res.status} ${res.statusText}`
        );
      }

      toast.success(
        "Mushroom submitted successfully! It will be reviewed by an admin."
      );

      // Reset form
      setImageFile(null);
      setImagePreview(null);
      setCommonName("");
      setEcologicalRole("");
      setTexture("");
      setUnderside("");
      setFruitingSurface("");
      setStemPresence("");
      setCommonUses([]);
      setExifDateTime(null);
      setCityName("");
      setManualLat("");
      setManualLng("");
      setHasExifGps(false);
      setLocationInputMethod("map");
      onLocationSelect?.(null);

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage =
        err.message || "Failed to submit mushroom. Please try again.";

      if (
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("token")
      ) {
        toast.error("Please log in to submit mushrooms");
      } else if (errorMessage.includes("image")) {
        toast.error(
          "Image error: Please ensure image is JPG, PNG, or WEBP and under 10MB"
        );
      } else if (errorMessage.includes("Location")) {
        toast.error("Please provide a valid location");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLocation = getCurrentLocation();

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white border border-stone-200 w-full max-w-md rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-300 my-8 max-h-[90vh] flex flex-col">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-stone-400 hover:text-emerald-600 transition-colors z-10"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        {/* HEADER - Fixed */}
        <div className="p-8 md:p-10 pb-6 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-6 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              Citizen Science
            </span>
          </div>
          <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tight">
            Add <span className="text-emerald-600 italic">Specimen</span>
          </h2>
        </div>

        {/* FORM - Scrollable */}
        <form
          id="mushroom-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 md:px-10 pb-8 md:pb-10 space-y-4"
        >
          {/* INFO MESSAGE */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-emerald-800 text-center">
              📸 <strong>Tip:</strong> Taking a photo with your camera (instead of selecting from gallery) will automatically include GPS location and date/time in EXIF data if location services are enabled. Otherwise, you can select location on map, search by city, or enter coordinates manually.
            </p>
          </div>

          {/* PHOTO UPLOAD - REQUIRED */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
              Photo <span className="text-red-500">*</span>
            </label>
            
            {imagePreview ? (
              // IMAGE PREVIEW
              <div className="relative w-full rounded-3xl overflow-hidden border-2 border-emerald-300 bg-stone-50">
                <img
                  src={imagePreview}
                  alt="Selected mushroom"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-xs font-bold mb-1 truncate">
                      {imageFile.name}
                    </p>
                    {exifDateTime && (
                      <p className="text-white/80 text-[10px] font-medium">
                        📅 {exifDateTime.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
                <label className="absolute bottom-3 right-3 cursor-pointer">
                  <span className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg">
                    Change Photo
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                    capture="environment"
                  />
                </label>
              </div>
            ) : (
              // UPLOAD AREA
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 group transition-all bg-stone-50 relative overflow-hidden">
                <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform z-10">
                  <Camera className="text-emerald-600" size={28} />
                </div>
                <p className="mt-4 text-xs text-stone-600 group-hover:text-emerald-700 font-bold uppercase tracking-wider z-10 text-center px-4">
                  Tap to Take Photo or Select from Gallery
                </p>
                <p className="mt-1 text-[10px] text-stone-400 group-hover:text-emerald-600 font-medium z-10 text-center px-4">
                  Camera photos include EXIF data automatically
                </p>
                <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-full z-10">
                  <span className="text-[9px] text-emerald-700 font-bold">📸</span>
                  <span className="text-[9px] text-emerald-700 font-medium">
                    EXIF data will be extracted automatically
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                  capture="environment"
                  required
                />
              </label>
            )}
            
            {exifDateTime && !imagePreview && (
              <p className="mt-2 text-xs text-emerald-600 font-medium">
                📅 Photo taken: {exifDateTime.toLocaleString()}
              </p>
            )}
          </div>

          {/* COMMON NAME - OPTIONAL */}
          <input
            value={commonName}
            onChange={(e) => setCommonName(e.target.value)}
            placeholder="Common name (optional)"
            className="w-full bg-stone-100 border border-stone-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-stone-800 placeholder:text-stone-400"
          />

          {/* LOCATION INPUT - REQUIRED */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
              Location <span className="text-red-500">*</span>
            </label>

            {/* Current Location Display */}
            {currentLocation && (
              <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-800">
                      📍 {currentLocation.latitude.toFixed(5)},{" "}
                      {currentLocation.longitude.toFixed(5)}
                    </p>
                    {hasExifGps && (
                      <p className="text-[10px] text-emerald-600 mt-1">
                        (From image EXIF)
                      </p>
                    )}
                  </div>
                  {hasExifGps && (
                    <button
                      type="button"
                      onClick={() => {
                        setHasExifGps(false);
                        setLocationInputMethod("map");
                      }}
                      className="px-3 py-1.5 text-[10px] font-bold uppercase bg-white border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-all"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Location Input Methods - Only show if EXIF GPS is not present */}
            {!hasExifGps && (
              <div className="space-y-3">
                {/* Method Selector */}
                {!currentLocation && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setLocationInputMethod("map")}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                        locationInputMethod === "map"
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      <MapPin size={12} className="inline mr-1" />
                      Map
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationInputMethod("city")}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                        locationInputMethod === "city"
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      <Search size={12} className="inline mr-1" />
                      City
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationInputMethod("manual")}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                        locationInputMethod === "manual"
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      <Navigation size={12} className="inline mr-1" />
                      Manual
                    </button>
                  </div>
                )}

                {/* Map Picker */}
                {locationInputMethod === "map" && (
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="w-full bg-stone-100 border-2 border-stone-200 rounded-2xl px-5 py-4 text-left font-bold transition hover:border-emerald-300 text-stone-600"
                  >
                    Click to select location on map
                  </button>
                )}

                {/* City Search */}
                {locationInputMethod === "city" && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      placeholder="Enter city name..."
                      className="flex-1 bg-stone-100 border border-stone-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-stone-800 placeholder:text-stone-400 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCitySearch();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCitySearch}
                      disabled={isGeocoding}
                      className="px-4 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-all"
                    >
                      {isGeocoding ? "..." : "Search"}
                    </button>
                  </div>
                )}

                {/* Manual Input */}
                {locationInputMethod === "manual" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        placeholder="Latitude (-90 to 90)"
                        className="flex-1 bg-stone-100 border border-stone-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-stone-800 placeholder:text-stone-400 text-sm"
                      />
                      <input
                        type="number"
                        step="any"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        placeholder="Longitude (-180 to 180)"
                        className="flex-1 bg-stone-100 border border-stone-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-stone-800 placeholder:text-stone-400 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleManualLocation}
                      className="w-full px-4 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase hover:bg-emerald-700 transition-all"
                    >
                      Set Location
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CLASSIFICATION FIELDS - OPTIONAL */}
          <div className="border-t border-stone-200 pt-6 mt-6">
            <p className="text-xs font-black uppercase tracking-widest text-stone-500 mb-4">
              Classification (Optional)
            </p>

            <div className="space-y-4">
              <MushroomSelectField
                label="Ecological Role"
                value={ecologicalRole}
                onChange={setEcologicalRole}
                options={ECOLOGICAL_ROLES}
              />

              <MushroomSelectField
                label="Texture"
                value={texture}
                onChange={setTexture}
                options={TEXTURES}
              />

              <MushroomSelectField
                label="Underside"
                value={underside}
                onChange={setUnderside}
                options={UNDERSIDES}
              />

              <MushroomSelectField
                label="Fruiting Surface"
                value={fruitingSurface}
                onChange={setFruitingSurface}
                options={FRUITING_SURFACES}
              />

              <MushroomSelectField
                label="Stem Presence"
                value={stemPresence}
                onChange={setStemPresence}
                options={STEM_PRESENCE}
              />

              {/* COMMON USES */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                  Common Uses
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_USES.map((use) => (
                    <button
                      key={use}
                      type="button"
                      onClick={() => {
                        setCommonUses((prev) =>
                          prev.includes(use)
                            ? prev.filter((u) => u !== use)
                            : [...prev, use]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                        commonUses.includes(use)
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {use
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* SUBMIT BUTTON - Fixed */}
        <div className="p-8 md:p-10 pt-4 border-t border-stone-200 shrink-0">
          <button
            type="submit"
            form="mushroom-form"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 py-5 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing..." : "Submit Observation"}
          </button>
        </div>
      </div>

      {/* LOCATION PICKER MODAL */}
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(location) => {
          onLocationSelect?.(location);
          setShowLocationPicker(false);
          setLocationInputMethod("map");
        }}
        selectedLocation={currentLocation}
      />
    </div>
  );
}
