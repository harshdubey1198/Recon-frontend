import React, { useState, useEffect } from "react";
import { X, Globe, Users, BarChart3, PieChart, LineChart, Loader2, } from "lucide-react";
import { Line, Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import { toast } from "react-toastify";
import { fetchPortalStats } from "../../server";

const PortalDetailPanel = ({ portalId, portalName, onClose }) => {
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

  if (loading) {
    return (
      <div className="fixed top-0 right-0 w-full sm:w-[550px] h-full bg-white shadow-2xl border-l border-gray-200 z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  if (!portalData) {
    return (
      <div className="fixed top-0 right-0 w-full sm:w-[550px] h-full bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col items-center justify-center text-gray-600">
        <p className="text-lg font-medium">No stats available for this portal.</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Close
        </button>
      </div>
    );
  }

  // ✅ Extract Data
  const { top_performing_categories, weekly_performance, top_contributors } = portalData;

  // 📊 Weekly performance chart
  const weeklyData = {
    labels: weekly_performance.map((w) => w.day),
    datasets: [
      {
        label: "Success",
        data: weekly_performance.map((w) => w.success),
        backgroundColor: "#22c55e",
        borderColor: "#22c55e",
        borderWidth: 1,
      },
      {
        label: "Failed",
        data: weekly_performance.map((w) => w.failed),
        backgroundColor: "#ef4444",
        borderColor: "#ef4444",
        borderWidth: 1,
      },
    ],
  };

  // 🥧 Top categories
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

  // 👥 Top contributors
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
    <div className="fixed top-0 right-0 w-full sm:w-[550px] h-full bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-black text-white sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5" />
          <h2 className="text-lg font-semibold">{portalName} – Stats Overview</h2>
        </div>
        <button onClick={onClose} className="hover:text-gray-300">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* 🔹 Top Performing Categories */}
        {top_performing_categories?.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-indigo-500" />
              <span>Top Performing Categories</span>
            </h3>
            <Pie data={categoryData} />
            <ul className="mt-4 text-sm text-gray-700 space-y-1">
              {top_performing_categories.map((cat, i) => (
                <li key={i} className="flex justify-between border-b py-1">
                  <span>{cat.master_category__name}</span>
                  <span className="font-semibold">{cat.total_posts}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 🔹 Weekly Performance */}
        {weekly_performance?.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span>Weekly Performance</span>
            </h3>
            <Bar data={weeklyData} />
          </div>
        )}

        {/* 🔹 Top Contributors */}
        {top_contributors?.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-700" />
              <span>Top Contributors</span>
            </h3>
            <Bar data={contributorData} />
            <ul className="mt-4 text-sm text-gray-700 space-y-1">
              {top_contributors.map((user, i) => (
                <li
                  key={i}
                  className="flex justify-between border-b py-1 hover:bg-gray-50 cursor-pointer"
                  onClick={() => console.log("Open user detail:", user.news_post__created_by__id)}
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
  );
};

export default PortalDetailPanel;
