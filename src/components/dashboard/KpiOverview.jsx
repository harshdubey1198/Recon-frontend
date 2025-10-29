// src/components/dashboard/KPIOverview.jsx
import React from "react";
import { FileText, Clock, Users, BarChart3, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function KPIOverview({ data = {} }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const role = user?.role || "";

  const formatTime = (time) => {
    if (!time || time === 0) return "0m";
    const hours = Math.floor(time / 60);
    const minutes = Math.round(time % 60);
    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
  };

  const metrics = [
    {
      id: "avgTime",
      title: "Avg. Time to Publish",
      value: formatTime(data.news_distribution?.average_time_taken),
      color: "bg-pink-100 text-pink-600",
      icon: <Clock className="w-5 h-5" />,
      change:
        data.news_distribution?.today_average_time_taken > 0
          ? `↑ ${formatTime(
              data.news_distribution?.today_average_time_taken
            )} faster today`
          : "No change today",
      changeColor:
        data.news_distribution?.today_average_time_taken > 0
          ? "text-green-600"
          : "text-gray-500",
    },
    {
      id: "totalDistributions",
      title: "Total Distributions",
      value: data.news_distribution?.total_distributions || 0,
      color: "bg-green-100 text-green-600",
      icon: <BarChart3 className="w-5 h-5" />,
      change: `↑ ${data.news_distribution?.today?.total || 0} today`,
      changeColor: "text-green-600",
    },
    {
      id: "successfulDistributions",
      title: "Successful Distributions",
      value: data.news_distribution?.successful_distributions || 0,
      color: "bg-blue-100 text-blue-600",
      icon: <Activity className="w-5 h-5" />,
      change: `↑ ${data.news_distribution?.today?.successful || 0} today`,
      changeColor: "text-green-600",
    },
    ...(role === "master"
      ? [
          {
            id: "activeUsers",
            title: "Active Users",
            value: data.total_users || 0,
            color: "bg-yellow-100 text-yellow-600",
            icon: <Users className="w-5 h-5" />,
            change: "+ Users across all portals",
            changeColor: "text-blue-600",
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="cursor-pointer bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${metric.color}`}
          >
            {metric.icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
          <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
          <p className={`text-xs ${metric.changeColor}`}>{metric.change}</p>
        </div>
      ))}
    </div>
  );
}
