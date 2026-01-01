"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  MapPin,
  Image as ImageIcon,
  Upload,
  FileSpreadsheet,
  X,
  Loader2,
  Edit3,
  CheckSquare,
  Square,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminMushroomsPage() {
  const router = useRouter();
  const [mushrooms, setMushrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    systemImports: 0,
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [selectedMushrooms, setSelectedMushrooms] = useState(new Set());
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState({
    commonName: "",
    ecologicalRole: "",
    texture: "",
    underside: "",
    stemPresence: "",
    commonUses: [],
  });
  const [bulkEditing, setBulkEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayPage, setDisplayPage] = useState(1); // Display page for pagination UI
  const [totalPages, setTotalPages] = useState(1);
  const [totalMushrooms, setTotalMushrooms] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [allLoadedMushrooms, setAllLoadedMushrooms] = useState([]); // Store all loaded mushrooms for lazy loading
  const observerTarget = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
    setDisplayPage(1);
    setMushrooms([]);
    setAllLoadedMushrooms([]);
    fetchMushrooms();
    fetchCounts();
  }, [statusFilter]);

  useEffect(() => {
    if (statusFilter === "system-imports" && currentPage > 1 && currentPage === 2) {
      // Lazy load page 2
      fetchMoreMushrooms();
    } else if (statusFilter === "system-imports" && currentPage > 2) {
      // Pagination: load specific page
      fetchMoreMushrooms();
    }
  }, [currentPage, statusFilter]);

  // Update displayed mushrooms based on display page
  useEffect(() => {
    if (statusFilter === "system-imports" && allLoadedMushrooms.length > 0) {
      const startIndex = (displayPage - 1) * 200;
      const endIndex = startIndex + 200;
      setMushrooms(allLoadedMushrooms.slice(startIndex, endIndex));
    }
  }, [displayPage, allLoadedMushrooms, statusFilter]);

  // Intersection Observer for lazy loading (only loads page 2 automatically)
  useEffect(() => {
    if (statusFilter !== "system-imports" || isLoadingMore || currentPage !== 1 || !hasMore || totalMushrooms <= 200 || allLoadedMushrooms.length >= 200) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && currentPage === 1 && allLoadedMushrooms.length < 400) {
          setCurrentPage(2);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, statusFilter, currentPage, totalMushrooms, allLoadedMushrooms.length]);

  const fetchCounts = async () => {
    try {
      // Fetch counts for all statuses in a single request
      const res = await fetch("/api/admin/mushrooms?countsOnly=true");
      const data = await res.json();

      if (res.ok && data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  const fetchMushrooms = async () => {
    try {
      setLoading(true);
      const url = statusFilter === "system-imports" 
        ? `/api/admin/mushrooms?systemImports=true&page=1&limit=200`
        : `/api/admin/mushrooms?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to fetch mushrooms");
      }

      if (statusFilter === "system-imports") {
        const loadedMushrooms = data.mushrooms || [];
        setAllLoadedMushrooms(loadedMushrooms);
        // Show first 200 items
        setMushrooms(loadedMushrooms.slice(0, 200));
        setTotalPages(data.totalPages || 1);
        setTotalMushrooms(data.total || 0);
        setHasMore(data.hasMore || false);
      } else {
        setMushrooms(data.mushrooms || []);
        setAllLoadedMushrooms([]);
        setTotalPages(1);
        setTotalMushrooms(data.mushrooms?.length || 0);
        setHasMore(false);
      }
      setError(null);
      
      // Refresh counts after any action
      fetchCounts();
    } catch (err) {
      setError(err.message);
      setMushrooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreMushrooms = async () => {
    if (statusFilter !== "system-imports" || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const url = `/api/admin/mushrooms?systemImports=true&page=${currentPage}&limit=200`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch more mushrooms");
      }

      // For page 2, append to existing (lazy loading)
      if (currentPage === 2) {
        setAllLoadedMushrooms((prev) => [...prev, ...(data.mushrooms || [])]);
      } else {
        // For pagination (page > 2), we need to ensure we have all previous pages
        // Load all pages up to currentPage
        const pagesToLoad = [];
        for (let page = 2; page <= currentPage; page++) {
          if (page === currentPage) {
            pagesToLoad.push(Promise.resolve({ mushrooms: data.mushrooms || [] }));
          } else {
            // Load previous pages if not already loaded
            const pageUrl = `/api/admin/mushrooms?systemImports=true&page=${page}&limit=200`;
            pagesToLoad.push(fetch(pageUrl).then(res => res.json()));
          }
        }
        
        const results = await Promise.all(pagesToLoad);
        const allMushrooms = [allLoadedMushrooms.slice(0, 200)]; // Keep first 200
        results.forEach(result => {
          allMushrooms.push(...(result.mushrooms || []));
        });
        setAllLoadedMushrooms(allMushrooms.flat());
      }
      setHasMore(data.hasMore || false);
    } catch (err) {
      toast.error(err.message || "Failed to load more mushrooms");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
          <Clock size={12} />
          Pending
        </span>
      ),
      approved: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
          <CheckCircle size={12} />
          Approved
        </span>
      ),
      rejected: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <XCircle size={12} />
          Rejected
        </span>
      ),
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Please select an Excel file");
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const res = await fetch("/api/admin/import-mushrooms", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      toast.success(
        `Import completed: ${data.results.success} successful, ${data.results.failed} failed`
      );

      if (data.results.errors.length > 0) {
        console.error("Import errors:", data.results.errors);
        // Show first few errors
        const errorPreview = data.results.errors.slice(0, 5).join("\n");
        if (data.results.errors.length > 5) {
          toast.error(
            `Some errors occurred. Check console for details.\n${errorPreview}...`
          );
        } else {
          toast.error(`Errors:\n${errorPreview}`);
        }
      }

      // Refresh the list
      fetchMushrooms();
      fetchCounts();
      setShowImportModal(false);
      setImportFile(null);
    } catch (error) {
      toast.error(error.message || "Failed to import mushrooms");
    } finally {
      setImporting(false);
    }
  };

  const toggleSelectMushroom = (id) => {
    setSelectedMushrooms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedMushrooms.size === mushrooms.length) {
      setSelectedMushrooms(new Set());
    } else {
      setSelectedMushrooms(new Set(mushrooms.map((m) => m._id)));
    }
  };

  const handleBulkEdit = async () => {
    if (selectedMushrooms.size === 0) {
      toast.error("Please select at least one mushroom");
      return;
    }

    setBulkEditing(true);
    try {
      const updates = {};
      if (bulkEditForm.commonName) updates.commonName = bulkEditForm.commonName;
      if (bulkEditForm.ecologicalRole) updates.ecologicalRole = bulkEditForm.ecologicalRole;
      if (bulkEditForm.texture) updates.texture = bulkEditForm.texture;
      if (bulkEditForm.underside) updates.underside = bulkEditForm.underside;
      if (bulkEditForm.stemPresence) updates.stemPresence = bulkEditForm.stemPresence;
      if (bulkEditForm.commonUses.length > 0) updates.commonUses = bulkEditForm.commonUses;

      // Update each selected mushroom
      const updatePromises = Array.from(selectedMushrooms).map((id) =>
        fetch(`/api/admin/mushrooms/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        toast.success(`Updated ${successful} mushroom(s) successfully`);
      }
      if (failed > 0) {
        toast.error(`Failed to update ${failed} mushroom(s)`);
      }

      // Refresh the list
      fetchMushrooms();
      setSelectedMushrooms(new Set());
      setShowBulkEditModal(false);
      setBulkEditForm({
        commonName: "",
        ecologicalRole: "",
        texture: "",
        underside: "",
        stemPresence: "",
        commonUses: [],
      });
    } catch (error) {
      toast.error(error.message || "Failed to update mushrooms");
    } finally {
      setBulkEditing(false);
    }
  };

  const toggleBulkUse = (use) => {
    setBulkEditForm((prev) => ({
      ...prev,
      commonUses: prev.commonUses.includes(use)
        ? prev.commonUses.filter((u) => u !== use)
        : [...prev.commonUses, use],
    }));
  };

  const handleBulkDelete = async () => {
    if (selectedMushrooms.size === 0) {
      toast.error("Please select at least one mushroom");
      return;
    }

    // Check if all selected mushrooms are system imports
    const selectedMushroomData = mushrooms.filter((m) =>
      selectedMushrooms.has(m._id)
    );

    const systemImports = selectedMushroomData.filter((m) => {
      const submittedBy = m.submittedBy;
      return (
        submittedBy?.email === "system@ecovigyan.org" ||
        submittedBy?.username === "system" ||
        submittedBy?.name === "System Import"
      );
    });

    if (systemImports.length === 0) {
      toast.error("Only system-imported mushrooms can be deleted");
      return;
    }

    if (systemImports.length < selectedMushrooms.size) {
      toast.error(
        `Only ${systemImports.length} of ${selectedMushrooms.size} selected mushrooms are system imports. Only system imports will be deleted.`
      );
    }

    setDeleting(true);
    try {
      // Delete only system imports
      const deletePromises = systemImports.map((mushroom) =>
        fetch(`/api/admin/mushrooms/${mushroom._id}`, {
          method: "DELETE",
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter(
        (r) => r.status === "fulfilled" && r.value.ok
      ).length;
      const failed = results.filter(
        (r) => r.status === "rejected" || !r.value.ok
      ).length;

      if (successful > 0) {
        toast.success(`Deleted ${successful} system-imported mushroom(s) successfully`);
      }
      if (failed > 0) {
        toast.error(`Failed to delete ${failed} mushroom(s)`);
      }

      // Refresh the list
      fetchMushrooms();
      setSelectedMushrooms(new Set());
      setShowDeleteModal(false);
    } catch (error) {
      toast.error(error.message || "Failed to delete mushrooms");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading mushrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
                Mushroom <span className="text-emerald-600">Submissions</span>
              </h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
                Review and manage submitted mushroom observations
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {selectedMushrooms.size > 0 && (
                <>
                  <button
                    onClick={() => setShowBulkEditModal(true)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2"
                  >
                    <Edit3 size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Bulk Edit</span>
                    <span className="sm:hidden">Edit</span>
                    <span>({selectedMushrooms.size})</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Delete System Imports</span>
                    <span className="sm:hidden">Delete</span>
                    <span>({selectedMushrooms.size})</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2"
              >
                <Upload size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Import Excel</span>
                <span className="sm:hidden">Import</span>
              </button>
              <Link
                href="/"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS FILTERS */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 sm:mx-0 px-3 sm:px-0">
          {[
            { value: "pending", label: "Pending", icon: Clock },
            { value: "approved", label: "Approved", icon: CheckCircle },
            { value: "rejected", label: "Rejected", icon: XCircle },
            { value: "system-imports", label: "System Imports", icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = statusFilter === tab.value;
            const count = tab.value === "system-imports" 
              ? (counts.systemImports || 0)
              : (counts[tab.value] || 0);
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                }`}
              >
                <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-bold text-red-800">{error}</p>
          </div>
        )}

        {/* MUSHROOMS LIST */}
        {mushrooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">
                No {statusFilter} mushrooms
              </h3>
              <p className="text-sm text-gray-600">
                {statusFilter === "pending"
                  ? "There are no pending submissions to review."
                  : `No mushrooms have been ${statusFilter} yet.`}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* SELECT ALL CHECKBOX */}
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {selectedMushrooms.size === mushrooms.length ? (
                  <CheckSquare size={18} className="text-emerald-600" />
                ) : (
                  <Square size={18} />
                )}
                <span>
                  {selectedMushrooms.size === mushrooms.length
                    ? "Deselect All"
                    : "Select All"}
                </span>
              </button>
              {selectedMushrooms.size > 0 && (
                <span className="text-sm text-gray-600 font-medium">
                  {selectedMushrooms.size} selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {mushrooms.map((mushroom) => {
                const isSelected = selectedMushrooms.has(mushroom._id);
                return (
                  <div
                    key={mushroom._id}
                    className={`bg-white rounded-2xl border-2 overflow-hidden transition-all group relative ${
                      isSelected
                        ? "border-emerald-500 shadow-lg"
                        : "border-gray-200 hover:border-emerald-300 hover:shadow-xl"
                    }`}
                  >
                    {/* SELECTION CHECKBOX */}
                    <div
                      className="absolute top-3 left-3 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectMushroom(mushroom._id);
                      }}
                    >
                      <button className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors">
                        {isSelected ? (
                          <CheckSquare size={20} className="text-emerald-600" />
                        ) : (
                          <Square size={20} className="text-gray-400" />
                        )}
                      </button>
                    </div>

                    <Link
                      href={`/admin/mushrooms/${mushroom._id}`}
                      className="block"
                    >
                {/* IMAGE */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {mushroom.images && mushroom.images.length > 0 ? (
                    <img
                      src={mushroom.images[0].url}
                      alt={mushroom.commonName || "Mushroom"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="text-gray-300" size={48} />
                    </div>
                  )}
                  {/* STATUS BADGE OVERLAY */}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(mushroom.status)}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h3 className="font-black text-lg text-gray-900 mb-3 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {mushroom.commonName || "Unnamed Mushroom"}
                  </h3>

                  {/* METADATA */}
                  <div className="space-y-2 text-sm">
                    {mushroom.submittedBy && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={14} className="text-gray-400" />
                        <span className="font-medium">
                          {mushroom.submittedBy.name ||
                            mushroom.submittedBy.username ||
                            "Unknown User"}
                        </span>
                      </div>
                    )}

                    {mushroom.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="font-medium">
                          {mushroom.location.latitude.toFixed(4)},{" "}
                          {mushroom.location.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="font-medium">
                        {formatDate(mushroom.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* VIEW BUTTON */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                        Review
                      </span>
                      <Eye
                        size={16}
                        className="text-emerald-600 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* LAZY LOADING TRIGGER - Only for system imports, only for first 200 items */}
            {statusFilter === "system-imports" && hasMore && currentPage === 1 && totalMushrooms > 200 && allLoadedMushrooms.length < 400 && (
              <div ref={observerTarget} className="col-span-full flex justify-center py-8">
                {isLoadingMore ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                    <p className="text-sm font-bold text-gray-600">
                      Loading more mushrooms...
                    </p>
                  </div>
                ) : (
                  <div className="h-20" />
                )}
              </div>
            )}

            {/* PAGINATION - Only for system imports when more than 200 items */}
            {statusFilter === "system-imports" && totalMushrooms > 200 && (() => {
              const startItem = (displayPage - 1) * 200 + 1;
              const endItem = Math.min(displayPage * 200, totalMushrooms);
              
              return (
                <div className="col-span-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {startItem} - {endItem} of {totalMushrooms} mushrooms
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDisplayPage(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={displayPage === 1 || isLoadingMore}
                      className="px-3 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">First</span>
                    </button>
                    <button
                      onClick={() => {
                        if (displayPage > 1) {
                          const newDisplayPage = displayPage - 1;
                          setDisplayPage(newDisplayPage);
                          // Load the page if not already loaded
                          if (newDisplayPage > 1 && allLoadedMushrooms.length < newDisplayPage * 200) {
                            setCurrentPage(newDisplayPage + 1);
                          }
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      disabled={displayPage === 1 || isLoadingMore}
                      className="px-3 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                    <div className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-300 rounded-lg whitespace-nowrap">
                      Page {displayPage} of {totalPages}
                    </div>
                    <button
                      onClick={() => {
                        if (displayPage < totalPages) {
                          const newDisplayPage = displayPage + 1;
                          setDisplayPage(newDisplayPage);
                          // Load the page if not already loaded
                          if (allLoadedMushrooms.length < newDisplayPage * 200) {
                            setCurrentPage(newDisplayPage + 1);
                          }
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      disabled={displayPage >= totalPages || isLoadingMore}
                      className="px-3 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setDisplayPage(totalPages);
                        // Load all pages up to the last one if needed
                        if (allLoadedMushrooms.length < totalPages * 200) {
                          setCurrentPage(totalPages + 1);
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={displayPage >= totalPages || isLoadingMore}
                      className="px-3 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">Last</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="text-emerald-600" size={24} />
                  Import Mushrooms from Excel
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Upload an Excel file with mushroom data
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* FILE UPLOAD */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Excel File (.xlsx, .xls)
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 transition-colors cursor-pointer"
                />
                {importFile && (
                  <p className="mt-2 text-sm text-emerald-600 font-medium">
                    Selected: {importFile.name}
                  </p>
                )}
              </div>

              {/* EXPECTED FORMAT */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h3 className="font-bold text-emerald-900 mb-2">
                  Expected Excel Format:
                </h3>
                <div className="text-sm text-emerald-800 space-y-1">
                  <p>
                    <strong>Column 1:</strong> Photo/Image (Google Drive link) <span className="text-red-600">*Required</span>
                  </p>
                  <p>
                    <strong>Column 2:</strong> Latitude <span className="text-red-600">*Required</span>
                  </p>
                  <p>
                    <strong>Column 3:</strong> Longitude <span className="text-red-600">*Required</span>
                  </p>
                  <p>
                    <strong>Column 4:</strong> Name (optional)
                  </p>
                  <p>
                    <strong>Column 5:</strong> Stem (optional: "has-stem" or "has-no-stem")
                  </p>
                  <p>
                    <strong>Column 6:</strong> Bottom/Underside (optional: "gills", "pores", "teeth", etc.)
                  </p>
                  <p>
                    <strong>Column 7:</strong> Texture (optional: "soft-to-touch", "hard-to-touch", "jelly-like", "leathery")
                  </p>
                  <p>
                    <strong>Column 8:</strong> Role (optional: "decomposer", "symbiont", "parasite")
                  </p>
                  <p>
                    <strong>Column 9:</strong> Use (optional: "edible", "inedible", "poisonous", "medicinal", etc.)
                  </p>
                </div>
                <p className="text-xs text-emerald-700 mt-3 italic">
                  Note: Column names are case-insensitive. Google Drive links
                  will be automatically converted to direct image URLs. Optional fields can be left empty.
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={importing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || importing}
                  className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Import
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK EDIT MODAL */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Edit3 className="text-blue-600" size={24} />
                  Bulk Edit Mushrooms
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Update {selectedMushrooms.size} selected mushroom(s)
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBulkEditModal(false);
                  setBulkEditForm({
                    commonName: "",
                    ecologicalRole: "",
                    texture: "",
                    underside: "",
                    stemPresence: "",
                    commonUses: [],
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* COMMON NAME */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Common Name (optional)
                </label>
                <input
                  type="text"
                  value={bulkEditForm.commonName}
                  onChange={(e) =>
                    setBulkEditForm({ ...bulkEditForm, commonName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="Leave empty to not update"
                />
              </div>

              {/* ECOLOGICAL ROLE */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ecological Role (optional)
                </label>
                <select
                  value={bulkEditForm.ecologicalRole}
                  onChange={(e) =>
                    setBulkEditForm({ ...bulkEditForm, ecologicalRole: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">Leave unchanged</option>
                  <option value="decomposer">Decomposer</option>
                  <option value="symbiont">Symbiont</option>
                  <option value="parasite">Parasite</option>
                </select>
              </div>

              {/* TEXTURE */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Texture (optional)
                </label>
                <select
                  value={bulkEditForm.texture}
                  onChange={(e) =>
                    setBulkEditForm({ ...bulkEditForm, texture: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">Leave unchanged</option>
                  <option value="soft-to-touch">Soft to Touch</option>
                  <option value="hard-to-touch">Hard to Touch</option>
                  <option value="jelly-like">Jelly-like</option>
                  <option value="leathery">Leathery</option>
                </select>
              </div>

              {/* UNDERSIDE */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Underside/Bottom (optional)
                </label>
                <select
                  value={bulkEditForm.underside}
                  onChange={(e) =>
                    setBulkEditForm({ ...bulkEditForm, underside: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">Leave unchanged</option>
                  <option value="gills">Gills</option>
                  <option value="pores">Pores</option>
                  <option value="teeth">Teeth</option>
                  <option value="ball-with-no-distinctive-bottom">Ball with no distinctive bottom</option>
                  <option value="cup-with-no-distinctive-bottom">Cup with no distinctive bottom</option>
                  <option value="star-with-no-distinctive-bottom">Star with no distinctive bottom</option>
                  <option value="jelly-with-no-distinctive-bottom">Jelly with no distinctive bottom</option>
                  <option value="sponge-with-no-distinctive-bottom">Sponge with no distinctive bottom</option>
                </select>
              </div>

              {/* STEM PRESENCE */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Stem Presence (optional)
                </label>
                <select
                  value={bulkEditForm.stemPresence}
                  onChange={(e) =>
                    setBulkEditForm({ ...bulkEditForm, stemPresence: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">Leave unchanged</option>
                  <option value="has-stem">Has Stem</option>
                  <option value="has-no-stem">Has No Stem</option>
                </select>
              </div>

              {/* COMMON USES */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Common Uses (optional - select multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {["edible", "inedible", "poisonous", "medicinal", "hallucinogenic", "other-uses", "mysterious"].map(
                    (use) => (
                      <button
                        key={use}
                        onClick={() => toggleBulkUse(use)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                          bulkEditForm.commonUses.includes(use)
                            ? "bg-blue-50 border-blue-600 text-blue-700"
                            : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {use.replace(/-/g, " ")}
                      </button>
                    )
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leave empty to not update. Selected uses will be added to existing uses.
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowBulkEditModal(false);
                    setBulkEditForm({
                      commonName: "",
                      ecologicalRole: "",
                      texture: "",
                      underside: "",
                      stemPresence: "",
                      commonUses: [],
                    });
                  }}
                  className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={bulkEditing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkEdit}
                  disabled={bulkEditing}
                  className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {bulkEditing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit3 size={16} />
                      Update {selectedMushrooms.size} Mushroom(s)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Trash2 size={24} className="text-red-600" />
                  Delete System Imports
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  This action cannot be undone
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={deleting}
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-bold">{selectedMushrooms.size}</span> selected
                system-imported mushroom(s)?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-semibold">
                  ⚠️ Warning: Only system-imported mushrooms will be deleted. Regular
                  user submissions will be skipped.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="px-6 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete {selectedMushrooms.size} Mushroom(s)
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



