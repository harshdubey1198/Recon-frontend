import React, { useState, useEffect } from "react";
import {
  FileText,
  Eye,
  Check,
  Tag,
  X,
  Clock,
  Calendar,
} from "lucide-react";
import { fetchNewsList, fetchNewsDetail } from "../../server"; // ✅ adjust path if needed
import constant from "../../Constant";

const NewsList = () => {
  const [selectedNewsIds, setSelectedNewsIds] = useState([]);
  const [news, setNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);

  // 🔹 Load list on mount
  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await fetchNewsList();
        console.log("Fetched news list:", res);
        if (res?.data?.status) {
          // map API list response to UI fields
          const mapped = res.data.data.map((item) => ({
            id: item.id,
            category: item.master_category_name || "N/A",
            headline: item.news_post_title,
            shortDesc: item.portal_category_name,
            longDesc: "", // full detail later
            author: item.portal_name,
            live_url: item.live_url,
            journalist: "",
            status: item.status,
            date: new Date(item.sent_at).toLocaleDateString(),
            tags: [],
            image: item.news_post_image || "https://via.placeholder.com/150",
            latestNews: false,
            headlines: false,
            articles: false,
            trending: false,
            breakingNews: false,
            upcomingEvents: false,
            scheduleDate: "",
            counter: item.retry_count || 0,
            order: 0,
          }));
          setNews(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch news list:", err);
      }
    };
    loadNews();
  }, []);

  // 🔹 Toggle selection
  const toggleSelect = (id) => {
    setSelectedNewsIds((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedNewsIds.length === news.length) {
      setSelectedNewsIds([]);
    } else {
      setSelectedNewsIds(news.map((item) => item.id));
    }
  };

  // 🔹 Load detail when user clicks eye button
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
                  Recent Generate Articles/News
                </h1>
                <p className="text-gray-300 text-sm">
                  Manage published & draft articles
                </p>
              </div>
            </div>
            {/* <button
              type="submit"
              className="px-3 py-1.5 bg-white text-black rounded text-sm hover:bg-gray-100 transition-colors flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>Submit</span>
            </button> */}
          </div>

          {/* Table */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-black"
                        checked={selectedNewsIds.length === news.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Image
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Headline
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Category
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Portal Name
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Live Url
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
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
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
                            >
                              <Tag className="w-3 h-3 inline-block mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {item.category}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {item.author}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {item.live_url}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            item.status === "SUCCESS"
                              ? "bg-green-100 text-green-700"
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="p-1 text-gray-600 hover:text-black"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {news.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-gray-500">
                        No news found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative animate-fadeIn overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
            {selectedNews.image && (
              <div className="overflow-hidden rounded-xl mb-6">
                <img
                  src={`${selectedNews.image}`}
                  alt={selectedNews.headline}
                  className="w-full h-72 object-cover hover:scale-105 transition-transform"
                />
              </div>
            )}

            {/* Headline */}
            <h2 className="text-3xl font-bold mb-2 text-gray-900 leading-tight">
              {selectedNews.headline}
            </h2>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                {selectedNews.category}
              </span>
              <span className="px-2 py-1 border rounded text-gray-600 text-xs">
                {selectedNews.status}
              </span>
              <span>✍️ {selectedNews.author}</span>
              {selectedNews.journalist && (
                <span>📰 {selectedNews.journalist}</span>
              )}
              <span>📅 {selectedNews.date}</span>
            </div>

            {/* Short Desc */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {selectedNews.shortDesc}
              </p>
            </div>

            {/* Full Desc */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Full Article
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedNews.longDesc}
              </p>
            </div>

            {/* Tags */}
            {selectedNews.tags?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedNews.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-gray-200 transition"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Publishing */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Publishing Options
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: "latestNews", label: "Latest News" },
                  { key: "headlines", label: "Headlines" },
                  { key: "articles", label: "Articles" },
                  { key: "trending", label: "Trending" },
                  { key: "breakingNews", label: "Breaking News" },
                  { key: "upcomingEvents", label: "Upcoming Events" },
                ].map(({ key, label }) =>
                  selectedNews[key] ? (
                    <span
                      key={key}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs"
                    >
                      ✅ {label}
                    </span>
                  ) : null
                )}
              </div>
            </div>

            {/* Event */}
            {selectedNews.upcomingEvents && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  Event Details
                </h3>
                <p className="text-sm text-gray-600">
                  <strong>Start:</strong> {selectedNews.eventStartDate || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>End:</strong> {selectedNews.eventEndDate || "N/A"}
                </p>
              </div>
            )}

            {/* Schedule */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Scheduling & Settings
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Schedule Date:</strong>{" "}
                  {selectedNews.scheduleDate || "N/A"}
                </li>
                <li>
                  <strong>Counter:</strong> {selectedNews.counter || 0}
                </li>
                <li>
                  <strong>Display Order:</strong> {selectedNews.order || 0}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsList;
