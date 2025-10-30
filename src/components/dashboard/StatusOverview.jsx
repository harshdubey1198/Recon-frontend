import React from "react";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StatusOverview({ data = {} }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const role = user?.role || "";

  const published = data.published_posts || 0;
  const draft = data.draft_posts || 0;
  const failed = data.news_distribution?.failed_distributions || 0;
  const throughput = data.news_distribution?.throughput_per_hour || 0;
  const todayPosts = data.today_total_posts || 0;
  const todayFailed = data.news_distribution?.today?.failed || 0;

  // 🔹 Growth calculator (normal vs inverse logic)
  const calcGrowth = (total, today, inverse = false) => {
    if (!total || total === 0)
      return { percent: 0, text: "0%", color: "text-gray-500" };

    const percent = ((today / total) * 100).toFixed(1);
    const isPositive = today > 0;

    if (!inverse) {
      return {
        percent,
        text: isPositive
          ? `↑ ${today} (${percent}%) today`
          : `↓ 0 (${percent}%) today`,
        color: isPositive ? "text-green-600" : "text-red-600",
      };
    }

    // For failed → reversed color logic
    return {
      percent,
      text: isPositive
        ? `↑ ${today} (${percent}%) today`
        : `↓ 0 (${percent}%) today`,
      color: isPositive ? "text-red-600" : "text-green-600",
    };
  };

  const statuses = [
    {
      id: "published",
      title: "Published",
      value: published,
      color: "bg-green-100 text-green-600",
      icon: <CheckCircle2 className="w-5 h-5" />,
      growth: calcGrowth(published, todayPosts),
      showGrowth: true,
    },
    {
      id: "draft",
      title: "Drafts",
      value: draft,
      color: "bg-gray-100 text-gray-600",
      icon: <FileText className="w-5 h-5" />,
      growth: calcGrowth(draft, data.today_total_drafts || 0),
      showGrowth: true,
    },
    {
      id: "failed",
      title: "Failed",
      value: failed,
      color: "bg-red-100 text-red-600",
      icon: <AlertTriangle className="w-5 h-5" />,
      growth: calcGrowth(failed, todayFailed, true),
      showGrowth: true,
    },
    {
      id: "throughput",
      title: "Throughput / Hour",
      value: throughput.toFixed(2),
      color: "bg-blue-100 text-blue-600",
      icon: <Activity className="w-5 h-5" />,
      growth:
        throughput > 0
          ? {
              text: `↑ ${(throughput * 100).toFixed(1)}% efficiency`,
              color: "text-green-600",
            }
          : { text: "No activity today", color: "text-gray-500" },
      showGrowth: false, // ✅ control visibility here (set false to hide)
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* 🔹 Conditionally show growth */}
          {status.showGrowth && (
            <p className={`text-xs ${status.growth.color}`}>
              • {status.growth.text}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
