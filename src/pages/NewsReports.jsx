import React, { useEffect, useState } from "react";
import { FileText, BarChart3, Loader2, ExternalLink, Globe, AlertTriangle, Filter, X, } from "lucide-react";
import { fetchNewsReport, fetchDistributedNews } from "../../server";
import MasterFilter from "../components/filters/MasterFilter";

export default function NewsReports() {
  const [filters, setFilters] = useState({});
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [distLoading, setDistLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPostTitle, setSelectedPostTitle] = useState(null);

  // 🔹 Fetch report data
  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const res = await fetchNewsReport(filters);
        if (res.data?.status) setReport(res.data.data);
      } catch (err) {
        console.error("Failed to fetch report:", err);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [filters]);

  // 🔹 Fetch distribution data for selected post
  const handleViewDistribution = async (newsId, postTitle) => {
    setSelectedPost(newsId);
    setDistLoading(true);
    try {
      const res = await fetchDistributedNews({ news_post_id: newsId });
      if (res.data?.status) setDistribution(res.data.data || []);
      else setDistribution([]);
    } catch (err) {
      console.error("Failed to fetch distributed news:", err);
    } finally {
      setDistLoading(false);
    }
  };

  // 🔹 Apply Filters
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-gray-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">News Reports</h2>
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-4 py-2 flex items-center gap-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-10 text-gray-600">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {/* Summary */}
        {!loading && report && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 text-white p-4 rounded-lg text-center">
                <p className="text-sm opacity-80">Total Master Posts</p>
                <h3 className="text-2xl font-bold">
                  {report.summary.total_master_posts}
                </h3>
              </div>
              <div className="bg-gray-800 text-white p-4 rounded-lg text-center">
                <p className="text-sm opacity-80">Total Distributions</p>
                <h3 className="text-2xl font-bold">
                  {report.summary.total_distributions}
                </h3>
              </div>
            </div>

            {/* User → Master Posts */}
            {report.results?.map((user, idx) => (
              <div key={idx} className="border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {user.username}{" "}
                    <span className="text-sm text-gray-500">
                      ({user.master_posts_count} posts)
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.master_posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handleViewDistribution(post.id)}
                      className={`border-2 p-4 rounded-lg cursor-pointer transition-all ${
                        selectedPost === post.id
                          ? "border-gray-900 bg-gray-900 text-white shadow-lg"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <h4 className="font-semibold text-sm">{post.title}</h4>
                      <p className="text-xs mt-1 opacity-80">
                        Status: {post.status}
                      </p>
                      <p className="text-xs opacity-80">
                        Category: {post.master_category}
                      </p>
                      <p className="text-xs opacity-70">
                        Excluded:{" "}
                        {post.excluded_portals?.length
                          ? post.excluded_portals.join(", ")
                          : "None"}
                      </p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Distribution Section */}
            {selectedPost && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                  <Globe className="w-5 h-5 text-gray-700" />
                  Distributions for Post ID: {selectedPost}
                </h3>

                {distLoading ? (
                  <div className="flex justify-center py-10 text-gray-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : distribution.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {distribution.map((dist) => (
                      <div
                        key={dist.id}
                        className={`p-4 border rounded-lg transition-all ${
                          dist.status === "FAILED"
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 hover:shadow"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-600" />
                            {dist.portal_name}
                          </h4>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              dist.status === "FAILED"
                                ? "bg-red-200 text-red-800"
                                : "bg-green-200 text-green-800"
                            }`}
                          >
                            {dist.status}
                          </span>
                        </div>

                        <img
                          src={dist.news_post_image}
                          alt="news"
                          className="w-full h-36 object-cover rounded-lg border mb-3"
                        />

                        <p className="text-sm font-medium text-gray-800">
                          {dist.news_post_title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Category: {dist.master_category_name} →{" "}
                          {dist.portal_category_name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Author: {dist.news_post_created_by}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Sent: {new Date(dist.sent_at).toLocaleString()}
                        </p>

                        <div className="mt-3 flex justify-between items-center">
                          <a
                            href={dist.live_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Live
                          </a>
                          {dist.retry_count > 0 && (
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-yellow-600" />
                              Retries: {dist.retry_count}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No distribution data found.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🔹 Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative">
            <button
              onClick={() => setShowFilterModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-700" />
              Apply Filters
            </h3>

            <div className="space-y-4">
              <MasterFilter
                visibleFilters={[
                    "date_filter",
                    "portal_id",
                    "master_category_id",
                    "username",
                    "search",
                ]}
                onChange={handleApplyFilters}
                />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyFilters(filters)}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
