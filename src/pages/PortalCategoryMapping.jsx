import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Check, Loader2, ArrowLeft, CheckCircle2, X, Plus } from 'lucide-react';

// Import your actual API functions
import {
  fetchPortals,
  fetchPortalParentCategories,
  fetchSubCategoriesByParent,
  createPortalCategoryMapping,
  fetchCrossPortalMappings,
  deleteCrossPortalMapping
} from '../../server';

const PortalCategoryMapping = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedTargetIds, setSelectedTargetIds] = useState([]);
  
  const [portals, setPortals] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [targetMappings, setTargetMappings] = useState([]);
  const [requestedCategory, setRequestedCategory] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');

  // Modal states
  const [showPortalCategoryModal, setShowPortalCategoryModal] = useState(false);
  const [selectedPortalForCategories, setSelectedPortalForCategories] = useState('');
  const [isSubcategoryView, setIsSubcategoryView] = useState(false);
  const [portalCategoriesModal, setPortalCategoriesModal] = useState([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [categoryPage, setCategoryPage] = useState(1);
  const [portalList, setPortalList] = useState([]);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    loadPortals();
  }, []);

  const loadPortals = async () => {
    setLoading(true);
    setPortalLoading(true);
    try {
      const response = await fetchPortals(1);
      const portalData = response.data.data || [];
      setPortals(portalData);
      setPortalList(portalData);
    } catch (error) {
      console.error('Error fetching portals:', error);
    } finally {
      setLoading(false);
      setPortalLoading(false);
    }
  };

  const loadParentCategories = async (portalId) => {
    setLoading(true);
    try {
      const response = await fetchPortalParentCategories(portalId, 1);
      setParentCategories(response.data.data.parent_categories || []);
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (portalId, parentExternalId) => {
    setLoading(true);
    try {
      const response = await fetchSubCategoriesByParent(portalId, parentExternalId, 1);
      setSubcategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTargetMappings = async (sourceCategoryId) => {
    setLoading(true);
    try {
      const response = await fetchCrossPortalMappings(sourceCategoryId);
      const responseData = response.data.data;
      
      setRequestedCategory(responseData.requested_portal_category);
      setTargetMappings(responseData.mapped_portal_categories || []);
      
      if (responseData.mapping_found && responseData.mapped_portal_categories) {
        const mappedIds = responseData.mapped_portal_categories.map(m => m.id);
        setSelectedTargetIds(mappedIds);
      } else {
        setSelectedTargetIds([]);
      }
    } catch (error) {
      console.error('Error fetching target mappings:', error);
      setTargetMappings([]);
      setSelectedTargetIds([]);
      setRequestedCategory(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePortalSelect = async (portal) => {
    setSelectedPortal(portal);
    setSelectedParent(null);
    setSelectedSubcategory(null);
    setSelectedTargetIds([]);
    await loadParentCategories(portal.id);
    setStep(2);
  };

  const handleParentSelect = async (parent) => {
    setSelectedParent(parent);
    setSelectedSubcategory(null);
    setSelectedTargetIds([]);
    await loadSubcategories(selectedPortal.id, parent.parent_external_id);
    setStep(3);
  };

  const handleSubcategorySelect = async (subcategory) => {
    setSelectedSubcategory(subcategory);
    await loadTargetMappings(subcategory.id);
    setStep(4);
  };

  const toggleTargetSelection = (targetId) => {
    setSelectedTargetIds(prev => 
      prev.includes(targetId) 
        ? prev.filter(id => id !== targetId)
        : [...prev, targetId]
    );
  };

  const handleDeleteMapping = async (mappingId, e) => {
    e.stopPropagation();
     setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await deleteCrossPortalMapping(mappingId);
       setSubmitStatus('success');
      setSubmitMessage(response.data.message || 'Mapping deleted successfully!');
      // Reload target mappings to show updated state
      await loadTargetMappings(selectedSubcategory.id);
      
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error.response?.data?.message || error.message || 'Failed to delete mapping');
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2) {
        setSelectedPortal(null);
        setParentCategories([]);
      } else if (step === 3) {
        setSelectedParent(null);
        setSubcategories([]);
      } else if (step === 4) {
        setSelectedSubcategory(null);
        setTargetMappings([]);
        setSelectedTargetIds([]);
        setRequestedCategory(null);
      }
    }
  };

  const filterItems = (items, query) => {
    if (!query) return items;
    const lowerQuery = query.toLowerCase();
    
    if (step === 1) {
      return items.filter(item => item.name.toLowerCase().includes(lowerQuery));
    } else if (step === 2) {
      return items.filter(item => item.parent_name.toLowerCase().includes(lowerQuery));
    } else if (step === 3 || step === 4) {
      return items.filter(item => item.name.toLowerCase().includes(lowerQuery));
    }
    return items;
  };

  const getStepTitle = () => {
    switch(step) {
      case 1: return 'Select Portal';
      case 2: return 'Select Parent Category';
      case 3: return 'Select Subcategory';
      case 4: return 'Map Target Categories';
      default: return '';
    }
  };

  const getBreadcrumb = () => {
    const crumbs = [];
    if (selectedPortal) crumbs.push(selectedPortal.name);
    if (selectedParent) crumbs.push(selectedParent.parent_name);
    if (selectedSubcategory) crumbs.push(selectedSubcategory.name);
    return crumbs.join(' / ');
  };

  const getCurrentItems = () => {
    switch(step) {
      case 1: return portals;
      case 2: return parentCategories;
      case 3: return subcategories;
      case 4: return targetMappings;
      default: return [];
    }
  };

  const filteredItems = filterItems(getCurrentItems(), searchQuery);

  // Handle opening modal and loading categories
  const handleOpenModal = () => {
    setShowPortalCategoryModal(true);
  };

  // Handle portal selection in modal
  const handlePortalChangeInModal = async (portalId) => {
    setSelectedPortalForCategories(portalId);
    setCategoryPage(1);
    setIsSubcategoryView(false);
    setPortalCategoriesModal([]);
    
    if (portalId) {
      try {
        const res = await fetchPortalParentCategories(portalId, 1);
        const categories = res?.data?.data?.parent_categories || [];
        const cleanCategories = categories.map(cat => ({
          parent_name: cat.parent_name,
          parent_external_id: cat.parent_external_id
        }));
        setPortalCategoriesModal(cleanCategories);
      } catch (err) {
        console.error("Error fetching parent categories:", err);
      }
    }
  };

  // Handle saving selected subcategories from modal
  const handleSaveModalSelection = async () => {
    const selectedCats = portalCategoriesModal.filter(c => c.selected);
    
    if (selectedCats.length === 0) {
      alert("Please select at least one subcategory.");
      return;
    }

    if (!selectedSubcategory) {
      alert("Please select a source category first.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Get target category IDs from selected subcategories
      const targetCategoryIds = selectedCats.map(cat => cat.id);

      // Prepare payload for API
      const payload = {
        source_category_id: selectedSubcategory.id,
        target_category_ids: targetCategoryIds
      };

      // Call API to create mappings
      const response = await createPortalCategoryMapping(payload);

      const selectedPortalData = portalList.find(
        p => p.id === Number(selectedPortalForCategories)
      );
      const actualPortalName = selectedPortalData?.name || "Unknown Portal";

      const newMappings = selectedCats.map(cat => ({
        id: cat.id,
        portal_category_id: cat.external_id,
        name: cat.name,
        parent_name: selectedParentCategory?.parent_name || cat.parent_name,
        portal_name: actualPortalName
      }));

      // Add to target mappings
      setTargetMappings(prev => {
        const updated = [...prev];
        newMappings.forEach(mapping => {
          const exists = updated.some(
            m => m.portal_category_id === mapping.portal_category_id
          );
          if (!exists) {
            updated.push(mapping);
          }
        });
        return updated;
      });

      // Add to selected IDs
      setSelectedTargetIds(prev => {
        const newIds = newMappings.map(m => m.id);
        return [...new Set([...prev, ...newIds])];
      });

      setSubmitStatus('success');
      setSubmitMessage(response.data.message || `${selectedCats.length} mapping(s) created successfully!`);
      
      // Reload target mappings to show updated state
      await loadTargetMappings(selectedSubcategory.id);

      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);

      // Reset modal
      setShowPortalCategoryModal(false);
      setIsSubcategoryView(false);
      setSelectedPortalForCategories("");
      setPortalCategoriesModal([]);
      setSelectedParentCategory(null);
      setCategoryPage(1);
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error.response?.data?.message || error.message || 'Failed to create mapping');
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <div className="min-h-screen bg-gray-50 py-8">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-black px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              )}
              <div>
               <h1 className="text-2xl font-bold text-white flex items-center gap-3">Portal Category Mapping</h1>
                <p className="text-gray-300 mt-1">Step {step} of 4</p>
              </div>
            </div>
          </div>

          {getBreadcrumb() && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-white rounded-lg">
              <div className="text-sm text-black font-medium">{getBreadcrumb()}</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">{getStepTitle()}</h2>
            
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-black animate-spin" />
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          )}

          {!loading && (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2">

              {filteredItems.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  {step === 4 ? 'No mapped categories found. Click "Add Mapping" to add categories.' : 'No items found'}
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = step === 4 && selectedTargetIds.includes(item.id);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (step === 1) handlePortalSelect(item);
                        else if (step === 2) handleParentSelect(item);
                        else if (step === 3) handleSubcategorySelect(item);
                      }}
                      className={`p-5 rounded-xl border-2 ${step === 4 ? '' : 'cursor-pointer'} transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-black bg-white/90'
                          : 'border-gray-200 hover:border-black/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {step === 1 ? item.name :
                             step === 2 ? item.parent_name :
                             step === 3 ? item.name :
                             item.name}
                          </h3>
                          
                          {step === 3 && (
                            <div className="text-sm text-gray-500">
                              <p className="text-xs mt-1">Parent: {item.parent_name}</p>
                            </div>
                          )}
                          
                          {step === 4 && (
                            <div className="text-sm text-gray-500">
                              <p className="font-medium text-gray-700">{item.portal_name}</p>
                              <p className="text-xs mt-1">Parent: {item.parent_name}</p>
                              <p className="text-xs">Portal Category ID: {item.portal_category_id}</p>
                            </div>
                          )}
                        </div>
                        
                        {step === 4 && (
                          <button
                            onClick={(e) => handleDeleteMapping(item.cross_mapping_id || item.id, e)}
                            className="w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0 ml-2 transition-colors"
                            title="Delete mapping"
                          >
                            <X className="w-5 h-5 text-white" />
                          </button>
                        )}
                        
                        {step < 4 && (
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
                {step === 4 && !loading && (
                <div className="mt-8 pt-6 border-t">
                    <div className="flex items-center justify-end">
                    <button
                        onClick={handleOpenModal}
                        className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-black/70 transition-all shadow-md flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Mapping
                    </button>
                    </div>
                </div>
                )}

          </div>
            </div>

      {/* Portal Category Selection Modal */}
      {showPortalCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-2xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => {
                setShowPortalCategoryModal(false);
                setSelectedPortalForCategories("");
                setIsSubcategoryView(false);
                setPortalCategoriesModal([]);
                setSelectedParentCategory(null);
              }}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4">
              {!selectedPortalForCategories 
                ? "Select Portal" 
                : isSubcategoryView 
                  ? "Select Subcategory" 
                  : "Select Category"}
            </h3>

            <select
              className="border p-2 rounded w-full mb-3"
              value={selectedPortalForCategories}
              onChange={(e) => handlePortalChangeInModal(e.target.value)}
            >
              <option value="">Select Portal</option>
              {portalLoading ? (
                <option>Loading...</option>
              ) : (
                portalList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>

            {isSubcategoryView && (
              <button
                type="button"
                className="mb-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                onClick={async () => {
                  setIsSubcategoryView(false);
                  setCategoryPage(1);
                  const res = await fetchPortalParentCategories(selectedPortalForCategories, 1);
                  const categories = res?.data?.data?.parent_categories || [];
                  const cleanCategories = categories.map(cat => ({
                    parent_name: cat.parent_name,
                    parent_external_id: cat.parent_external_id
                  }));
                  setPortalCategoriesModal(cleanCategories);
                }}
              >
                ← Back to Categories
              </button>
            )}

            {portalCategoriesModal.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto border rounded p-2">
                {portalCategoriesModal.map((cat) => (
                  <li
                    key={cat.parent_external_id || cat.external_id}
                    className="p-2 border-b text-sm flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={async () => {
                      if (!isSubcategoryView) {
                        try {
                          const subCatRes = await fetchSubCategoriesByParent(
                            selectedPortalForCategories,
                            cat.parent_external_id
                          );
                          const subcats = subCatRes?.data?.data?.categories || [];
                          
                          if (subcats.length > 0) {
                            setPortalCategoriesModal(subcats);
                            setIsSubcategoryView(true);
                            setSelectedParentCategory(cat);
                          } else {
                            alert("No subcategories found");
                          }
                        } catch (err) {
                          console.error("Error fetching subcategories:", err);
                          alert("Failed to load subcategories");
                        }
                      }
                    }}
                  >
                    <label className="flex items-center gap-2 cursor-pointer w-full" onClick={(e) => {
                      if (isSubcategoryView) {
                        e.stopPropagation();
                      }
                    }}>
                      {isSubcategoryView && (
                        <input
                          type="checkbox"
                          checked={cat.selected || false}
                          onChange={(e) => {
                            e.stopPropagation();
                            const isChecked = e.target.checked;
                            setPortalCategoriesModal((prev) =>
                              prev.map((c) => ({
                                ...c,
                               selected: c.external_id === cat.external_id ? isChecked : false,

                              }))
                            );
                          }}
                        />
                      )}
                      <span className="flex-1">
                        {isSubcategoryView ? cat.name : cat.parent_name}
                      </span>
                      {!isSubcategoryView && (
                        <span className="text-xs text-gray-500">→</span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm text-center mt-2">
                No categories found
              </p>
            )}

            {isSubcategoryView && (
              <div className="flex justify-end mt-5">
                <button
                  className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-md"
                  onClick={handleSaveModalSelection}
                >
                  Save Selected
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalCategoryMapping;