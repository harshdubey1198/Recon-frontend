import { useParams, useLocation } from "react-router-dom";

export default function NewsDetail() {
  const { id } = useParams();
  const location = useLocation();
  const news = location.state; // ✅ get passed data

  if (!news) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">News Detail</h1>
        <p className="text-gray-500">No news details found for ID: {id}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded">
      <img
        src={news.image}
        alt={news.headline}
        className="w-full h-64 object-cover rounded mb-4"
      />
      <h1 className="text-3xl font-bold mb-2">{news.headline}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {news.category} • {news.author} • {news.date}
      </p>
      <p className="text-gray-700 mb-4">{news.shortDesc}</p>
      <div className="flex flex-wrap gap-2">
        {news.tags.map((tag, idx) => (
          <span
            key={idx}
            className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
