import React, { useState, useEffect, useRef } from "react";
import { fetchAdminStats, fetchMasterCategories, fetchNewsList } from "../../server";
import { FileText, FolderOpen, Tag, Eye, ChevronRight, CheckCircle2, TrendingUp, Target, ArrowUpRight } from "lucide-react";
import formatUsername from "../utils/formateName";
import KPIOverview from "../components/dashboard/KpiOverview";
import StatusOverview from "../components/dashboard/StatusOverview";
import PortalLeaderboard from "../components/PortalLeaderboard";
import AnalyticsComponent from "../components/AnalyticsComponent";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const scrollContainerRef = useRef(null);
  const portalLeaderboardRef = useRef(null);
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
        today: {
            total: 0,
            successful: 0,
            failed: 0
        }
       }
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(15000);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNews = async (pageNumber = 1) => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const res = await fetchNewsList(pageNumber);
      if (res?.data?.status) {
        const mapped = res.data.data.map((item) => ({
          id: item.id,
          title: item.news_post_title,
          category: item.portal_category_name || item.master_category_name,
          status: item.status === "SUCCESS" ? "Published" : "Draft",
          views: item.retry_count || 0,
          date: new Date(item.sent_at).toLocaleDateString(),
          image: item.news_post_image,
        }));

        setRecentPosts((prev) =>
          pageNumber === 1 ? mapped : [...prev, ...mapped]
        );
        setPagination(res.data.pagination);
        setPage(pageNumber);
      }
    } catch (err) {
      console.error("Failed to fetch news list:", err);
    } finally {
      setIsFetching(false);
    }
  };

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

  const loadStats = async () => {
    try {
      const res = await fetchAdminStats();
      // console.log("Admin stats response:", res);
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

  const loadCategories = async () => {
    try {
      const res = await fetchMasterCategories();
      if (res?.data?.status) {
        const mapped = res.data.data.map((cat, idx) => ({
          name: cat.name,
          posts: Math.floor(Math.random() * 500),
          color: [
            "bg-blue-500",
            "bg-purple-500",
            "bg-green-500",
            "bg-orange-500",
            "bg-red-500",
            "bg-indigo-500",
          ][idx % 6],
        }));
        setCategories(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    loadStats();
    loadCategories();
    loadNews(1);
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

  const refreshAllData = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadStats(),
      loadCategories(),
      loadNews(1),
      portalLeaderboardRef.current?.refreshData()
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        refreshAllData();
      }, refreshInterval);
    }
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Content Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user ? formatUsername(user.username) : "Guest"}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user ? user.username[0].toUpperCase() : "G"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <p className="flex flex-row items-center justify-between text-gray-600">
            Here's what's happening with your content today.
            <div className="flex items-center space-x-3 m-2">
              {isRefreshing && (
                <span className="text-xs text-gray-500 animate-pulse ml-2">
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
                  className="ml-3 px-3 py-1 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
                >
                  Refresh Stats
                </button>
              )}
            </div>
          </p>
        </div>

        {/* Stats Grid */}
       {/* ✅ Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            id: "totalPosts",
            title: "Total Posts",
            value: stats.totalPosts,
            today: stats.today_total_posts,
            color: "bg-blue-100 text-blue-600",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            ),
          },
          {
            id: "todayPosts",
            title: "Today’s Posts",
            value: stats.today_total_posts,
            today: stats.today_total_posts,
            color: "bg-indigo-100 text-indigo-600",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ),
          },
          {
            id: "categories",
            title: "Categories",
            value: stats.categories,
            today: 0, // no daily data
            color: "bg-purple-100 text-purple-600",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            ),
          },
          {
            id: "domains",
            title: "Active Domains",
            value: stats.domains,
            today: 0, // no daily data
            color: "bg-green-100 text-green-600",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                />
              </svg>
            ),
          },
        ].map((card) => {
          const percent =
            card.value && card.today
              ? ((card.today / card.value) * 100).toFixed(1)
              : 0;
          const isPositive = card.today > 0;

          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 duration-300"
            >
              <div
                className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}
              >
                {card.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {card.value?.toLocaleString() ?? 0}
              </h3>
              <p className="text-sm text-gray-600">{card.title}</p>

              
            </div>
          );
        })}
      </div>

      <KPIOverview data={stats} />
      <StatusOverview data={stats} />
        {/* Domain Access Table */}
        {/* <div className="border-b rounded-xl text-white border-blue-100/50 bg-black mb-8">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-white">
              Domain Distribution
            </h3>
            <p className="text-sm text-gray-500">Total Posts</p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +12.5% from last month
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.totaltodayPosts != null ? stats.totaltodayPosts.toLocaleString() : "0"}
            </h3>
            <p className="text-sm text-gray-500">Today's Posts</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.categories}</h3>
            <p className="text-sm text-gray-500">Categories</p>
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +3 new this month
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.domains}</h3>
            <p className="text-sm text-gray-500">Active Domains</p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              All operational
            </div>
          </div>
        </div> */}

        {/* Portal Leaderboard Component */}

        <PortalLeaderboard ref={portalLeaderboardRef} />
        <AnalyticsComponent/>
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 border-b border-blue-100/50 bg-black">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Recent Posts
                  </h3>
                  <p className="text-sm text-blue-100">
                    Latest published content
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="space-y-3 overflow-y-auto h-[920px] recent-posts-scroll pr-2"
                style={{ scrollBehavior: 'smooth' }}
              >
                {recentPosts.length === 0 && !isFetching ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No posts available</p>
                  </div>
                ) : (
                  recentPosts.map((post) => (
                    <div key={post.id} className="group relative bg-white rounded-xl p-4 border border-gray-200 hover:border-black/50 hover:shadow-md transition-all duration-200">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-blue-50/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200"></div>
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1 pr-4">
                            {post.title}
                          </h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{post.date}</span>
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="inline-flex items-center bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1 rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                            {post.category}
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              post.status === "Published"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                                : "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200"
                            }`}
                          >
                            {post.status}
                          </span>
                          <span className="inline-flex items-center text-xs text-gray-600 font-medium">
                            <Eye className="w-3 h-3 mr-1" />
                            {post.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isFetching && (
                  <div className="flex justify-center py-8">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100"></div>
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-600 absolute top-0 left-0"></div>
                    </div>
                  </div>
                )}
                {pagination && page >= pagination.total_pages && !isFetching && recentPosts.length > 0 && (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500 font-medium">All posts loaded</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-lg border border-black/50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 border-b border-purple-100/50 bg-black">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Categories
                  </h3>
                  <p className="text-sm text-purple-100">
                    Content distribution by category
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="group relative bg-white rounded-xl p-4 border border-gray-100 hover:border-black/50 hover:shadow-md transition-all duration-200"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-50/0 via-purple-50/50 to-purple-50/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center shadow-sm`}>
                          <Tag className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}