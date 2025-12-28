"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

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
  });

  useEffect(() => {
    fetchMushrooms();
    fetchCounts();
  }, [statusFilter]);

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
      const res = await fetch(`/api/admin/mushrooms?status=${statusFilter}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to fetch mushrooms");
      }

      setMushrooms(data.mushrooms || []);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                Mushroom <span className="text-emerald-600">Submissions</span>
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Review and manage submitted mushroom observations
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* STATUS FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-3 mb-6">
          {[
            { value: "pending", label: "Pending", icon: Clock },
            { value: "approved", label: "Approved", icon: CheckCircle },
            { value: "rejected", label: "Rejected", icon: XCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = statusFilter === tab.value;
            const count = counts[tab.value] || 0;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                }`}
              >
                <Icon size={18} />
                {tab.label}
                {count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mushrooms.map((mushroom) => (
              <Link
                key={mushroom._id}
                href={`/admin/mushrooms/${mushroom._id}`}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-emerald-300 hover:shadow-xl transition-all group"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



