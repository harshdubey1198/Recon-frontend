// src/components/dashboard/KPIOverview.jsx
import React from "react";
import { FileText, Clock, Users, BarChart3, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function KPIOverview({ data = {} }) {
  const navigate = useNavigate();
  console.log(data);
  
  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const role = user?.role || "";
  console.log(user?.role);
  
  const formatTime = (time) => {
    if (!time || time === 0) return "0m";
    const hours = Math.floor(time / 60);
    const minutes = Math.round(time % 60);
    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
  };

  const calcGrowth = (total, today) => {
  if (!total || total === 0) return { percent: 0, text: "0%", color: "text-gray-500" };
  const percent = ((today / total) * 100).toFixed(1);
  return {
    percent,
    text:
      today > 0
        ? `↑ ${today} (${percent}%) today`
        : `↓ 0 (${percent}%) today`,
    color: today > 0 ? "text-green-600" : "text-red-600",
  };
};

const metrics = [
  {
    id: "avgTime",
    title: "Avg. Time to Publish",
    value: formatTime(data.news_distribution?.average_time_taken),
    color: "bg-pink-100 text-pink-600",
    icon: <Clock className="w-5 h-5" />,
    growth: calcGrowth(
      data.news_distribution?.average_time_taken,
      data.news_distribution?.today_average_time_taken
    ),
  },
  {
    id: "totalDistributions",
    title: "Total Distributions",
    value: data.news_distribution?.total_distributions || 0,
    color: "bg-green-100 text-green-600",
    icon: <BarChart3 className="w-5 h-5" />,
    growth: calcGrowth(
      data.news_distribution?.total_distributions,
      data.news_distribution?.today?.total
    ),
  },
  {
    id: "successfulDistributions",
    title: "Successful Distributions",
    value: data.news_distribution?.successful_distributions || 0,
    color: "bg-blue-100 text-blue-600",
    icon: <Activity className="w-5 h-5" />,
    growth: calcGrowth(
      data.news_distribution?.successful_distributions,
      data.news_distribution?.today?.successful
    ),
  },
  ...(role === "master"
    ? [
        {
          id: "activeUsers",
          title: "Active Users",
          value: data.total_users || data.activeUsers || 0,
          color: "bg-yellow-100 text-yellow-600",
          icon: <Users className="w-5 h-5" />,
          growth: calcGrowth(data.total_users || 0, data.today_total_posts || 0),
        },
      ]
    : []),
];


  return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2  ${
          user?.role === "master" ? "lg:grid-cols-4" : "lg:grid-cols-3"
        } gap-6 mb-8`}
      >
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
          <p className={`text-xs ${metric.growth.color}`}>{metric.growth.text}</p>
        </div>
      ))}
    </div>
  );
}
