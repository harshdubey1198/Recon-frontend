import React, { useState, useEffect } from "react";
import {
  X,
  Globe,
  Users,
  BarChart3,
  PieChart,
  Loader2,
} from "lucide-react";
import { Line, Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import { toast } from "react-toastify";
import { fetchPortalStats } from "../../server";

const PortalDetailModal = ({ portalId, portalName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [portalData, setPortalData] = useState(null);

  useEffect(() => {
    if (portalId) loadPortalStats();
  }, [portalId]);

  const loadPortalStats = async () => {
    try {
      setLoading(true);
      const res = await fetchPortalStats(portalId);
      if (res?.data?.success && res.data.data) {
        setPortalData(res.data.data);
      } else {
        toast.error("Failed to load portal stats.");
      }
    } catch (err) {
      console.error("Error fetching portal stats:", err);
      toast.error("Server error while fetching portal stats.");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Loading State
  if (loading)
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center w-[400px]">
          <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-2" />
          <p className="text-gray-700 font-medium">Loading stats...</p>
        </div>
      </div>
    );

  // 🧩 Empty State
  if (!portalData)
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center w-[400px]">
          <p className="text-lg font-medium text-gray-700">
            No stats available for this portal.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    );

  // ✅ Data Extraction
  const { top_performing_categories, weekly_performance, top_contributors } =
    portalData;

  const weeklyData = {
    labels: weekly_performance.map((w) => w.day),
    datasets: [
      {
        label: "Success",
        data: weekly_performance.map((w) => w.success),
        backgroundColor: "#22c55e",
        borderColor: "#22c55e",
      },
      {
        label: "Failed",
        data: weekly_performance.map((w) => w.failed),
        backgroundColor: "#ef4444",
        borderColor: "#ef4444",
      },
    ],
  };

  const categoryData = {
    labels: top_performing_categories.map((c) => c.master_category__name),
    datasets: [
      {
        label: "Total Posts",
        data: top_performing_categories.map((c) => c.total_posts),
        backgroundColor: ["#60a5fa", "#34d399", "#fbbf24", "#f472b6"],
      },
    ],
  };

  const contributorData = {
    labels: top_contributors.map((u) => u.news_post__created_by__username),
    datasets: [
      {
        label: "Distributions",
        data: top_contributors.map((u) => u.total_distributions),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden scrollbar-hide relative animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black text-white rounded-t-2xl sticky top-0">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <h2 className="text-lg font-semibold">
              {portalName} – Analytics Overview
            </h2>
          </div>
          <button
            onClick={onClose}
            className="hover:text-gray-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top Categories */}
          {top_performing_categories?.length > 0 && (
            <div className="bg-white border rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-500" />
                Top Performing Categories
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-center">
                <div className="md:w-1/2">
                  <Pie data={categoryData} />
                </div>
                <ul className="md:w-1/2 mt-4 md:mt-0 text-sm text-gray-700 space-y-1 px-3">
                  {top_performing_categories.map((cat, i) => (
                    <li key={i} className="flex justify-between border-b py-1">
                      <span>{cat.master_category__name}</span>
                      <span className="font-semibold">{cat.total_posts}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Weekly Performance */}
          {weekly_performance?.length > 0 && (
            <div className="bg-white border rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                Weekly Performance
              </h3>
              <Bar data={weeklyData} />
            </div>
          )}

          {/* Top Contributors */}
          {top_contributors?.length > 0 && (
            <div className="bg-white border rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-700" />
                Top Contributors
              </h3>
              <Bar data={contributorData} />
              <ul className="mt-4 text-sm text-gray-700 space-y-1">
                {top_contributors.map((user, i) => (
                  <li
                    key={i}
                    className="flex justify-between border-b py-1 hover:bg-gray-50 cursor-pointer"
                  >
                    <span>{user.news_post__created_by__username}</span>
                    <span className="font-semibold">
                      {user.total_distributions} posts
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalDetailModal;
