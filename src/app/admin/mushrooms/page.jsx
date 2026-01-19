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
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

// Shimmer skeleton component for loading state
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden animate-pulse">
    <div className="aspect-video bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200 relative overflow-hidden">
      <div className="absolute inset-0 shimmer-effect" />
    </div>
    <div className="p-5 space-y-3">
      <div className="h-6 bg-stone-200 rounded-lg w-3/4 shimmer-effect" />
      <div className="space-y-2">
        <div className="h-4 bg-stone-100 rounded w-1/2 shimmer-effect" />
        <div className="h-4 bg-stone-100 rounded w-2/3 shimmer-effect" />
        <div className="h-4 bg-stone-100 rounded w-1/2 shimmer-effect" />
      </div>
      <div className="pt-4 border-t border-stone-100">
        <div className="h-4 bg-stone-200 rounded w-20 shimmer-effect" />
      </div>
    </div>
  </div>
);

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
  const [bulkApproving, setBulkApproving] = useState(false);
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

  // Bulk approve using efficient single-query API
  const handleBulkApprove = async () => {
    if (selectedMushrooms.size === 0) {
      toast.error("Please select at least one mushroom");
      return;
    }

    setBulkApproving(true);
    try {
      const res = await fetch("/api/admin/mushrooms/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          mushroomIds: Array.from(selectedMushrooms),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to approve mushrooms");
      }

      toast.success(
        `Approved ${data.modifiedCount} mushroom(s)! ${data.pointsAwarded} points awarded.`
      );

      // Refresh the list and counts
      fetchMushrooms();
      fetchCounts();
      setSelectedMushrooms(new Set());
    } catch (error) {
      toast.error(error.message || "Failed to approve mushrooms");
    } finally {
      setBulkApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50/30 to-stone-100">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 border-b border-emerald-700/20 shadow-xl shadow-emerald-500/10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="h-8 bg-white/20 rounded-lg w-64 animate-pulse" />
                <div className="h-4 bg-white/10 rounded w-48 animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 bg-white/20 rounded-lg w-24 animate-pulse" />
                <div className="h-10 bg-white/20 rounded-lg w-24 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs Skeleton */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
          <div className="flex gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-white rounded-xl w-32 animate-pulse border border-stone-200" />
            ))}
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>

        {/* Shimmer animation styles */}
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          :global(.shimmer-effect) {
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
            background-size: 200% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50/30 to-stone-100">
      {/* HEADER - Modern Gradient */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 border-b border-emerald-700/20 shadow-xl shadow-emerald-500/10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight drop-shadow-lg">
                  Mushroom <span className="text-emerald-100">Submissions</span>
                </h1>
              </div>
              <p className="text-sm text-emerald-100/80 ml-14">
                Review and manage submitted mushroom observations
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {selectedMushrooms.size > 0 && (
                <>
                  {/* BULK APPROVE BUTTON */}
                  <button
                    onClick={handleBulkApprove}
                    disabled={bulkApproving}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-emerald-700 bg-white hover:bg-emerald-50 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-1.5 sm:gap-2 border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkApproving ? (
                      <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" />
                    ) : (
                      <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                    )}
                    <span className="hidden sm:inline">{bulkApproving ? "Approving..." : "Approve"}</span>
                    <span className="sm:hidden">{bulkApproving ? "..." : "OK"}</span>
                    <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md text-xs">{selectedMushrooms.size}</span>
                  </button>
                  <button
                    onClick={() => setShowBulkEditModal(true)}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-blue-600 bg-white hover:bg-blue-50 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-1.5 sm:gap-2 border border-blue-100"
                  >
                    <Edit3 size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Bulk Edit</span>
                    <span className="sm:hidden">Edit</span>
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md text-xs">{selectedMushrooms.size}</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-red-600 bg-white hover:bg-red-50 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-1.5 sm:gap-2 border border-red-100"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Delete</span>
                    <span className="sm:hidden">Del</span>
                    <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md text-xs">{selectedMushrooms.size}</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-emerald-600 bg-white hover:bg-emerald-50 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-1.5 sm:gap-2 border border-emerald-100"
              >
                <Upload size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Import Excel</span>
                <span className="sm:hidden">Import</span>
              </button>
              <Link
                href="/"
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white/90 hover:text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm whitespace-nowrap"
              >
                <span className="hidden sm:inline">← Back to Home</span>
                <span className="sm:hidden">← Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS FILTERS */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-3 sm:mx-0 px-3 sm:px-0">
          {[
            { value: "pending", label: "Pending", icon: Clock, color: "yellow" },
            { value: "approved", label: "Approved", icon: CheckCircle, color: "green" },
            { value: "rejected", label: "Rejected", icon: XCircle, color: "red" },
            { value: "system-imports", label: "System Imports", icon: Upload, color: "purple" },
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
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-300/30 scale-[1.02]"
                    : "bg-white text-gray-700 border-2 border-stone-200 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                <Icon size={16} className={`sm:w-[18px] sm:h-[18px] ${isActive ? "drop-shadow" : ""}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-stone-100 text-stone-600"
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
          <div className="bg-white rounded-3xl border-2 border-stone-200 p-12 text-center shadow-xl">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ImageIcon className="text-stone-400" size={36} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">
                No {statusFilter.replace('-', ' ')} mushrooms
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {statusFilter === "pending"
                  ? "All caught up! There are no pending submissions to review."
                  : `No mushrooms have been ${statusFilter.replace('-', ' ')} yet.`}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* SELECT ALL CHECKBOX */}
            <div className="mb-6 flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-stone-200/50 w-fit">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors"
              >
                {selectedMushrooms.size === mushrooms.length ? (
                  <CheckSquare size={20} className="text-emerald-600" />
                ) : (
                  <Square size={20} className="text-stone-400" />
                )}
                <span>
                  {selectedMushrooms.size === mushrooms.length
                    ? "Deselect All"
                    : "Select All"}
                </span>
              </button>
              {selectedMushrooms.size > 0 && (
                <span className="text-sm text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                  {selectedMushrooms.size} selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {mushrooms.map((mushroom) => {
                const isSelected = selectedMushrooms.has(mushroom._id);
                return (
                  <div
                    key={mushroom._id}
                    className={`bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 group relative hover:-translate-y-1 ${
                      isSelected
                        ? "border-emerald-500 shadow-xl shadow-emerald-100 ring-4 ring-emerald-100"
                        : "border-stone-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-50"
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
                      <button className={`p-2 backdrop-blur-md rounded-xl shadow-lg transition-all hover:scale-110 ${
                        isSelected 
                          ? "bg-emerald-500 text-white" 
                          : "bg-white/90 hover:bg-white"
                      }`}>
                        {isSelected ? (
                          <CheckSquare size={18} className="text-white" />
                        ) : (
                          <Square size={18} className="text-stone-400" />
                        )}
                      </button>
                    </div>

                    <Link
                      href={`/admin/mushrooms/${mushroom._id}`}
                      className="block"
                    >
                      {/* IMAGE */}
                      <div className="aspect-video bg-gradient-to-br from-stone-100 to-stone-200 relative overflow-hidden">
                        {mushroom.images && mushroom.images.length > 0 ? (
                          <img
                            src={mushroom.images[0].url}
                            alt={mushroom.commonName || "Mushroom"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="text-stone-300" size={48} />
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                        <div className="space-y-2.5 text-sm">
                          {mushroom.submittedBy && (
                            <div className="flex items-center gap-2.5 text-gray-600">
                              <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center">
                                <User size={12} className="text-stone-500" />
                              </div>
                              <span className="font-medium">
                                {mushroom.submittedBy.name ||
                                  mushroom.submittedBy.username ||
                                  "Unknown User"}
                              </span>
                            </div>
                          )}

                          {mushroom.location && (
                            <div className="flex items-center gap-2.5 text-gray-600">
                              <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center">
                                <MapPin size={12} className="text-stone-500" />
                              </div>
                              <span className="font-medium">
                                {mushroom.location.latitude.toFixed(4)},{" "}
                                {mushroom.location.longitude.toFixed(4)}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2.5 text-gray-600">
                            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center">
                              <Calendar size={12} className="text-stone-500" />
                            </div>
                            <span className="font-medium">
                              {formatDate(mushroom.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* VIEW BUTTON */}
                        <div className="mt-5 pt-4 border-t border-stone-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                              Review →
                            </span>
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                              <Eye
                                size={14}
                                className="text-emerald-600 group-hover:scale-110 transition-transform"
                              />
                            </div>
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



