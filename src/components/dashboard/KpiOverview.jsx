// src/components/dashboard/KPIOverview.jsx
import React from "react";
import { FileText, Clock, Users, BarChart3, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const metrics = [
  {
    id: "totalPublications",
    title: "Total Publications",
    value: "12",
    color: "bg-blue-100 text-blue-600",
    icon: <FileText className="w-5 h-5" />,
    change: "+12.5% from last month",
    changeColor: "text-green-600",
    drillPath: "/dashboard/publications",
  },
  {
    id: "throughput",
    title: "Throughput / Hour",
    value: "8.6",
    color: "bg-green-100 text-green-600",
    icon: <Activity className="w-5 h-5" />,
    change: "+2.3% efficiency",
    changeColor: "text-green-600",
    drillPath: "/dashboard/throughput",
  },
  {
    id: "activePortals",
    title: "Active Portals",
    value: "12",
    color: "bg-indigo-100 text-indigo-600",
    icon: <BarChart3 className="w-5 h-5" />,
    change: "All operational",
    changeColor: "text-green-600",
    drillPath: "/dashboard/portals",
  },
  {
    id: "activeUsers",
    title: "Active Users",
    value: "27",
    color: "bg-yellow-100 text-yellow-600",
    icon: <Users className="w-5 h-5" />,
    change: "+4 new this week",
    changeColor: "text-blue-600",
    drillPath: "/dashboard/users",
  },
  {
    id: "avgTime",
    title: "Avg. Time to Publish",
    value: "3h 24m",
    color: "bg-pink-100 text-pink-600",
    icon: <Clock className="w-5 h-5" />,
    change: "↓ faster than last week",
    changeColor: "text-green-600",
    drillPath: "/dashboard/time",
  },
];

export default function KPIOverview({ data = {} }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {metrics.map((metric) => (
        <div
          key={metric.id}
        //   onClick={() => navigate(metric.drillPath)}
          className="cursor-pointer bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${metric.color}`}
          >
            {metric.icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {data[metric.id] || metric.value}
          </h3>
          <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
          <p className={`text-xs ${metric.changeColor}`}>↑ {metric.change}</p>
        </div>
      ))}
    </div>
  );
}
