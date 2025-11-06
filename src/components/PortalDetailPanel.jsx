import React, { useState, useEffect } from "react";
import { X, Globe, BarChart3, Users, FileText, AlertTriangle, PieChart, LineChart, Loader2, } from "lucide-react";
import { Line, Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

const PortalDetailPanel = ({ portalId, portalName, onClose }) => {
  const [loading, setLoading] = useState(true);

  // Mock data — replace with API results later
  const [portalData, setPortalData] = useState({
    kpis: {
      total_publications: 180,
      success_rate: 92,
      failure_rate: 8,
    },
    outputTrend: [
      { date: "2025-10-01", count: 5 },
      { date: "2025-10-02", count: 12 },
      { date: "2025-10-03", count: 9 },
      { date: "2025-10-04", count: 15 },
      { date: "2025-10-05", count: 7 },
    ],
    failureReasons: [
      { reason: "Timeout", count: 4 },
      { reason: "Invalid Token", count: 3 },
      { reason: "API Error", count: 2 },
      { reason: "Connection Lost", count: 1 },
    ],
    categoryMix: [
      { label: "Business", value: 40 },
      { label: "Politics", value: 25 },
      { label: "Sports", value: 15 },
      { label: "Technology", value: 20 },
    ],
    topAuthors: [
      { id: 1, name: "Ayesha Khan", posts: 34 },
      { id: 2, name: "Ravi Mehta", posts: 27 },
      { id: 3, name: "Huda Salem", posts: 21 },
    ],
    topArticles: [
      { id: 101, title: "Dubai AI Summit 2025 Highlights", views: 5200 },
      { id: 102, title: "GCC Economic Growth Outlook", views: 4100 },
      { id: 103, title: "UAE Green Energy Mission Expands", views: 3900 },
    ],
    gaTrafficTrend: [
      { date: "2025-10-01", sessions: 120 },
      { date: "2025-10-02", sessions: 240 },
      { date: "2025-10-03", sessions: 300 },
      { date: "2025-10-04", sessions: 280 },
      { date: "2025-10-05", sessions: 350 },
    ],
  });

  useEffect(() => {
    // Simulate API load
    setTimeout(() => setLoading(false), 600);
  }, []);

  if (loading) {
    return (
      <div className="fixed top-0 right-0 w-full sm:w-[550px] h-full bg-white shadow-2xl border-l border-gray-200 z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  // Chart Configs
  const outputTrendData = {
    labels: portalData.outputTrend.map((x) => x.date),
    datasets: [
      {
        label: "Publications",
        data: portalData.outputTrend.map((x) => x.count),
        borderColor: "#0ea5e9",
        backgroundColor: "#0ea5e930",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const failureReasonData = {
    labels: portalData.failureReasons.map((r) => r.reason),
    datasets: [
      {
        label: "Failures",
        data: portalData.failureReasons.map((r) => r.count),
        backgroundColor: ["#f87171", "#fb923c", "#facc15", "#a3a3a3"],
      },
    ],
  };

  const categoryMixData = {
    labels: portalData.categoryMix.map((c) => c.label),
    datasets: [
      {
        label: "Category Distribution",
        data: portalData.categoryMix.map((c) => c.value),
        backgroundColor: ["#60a5fa", "#34d399", "#fbbf24", "#f472b6"],
      },
    ],
  };

  const trafficData = {
    labels: portalData.gaTrafficTrend.map((x) => x.date),
    datasets: [
      {
        label: "GA Sessions",
        data: portalData.gaTrafficTrend.map((x) => x.sessions),
        borderColor: "#10b981",
        backgroundColor: "#10b98130",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="fixed top-0 right-0 w-full sm:w-[550px] h-full bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-black text-white">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5" />
          <h2 className="text-lg font-semibold">{portalName} Overview</h2>
        </div>
        <button onClick={onClose} className="hover:text-gray-300">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center border">
            <p className="text-gray-500 text-sm">Publications</p>
            <h3 className="text-2xl font-bold">{portalData.kpis.total_publications}</h3>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center border">
            <p className="text-gray-500 text-sm">Success Rate</p>
            <h3 className="text-2xl font-bold text-green-600">
              {portalData.kpis.success_rate}%
            </h3>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center border">
            <p className="text-gray-500 text-sm">Failure Rate</p>
            <h3 className="text-2xl font-bold text-red-600">
              {portalData.kpis.failure_rate}%
            </h3>
          </div>
        </div>

        {/* Output Trend */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span>Output Trend</span>
          </h3>
          <Line data={outputTrendData} />
        </div>

        {/* Failure Reasons */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>Failures by Reason</span>
          </h3>
          <Bar data={failureReasonData} />
        </div>

        {/* Category Mix */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-indigo-500" />
            <span>Category Mix</span>
          </h3>
          <Pie data={categoryMixData} />
        </div>

        {/* Top Authors */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-700" />
            <span>Top Authors</span>
          </h3>
          <ul className="space-y-2">
            {portalData.topAuthors.map((author) => (
              <li
                key={author.id}
                onClick={() => console.log("Open user detail:", author.id)}
                className="flex justify-between items-center p-2 hover:bg-gray-50 cursor-pointer rounded-md border-b"
              >
                <span>{author.name}</span>
                <span className="text-sm text-gray-600">{author.posts} posts</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Articles */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-700" />
            <span>Top Articles</span>
          </h3>
          <ul className="space-y-2">
            {portalData.topArticles.map((article) => (
              <li
                key={article.id}
                onClick={() => console.log("Open article performance:", article.id)}
                className="flex justify-between items-center p-2 hover:bg-gray-50 cursor-pointer rounded-md border-b"
              >
                <span className="truncate w-2/3">{article.title}</span>
                <span className="text-sm text-gray-600">{article.views} views</span>
              </li>
            ))}
          </ul>
        </div>

        {/* GA Traffic Trend */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <LineChart className="w-4 h-4 text-green-600" />
            <span>GA Traffic Trend</span>
          </h3>
          <Line data={trafficData} />
        </div>
      </div>
    </div>
  );
};

export default PortalDetailPanel;
