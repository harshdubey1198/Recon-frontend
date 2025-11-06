import React, { useState, useEffect, useRef } from "react";
import { Globe, List, Plus, ChevronDown, Loader2, Users } from "lucide-react";
import { fetchMasterCategories, fetchPortals, fetchPortalCategories, mapMasterCategory, createMasterCategory, fetchMappedCategoriesById, deleteMapping, updateCategoryMapping } from "../../server";
import { toast } from "react-toastify";
import formatUsername from "../utils/formateName";

const InfiniteScrollDropdown = ({ value, onChange, options, placeholder, loading, hasMore, onLoadMore,icon: Icon,renderOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const dropdownHeight = 288;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.2 && hasMore && !loading) {
      onLoadMore();
    }
  };

  useEffect(() => {
    if (isOpen && options.length === 0 && hasMore && !loading) {
      onLoadMore();
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.id === value || opt.name === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-transparent"
      >
        <div className="flex items-center gap-2 text-left flex-1">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
            {selectedOption ? renderOption(selectedOption) : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 w-full bg-white border-2 border-black/80 rounded-lg shadow-xl max-h-72 overflow-y-auto ${
            dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          ref={listRef}
          onScroll={handleScroll}
        >
          {options.length === 0 && !loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">No options available</div>
          ) : (
            <>
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors text-sm ${
                    (value === option.id || value === option.name) 
                      ? "bg-black/80 text-white hover:bg-black/90" 
                      : "text-gray-900 border-b border-gray-100 last:border-b-0"
                  }`}
                >
                  {renderOption(option)}
                </button>
              ))}
              {loading && (
                <div className="px-4 py-3 flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 border-t border-gray-200">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading more...
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const CategoryMapping = () => {
  const [masterCategories, setMasterCategories] = useState([]);
  const [selectedMasterCategory, setSelectedMasterCategory] = useState("");
  const [selectedMasterCategoryId, setSelectedMasterCategoryId] = useState(null);
  const [masterCategoriesPage, setMasterCategoriesPage] = useState(1);
  const [masterCategoriesHasMore, setMasterCategoriesHasMore] = useState(true);
  const [masterCategoriesLoading, setMasterCategoriesLoading] = useState(false);

  const [portals, setPortals] = useState([]);
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [portalsPage, setPortalsPage] = useState(1);
  const [portalsHasMore, setPortalsHasMore] = useState(true);
  const [portalsLoading, setPortalsLoading] = useState(false);

  const [portalCategories, setPortalCategories] = useState([]);
  const [selectedPortalCategory, setSelectedPortalCategory] = useState("");
  const [portalCategoriesPage, setPortalCategoriesPage] = useState(1);
  const [portalCategoriesHasMore, setPortalCategoriesHasMore] = useState(true);
  const [portalCategoriesLoading, setPortalCategoriesLoading] = useState(false);

  const [useDefaultContent, setUseDefaultContent] = useState(false);
  const [mappings, setMappings] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMasterCategoryName, setNewMasterCategoryName] = useState("");
  const [newMasterCategoryDescription, setNewMasterCategoryDescription] = useState("");

  const [mappedData, setMappedData] = useState(null);
  const [mappedCategoriesPage, setMappedCategoriesPage] = useState(1);
  const [mappedCategoriesHasMore, setMappedCategoriesHasMore] = useState(false);
  const [mappedCategoriesLoading, setMappedCategoriesLoading] = useState(false);
  const mappedScrollRef = useRef(null);

  useEffect(() => {
    loadMasterCategories(1);
  }, []);

  useEffect(() => {
    loadPortals(1);
  }, []);

  const loadMasterCategories = async (page) => {
    if (masterCategoriesLoading) return;
    
    setMasterCategoriesLoading(true);
    try {
      const response = await fetchMasterCategories(page);
      const { data, pagination } = response.data;
      
      if (page === 1) {
        setMasterCategories(data);
      } else {
        setMasterCategories(prev => [...prev, ...data]);
      }
      
      setMasterCategoriesPage(page);
      setMasterCategoriesHasMore(pagination.page < pagination.total_pages);
    } catch (error) {
      console.error("Error fetching master categories:", error);
      toast.error("Failed to load master categories");
    } finally {
      setMasterCategoriesLoading(false);
    }
  };

  const loadPortals = async (page) => {
    if (portalsLoading) return;
    
    setPortalsLoading(true);
    try {
      const response = await fetchPortals(page);
      const { data, pagination } = response.data;
      
      if (page === 1) {
        setPortals(data);
      } else {
        setPortals(prev => [...prev, ...data]);
      }
      
      setPortalsPage(page);
      setPortalsHasMore(pagination.page < pagination.total_pages);
    } catch (error) {
      console.error("Error fetching portals:", error);
      toast.error("Failed to load portals");
    } finally {
      setPortalsLoading(false);
    }
  };

  const loadPortalCategories = async (portalName, page) => {
    if (portalCategoriesLoading) return;
    
    setPortalCategoriesLoading(true);
    try {
      const response = await fetchPortalCategories(portalName, page);
      const { data, pagination } = response.data;
      
      if (page === 1) {
        setPortalCategories(data);
      } else {
        setPortalCategories(prev => [...prev, ...data]);
      }
      
      setPortalCategoriesPage(page);
      setPortalCategoriesHasMore(pagination.page < pagination.total_pages);
    } catch (error) {
      console.error("Error fetching portal categories:", error);
      toast.error("Failed to load portal categories");
    } finally {
      setPortalCategoriesLoading(false);
    }
  };

  const loadMappedCategories = async (categoryId, page) => {
    if (mappedCategoriesLoading) return;
    
    setMappedCategoriesLoading(true);
    try {
      const response = await fetchMappedCategoriesById(categoryId, page);
      const { data, pagination } = response.data;
      
      if (page === 1) {
        setMappedData(data);
      } else {
        setMappedData(prev => ({
          ...data,
          mappings: [...prev.mappings, ...data.mappings]
        }));
      }
      
      setMappedCategoriesPage(page);
      setMappedCategoriesHasMore(pagination.page < pagination.total_pages);
    } catch (error) {
      console.error("Error fetching mapped categories:", error);
      toast.error("Failed to load mapped categories");
      setMappedData(null);
    } finally {
      setMappedCategoriesLoading(false);
    }
  };

  const handleMappedScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.2 && mappedCategoriesHasMore && !mappedCategoriesLoading && selectedMasterCategoryId) {
      loadMappedCategories(selectedMasterCategoryId, mappedCategoriesPage + 1);
    }
  };

  useEffect(() => {
    if (!selectedPortal) {
      setPortalCategories([]);
      setPortalCategoriesPage(1);
      setPortalCategoriesHasMore(true);
      return;
    }
    loadPortalCategories(selectedPortal.name, 1);
  }, [selectedPortal]);

  useEffect(() => {
    if (selectedMasterCategoryId) {
      setMappedCategoriesPage(1);
      loadMappedCategories(selectedMasterCategoryId, 1);
    } else {
      setMappedData(null);
      setMappedCategoriesPage(1);
      setMappedCategoriesHasMore(false);
    }
  }, [selectedMasterCategoryId]);

  const handleAddMapping = async () => {
    if (!selectedMasterCategory || !selectedPortal || !selectedPortalCategory) {
      toast.warning("Please select Master Category, Portal, and Portal Category");
      return;
    }

    const masterCategoryObj = masterCategories.find(
      (cat) => cat.name === selectedMasterCategory
    );

    const portalCategoryObj = portalCategories.find(
      (cat) => cat.id === Number(selectedPortalCategory)
    );

    const newMapping = {
      masterCategory: selectedMasterCategory,
      portal: selectedPortal.name,
      portalCategory: `${portalCategoryObj.parent_name} → ${portalCategoryObj.name}`,
    };

    const exists = mappings.some(
      (m) =>
        m.masterCategory === newMapping.masterCategory &&
        m.portal === newMapping.portal &&
        m.portalCategory === newMapping.portalCategory
    );

    if (exists) {
      toast.info("Mapping already exists!");
      return;
    }

    try {
      const res = await mapMasterCategory({
        master_category: masterCategoryObj.id,
        portal_categories: [portalCategoryObj.id],
        use_default_content: useDefaultContent,
      });

      setMappings([...mappings, newMapping]);
      setSelectedMasterCategory("");
      setSelectedPortal("");
      setSelectedPortalCategory("");
      toast.success(res.data.message);
      
      if (selectedMasterCategoryId) {
        loadMappedCategories(selectedMasterCategoryId, 1);
      }
    } catch (err) {
      console.error("Failed to map category:", err);
      toast.error(err.response?.data?.message || "Failed to map category");
    }
  };

  const handleCreateMasterCategory = async () => {
    if (!newMasterCategoryName || !newMasterCategoryDescription) {
      toast.warning("Please fill both Name and Description");
      return;
    }

    try {
      await createMasterCategory({
        name: newMasterCategoryName,
        description: newMasterCategoryDescription,
      });
      toast.success("Master Category created successfully!");

      loadMasterCategories(1);

      setIsModalOpen(false);
      setNewMasterCategoryName("");
      setNewMasterCategoryDescription("");
    } catch (error) {
      console.error("Error creating master category:", error);
      toast.error("Failed to create master category!");
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    try {
      const response = await deleteMapping(mappingId);
      toast.success(response.data?.data || "Mapping deleted");

      if (selectedMasterCategoryId) {
        loadMappedCategories(selectedMasterCategoryId, 1);
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

      if (selectedMasterCategoryId) {
        loadMappedCategories(selectedMasterCategoryId, 1);
      }
    } catch (error) {
      console.error("Failed to update mapping:", error);
      toast.error(error.response?.data?.message || "Failed to update mapping");
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-xl">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Category Mapping</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-lg"
            >
              <Plus className="w-4 h-4" /> Add Master Category
            </button>
          </div>

          <div className="p-6 space-y-6 h-auto">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <List className="w-4 h-4 text-gray-600" /> Master Category
              </label>
              <InfiniteScrollDropdown
                value={selectedMasterCategory}
                onChange={(cat) => {
                  setSelectedMasterCategory(cat.name);
                  setSelectedMasterCategoryId(cat.id);
                }}
                options={masterCategories}
                placeholder="-- Select Master Category --"
                loading={masterCategoriesLoading}
                hasMore={masterCategoriesHasMore}
                onLoadMore={() => loadMasterCategories(masterCategoriesPage + 1)}
                icon={List}
                renderOption={(cat) => (
                  <div>
                    <div className="font-medium">{cat.name}</div>
                    {cat.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{cat.description}</div>
                    )}
                  </div>
                )}
              />
            </div>

            {mappedData && (
              <div className="bg-gray-50 to-indigo-50 border-2 border-black/80 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-black/70 pb-3">
                  <h3 className="font-bold text-lg text-gray-800">
                    Existing Mappings for "{mappedData.master_category.name}"
                  </h3>
                  {mappedData.assigned_users.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{mappedData.assigned_users.length} assigned user(s)</span>
                    </div>
                  )}
                </div>

                {mappedData.assigned_users.length > 0 && (
                  <div className="bg-white/70 rounded-lg p-3">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Assigned Users:</div>
                    <div className="flex flex-wrap gap-2">
                      {mappedData.assigned_users.map((user) => (
                        <div
                          key={user.id}
                          className="px-3 py-1 bg-black/20 text- rounded-full text-xs font-medium"
                        >
                           {formatUsername(user.username)} ({user.email})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    Portal Mappings ({mappedData.mappings.length}):
                  </div>
                  <div 
                    ref={mappedScrollRef}
                    onScroll={handleMappedScroll}
                    className="space-y-2 max-h-64 overflow-y-auto pr-2"
                  >
                    {mappedData.mappings.map((mapping) => (
                      <div
                        key={mapping.id}
                        className="bg-white border border-black/80 px-4 py-3 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm flex-1">
                            <Globe className="w-4 h-4 text-black/80" />
                            <span className="font-semibold text-gray-800">{mapping.portal_name}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-gray-700">{mapping.portal_category_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleDefaultContent(mapping.id, mapping.use_default_content)}
                              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                                mapping.use_default_content
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {mapping.use_default_content ? 'Default Content:True' : 'Default Content: False'}
                            </button>

                            {mapping.is_default && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                Default
                              </span>
                            )}

                            <button
                              onClick={() => handleDeleteMapping(mapping.id)}
                              className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-medium hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {mappedCategoriesLoading && (
                      <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading more mappings...
                      </div>
                    )}
                    {!mappedCategoriesHasMore && mappedData.mappings.length > 0 && (
                      <div className="text-center text-xs text-gray-500 py-2">
                        No more mappings
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-600" /> Portal
              </label>
              <InfiniteScrollDropdown
                value={selectedPortal?.id}
                onChange={(portal) => {
                  setSelectedPortal(portal);
                  setSelectedPortalCategory("");
                }}
                options={portals}
                placeholder="-- Select Portal --"
                loading={portalsLoading}
                hasMore={portalsHasMore}
                onLoadMore={() => loadPortals(portalsPage + 1)}
                icon={Globe}
                renderOption={(portal) => portal.name}
              />
            </div>

            {selectedPortal && (
              <>
                <div className="bg-white/50 border border-black/80 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">
                      Use Default Content
                    </label>
                    <select
                      value={useDefaultContent.toString()}
                      onChange={(e) => setUseDefaultContent(e.target.value === "true")}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <List className="w-4 h-4 text-gray-600" /> Portal Category
                  </label>
                  <InfiniteScrollDropdown 
                    value={selectedPortalCategory} 
                    onChange={(cat) => setSelectedPortalCategory(cat.id)}
                    options={portalCategories}
                    placeholder="-- Select Portal Category --" 
                    loading={portalCategoriesLoading}
                    hasMore={portalCategoriesHasMore} 
                    onLoadMore={() => loadPortalCategories(selectedPortal.name, portalCategoriesPage + 1)} 
                    icon={List} 
                    renderOption={(cat) => ( 
                      <div className="text-sm"> 
                        <span className="text-gray-600">{cat.parent_name}</span>
                        <span className="mx-2 text-gray-400">→</span> 
                        <span className="font-medium text-gray-900">{cat.name}</span>
                      </div> 
                    )} 
                  />
                </div>
              </>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleAddMapping}
                className="px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Add Mapping
              </button>
            </div>

            {mappings.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h2 className="font-bold text-lg text-gray-800 mb-4">Recently Mapped Categories</h2>
                <div className="space-y-3">
                  {mappings.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-4 py-3 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-800">{m.masterCategory}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-gray-700">{m.portal}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-gray-700">{m.portalCategory}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Add Master Category</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Enter category name"
                  value={newMasterCategoryName}
                  onChange={(e) => setNewMasterCategoryName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/80"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Enter category description"
                  value={newMasterCategoryDescription}
                  onChange={(e) => setNewMasterCategoryDescription(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/80"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMasterCategory}
                  className="px-5 py-2.5 bg-black/80 text-white rounded-lg hover:bg-black/90 transition-colors font-medium shadow-lg"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMapping;