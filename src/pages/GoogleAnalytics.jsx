import React, { useState, useEffect , useContext  } from "react";
import {
  ChevronDown,
  Activity,
  MousePointerClick,
  UserPlus,
  Globe2,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  ComposedChart,
  Bar,
  Line
} from "recharts";
import { useAuth } from "../context/AuthContext";


// Import the GA4 API function
import { queryGA4 , fetchAssignPortal } from "../../server"; // Assuming queryGA4 function is exported from server.js

const GoogleAnalytics = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Last 7 days");
const { user } = useAuth();
const userId = user?.id;



  // GA4 overview totals
  const [ga4Totals, setGa4Totals] = useState({
    activeUsers: 0,
    eventCount: 0,
    newUsers: 0,
  });

  // Date-wise GA4 series (for non-realtime chart)
  const [ga4Series, setGa4Series] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState([]);
  const [realtimeTimeline, setRealtimeTimeline] = useState([]);
  const [selectedPid, setSelectedPid] = useState("497438670"); // default DXB
  const portalNameMap = {
  newsibileasia: "DXB",
  gccnews24: "GCC",
  cninews: "CNI",
  middleeastbulletin: "Middleeast",
  dxbnewsnetwork: "DXB",
};

const [filteredPidOptions, setFilteredPidOptions] = useState([]);

  

  const dateRanges = [
    "Today",
    // "Yesterday",
    "Last 7 days",
    "Last 28 days",
    "Last 30 days",
    "This month",
    "Last month",
  ];

  const pidOptions = [
    { label: "DXB", pid: "497438670" },
    { label: "CNI", pid: "511394726" },
    { label: "GCC", pid: "492306132" },
    { label: "Middleeast", pid: "491217318" },
    { label: "GCC ", pid: "491207995" },
  ];



  const handleSelect = (range) => {
    setSelectedRange(range);
    setFilterOpen(false);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";

    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
  };

  const getDateRange = (range) => {
    const today = new Date();
    let startDate, endDate;

    switch (range) {
      case "Today":
        startDate = endDate = today.toISOString().split("T")[0];
        break;
      case "Yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = endDate = yesterday.toISOString().split("T")[0];
        break;
      }
      case "Last 7 days": {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = today;
        startDate = startDate.toISOString().split("T")[0];
        endDate = endDate.toISOString().split("T")[0];
        break;
      }
      case "Last 28 days": {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 28);
        endDate = today;
        startDate = startDate.toISOString().split("T")[0];
        endDate = endDate.toISOString().split("T")[0];
        break;
      }
      case "Last 30 days": {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        endDate = today;
        startDate = startDate.toISOString().split("T")[0];
        endDate = endDate.toISOString().split("T")[0];
        break;
      }
      case "This month": {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        startDate = startDate.toISOString().split("T")[0];
        endDate = endDate.toISOString().split("T")[0];
        break;
      }
      case "Last month": {
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        startDate = new Date(
          lastMonth.getFullYear(),
          lastMonth.getMonth(),
          1
        );
        endDate = new Date(
          lastMonth.getFullYear(),
          lastMonth.getMonth() + 1,
          0
        );
        startDate = startDate.toISOString().split("T")[0];
        endDate = endDate.toISOString().split("T")[0];
        break;
      }
      default:
        startDate = endDate = today.toISOString().split("T")[0];
        break;
    }

    return { startDate, endDate };
  };

  // helper: GA date (YYYYMMDD) → label like "14 Feb"
  const formatGaDateLabel = (gaDateStr) => {
    if (!gaDateStr || gaDateStr.length !== 8) return gaDateStr || "";
    const year = parseInt(gaDateStr.slice(0, 4), 10);
    const month = parseInt(gaDateStr.slice(4, 6), 10) - 1;
    const day = parseInt(gaDateStr.slice(6, 8), 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    }); // e.g. "14 Feb"
  };

  const isRealtimeRange =
    selectedRange === "Today" || selectedRange === "Yesterday";

  // ----------------- REALTIME: last 30 min -----------------
  const fetchRealtimeData = async () => {
    try {
      const requestData = {
        pid: selectedPid,
        endpoint: "runRealtimeReport",
        body: {
          metrics: [{ name: "activeUsers" }],
        },
      };

      const response = await queryGA4(requestData);
      const activeUsers = parseInt(
        response?.data?.rows?.[0]?.metricValues?.[0]?.value || 0,
        10
      );

      setRealtimeTimeline((prev) => {
        const newData = [
          ...prev,
          {
            minuteAgo: prev.length, // 0 = just now, 1 = 1 min ago...
            activeUsers,
          },
        ];
        return newData.slice(-30); // keep last 30 points
      });
    } catch (error) {
      console.error("Realtime error:", error);
    }
  };

  // ----------------- GA4 REPORT: totals + date-wise series -----------------
  useEffect(() => {
    const fetchGA4Data = async () => {
      const { startDate, endDate } = getDateRange(selectedRange);
      try {
        const requestData = {
          pid: selectedPid,
          endpoint: "runReport",
          body: {
            dimensions: [{ name: "date" }], // important for date-wise chart
            metrics: [
              { name: "activeUsers" },
              { name: "eventCount" },
              { name: "newUsers" },
            ],
            dateRanges: [{ startDate, endDate }],
          },
        };

        const response = await queryGA4(requestData);
        const rows = response?.data?.rows || [];

        let totalActive = 0;
        let totalEvents = 0;
        let totalNew = 0;

        const series = rows.map((row) => {
          const gaDate = row.dimensionValues?.[0]?.value; // "20250214"
          const active = parseInt(row.metricValues?.[0]?.value || 0, 10);
          const events = parseInt(row.metricValues?.[1]?.value || 0, 10);
          const newU = parseInt(row.metricValues?.[2]?.value || 0, 10);

          totalActive += active;
          totalEvents += events;
          totalNew += newU;

          return {
            date: gaDate,
            label: formatGaDateLabel(gaDate),
            activeUsers: active,
            eventCount: events,
            newUsers: newU,
          };
        });

        setGa4Totals({
          activeUsers: totalActive,
          eventCount: totalEvents,
          newUsers: totalNew,
        });
        setGa4Series(series);
      } catch (error) {
        console.error("Error fetching GA4 data:", error);
      }
    };

    const fetchRealtimeCountryData = async () => {
      try {
        const requestData = {
          pid: selectedPid,
          endpoint: "runRealtimeReport",
          body: {
            metrics: [{ name: "activeUsers" }],
            dimensions: [{ name: "country" }],
          },
        };

        const response = await queryGA4(requestData);

        const activeCountryUsers = (response?.data?.rows || []).map(
          (row) => ({
            country: row.dimensionValues?.[0]?.value,
            activeUsers: parseInt(row.metricValues?.[0]?.value || 0, 10),
          })
        );

        activeCountryUsers.sort((a, b) => b.activeUsers - a.activeUsers);

        setSelectedCountry(activeCountryUsers);
      } catch (error) {
        console.error("Error fetching GA4 realtime country data:", error);
      }
    };

    // For any range, get date-wise data + country data
    fetchGA4Data();
    fetchRealtimeCountryData();

    // For Today / Yesterday, also refresh realtime timeline immediately
    if (isRealtimeRange) {
      fetchRealtimeData();
    }
  }, [selectedRange, selectedPid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime polling every minute (only meaningful for Today/Yesterday)
  useEffect(() => {
    if (!isRealtimeRange) return;

    fetchRealtimeData(); // initial

    const interval = setInterval(fetchRealtimeData, 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPid, isRealtimeRange]);

  // ----------------- CHART DATA PREP -----------------

  const latestRealtime =
    realtimeTimeline.length > 0
      ? realtimeTimeline[realtimeTimeline.length - 1]
      : null;

  const realtimeChartBase = realtimeTimeline.map((d) => ({
    label: d.minuteAgo === 0 ? "Now" : `${d.minuteAgo}m`,
    activeUsers: d.activeUsers,
  }));

  // base data for chart: either realtime (Today/Yesterday) or date-wise series
  const baseChartData = isRealtimeRange ? realtimeChartBase : ga4Series;

  // Option B: Line + Bar + Shaded Area (more visual)
  const composedChartData = baseChartData.map((d) => ({
    ...d,
    shaded: d.activeUsers, // same series used for filled area
  }));

  const headlineValue = isRealtimeRange
    ? latestRealtime
      ? formatNumber(latestRealtime.activeUsers)
      : "—"
    : formatNumber(ga4Totals.activeUsers);

  const headlineSuffix = isRealtimeRange
    ? "active users now"
    : "users in selected period";


useEffect(() => {
  if (!userId) return; // WAIT for context to load

  const loadUserPortals = async () => {
    try {
      const res = await fetchAssignPortal(userId);
      const assigned = res?.data?.data || [];
      console.log("Fetch assign portal" , assigned)

      const allowedLabels = assigned
        .map(item => portalNameMap[item.portal_name.toLowerCase()])
        .filter(Boolean);

      const finalList = pidOptions.filter(option =>
        allowedLabels.includes(option.label)
      );

      setFilteredPidOptions(finalList);

      if (finalList.length > 0) {
        setSelectedPid(finalList[0].pid);
      }

    } catch (err) {
      console.error("Portal loading error:", err);
    }
  };

  loadUserPortals();
}, [userId]);  // ✔ FIX: run when userId is available



  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              Analytics overview
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                GA4 Live
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Property performance, real-time users and country breakdown.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* PROPERTY SELECTOR */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                PROPERTY
              </span>
              <div className="relative">
                <select
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm pr-8 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedPid}
                  onChange={(e) => setSelectedPid(e.target.value)}
                >
                  {filteredPidOptions.length === 0 && (
                    <option>No portal assigned</option>
                  )}
                  {filteredPidOptions.map((p) => (
                    <option key={p.pid} value={p.pid}>
                      {p.label} — {p.pid}
                    </option>
                  ))}

                </select>
              </div>
            </div>

            {/* DATE RANGE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg bg-white shadow-sm hover:bg-slate-50"
              >
                {selectedRange}
                <ChevronDown size={16} className="text-slate-500" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-10">
                  {dateRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => handleSelect(range)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TOP METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Users"
            value={formatNumber(ga4Totals.activeUsers)}
            icon={Activity}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            helper="Total active users in selected date range"
          />
          <MetricCard
            title="Event count"
            value={formatNumber(ga4Totals.eventCount)}
            icon={MousePointerClick}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            helper="Total events triggered"
          />
          <MetricCard
            title="New users"
            value={formatNumber(ga4Totals.newUsers)}
            icon={UserPlus}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            helper="First-time users"
          />
          <MetricCard
            title="Users right now"
            value={
              latestRealtime ? formatNumber(latestRealtime.activeUsers) : "—"
            }
            icon={Activity}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            helper="Real-time active users"
          />
        </div>

        {/* REALTIME + COUNTRY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* REALTIME / DATE CHART PANEL */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {isRealtimeRange
                    ? "Users in last 30 minutes"
                    : "Users over selected period"}
                </p>

                <div className="flex items-end gap-2 mt-2">
                  <span className="text-4xl font-semibold text-slate-900 leading-none">
                    {headlineValue}
                  </span>
                  <span className="text-xs text-slate-500 mb-1">
                    {headlineSuffix}
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Active users
                </span>
              </div>
            </div>

            {/* COMPOSED CHART (Line + Bar + Shaded Area) */}
            <div className="px-4 sm:px-6 py-4">
              <div className="h-48 sm:h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={composedChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />

                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "#E5E7EB" }}
                    />

                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "#E5E7EB" }}
                      allowDecimals={false}
                    />

                    <Tooltip
                      cursor={{ fill: "rgba(59,130,246,0.04)" }}
                      contentStyle={{
                        borderRadius: 8,
                        borderColor: "#E5E7EB",
                        fontSize: 12,
                        padding: "10px",
                      }}
                      formatter={(value) => [`${value} users`, "Active users"]}
                    />

                    {/* Shaded area under line */}
                    <Area
                      type="monotone"
                      dataKey="shaded"
                      stroke={false}
                      fill="rgba(59,130,246,0.12)"
                    />

                    {/* Bars behind line */}
                    <Bar
                      dataKey="activeUsers"
                      barSize={14}
                      fill="rgba(59,130,246,0.45)"
                      radius={[6, 6, 0, 0]}
                    />

                    {/* Line on top */}
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="#1D4ED8"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#1D4ED8" }}
                      activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* COUNTRIES PANEL */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-slate-400" />
                  Users by country (realtime)
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Based on last few minutes of active users
                </p>
              </div>
            </div>

            <div className="px-6 py-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3 text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                <span>Country</span>
                <span>Active users</span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-72 pr-1">
                {selectedCountry.length > 0 ? (
                  selectedCountry.map((item, i) => (
                    <div
                      key={item.country + i}
                      className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-1 h-6 rounded-full bg-blue-500/70" />
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-900 truncate">
                            {item.country || "Unknown"}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {(
                              (item.activeUsers /
                                (latestRealtime?.activeUsers || 1)) *
                              100
                            ).toFixed(0)}
                            %&nbsp;of active users
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="hidden sm:block w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 bg-blue-500 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (item.activeUsers /
                                  (latestRealtime?.activeUsers || 1)) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {item.activeUsers}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400 py-4">
                    No realtime country data available.
                  </div>
                )}
              </div>

              <button
                type="button"
                className="mt-4 text-xs text-blue-600 hover:text-blue-700 flex items-center justify-end gap-1 font-medium"
              >
                View full realtime report
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable GA-style metric card
const MetricCard = ({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  helper,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">
            {value}
          </p>
        </div>
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      {helper && (
        <p className="mt-3 text-[11px] text-slate-400 leading-snug">{helper}</p>
      )}
    </div>
  );
};

export default GoogleAnalytics;
