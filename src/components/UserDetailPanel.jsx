import React, { useEffect, useState } from "react";
import { X, Loader2, BarChart3, Clock3, TrendingUp, FileWarning, } from "lucide-react";
import { fetchUserPerformance , fetchUserPortalPerformance} from "../../server";
import { toast } from "react-toastify";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const UserDetailPanel = ({ userId, username, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [portalStats, setPortalStats] = useState([]);

  useEffect(() => {
    if (userId) loadUserData();
  }, [userId]);

const loadUserData = async () => {
  try {
    setLoading(true);
    setNoData(false);

    const [userRes, portalRes] = await Promise.all([
      fetchUserPerformance(userId, "1m"),
      fetchUserPortalPerformance(userId, "1m"),
    ]);

    if (userRes?.data?.status) {
      const data = userRes.data.data;
      if (data && Object.keys(data).length > 0) {
        setUserData(data);
      } else setNoData(true);
    }

    if (portalRes?.data?.status) {
      setPortalStats(portalRes.data.data?.portals || []);
    }
  } catch (err) {
    console.error("Error loading user details:", err);
    toast.error("Error fetching user details.");
  } finally {
    setLoading(false);
  }
};

  

  // 🌀 Loading State
  if (loading) {
    return (
      <div className="fixed top-0 right-0 w-full sm:w-[480px] h-full bg-white shadow-2xl border-l border-gray-200 z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  // ⚠️ No Data Case
  if (noData) {
    return (
      <div className="fixed top-0 right-0 w-full sm:w-[480px] h-full bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-black text-white">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-lg font-semibold">{username}'s Performance</h2>
          </div>
          <button onClick={onClose} className="hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
          <FileWarning className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No data found
          </h3>
          <p className="text-gray-500 text-sm">
            No performance records available for this user in the selected range.
          </p>
          <button
            onClick={onClose}
            className="mt-5 px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ✅ Valid Data Case
  const {
    total_output,
    success_rate,
    average_time_to_publish_hours,
    active_time_window,
    timeline_of_actions,
  } = userData;

  const chartData = {
    labels: timeline_of_actions?.map((t) => t.date) || [],
    datasets: [
      {
        label: "Created",
        data: timeline_of_actions?.map((t) => t.created_count) || [],
        borderColor: "#0ea5e9",
        backgroundColor: "#0ea5e980",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Distributed",
        data: timeline_of_actions?.map((t) => t.distributed_count) || [],
        borderColor: "#f59e0b",
        backgroundColor: "#f59e0b40",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Failed",
        data: timeline_of_actions?.map((t) => t.failed_count) || [],
        borderColor: "#ef4444",
        backgroundColor: "#ef444440",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="fixed top-0 right-0 w-full sm:w-[480px] h-full bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-black text-white">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <h2 className="text-lg font-semibold">{username}'s Performance</h2>
        </div>
        <button onClick={onClose} className="hover:text-gray-300">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center border">
            <p className="text-gray-600 text-sm">Created</p>
            <h3 className="text-xl font-bold text-black">{total_output.created}</h3>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border">
            <p className="text-gray-600 text-sm">Published</p>
            <h3 className="text-xl font-bold text-green-600">{total_output.published}</h3>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border">
            <p className="text-gray-600 text-sm">Distributed</p>
            <h3 className="text-xl font-bold text-indigo-600">{total_output.distributed}</h3>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border">
            <p className="text-gray-600 text-sm">Failed</p>
            <h3 className="text-xl font-bold text-red-600">{total_output.total_failed}</h3>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border">
            <p className="text-gray-600 text-sm">Success Rate</p>
            <h3
              className={`text-xl font-bold ${
                success_rate > 50 ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {success_rate.toFixed(1)}%
            </h3>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center border">
            <p className="text-gray-600 text-sm">Active Hours</p>
            <h3 className="text-md font-semibold text-black">
              {active_time_window || "—"}
            </h3>
          </div>
        </div>

        {/* Average Time */}
        <div className="bg-gray-100 rounded-lg p-4 flex items-center space-x-3 border">
          <Clock3 className="text-gray-700 w-5 h-5" />
          <p className="text-gray-700 text-sm">
            <strong>Avg. Publish Time:</strong>{" "}
            {average_time_to_publish_hours > 0
              ? `${average_time_to_publish_hours.toFixed(1)} hrs`
              : "No data yet"}
          </p>
        </div>

        {/* Chart */}
        {timeline_of_actions && timeline_of_actions.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-700" />
              <span>Activity Timeline</span>
            </h3>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Daily Table */}
        {timeline_of_actions && timeline_of_actions.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm mt-6">
            <h3 className="font-semibold p-4 border-b">Daily Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Created</th>
                    <th className="px-4 py-2">Distributed</th>
                    <th className="px-4 py-2">Success</th>
                    <th className="px-4 py-2">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline_of_actions.map((row, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{row.date}</td>
                      <td className="px-4 py-2 text-black font-medium">{row.created_count}</td>
                      <td className="px-4 py-2 text-indigo-600 font-medium">{row.distributed_count}</td>
                      <td className="px-4 py-2 text-green-600 font-medium">{row.success_count}</td>
                      <td className="px-4 py-2 text-red-600 font-medium">{row.failed_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {portalStats.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm mt-6 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Portal Performance
            </h3>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2">Portal</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2 text-green-600">Success</th>
                    <th className="px-4 py-2 text-red-600">Failed</th>
                    <th className="px-4 py-2">Success %</th>
                  </tr>
                </thead>
                <tbody>
                  {portalStats.map((p, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{p.portal_name}</td>
                      <td className="px-4 py-2">{p.total_distributed}</td>
                      <td className="px-4 py-2 text-green-600">{p.success_distributed}</td>
                      <td className="px-4 py-2 text-red-600">{p.failed_distributed}</td>
                      <td className="px-4 py-2 font-semibold">
                        {p.success_ratio.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserDetailPanel;
