import React, { useEffect, useState, useRef, useCallback } from "react";
import { List, Info, Search, Folder, ArrowRight, Package, X, Users, Link2, Loader2 } from "lucide-react";
import { fetchCategoryMappings, fetchMasterCategories, fetchMappedCategoriesById, deleteMapping, updateCategoryMapping } from "../../server";
import CategoryMapping from "../pages/CategoryMapping";
import formatUsername from "../utils/formateName";
import { toast } from "react-toastify";

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMapping, setShowMapping] = useState(false);
  
  // Pagination for main categories list
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreCategories, setHasMoreCategories] = useState(false);
  const [loadingMoreCategories, setLoadingMoreCategories] = useState(false);
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [mappingDetails, setMappingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Pagination for modal
  const [detailsPage, setDetailsPage] = useState(1);
  const [hasMoreDetails, setHasMoreDetails] = useState(false);
  const [loadingMoreDetails, setLoadingMoreDetails] = useState(false);
  
  const categoriesScrollRef = useRef(null);
  const modalScrollRef = useRef(null);

  const loadData = async (page = 1, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      } else {
        setLoadingMoreCategories(true);
      }

      const categoryRes = await fetchMasterCategories(page, searchTerm);

      if (categoryRes.data.status && Array.isArray(categoryRes.data.data)) {
        if (isLoadMore) {
          setCategories(prev => [...prev, ...categoryRes.data.data]);
        } else {
          setCategories(categoryRes.data.data);
        }
        setCategoriesCount(categoryRes.data.pagination.count || 0);
        setHasMoreCategories(categoryRes.data.pagination.next !== null);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setLoadingMoreCategories(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm]);

  const loadMoreCategories = useCallback(() => {
    if (loadingMoreCategories || !hasMoreCategories || loading) return;
    loadData(currentPage + 1, true);
  }, [currentPage, hasMoreCategories, loadingMoreCategories, loading]);

  const handleCategoriesScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMoreCategories();
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setDetailsPage(1);
    setMappingDetails(null);

    try {
      const response = await fetchMappedCategoriesById(category.id, 1);
      if (response.data.status) {
        setMappingDetails(response.data.data);
        setHasMoreDetails(response.data.pagination.next !== null);
      }
    } catch (error) {
      console.error("Error fetching mapping details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadMoreDetails = async () => {
    if (loadingMoreDetails || !hasMoreDetails || !selectedCategory) return;

    setLoadingMoreDetails(true);
    const nextPage = detailsPage + 1;

    try {
      const response = await fetchMappedCategoriesById(selectedCategory.id, nextPage);
      if (response.data.status) {
        setMappingDetails(prev => ({
          ...prev,
          mappings: [...(prev?.mappings || []), ...(response.data.data.mappings || [])]
        }));
        setDetailsPage(nextPage);
        setHasMoreDetails(response.data.pagination.next !== null);
      }
    } catch (error) {
      console.error("Error loading more details:", error);
    } finally {
      setLoadingMoreDetails(false);
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    try {
      const response = await deleteMapping(mappingId);
      toast.success(response.data?.data || "Mapping deleted");

      // Directly refresh mapping details after delete (fetch page 1)
      if (selectedCategory?.id) {
        const updatedRes = await fetchMappedCategoriesById(selectedCategory.id, 1);
        if (updatedRes?.data?.data) {
          setMappingDetails(updatedRes.data.data);
          // reset modal pagination to first page after refresh
          setDetailsPage(1);
          setHasMoreDetails(updatedRes.data.pagination?.next !== null);
        }
      }
    } catch (error) {
      console.error("Failed to delete mapping:", error);
      toast.error(error.response?.data?.message || "Failed to delete mapping");
    }
  };

  const handleToggleDefaultContent = async (mappingId, currentValue) => {
    try {
      await updateCategoryMapping(mappingId, !currentValue);
      toast.success(`Default content ${!currentValue ? 'enabled' : 'disabled'}`);

      // Refresh the mapping details after toggle
      if (selectedCategory?.id) {
        const updatedRes = await fetchMappedCategoriesById(selectedCategory.id, 1);
        if (updatedRes?.data?.data) {
          setMappingDetails(updatedRes.data.data);
          setDetailsPage(1);
          setHasMoreDetails(updatedRes.data.pagination?.next !== null);
        }
      }
    } catch (error) {
      console.error("Failed to update mapping:", error);
      toast.error(error.response?.data?.message || "Failed to update mapping");
    }
  };

  const handleModalScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMoreDetails();
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedCategory(null);
    setMappingDetails(null);
    setDetailsPage(1);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleCategories = showAll
    ? filteredCategories
    : filteredCategories;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl border border-gray-200 rounded-3xl p-8 space-y-8">
          {/* Header */}
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
              <p className="text-sm font-semibold text-gray-900 mb-1">All Categories</p>
              <p className="text-sm text-gray-700">
                Click on any category to view its mappings and assigned users.
              </p>
            </div>
          </div>

          {/* Search Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-gray-800 to-black rounded-xl shadow-md">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    All Master Categories
                  </h2>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900 text-lg">{categoriesCount}</span> Master Categories available
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
                  className="pl-12 pr-4 py-3 w-full border-2 border-gray-300 rounded-xl text-sm bg-white shadow-sm transition-all"
                />
              </div>
            </div>

            {categories.length === 0 && !loading ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No categories found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search term</p>
              </div>
            ) : (
              <div className="border-2 border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-white h-[410px] p-4 shadow-inner">
                <div 
                  ref={categoriesScrollRef}
                  onScroll={handleCategoriesScroll}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto h-full pr-2"
                >
                  {loading && categories.length === 0 ? (
                    <div className="col-span-full flex justify-center items-center py-10">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-700 text-sm font-medium">Loading categories...</p>
                      </div>
                    </div>
                  ) : (
                    visibleCategories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat)}
                        className="group relative px-4 py-3 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:shadow-md hover:border-gray-900 hover:bg-gray-50 transition-all cursor-pointer transform"
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
                    ))
                  )}

                  {loadingMoreCategories && (
                    <div className="col-span-full flex justify-center py-4">
                      <Loader2 className="w-6 h-6 text-gray-900 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            )}

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
        </div>
      </div>

      {/* CategoryMapping Modal */}
      {showMapping && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-start pt-10 overflow-auto z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-2 relative m-4 animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setShowMapping(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <CategoryMapping />
          </div>
        </div>
      )}
    </div>
  );
};
export default AllCategories;
