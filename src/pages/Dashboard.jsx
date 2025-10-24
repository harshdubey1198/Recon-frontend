import React, { useState, useEffect, useRef } from "react";
import {
  fetchAdminStats,
  fetchDomainDistribution,
  fetchMasterCategories,
  fetchNewsList,
} from "../../server";
export default function Dashboard() {
  const [user, setUser] = useState(null);

  const [domains, setDomains] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const scrollContainerRef = useRef(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totaltodayPosts: 0,
    categories: 0,
    domains: 0,
    targets: 0,
    activeUsers: 0,
    revenue: 0,
  });
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

  // Handle scroll for infinite loading
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || isFetching || !pagination) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrolledToBottom = scrollHeight - scrollTop <= clientHeight + 50;

    // Load next page when scrolled to bottom
    if (scrolledToBottom && pagination.next) {
      const nextPage = page + 1;
      if (nextPage <= pagination.total_pages) {
        console.log(`Loading page ${nextPage}...`); // Debug log
        loadNews(nextPage);
      }
    }
  };
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchAdminStats();
        console.log("Admin stats response:", res);
        if (res?.data?.status) {
          setStats({
            totalPosts: res.data.data.total_posts,
            totaltodayPosts: res.data.data.today_total_posts,
            categories: res.data.data.total_master_categories,
            domains: res.data.data.total_portals,
            targets: res.data.data.news_distribution.total_distributions,
            activeUsers: res.data.data.total_users,
            revenue: res.data.data.news_distribution.successful_distributions, // फिलहाल revenue नहीं है तो example के लिए success counts
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

  const loadDomains = async () => {
      try {
        const res = await fetchDomainDistribution();

        if (res?.data?.status) {
          const mapped = res.data.data.map((d) => ({
            id: d.portal_id,
            name: d.portal_name,
            total: d.total_distributions,
            success: d.successful_distributions,
            failed: d.failed_distributions,
            pending: d.pending_distributions,
            retry: d.retry_counts,
            todayTotal: d.today_total_distributions,
            todaySuccess: d.today_successful_distributions,
            todayFailed: d.today_failed_distributions,
            todayPending: d.today_pending_distributions,
            todayRetry: d.today_retry_counts,

            // Optional display helpers
            traffic: `${d.successful_distributions} success / ${d.failed_distributions} failed`,
            todayTraffic: `${d.today_successful_distributions} success / ${d.today_failed_distributions} failed`,

            // Smart status logic
            status:
              d.failed_distributions > 0
                ? "Partial"
                : d.successful_distributions > 0
                ? "Active"
                : "Idle",
          }));

          setDomains(mapped);
        }
      } catch (err) {
        console.error("❌ Failed to fetch domains:", err);
      }
    };

    const loadCategories = async () => {
      try {
        const res = await fetchMasterCategories();
        if (res?.data?.status) {
          // Map API -> UI
          const mapped = res.data.data.map((cat, idx) => ({
            name: cat.name,
            posts: Math.floor(Math.random() * 500), // फिलहाल dummy posts count
            color: [
              "bg-blue-500",
              "bg-purple-500",
              "bg-green-500",
              "bg-orange-500",
              "bg-red-500",
              "bg-indigo-500",
            ][idx % 6], // रंग rotate करने के लिए
          }));
          setCategories(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

   loadStats();
    loadDomains();
    loadCategories();
    loadNews(1); // Load first page on mount
  }, []);
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed); // direct set करो
      } catch (err) {
        console.error("Failed to parse user:", err);
      }
    }
  }, []);


  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Content Management System
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user ? user.username : "Guest"}
                </p>
                {/* <p className="text-xs text-gray-500">
                {user?.email || "No email saved"}
              </p> */}
              </div>
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user ? user.username[0].toUpperCase() : "G"}
                </span>
              </div>
              {/* <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Logout
            </button> */}
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {/* Welcome back, {user.username}! 👋 */}
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your content today.
          </p>
        </div>

        {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalPosts.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-500">Total Posts</p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              +12.5% from last month
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats?.totaltodayPosts != null
              ? stats.totaltodayPosts.toLocaleString()
              : "0"}
          </h3>

            <p className="text-sm text-gray-500">Total Today Posts</p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {/* +12.5% from last month */}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
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
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.categories}
            </h3>
            <p className="text-sm text-gray-500">Categories</p>
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              +3 new this month
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
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
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.domains}
            </h3>
            <p className="text-sm text-gray-500">Active Domains</p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              All operational
            </div>
          </div>
   </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Posts */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Posts
              </h3>
              <p className="text-sm text-gray-500">
                Latest published content (Page {page} of {pagination?.total_pages || 1})
              </p>
            </div>
            <div className="p-6">
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="space-y-4 overflow-y-auto max-h-96 recent-posts-scroll"
                style={{ scrollBehavior: 'smooth' }}
              >
                {recentPosts.length === 0 && !isFetching ? (
                  <div className="text-center py-8 text-gray-500">
                    No posts available
                  </div>
                ) : (
                  recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">
                            {post.category}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              post.status === "Published"
                                ? "bg-green-100 text-green-600"
                                : "bg-yellow-100 text-yellow-600"
                            }`}
                          >
                            {post.status}
                          </span>
                          <span>{post.views} views</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">{post.date}</div>
                    </div>
                  ))
                )}
                {isFetching && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                )}
                {pagination && page >= pagination.total_pages && !isFetching && recentPosts.length > 0 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No more posts to load
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categories Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Categories
              </h3>
              <p className="text-sm text-gray-500">
                Content distribution by category
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${category.color}`}
                      ></div>
                      <span className="font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                  </div>
                ))}
               </div>
            </div>
          </div>
        </div>

        {/* Domain Access Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Domain Access
            </h3>
            <p className="text-sm text-gray-500">
              Overview of all active domains and their performance
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Success
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Failed
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Retry
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Today (T/F/P/R)
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {domains.map((domain, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {domain.name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{domain.total}</td>
                    <td className="px-6 py-4 text-green-600">
                      {domain.success}
                    </td>
                    <td className="px-6 py-4 text-red-600">{domain.failed}</td>
                    <td className="px-6 py-4 text-yellow-600">
                      {domain.pending}
                    </td>
                    <td className="px-6 py-4 text-purple-600">
                      {domain.retry}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {domain.todayTotal}/{domain.todayFailed}/
                      {domain.todayPending}/{domain.todayRetry}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          domain.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : domain.status === "Partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {domain.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-gray-900 text-white p-6 rounded-2xl hover:bg-gray-800 transition-colors text-left">
            <svg
              className="w-8 h-8 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <h3 className="font-semibold mb-1">Create New Post</h3>
            <p className="text-sm text-gray-300">Start writing a new article</p>
          </button>

          <button className="bg-white border-2 border-gray-200 p-6 rounded-2xl hover:border-gray-300 transition-colors text-left">
            <svg
              className="w-8 h-8 mb-3 text-gray-600"
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
            <h3 className="font-semibold mb-1 text-gray-900">
              Manage Categories
            </h3>
            <p className="text-sm text-gray-500">Organize your content</p>
          </button>

          <button className="bg-white border-2 border-gray-200 p-6 rounded-2xl hover:border-gray-300 transition-colors text-left">
            <svg
              className="w-8 h-8 mb-3 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="font-semibold mb-1 text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-500">View detailed reports</p>
          </button>

          <button className="bg-white border-2 border-gray-200 p-6 rounded-2xl hover:border-gray-300 transition-colors text-left">
            <svg
              className="w-8 h-8 mb-3 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="font-semibold mb-1 text-gray-900">Settings</h3>
            <p className="text-sm text-gray-500">Configure your dashboard</p>
          </button>
        </div> */}
      </div>
    </div>
  );
}
