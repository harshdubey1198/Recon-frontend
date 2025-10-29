import React from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StatusOverview({ data = {} }) {
  const navigate = useNavigate();

  const published = data.published_posts || 0;
  const draft = data.draft_posts || 0;
  const failed = data.news_distribution?.failed_distributions || 0;
  const pending = data.news_distribution?.pending_distributions || 0;
  const todayPosts = data.today_total_posts || 0;
  const todayFailed = data.news_distribution?.today?.failed || 0;
  const todayTotal = data.news_distribution?.today?.total || 0;

  const statuses = [
    {
      id: "published",
      title: "Published",
      value: published,
      color: "bg-green-100 text-green-600",
      icon: <CheckCircle2 className="w-5 h-5" />,
      change:
        todayPosts > 0
          ? `↑ ${todayPosts} new today`
          : "No new publications today",
      changeColor: todayPosts > 0 ? "text-green-600" : "text-gray-500",
    },
    {
      id: "draft",
      title: "Drafts",
      value: draft,
      color: "bg-gray-100 text-gray-600",
      icon: <FileText className="w-5 h-5" />,
      change:
        data.today_total_drafts > 0
          ? `↑ ${data.today_total_drafts} created today`
          : "No new drafts today",
      changeColor:
        data.today_total_drafts > 0 ? "text-blue-600" : "text-gray-500",
    },
    // {
    //   id: "pending",
    //   title: "Pending",
    //   value: pending,
    //   color: "bg-amber-100 text-amber-600",
    //   icon: <Clock className="w-5 h-5" />,
    //   change:
    //     pending > 0
    //       ? `${pending} awaiting approval`
    //       : "No pending distributions",
    //   changeColor: pending > 0 ? "text-amber-600" : "text-gray-500",
    // },
    {
      id: "failed",
      title: "Failed",
      value: failed,
      color: "bg-red-100 text-red-600",
      icon: <AlertTriangle className="w-5 h-5" />,
      change:
        todayFailed > 0
          ? `↑ ${todayFailed} failed today`
          : "No failures today",
      changeColor: todayFailed > 0 ? "text-red-600" : "text-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statuses.map((status) => (
        <div
          key={status.id}
          className="cursor-pointer bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${status.color}`}
          >
            {status.icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{status.value}</h3>
          <p className="text-sm text-gray-600 mb-1">{status.title}</p>
          <p className={`text-xs ${status.changeColor}`}>• {status.change}</p>
        </div>
      ))}
    </div>
  );
}
