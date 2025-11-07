import React, { useEffect, useState } from "react";
import {
  X,
  BarChart3,
  Users,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { toast } from "react-toastify";
import { fetchCategoryStats } from "../../server";

const CategoryDetailPanel = ({ categoryId, categoryName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (categoryId) loadCategoryStats();
  }, [categoryId]);

  const loadCategoryStats = async () => {
    try {
      setLoading(true);
      const res = await fetchCategoryStats(categoryId, "1m");
      if (res?.data?.status && res.data.data) {
        setStats(res.data.data);
      } else {
        toast.error("Failed to load category stats.");
      }
    } catch (err) {
      console.error("Error fetching category stats:", err);
      toast.error("Server error while fetching category data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="fixed top-0 right-0 w-full sm:w-[550px] h-full bg-white border-l border-gray-200 shadow-2xl z-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-700">
          <div className="w-6 h-6 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
          <span>Loading category data...</span>
        </div>
      </div>
    );

  if (!stats)
    return (
      <div className="fixed top-0 right-0 w-full sm:w-[550px] h-full bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col items-center justify-center text-gray-600">
        <p className="text-lg font-medium">No analytics available.</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Close
        </button>
      </div>
    );

  const {
    output_trend = [],
    top_portals = [],
    top_authors = [],
    inactivity_windows = [],
  } = stats;

  const outputData = {
    labels: output_trend.map((d) => d.date),
    datasets: [
      {
        label: "Total Posts",
        data: output_trend.map((d) => d.total_posts),
        borderColor: "#0ea5e9",
        backgroundColor: "#0ea5e920",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Successful Posts",
        data: output_trend.map((d) => d.success_posts),
        borderColor: "#10b981",
        backgroundColor: "#10b98130",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const portalsData = {
    labels: top_portals.map((p) => p.portal),
    datasets: [
      {
        label: "Published Articles",
        data: top_portals.map((p) => p.count),
        backgroundColor: "#6366f1",
      },
    ],
  };

  const authorsData = {
    labels: top_authors.map((a) => a.username),
    datasets: [
      {
        label: "Contributions",
        data: top_authors.map((a) => a.count),
        backgroundColor: "#10b981",
      },
    ],
  };

  return (
    <div className="fixed top-0 right-0 w-full sm:w-[550px] h-full bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-black text-white sticky top-0">
        <h2 className="text-lg font-semibold">{categoryName} Analytics</h2>
        <button onClick={onClose}>
          <X className="w-5 h-5 hover:text-gray-300" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Output Trend */}
        {output_trend.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Output Trend
            </h3>
            <Line data={outputData} />
          </div>
        )}

        {/* Top Portals */}
        {top_portals.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Top Portals
            </h3>
            <Bar data={portalsData} />
            <ul className="mt-3 text-sm text-gray-700 space-y-1">
              {top_portals.map((p, i) => (
                <li
                  key={i}
                  className="flex justify-between border-b py-1 hover:bg-gray-50 cursor-pointer"
                >
                  <span>{p.portal}</span>
                  <span className="font-semibold">{p.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top Authors */}
        {top_authors.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              Top Authors
            </h3>
            <Bar data={authorsData} />
            <ul className="mt-3 text-sm text-gray-700 space-y-1">
              {top_authors.map((a, i) => (
                <li
                  key={i}
                  className="flex justify-between border-b py-1 hover:bg-gray-50 cursor-pointer"
                >
                  <span>{a.username}</span>
                  <span className="font-semibold">{a.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Inactivity Windows */}
        {inactivity_windows.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Inactivity Windows
            </h3>
            <ul className="space-y-2">
              {inactivity_windows.map((win, i) => (
                <li
                  key={i}
                  className="flex justify-between border-b py-1 text-sm text-gray-700"
                >
                  <span>
                    {win.start} → {win.end}
                  </span>
                  <span className="font-semibold">
                    {win.duration_days} days
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Create New Article Button */}
        <div className="bg-white border rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>
              {inactivity_windows?.length
                ? `Last inactivity lasted ${
                    inactivity_windows[0]?.duration_days || 0
                  } days`
                : "Active recently"}
            </span>
          </div>
          <button className="px-3 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-800">
            Create New Article
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPanel;
