import React, { useEffect, useState } from "react";
import { queryGA4 } from "../../../server";
import {
  Activity,
  MousePointerClick,
  Star,
  UserPlus,
  RefreshCcw,
} from "lucide-react";

const GA4Leaderboard = ({ range, customRange }) => {
  const [ga4, setGa4] = useState({
    activeUsers: 0,
    eventCount: 0,
    newUsers: 0,
    keyEvents: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const ga4PidOptions = [
    { label: "DXB", pid: "497438670" },
    { label: "CNI", pid: "511394726" },
    { label: "GCC", pid: "492306132" },
    { label: "MiddleEast", pid: "491217318" },
    { label: "GCC (Backup)", pid: "491207995" },
  ];

  const formatDateRange = () => {
    const f = (d) => d.toISOString().split("T")[0];
    const today = new Date();

    let start, end;

    if (range === "today") {
      start = end = f(today);
    } else if (range === "7d") {
      const d7 = new Date(today);
      d7.setDate(d7.getDate() - 7);
      start = f(d7);
      end = f(today);
    } else if (range === "30d") {
      const d30 = new Date(today);
      d30.setDate(d30.getDate() - 30);
      start = f(d30);
      end = f(today);
    } else if (range === "custom") {
      start = customRange?.start;
      end = customRange?.end;
    } else {
      start = end = f(today);
    }

    if (!start || !end) return null;

    return [{ startDate: start, endDate: end }];
  };

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toLocaleString();
  };

  const loadGA4 = async () => {
    const dateRanges = formatDateRange();
    if (!dateRanges) return;

    setIsLoading(true);

    let totals = { active: 0, events: 0, newU: 0, key: 0 };

    try {
      // 🔥 Call all PIDs in PARALLEL instead of sequential loop
      const requests = ga4PidOptions.map((portal) =>
        queryGA4({
          pid: portal.pid,
          endpoint: "runReport",
          body: {
            metrics: [
              { name: "activeUsers" },
              { name: "eventCount" },
              { name: "newUsers" },
              { name: "keyEvents" },
            ],
            dateRanges,
          },
        })
      );

      const results = await Promise.allSettled(requests);

      results.forEach((res, idx) => {
        if (res.status !== "fulfilled") {
          console.error("GA4 error for pid:", ga4PidOptions[idx].pid, res.reason);
          return;
        }

        const row = res.value?.data?.rows?.[0]?.metricValues;
        if (!row) return;

        totals.active += parseInt(row[0]?.value || 0, 10);
        totals.events += parseInt(row[1]?.value || 0, 10);
        totals.newU += parseInt(row[2]?.value || 0, 10);
        totals.key += parseInt(row[3]?.value || 0, 10);
      });

      setGa4({
        activeUsers: totals.active,
        eventCount: totals.events,
        newUsers: totals.newU,
        keyEvents: totals.key,
      });

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("GA4 batch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGA4();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, customRange?.start, customRange?.end]);

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            GA4 Analytics Overview
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Aggregated metrics across{" "}
            <span className="font-semibold">{ga4PidOptions.length}</span> GA4
            properties
          </p>
        </div>

        <button
          onClick={loadGA4}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Users"
          value={formatNumber(ga4.activeUsers)}
          color="blue"
          icon={Activity}
          subtitle="Users in selected period"
          loading={isLoading}
        />
        <MetricCard
          title="Event Count"
          value={formatNumber(ga4.eventCount)}
          color="indigo"
          icon={MousePointerClick}
          subtitle="Total tracked events"
          loading={isLoading}
        />
        <MetricCard
          title="Key Events"
          value={formatNumber(ga4.keyEvents)}
          color="green"
          icon={Star}
          subtitle="Important conversions"
          loading={isLoading}
        />
        <MetricCard
          title="New Users"
          value={formatNumber(ga4.newUsers)}
          color="purple"
          icon={UserPlus}
          subtitle="First-time visitors"
          loading={isLoading}
        />
      </div>

      {/* Footer small info */}
      <div className="mt-3 flex items-center justify-between text-[11px] md:text-xs text-gray-500">
        <span>
          ⚡ GA4 data merged from DXB, CNI, GCC & other properties.
        </span>
        {lastUpdated && (
          <span>Last updated at {lastUpdated}</span>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, color, icon: Icon, subtitle, loading }) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${colorMap[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {loading && (
          <span className="text-[11px] text-gray-400 animate-pulse">
            updating…
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 mb-1">
        {loading ? (
          <span className="inline-block w-16 h-5 bg-gray-100 rounded animate-pulse" />
        ) : (
          value
        )}
      </p>
      <p className="text-[11px] text-gray-500">{subtitle}</p>
    </div>
  );
};

export default GA4Leaderboard;
