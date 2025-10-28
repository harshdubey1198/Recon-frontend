import React, { useState, useEffect } from "react";
import { FileText, Eye, X, Clock } from "lucide-react";
import {
  fetchMyNewsPosts,
  fetchNewsDetail,
  fetchMasterCategories,
  fetchPortals,
  fetchPortalCategories,
} from "../../server";
import constant from "../../Constant";

const NewsList = () => {
  const [selectedNewsIds, setSelectedNewsIds] = useState([]);
  const [news, setNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🔹 Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPortal, setSelectedPortal] = useState("");
  const [selectedPortalCategory, setSelectedPortalCategory] = useState("");
  const [selectedMasterCategory, setSelectedMasterCategory] = useState("");

  // 🔹 Dropdown Data
  const [portals, setPortals] = useState([]);
  const [portalCategories, setPortalCategories] = useState([]);
  const [masterCategories, setMasterCategories] = useState([]);

  // 🔹 Load dropdowns
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [mastersRes, portalsRes] = await Promise.all([
          fetchMasterCategories(),
          fetchPortals(),
        ]);
        setMasterCategories(mastersRes?.data?.data || []);
        setPortals(portalsRes?.data?.data || []);
      } catch (err) {
        console.error("Failed to load dropdowns:", err);
      }
    };
    loadDropdowns();
  }, []);

  // 🔹 Load portal categories when portal changes
  useEffect(() => {
    const loadPortalCats = async () => {
      if (!selectedPortal) {
        setPortalCategories([]);
        return;
      }
      try {
        const res = await fetchPortalCategories(selectedPortal);
        setPortalCategories(res?.data?.data || []);
      } catch (err) {
        console.error("Failed to load portal categories:", err);
      }
    };
    loadPortalCats();
  }, [selectedPortal]);

  // 🔹 Load news list (using new API)
  const loadNews = async () => {
  try {
    const res = await fetchMyNewsPosts({
      search,
      status,
      portal_name: selectedPortal,
      portal_category_name: selectedPortalCategory,
      master_category_name: selectedMasterCategory,
      start_date: startDate,
      end_date: endDate,
      created_by: createdBy,
      page,
    });

    console.log("Fetched response:", res);

    // ✅ Your posts are in res.data.data, not res.data.data.data
    if (res?.data?.status) {
      const posts = res?.data?.data || [];

      const mapped = posts.map((item) => ({        id: item.id,
        category: item.master_category_name || "N/A",
        headline: item.title || "Untitled",
        shortDesc: item.short_description || "",
        longDesc: item.content ? item.content.replace(/<[^>]+>/g, "") : "",
        author: "You",
        live_url: "",
        status: item.status || "N/A",
        date: new Date(item.created_at).toLocaleDateString(),
        image: item.post_image
          ? constant?.BASE_URL + item.post_image
          : "https://via.placeholder.com/150",
      }));

      setNews(mapped);

      // ✅ Pagination info lives under res.data.pagination
      setTotalPages(res?.data?.pagination?.total_pages || 1);
    }
  } catch (err) {
    console.error("Failed to fetch my news posts:", err);
  }
};


  useEffect(() => {
    loadNews();
  }, [page]);

  // 🔹 Selection
  const toggleSelect = (id) =>
    setSelectedNewsIds((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelectedNewsIds(
      selectedNewsIds.length === news.length ? [] : news.map((n) => n.id)
    );

  // 🔹 Detail view
  const handleViewDetail = async (item) => {
    try {
      const res = await fetchNewsDetail(item.id);
      if (res?.data?.status) {
        const d = res.data.data;
        const parsed = d.response_message ? JSON.parse(d.response_message) : {};
        const data = parsed?.data || {};

        setSelectedNews({
          id: d.id,
          category: d.master_category_name,
          headline: d.ai_title || data.post_title || item.headline,
          shortDesc: d.ai_short_description || data.post_short_des,
          longDesc: d.ai_content || data.post_des,
          author: d.portal_name,
          journalist: data.journalist || "",
          status: d.status,
          date: new Date(d.created_at).toLocaleDateString(),
          tags: data.post_tag ? data.post_tag.split(" ") : [],
          image: d.news_post_image,
          latestNews: data.Head_Lines || false,
          headlines: data.Head_Lines || false,
          articles: data.articles || false,
          trending: data.trending || false,
          breakingNews: data.BreakingNews || false,
          upcomingEvents: data.Event || false,
          eventStartDate: data.Event_date || null,
          eventEndDate: data.Eventend_date || null,
          scheduleDate: data.schedule_date || "",
          counter: data.viewcounter || 0,
          order: data.order || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch detail:", err);
    }
  };

  // 🔹 Reset filters
  const handleReset = () => {
    setSearch("");
    setStatus("");
    setSelectedPortal("");
    setSelectedPortalCategory("");
    setSelectedMasterCategory("");
    setStartDate("");
    setEndDate("");
    setCreatedBy("");
    loadNews();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-black px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  My Generated Articles / News
                </h1>
                <p className="text-gray-300 text-sm">
                  View and manage your own published & draft articles
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6">
            <div className="bg-gray-100 p-4 mb-4 rounded-lg border border-gray-200">
              <h2 className="text-md font-semibold text-gray-800 mb-3">
                Filter My News
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search headline..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">All</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>

                {/* Portal Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Portal Name
                  </label>
                  <select
                    value={selectedPortal}
                    onChange={(e) => setSelectedPortal(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">All</option>
                    {portals.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Portal Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Portal Category
                  </label>
                  <select
                    value={selectedPortalCategory}
                    onChange={(e) => setSelectedPortalCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">All</option>
                    {portalCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.parent_name
                          ? `${c.parent_name} → ${c.name}`
                          : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Master Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Master Category
                  </label>
                  <select
                    value={selectedMasterCategory}
                    onChange={(e) => setSelectedMasterCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">All</option>
                    {masterCategories.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* Created By */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Created By
                  </label>
                  <input
                    type="text"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    placeholder="Enter creator name..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={loadNews}
                  className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300 transition"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-black"
                        checked={selectedNewsIds.length === news.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-700">
                      Image
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-700">
                      Headline
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-700">
                      Portal
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-700">
                      Live URL
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {news.length > 0 ? (
                    news.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-black"
                            checked={selectedNewsIds.includes(item.id)}
                            onChange={() => toggleSelect(item.id)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <img
                            src={item.image}
                            alt={item.headline}
                            className="w-16 h-12 object-cover rounded border"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {item.headline}
                          <p className="text-xs text-gray-500">
                            {item.shortDesc}
                          </p>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.category}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.author}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[180px]">
                          {item.live_url}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              item.status === "SUCCESS"
                                ? "bg-green-100 text-green-700"
                                : item.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{item.date}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="p-1 text-gray-600 hover:text-black"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-4 text-gray-500"
                      >
                        No news found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      page === 1
                        ? "bg-gray-200 text-gray-400"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    Prev
                  </button>

                  <span className="text-sm text-gray-700">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      page === totalPages
                        ? "bg-gray-200 text-gray-400"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>
            {selectedNews.image && (
              <img
                src={selectedNews.image}
                alt={selectedNews.headline}
                className="w-full h-72 object-cover rounded-xl mb-6"
              />
            )}
            <h2 className="text-3xl font-bold mb-2 text-gray-900">
              {selectedNews.headline}
            </h2>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                {selectedNews.category}
              </span>
              <span>{selectedNews.status}</span>
              <span>✍️ {selectedNews.author}</span>
              {selectedNews.journalist && (
                <span>📰 {selectedNews.journalist}</span>
              )}
              <span>📅 {selectedNews.date}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <p className="mb-6 text-gray-700">{selectedNews.shortDesc}</p>
            ```jsx
            <h3 className="text-lg font-semibold mb-2">Full Article</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {selectedNews.longDesc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsList;
