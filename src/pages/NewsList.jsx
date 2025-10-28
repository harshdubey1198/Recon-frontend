import React, { useState, useEffect } from "react";
import { FileText, X, Clock } from "lucide-react";
import { fetchMyNewsPosts,fetchDistributedNews,publishNewsArticle, fetchNewsDetail, fetchMasterCategories, fetchPortals, fetchPortalCategories, } from "../../server";
import constant from "../../Constant";
import { toast } from "react-toastify";
import MasterFilter from "../components/filters/MasterFilter";
import SearchFilter from "../components/filters/SearchFilter";

const NewsList = () => {
  const [selectedNewsIds, setSelectedNewsIds] = useState([]);
  const [news, setNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [distributedList, setDistributedList] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [distributedData, setDistributedData] = useState({});
  const [publishingId, setPublishingId] = useState(null);

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

  const loadDistributedNews = async (newsPostId) => {
    try {
      const res = await fetchDistributedNews({ news_post_id: newsPostId });
      if (res?.data?.status) {
        setDistributedData((prev) => ({
          ...prev,
          [newsPostId]: res.data.data || [],
        }));
      } else {
        setDistributedData((prev) => ({ ...prev, [newsPostId]: [] }));
      }
    } catch (err) {
      console.error("Failed to fetch distributed list:", err);
      setDistributedData((prev) => ({ ...prev, [newsPostId]: [] }));
    }
  };

  const handleRetryPublish = async (item) => {
    try {
      setPublishingId(item.id);
      const res = await publishNewsArticle(item.id);
      if (res?.data?.status) {
        console.log("✅ Re-publish success:", res.data.message);
        toast.success("Article republished successfully!");
        loadDistributedNews(item.id); 
      } else {
        toast.error("Failed to republish the article.");
      }
    } catch (err) {
      console.error("❌ Error while republishing:", err);
      toast.error("Something went wrong while republishing.");
    }finally {
      setPublishingId(null);
    }
  };


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
  const loadNewsWithFilters = async (filters) => {
    try {
      const res = await fetchMyNewsPosts({
        search: filters.search || "",
        status: filters.status || "",
        portal_name: filters.portal_id || "",
        master_category_name: filters.master_category_id || "",
        created_by: filters.username || "",
        start_date: filters.date_filter?.start_date || "",
        end_date: filters.date_filter?.end_date || "",
        page: filters.page || page || 1,
      });

      if (res?.data?.status) {
        const posts = res?.data?.data || [];
        const mapped = posts.map((item) => ({
          id: item.id,
          category: item.master_category_name || "N/A",
          headline: item.title || "Untitled",
          shortDesc: item.short_description || "",
          longDesc: item.content ? item.content.replace(/<[^>]+>/g, "") : "",
          author: "You",
          live_url: "",
          status: item.status || "N/A",
          date: new Date(item.created_at).toLocaleDateString(),
          image: item.post_image
            ? `${constant?.appBaseUrl}/${item.post_image}`
            : "https://via.placeholder.com/150",
        }));
        setNews(mapped);
        setTotalPages(res?.data?.pagination?.total_pages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch filtered news:", err);
    }
  };



  useEffect(() => {
    // load all data on first render or page change
    loadNewsWithFilters({
      search,
      status,
      portal_id: selectedPortal,
      master_category_id: selectedMasterCategory,
      username: createdBy,
      date_filter: { start_date: startDate, end_date: endDate },
      page,
    });
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
    loadNewsWithFilters();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-black px-6 py-4 flex items-center justify-between">
            {/* Left Section */}
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

            {/* Right Section - Create News Button */}
            <button
                onClick={() => {
                  localStorage.setItem("activeTab", "Create News");
                  window.location.reload(); 
                }}
                className="group relative p-3 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-all flex items-center space-x-2 border border-white/20"
              >
                  <span className="relative z-10 flex items-center">
                    <FileText className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                    Create News
                  </span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
            </button>
          </div>
          
        {/* 🔍 Standalone Search Bar */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <SearchFilter
            onChange={(query) => {
              setSearch(query);
              const filters = {
                search: query,
                status,
                portal_id: selectedPortal,
                master_category_id: selectedMasterCategory,
                username: createdBy,
                date_filter: { start_date: startDate, end_date: endDate },
              };
              loadNewsWithFilters(filters);
            }}
          />
        </div>


          {/* Filters */}
          <div className="p-6">
            <MasterFilter
                visibleFilters={[
                  // "search",
                  "status",
                  // "portal_id",
                  "master_category_id",
                  // "username",
                  "custom_date"
                  // "date_filter",
                ]}
                initialFilters={{
                  search,
                  status,
                  portal_id: selectedPortal,
                  master_category_id: selectedMasterCategory,
                  username: createdBy,
                  date_filter: { start_date: startDate, end_date: endDate },
                }}
                onChange={(filters) => {
                  setSearch(filters.search || "");
                  setStatus(filters.status || "");
                  setSelectedPortal(filters.portal_id || "");
                  setSelectedMasterCategory(filters.master_category_id || "");
                  setCreatedBy(filters.username || "");
                  setStartDate(filters.date_filter?.start || "");
                  setEndDate(filters.date_filter?.end || "");
                  setPage(1);

                  // ✅ Call loadNews AFTER states update (using callback pattern)
                  setTimeout(() => {
                    loadNewsWithFilters(filters);
                  }, 0);
                }}

                onClear={() => {
                  handleReset();
                }}
              />

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
                      <React.Fragment key={item.id}>
                        {/* MAIN ROW */}
                        <tr
                          onClick={() => {
                            const isOpen = expandedRow === item.id;
                            setExpandedRow(isOpen ? null : item.id);
                            if (!isOpen && !distributedData[item.id]) {
                              loadDistributedNews(item.id);
                            }
                          }}
                          className={`border-t hover:bg-gray-50 cursor-pointer transition-colors ${
                            expandedRow === item.id ? "bg-gray-50" : ""
                          }`}
                        >
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-black"
                              checked={selectedNewsIds.includes(item.id)}
                              onClick={(e) => e.stopPropagation()}
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
                            <div className="flex items-center gap-2">
                              <span
                                className={`transition-transform ${
                                  expandedRow === item.id ? "rotate-90" : ""
                                }`}
                              >
                                ▶
                              </span>
                              {item.headline}
                            </div>
                            <p className="text-xs text-gray-500">{item.shortDesc}</p>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">{item.category}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{item.author}</td>
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
                          <td
                              className="px-4 py-2 text-sm"
                              onClick={(e) => {
                                e.stopPropagation(); // prevent row expand/collapse
                                if (!publishingId) handleRetryPublish(item);
                              }}
                            >
                              {publishingId === item.id ? (
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                  <svg
                                    className="w-4 h-4 animate-spin text-gray-600"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5a8 8 0 008 8v-4a4 4 0 01-4-4H6z"
                                    ></path>
                                  </svg>
                                  <span>Publishing...</span>
                                </div>
                              ) : (
                                <button
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                  title="Retry Publish"
                                >
                                  Retry
                                </button>
                              )}
                            </td>


                        </tr>

                        {/* COLLAPSIBLE DISTRIBUTED LIST */}
                        {expandedRow === item.id && (
                            <tr className="bg-white border-t border-gray-200">
                              <td colSpan="9" className="p-0">
                                {distributedData[item.id]?.length > 0 ? (
                                  <table className="w-full text-sm bg-gray-50">
                                    <tbody>
                                      {distributedData[item.id].map((dist) => (
                                        <tr
                                          key={dist.id}
                                          className="border-t border-gray-200 hover:bg-gray-100 transition-colors"
                                        >
                                            <td className="w-[150px]"></td>
                                          {/* 🔹 Portal Image */}
                                          <td className="w-[60px] px-2 py-3">
                                            <img
                                              src={dist.news_post_image}
                                              alt={dist.portal_name}
                                              className="w-10 h-10 object-cover rounded-md border"
                                            />
                                          </td>
                                          {/* 🔹 Headline + Short Description */}
                                          <td className="px-2 py-3 max-w-[200px]">
                                            <div className="flex flex-col">
                                              <span className="text-sm font-semibold text-gray-900">
                                                {dist.news_post_title}
                                              </span>
                                              <span className="text-xs text-gray-500 truncate max-w-[200px]">
                                                {dist.ai_short_description || "—"}
                                              </span>
                                            </div>
                                          </td>

                                          {/* 🔹 Live URL */}
                                          <td className="px-2 py-3 text-gray-600 truncate max-w-[200px]">
                                            <a
                                              href={dist.live_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline"
                                            >
                                              {dist.live_url}
                                            </a>
                                              <br/>
                                              <span className="px-2 py-3 font-medium text-gray-800">{dist.portal_name}</span>
                                          </td>

                                          {/* 🔹 Status Badge */}
                                          <td className="px-1 py-3">
                                            <span
                                              className={`px-2 py-1 text-xs rounded ${
                                                dist.status === "SUCCESS"
                                                  ? "bg-green-100 text-green-700"
                                                  : dist.status === "FAILED"
                                                  ? "bg-red-100 text-red-700"
                                                  : "bg-yellow-100 text-yellow-700"
                                              }`}
                                            >
                                              {dist.status}
                                            </span>
                                          </td>

                                          {/* 🔹 Date */}
                                          <td className="px-1 py-3 text-gray-500 whitespace-nowrap">
                                            {new Date(dist.sent_at).toLocaleDateString()}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div className="text-center py-3 text-gray-500">
                                    No distribution data found.
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}

                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-gray-500">
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
