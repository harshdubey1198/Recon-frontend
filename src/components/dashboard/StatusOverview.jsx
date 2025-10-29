// src/components/dashboard/StatusOverview.jsx
import React from "react";
import { FileText, Clock, CheckCircle2, AlertTriangle, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statuses = [
    {
        id: "published",
        title: "Published",
        value: "93",
        color: "bg-green-100 text-green-600",
        icon: <CheckCircle2 className="w-5 h-5" />,
        change: "Live and visible",
        changeColor: "text-green-600",
        drillPath: "/dashboard/status/published",
    },
    // {
    //     id: "scheduled",
    //     title: "Scheduled",
    //     value: "12",
    //     color: "bg-blue-100 text-blue-600",
    //     icon: <CalendarClock className="w-5 h-5" />,
    //     change: "Upcoming publications",
    //     changeColor: "text-blue-600",
    //     drillPath: "/dashboard/status/scheduled",
    // },
    // {
    //   id: "pending",
    //   title: "Pending",
    //   value: "9",
    //   color: "bg-amber-100 text-amber-600",
    //   icon: <Clock className="w-5 h-5" />,
    //   change: "Awaiting approval",
    //   changeColor: "text-amber-600",
    //   drillPath: "/dashboard/status/pending",
    // },
    {
      id: "draft",
      title: "Draft",
      value: "24",
      color: "bg-gray-100 text-gray-600",
      icon: <FileText className="w-5 h-5" />,
      change: "Unpublished drafts",
      changeColor: "text-gray-500",
      drillPath: "/dashboard/status/draft",
    },
    {
        id: "failed",
        title: "Failed",
        value: "5",
        color: "bg-red-100 text-red-600",
        icon: <AlertTriangle className="w-5 h-5" />,
        change: "Needs retry",
        changeColor: "text-red-600",
        drillPath: "/dashboard/status/failed",
    },
];

export default function StatusOverview({ data = {} }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statuses.map((status) => (
        <div
          key={status.id}
        //   onClick={() => navigate(status.drillPath)}
          className="cursor-pointer bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${status.color}`}
          >
            {status.icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {data[status.id] || status.value}
          </h3>
          <p className="text-sm text-gray-600 mb-1">{status.title}</p>
          <p className={`text-xs ${status.changeColor}`}>• {status.change}</p>
        </div>
      ))}
    </div>
  );
}
