import React, { useState, useEffect, useRef } from "react";
import { fetchAdminStats, fetchMasterCategories, fetchNewsList } from "../../server";
import KPIOverview from "../components/dashboard/KpiOverview";
import StatusOverview from "../components/dashboard/StatusOverview";
import PortalLeaderboard from "../components/dashboard/PortalLeaderboard";
import HeatMapCategory from "../components/dashboard/HeatMapCategory";
import AnalyticsComponent from "../components/dashboard/AnalyticsComponent";
import SuccessRateChart from "../components/dashboard/SuccessRateChart";
import { Calendar,Filter } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  // const [categories, setCategories] = useState([]);
  // const [recentPosts, setRecentPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const scrollContainerRef = useRef(null);
  const portalLeaderboardRef = useRef(null);
  const heatmapCategoryRef = useRef(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totaltodayPosts: 0,
    categories: 0,
    domains: 0,
    targets: 0,
    activeUsers: 0,
    revenue: 0,
    total_posts: 0,
    draft_posts: 0,
    published_posts: 0,
    today_total_posts: 0,
    today_total_drafts: 0,
    total_portals: 0,
    total_master_categories: 0,
    news_distribution: {
      total_distributions: 0,
      successful_distributions: 0,
      failed_distributions: 0,
      pending_distributions: 0,
      retry_counts: 0,
      today: { total: 0, successful: 0, failed: 0 }
    }
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(15000);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Date range filter states
  const [range, setRange] = useState("7d");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);

  // const loadNews = async (pageNumber = 1) => {
  //   if (isFetching) return;
  //   setIsFetching(true);
  //   try {
  //     const res = await fetchNewsList(pageNumber);
  //     if (res?.data?.status) {
  //       const mapped = res.data.data.map((item) => ({
  //         id: item.id,
  //         title: item.news_post_title,
  //         category: item.portal_category_name || item.master_category_name,
  //         status: item.status === "SUCCESS" ? "Published" : "Draft",
  //         views: item.retry_count || 0,
  //         date: new Date(item.sent_at).toLocaleDateString(),
  //         image: item.news_post_image,
  //       }));

  //       setRecentPosts((prev) =>
  //         pageNumber === 1 ? mapped : [...prev, ...mapped]
  //       );
  //       setPagination(res.data.pagination);
  //       setPage(pageNumber);
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch news list:", err);
  //   } finally {
  //     setIsFetching(false);
  //   }
  // };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || isFetching || !pagination) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrolledToBottom = scrollHeight - scrollTop <= clientHeight + 50;

    if (scrolledToBottom && pagination.next) {
      const nextPage = page + 1;
      if (nextPage <= pagination.total_pages) {
        loadNews(nextPage);
      }
    }
  };

 const loadStats = async (rangeParam = null, customRangeParam = null) => {
    try {
      const effectiveRange = rangeParam || range;
      const effectiveCustomRange = customRangeParam || customRange;
      const customDates = effectiveRange === "custom" ? effectiveCustomRange : null;
      const res = await fetchAdminStats(effectiveRange, customDates);
      if (res?.data?.status) {
        setStats({
          totalPosts: res.data.data.total_posts,
          totaltodayPosts: res.data.data.today_total_posts,
          categories: res.data.data.total_master_categories,
          domains: res.data.data.total_portals,
          targets: res.data.data.news_distribution.total_distributions,
          activeUsers: res.data.data.total_users,
          revenue: res.data.data.news_distribution.successful_distributions,
          total_posts: res.data.data.total_posts,
          draft_posts: res.data.data.draft_posts,
          published_posts: res.data.data.published_posts,
          today_total_posts: res.data.data.today_total_posts,
          today_total_drafts: res.data.data.today_total_drafts,
          total_portals: res.data.data.total_portals,
          total_master_categories: res.data.data.total_master_categories,
          news_distribution: res.data.data.news_distribution
        });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };


  // const loadCategories = async () => {
  //   try {
  //     const res = await fetchMasterCategories();
  //     if (res?.data?.status) {
  //       const mapped = res.data.data.map((cat, idx) => ({
  //         name: cat.name,
  //         posts: Math.floor(Math.random() * 500),
  //         color: [
  //           "bg-blue-500",
  //           "bg-purple-500",
  //           "bg-green-500",
  //           "bg-orange-500",
  //           "bg-red-500",
  //           "bg-indigo-500",
  //         ][idx % 6],
  //       }));
  //       setCategories(mapped);
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch categories:", err);
  //   }
  // };

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    if (newRange === "custom") {
      setShowCustomDateInputs(true);
    } else {
      setShowCustomDateInputs(false);
       // Use the freshly chosen range directly
     refreshAllData(newRange, null);
    }
  };

  const handleApplyCustomRange = () => {
    if (customRange.start && customRange.end) {
     // Ensure 'custom' range + picked dates are used in all API calls
    refreshAllData("custom", { ...customRange });
      setShowCustomDateInputs(false);
    }
  };

  useEffect(() => {
    loadStats();
    // loadCategories();
    // loadNews(1);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (err) {
        console.error("Failed to parse user:", err);
      }
    }
  }, []);

  const refreshAllData = async (r = range, cr = customRange) => {
    setIsRefreshing(true);
     const dates = r === "custom" ? cr : null;
    await Promise.all([
     loadStats(r, dates),
      // loadCategories(),
      // loadNews(1),
       portalLeaderboardRef.current?.refreshData?.(r, dates),
    heatmapCategoryRef.current?.refreshData?.(r, dates)
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    let intervalId;
    if (autoRefresh && range === "today") {
      intervalId = setInterval(() => {
        refreshAllData();
      }, refreshInterval);
    }
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, range]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-800 font-semibold text-base">
              <Filter className="w-4 h-4 text-gray-600" />
              <span>Filter:</span>
               <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={range}
                  onChange={(e) => handleRangeChange(e.target.value)}
                  className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="1m">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <button
              onClick={() => {
                setRange("7d");
                setCustomRange({ start: "", end: "" });
                setShowCustomDateInputs(false);
                refreshAllData("7d", null);
              }}
              className="bg-black text-xs text-white border border-gray-300 rounded-md px-2 py-1 hover:bg-black/50 transition"
            >
              Clear Filter
            </button>
            </div>
             
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Range Filter */}
           

              {/* Custom Date Inputs */}
              {showCustomDateInputs && (
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                    className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={customRange.end}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                    className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyCustomRange}
                    disabled={!customRange.start || !customRange.end}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}

              {range === "today" && (
                <>
                  {isRefreshing && (
                    <span className="text-xs text-gray-500 animate-pulse">
                      🔄 Refreshing data…
                    </span>
                  )}

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="h-4 w-4 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">Auto-Refresh</span>
                  </label>

                  {!autoRefresh && (
                    <button
                      onClick={refreshAllData}
                      className="px-3 py-1 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
                    >
                      Refresh Stats
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              id: "totalPosts",
              title: "Total Posts",
              value: stats.totalPosts,
              today: stats.today_total_posts,
              color: "bg-blue-100 text-blue-600",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              id: "todayPosts",
              title: "Today's Posts",
              value: stats.today_total_posts,
              today: stats.today_total_posts,
              color: "bg-indigo-100 text-indigo-600",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ),
            },
            {
              id: "categories",
              title: "Categories",
              value: stats.categories,
              today: 0,
              color: "bg-purple-100 text-purple-600",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              ),
            },
            {
              id: "domains",
              title: "Active Domains",
              value: stats.domains,
              today: 0,
              color: "bg-green-100 text-green-600",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              ),
            },
          ].map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 duration-300"
            >
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                {card.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {card.value?.toLocaleString() ?? 0}
              </h3>
              <p className="text-sm text-gray-600">{card.title}</p>
            </div>
          ))}
        </div>

        <KPIOverview data={stats} />
        <StatusOverview data={stats} />
        <PortalLeaderboard ref={portalLeaderboardRef} range={range} customRange={customRange} />
        <HeatMapCategory ref={heatmapCategoryRef} range={range} customRange={customRange} />
        <SuccessRateChart height={520} />
        <AnalyticsComponent />
      </div>
    </div>
  );
}