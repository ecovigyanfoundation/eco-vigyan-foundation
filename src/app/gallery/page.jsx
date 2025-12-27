"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, ChevronRight, Palette, School, User, Upload, X, Camera, Edit, Trash2 } from "lucide-react";

/* ---------------------------------------------------------
   GALLERY DATA & CONFIG
--------------------------------------------------------- */
const IMAGES_PER_PAGE = 9;

// Generate array of static image objects
const staticPaintings = Array.from({ length: 25 }, (_, i) => {
  const id = i + 1;
  const extension = id >= 16 ? "jpeg" : "jpg";

  return {
    id: `static-${id}`,
    src: `/paintings/p${id}.${extension}`,
    studentName: "Student Name",
    schoolName: "Name of School",
    isStatic: true,
  };
});

export default function EcoArtGallery() {
  const { user, isWriterOrAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    image: null,
    imagePreview: null,
    studentName: "",
    schoolName: "",
    description: "",
  });
  const [editForm, setEditForm] = useState({
    id: null,
    studentName: "",
    schoolName: "",
    description: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editing, setEditing] = useState(false);


  // Fetch uploaded images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();
        if (data.images) {
          const formattedImages = data.images.map((img) => ({
            id: img._id || img.id,
            src: img.image.url,
            studentName: img.studentName,
            schoolName: img.schoolName,
            description: img.description || "",
            isStatic: false,
          }));
          setUploadedImages(formattedImages);
        }
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  // Combine static and uploaded images
  const allImages = [...uploadedImages, ...staticPaintings];
  const totalPages = Math.ceil(allImages.length / IMAGES_PER_PAGE);

  // Pagination Logic
  const indexOfLastItem = currentPage * IMAGES_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - IMAGES_PER_PAGE;
  const currentItems = allImages.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check if user can upload (writer or admin)
  const canUpload = isWriterOrAdmin();

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPEG, PNG, or WebP image");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setUploadForm({ ...uploadForm, image: file });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadForm({ ...uploadForm, image: file, imagePreview: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.image || !uploadForm.studentName.trim() || !uploadForm.schoolName.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", uploadForm.image);
      formData.append("studentName", uploadForm.studentName.trim());
      formData.append("schoolName", uploadForm.schoolName.trim());
      formData.append("description", uploadForm.description.trim());

      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success("Image uploaded successfully!");
      
      // Add new image to the list
      const newImage = {
        id: data.galleryItem.id,
        src: data.galleryItem.image.url,
        studentName: data.galleryItem.studentName,
        schoolName: data.galleryItem.schoolName,
        description: data.galleryItem.description || "",
        isStatic: false,
      };
      setUploadedImages([newImage, ...uploadedImages]);

      // Reset form
      setUploadForm({
        image: null,
        imagePreview: null,
        studentName: "",
        schoolName: "",
        description: "",
      });
      setShowUploadModal(false);
    } catch (error) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Handle edit
  const handleEdit = (image) => {
    setEditForm({
      id: image.id,
      studentName: image.studentName,
      schoolName: image.schoolName,
      description: image.description || "",
    });
    setShowEditModal(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      const res = await fetch(`/api/gallery/${editForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: editForm.studentName.trim(),
          schoolName: editForm.schoolName.trim(),
          description: editForm.description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      toast.success("Image updated successfully!");

      // Update the image in the list
      setUploadedImages(uploadedImages.map((img) =>
        img.id === editForm.id
          ? {
              ...img,
              studentName: data.galleryItem.studentName,
              schoolName: data.galleryItem.schoolName,
              description: data.galleryItem.description || "",
            }
          : img
      ));

      setShowEditModal(false);
      setEditForm({ id: null, studentName: "", schoolName: "", description: "" });
    } catch (error) {
      toast.error(error.message || "Failed to update image");
    } finally {
      setEditing(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/gallery/${deletingId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }

      toast.success("Image deleted successfully!");

      // Remove from list
      setUploadedImages(uploadedImages.filter((img) => img.id !== deletingId));

      setShowDeleteConfirm(false);
      setDeletingId(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete image");
      setShowDeleteConfirm(false);
      setDeletingId(null);
    }
  };

  // Open delete confirmation
  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  return (
    <main className="min-h-screen bg-stone-50 pb-20 font-sans">
      {/* --- Header Section --- */}
      <section className="bg-emerald-900 py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            <Palette className="w-96 h-96 absolute -bottom-20 -left-20 text-white" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight"
          >
            Eco-Art Gallery
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            className="h-1.5 bg-emerald-400 mx-auto mb-8 rounded-full"
          />
          <p className="text-xl md:text-2xl text-emerald-100 font-medium leading-relaxed">
            Art is where young minds speak for the Earth. This gallery features paintings created by students during our nature education programs.
          </p>
          
          {/* Upload Button for Writers/Admins */}
          {canUpload && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowUploadModal(true)}
              className="mt-8 inline-flex items-center gap-2 bg-white text-emerald-900 px-6 py-3 rounded-full font-bold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Upload className="w-5 h-5" />
              Upload Image
            </motion.button>
          )}
        </div>
      </section>

      {/* --- Gallery Grid --- */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-stone-500">Loading gallery...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {currentItems.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-stone-500">No images in gallery yet.</p>
                </div>
              ) : (
                currentItems.map((painting) => (
              <motion.div
                key={painting.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-4 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all group"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100 mb-4">
                  <img
                    src={painting.src}
                    alt={`Painting by ${painting.studentName}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="bg-white/90 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-900">
                        View Artwork
                     </span>
                  </div>
                  
                  {/* Edit/Delete Buttons for Writers/Admins (only on uploaded images) */}
                  {canUpload && !painting.isStatic && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(painting)}
                        className="p-2 bg-white/90 rounded-full hover:bg-white transition shadow-lg"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-emerald-700" />
                      </button>
                      <button
                        onClick={() => confirmDelete(painting.id)}
                        className="p-2 bg-red-500/90 rounded-full hover:bg-red-500 transition shadow-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Captions */}
                <div className="px-2 space-y-2">
                  <div className="flex items-center gap-2 text-stone-700">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold border-b border-stone-200 flex-grow pb-1 italic">
                      {painting.studentName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-500">
                    <School className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold uppercase tracking-tight">
                      {painting.schoolName}
                    </span>
                  </div>
                  {painting.description && (
                    <p className="text-xs text-stone-600 mt-2 line-clamp-2">
                      {painting.description}
                    </p>
                  )}
                </div>
              </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}

        {/* --- Pagination Controls --- */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-4">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-full bg-white shadow-md hover:bg-emerald-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-emerald-700" />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-12 h-12 rounded-full font-bold transition-all shadow-sm ${
                    currentPage === number
                      ? "bg-emerald-600 text-white scale-110 shadow-emerald-200"
                      : "bg-white text-stone-600 hover:bg-emerald-50"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-full bg-white shadow-md hover:bg-emerald-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-6 h-6 text-emerald-700" />
            </button>
          </div>
        )}
      </section>

      {/* --- Quote Footer --- */}
      <section className="max-w-3xl mx-auto px-4 mt-20 text-center">
        <p className="text-stone-400 italic font-medium">
          &ldquo;Every child is an artist. The problem is how to remain an artist once he grows up.&rdquo;
        </p>
      </section>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-stone-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-stone-800">Upload Gallery Image</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Image
                </label>
                <div className="relative">
                  {uploadForm.imagePreview ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-stone-200">
                      <img
                        src={uploadForm.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setUploadForm({ ...uploadForm, image: null, imagePreview: null })}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:bg-stone-50 transition">
                      <Camera className="w-12 h-12 text-stone-400 mb-2" />
                      <span className="text-sm font-medium text-stone-600">
                        Click to upload image
                      </span>
                      <span className="text-xs text-stone-500 mt-1">
                        JPEG, PNG, or WebP (max 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={uploadForm.studentName}
                  onChange={(e) => setUploadForm({ ...uploadForm, studentName: e.target.value })}
                  placeholder="Enter student name"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              {/* School Name */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  value={uploadForm.schoolName}
                  onChange={(e) => setUploadForm({ ...uploadForm, schoolName: e.target.value })}
                  placeholder="Enter school name"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Enter description about the artwork..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
                <p className="text-xs text-stone-500 mt-1">
                  {uploadForm.description.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadForm.image}
                  className="flex-1 px-6 py-3 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-stone-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-stone-800">Edit Gallery Image</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* Student Name */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={editForm.studentName}
                  onChange={(e) => setEditForm({ ...editForm, studentName: e.target.value })}
                  placeholder="Enter student name"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              {/* School Name */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  value={editForm.schoolName}
                  onChange={(e) => setEditForm({ ...editForm, schoolName: e.target.value })}
                  placeholder="Enter school name"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Enter description about the artwork..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
                <p className="text-xs text-stone-500 mt-1">
                  {editForm.description.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="flex-1 px-6 py-3 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {editing ? "Updating..." : "Update Image"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Delete Image?</h2>
            <p className="text-stone-600 mb-6">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingId(null);
                }}
                className="flex-1 px-6 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}