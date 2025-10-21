// AllCategories.jsx
import React, { useEffect, useState } from "react";
import { List, Info, Search } from "lucide-react";
import { fetchCategoryMappings, fetchMappedCategories } from "../../server";
import CategoryMapping from "../pages/CategoryMapping"; // ✅ import CategoryMapping

const AllCategories = () => {
  const [mappings, setMappings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showMapping, setShowMapping] = useState(false); // ✅ state to show CategoryMapping

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
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
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
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md border rounded-2xl p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
              <List className="w-6 h-6" /> Category Mappings Overview
            </h1>

            {/* Button to open CategoryMapping */}
            <button
              onClick={() => setShowMapping(true)}
              className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-blue-700"
            >
              Manage Category Mappings
            </button>
          </div>

          {/* Info Banner */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-lg">
            <Info className="w-5 h-5" />
            <p className="text-sm">
              Below are <strong>unmapped master categories</strong> — not yet
              linked to any portal category.
            </p>
          </div>

          {/* Search + List */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-gray-700">
                Unmapped Master Categories (
                <span className="text-blue-600">{categories.length}</span>)
              </h2>

              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {filteredCategories.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                No categories match your search.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-xl bg-gray-50 max-h-[400px] overflow-y-auto p-3 shadow-sm">
                <ul className="space-y-1">
                  {visibleCategories.map((cat) => (
                    <li
                      key={cat.id}
                      className="px-3 py-2 bg-white border rounded-lg shadow-sm text-gray-700 hover:bg-blue-50 transition text-sm"
                    >
                      {cat.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Show more/less */}
            {filteredCategories.length > 10 && (
              <div className="text-center mt-3">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showAll
                    ? "Show less"
                    : `Show all (${filteredCategories.length})`}
                </button>
              </div>
            )}
          </div>

          {/* Existing mappings */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              Existing Mappings
            </h2>
            {mappings.length === 0 ? (
              <p className="text-gray-500">No category mappings found.</p>
            ) : (
              <ul className="space-y-2">
                {mappings.map((m) => (
                  <li
                    key={m.id}
                    className="border px-4 py-2 rounded-lg flex justify-between items-center hover:bg-gray-50 transition"
                  >
                    <span className="text-sm">
                      <strong className="text-gray-800">
                        {m.master_category_name}
                      </strong>{" "}
                      →{" "}
                      <em className="text-blue-600 font-medium">
                        {m.portal_name}
                      </em>{" "}
                      / {m.portal_category_name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* CategoryMapping Modal */}
      {showMapping && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-10 overflow-auto z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-6 relative">
            <button
              onClick={() => setShowMapping(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
            <CategoryMapping />
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCategories;
