import React, { useState, useEffect, useRef } from "react";
import { FolderTree, Search, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { fetchMasterCategories } from "../../server";
import CategoryDetailPanel from "../components/CategoryDetailPanel";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const loadCategories = async (pageNum = 1, searchQuery = "") => {
    try {
      setIsLoading(true);
      const res = await fetchMasterCategories(pageNum, searchQuery);
      const api = res.data;

      if (api.status && Array.isArray(api.data)) {
        setCategories(api.data);
        if (api.pagination) {
          setPage(api.pagination.page);
          setTotalPages(api.pagination.total_pages);
          setHasNext(!!api.pagination.next);
          setHasPrevious(!!api.pagination.previous);
        }
      } else {
        toast.error("Failed to load categories.");
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      toast.error("Server error while fetching categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(1);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => {
        loadCategories(1, value);
      }, 500)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Category Insights
            </h1>
            <p className="text-gray-600">
              Review performance and analytics for each master category
            </p>
          </div>
        <div className="flex items-center bg-white shadow-sm border border-gray-200 rounded-lg px-4 py-2 max-w-md">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-transparent focus:outline-none text-gray-700"
          />
        </div>
        </div>

        {/* Search Bar */}

        {/* Loader Overlay */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-40">
            <div className="flex items-center gap-2 text-gray-700">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading categories...</span>
            </div>
          </div>
        )}

        {/* Category Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() =>
                setSelectedCategory({ id: cat.id, name: cat.name })
              }
              className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Header */}
              <div className="bg-black p-5 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <FolderTree className="text-indigo-600" size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white truncate max-w-[160px]">
                      {cat.name}
                    </h2>
                    {/* <p className="text-gray-300 text-xs">ID: {cat.id}</p> */}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 text-sm text-gray-700 space-y-2">
                <p className="line-clamp-2 text-gray-600">
                  {cat.description || "No description available"}
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Created: {new Date(cat.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    Updated: {new Date(cat.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && categories.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No categories found.
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-8 gap-3">
          <button
            onClick={() => hasPrevious && loadCategories(page - 1, search)}
            disabled={!hasPrevious}
            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition ${
              hasPrevious
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            <ArrowLeft size={16} />
            Prev
          </button>

          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => hasNext && loadCategories(page + 1, search)}
            disabled={!hasNext}
            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition ${
              hasNext
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedCategory && (
        <CategoryDetailPanel
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
