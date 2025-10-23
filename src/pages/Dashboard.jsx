import React, { useState, useEffect } from "react";
import { fetchAdminStats, fetchDomainDistribution , fetchMasterCategories, fetchNewsList   } from "../../server"; 
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [domains, setDomains] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);



  const [stats, setStats] = useState({
    totalPosts: 0,
    categories: 0,
    domains: 0,
    targets: 0,
    activeUsers: 0,
    revenue: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchAdminStats();
        if (res?.data?.status) {
          setStats({
            totalPosts: res.data.data.total_posts,
            categories: res.data.data.total_master_categories,
            domains: res.data.data.total_portals,
            targets: res.data.data.news_distribution.total_distributions,
            activeUsers: res.data.data.total_users,
            revenue: res.data.data.news_distribution.successful_distributions, 
          });
        }
        toast.success(res.data.message);
      } catch (err) {
          const errorMsg = err.response?.data?.message || err.message || "Something went wrong";
          console.error("Failed to fetch stats:", errorMsg);
          toast.error(`Failed to fetch stats: ${errorMsg}`);
        }
    };

    const loadDomains = async () => {
      try {
        const res = await fetchDomainDistribution();
        if (res?.data?.status) {
          const mapped = res.data.data.map((d) => ({
            name: d.portal_name, // Domain name
            posts: d.total_distributions, // Total posts distributed
            traffic: `${d.successful_distributions} success / ${d.failed_distributions} failed`,
            status: d.failed_distributions > 0 ? "Partial" : "Active", // Simple status logic
          }));
          setDomains(mapped);
        }
      } catch (err) {
        toast.error(err.res?.data?.message );
        console.error("Failed to fetch domains:", err);
      
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
        toast.error(err.res?.data?.message );
        console.error("Failed to fetch categories:", err);
      }
    };


    const loadNews = async () => {
      try {
        const res = await fetchNewsList();
        console.log("");
        
        if (res?.data?.status) {
          // API से आए data को map करके UI format में बदलते हैं
          const mapped = res.data.data.map((item) => ({
            id: item.id,
            title: item.news_post_title,
            category: item.portal_category_name || item.master_category_name,
            status: item.status === "SUCCESS" ? "Published" : "Draft",
            views: item.retry_count || 0, // views API से नहीं आ रहे तो fallback
            date: new Date(item.sent_at).toLocaleDateString(),
            image: item.news_post_image,
          }));
          setRecentPosts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch news list:", err);
      }
    };

    loadStats();
    loadDomains();
    loadCategories();
    loadNews();
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

  // const recentPosts = [
  //   {
  //     id: 1,
  //     title: "Getting Started with React Hooks",
  //     category: "Development",
  //     status: "Published",
  //     views: 1250,
  //     date: "2024-01-15",
  //   },
  //   {
  //     id: 2,
  //     title: "Modern CSS Grid Layouts",
  //     category: "Design",
  //     status: "Draft",
  //     views: 0,
  //     date: "2024-01-14",
  //   },
  //   {
  //     id: 3,
  //     title: "API Security Best Practices",
  //     category: "Security",
  //     status: "Published",
  //     views: 890,
  //     date: "2024-01-13",
  //   },
  //   {
  //     id: 4,
  //     title: "Database Optimization Tips",
  //     category: "Backend",
  //     status: "Published",
  //     views: 654,
  //     date: "2024-01-12",
  //   },
  // ];

  // const categories = [
  //   { name: "Development", posts: 342, color: "bg-blue-500" },
  //   { name: "Design", posts: 189, color: "bg-purple-500" },
  //   { name: "Marketing", posts: 234, color: "bg-green-500" },
  //   { name: "Business", posts: 156, color: "bg-orange-500" },
  //   { name: "Technology", posts: 198, color: "bg-red-500" },
  //   { name: "Security", posts: 128, color: "bg-indigo-500" },
  // ];

  // const domains = [
  //   { name: "https://www.dxbnewsnetwork.com/", posts: 456, traffic: "85.2K", status: "Active" },
  //   { name: "https://cninews.ca/", posts: 234, traffic: "42.1K", status: "Active" },
  //   { name: "https://www.janhimachal.com/", posts: 189, traffic: "28.5K", status: "Active" },
  //   { name: "https://www.gcc.com/", posts: 167, traffic: "31.8K", status: "Maintenance" }
  // ];

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
              <p className="text-sm text-gray-500">Content Management System</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

          {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.targets}
            </h3>
            <p className="text-sm text-gray-500">Target Audience</p>
            <div className="mt-2 flex items-center text-xs text-orange-600">
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
              +8.3% engagement
            </div>
          </div> */}

          {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.activeUsers?.toLocaleString() ?? "0"}
            </h3>
            <p className="text-sm text-gray-500">Active Users</p>
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
              +15.2% this week
            </div>
          </div> */}

          {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              ${stats.revenue.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-500">Revenue</p>
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
              +22.1% from last month
            </div>
          </div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Posts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Posts
              </h3>
              <p className="text-sm text-gray-500">Latest published content</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
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
                ))}
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
              {/* <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {category.posts}
                </div>
                <div className="text-xs text-gray-500">posts</div>
              </div> */}
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
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success/Faild
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {domains.map((domain, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {domain.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {domain.posts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {domain.traffic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          domain.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {domain.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
