import React, { useEffect, useState } from "react";
import { List, Info, Search, Folder, ArrowRight, Package } from "lucide-react";
import { fetchCategoryMappings, fetchMappedCategories } from "../../server";
import CategoryMapping from "../pages/CategoryMapping";

const AllCategories = () => {
  const [mappings, setMappings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMapping, setShowMapping] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mappingRes, categoryRes] = await Promise.all([
          fetchCategoryMappings(),
          fetchMappedCategories(false),
        ]);

        if (mappingRes.data.status) setMappings(mappingRes.data.message);
        if (categoryRes.data.status && Array.isArray(categoryRes.data.data))
          setCategories(categoryRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleCategories = showAll
    ? filteredCategories
    : filteredCategories.slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl border border-gray-200 rounded-3xl p-8 space-y-8">
          {/* Header with Black/White Gradient */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-black p-6 shadow-lg">
            <div className="absolute inset-0 bg-white/5"></div>
            <div className="relative flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                    <List className="w-7 h-7" />
                  </div>
                  Category Mappings Overview
                </h1>
                <p className="text-gray-300 mt-2 text-sm">Manage and organize your category mappings</p>
              </div>
              <button
                onClick={() => setShowMapping(true)}
                className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Manage Mappings
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 bg-gradient-to-r from-gray-100 to-gray-200 border-l-4 border-gray-900 p-4 rounded-xl shadow-sm">
            <div className="p-2 bg-gray-800 rounded-lg">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Unmapped Categories</p>
              <p className="text-sm text-gray-700">
                Categories listed below are <strong>not yet linked</strong> to any portal category. Map them to organize your content effectively.
              </p>
            </div>
          </div>

          {/* Search Section with Stats */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-gray-800 to-black rounded-xl shadow-md">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Unmapped Master Categories
                  </h2>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900 text-lg">{categories.length}</span> categories waiting to be mapped
                  </p>
                </div>
              </div>

              <div className="relative w-80">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm bg-white shadow-sm transition-all"
                />
              </div>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No categories match your search</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search term</p>
              </div>
            ) : (
              <div className="border-2 border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-white max-h-[450px] overflow-y-auto p-4 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {visibleCategories.map((cat, idx) => (
                    <div
                      key={cat.id}
                      className="group relative px-4 py-3 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:shadow-md hover:border-gray-900 hover:bg-gray-50 transition-all cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-900 rounded-lg group-hover:bg-black transition-all">
                          <Folder className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {cat.name}
                          </p>
                          {cat.description && (
                            <p className="text-xs text-gray-600 truncate mt-0.5">
                              {cat.description}
                            </p>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-4 h-4 text-gray-900" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show more/less */}
            {filteredCategories.length > 10 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-6 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-full transition-all shadow-md hover:shadow-lg"
                >
                  {showAll
                    ? "Show less ↑"
                    : `Show all ${filteredCategories.length} categories ↓`}
                </button>
              </div>
            )}
          </div>

          {/* Existing mappings */}
          <div className="pt-8 border-t-2 border-gray-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-gray-800 to-black rounded-xl shadow-md">
                <List className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Existing Mappings</h2>
                <p className="text-sm text-gray-600">{mappings.length} active category mappings</p>
              </div>
            </div>
            
            {mappings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <List className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No category mappings found</p>
                <p className="text-sm text-gray-500 mt-1">Create your first mapping to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mappings.map((m) => (
                  <div
                    key={m.id}
                    className="group border-2 border-gray-300 px-5 py-4 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-900 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-gray-900 rounded-lg">
                          <Folder className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-bold text-gray-900 px-3 py-1 bg-gray-200 rounded-lg">
                            {m.master_category_name}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm font-semibold text-white bg-gray-900 px-3 py-1 rounded-lg">
                            {m.portal_name}
                          </span>
                          <span className="text-sm text-gray-700">
                            / {m.portal_category_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CategoryMapping Modal */}
      {showMapping && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-start pt-10 overflow-auto z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-8 relative m-4 animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setShowMapping(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <CategoryMapping />
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCategories;