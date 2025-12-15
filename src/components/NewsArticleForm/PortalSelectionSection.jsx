import React from "react";
import { Settings } from "lucide-react";

const PortalSelectionSection = ({
  isCategoryloading,
  assignedCategories,
  formData,
  setFormData,
  handleCategorySelect,
  showPortalSection,
  isPortalsLoading,
  mappedPortals,
  setMappedPortals,
  categoryHistory,
  isViewingSubcategories,
  handlePortalCategoryClick,
  handleGoBack,
  setShowPortalCategoryModal,
  showPortalCategoryModal,
  forceEnablePortal,
  setForceEnablePortal,
  isCrossMappingChecked,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">

     <div className="w-full md:w-1/2">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Portal
  </label>

  <select
    name="master_category"
    value={formData.master_category || assignedCategories[0]?.id}
    onChange={(e) => {
      setFormData((prev) => ({ ...prev, master_category: e.target.value }));
      handleCategorySelect(e);
    }}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
               focus:ring-2 focus:ring-gray-900 focus:border-transparent"
  >
    {assignedCategories.map((portal) => (
      <option key={portal.id} value={portal.id}>
        {portal.name}
      </option>
    ))}
  </select>
</div>


      {showPortalSection && (
        <section className="space-y-5 mt-2 border-2 p-2 border-gray-200 rounded relative">
          <div className="relative flex items-center justify-between items-center pb-3 border-b-2 border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 text-gray-700" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mappedPortals?.length > 0 && mappedPortals[0]?.mapping_found
                  ? "Select matched portal"
                  : categoryHistory.length > 0
                  ? "Select subcategory"
                  : "Select category"}{" "}
                from{" "}
                <span className="font-bold">
                  {assignedCategories.find((p) => p.id === Number(formData.master_category))?.name || "Selected"}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {!showPortalCategoryModal && formData.master_category && categoryHistory.length > 0 && !mappedPortals[0]?.has_subcategories && (
                <button
                  type="button"
                  className="px-3 py-2 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
                  onClick={() => {
                    setForceEnablePortal(true);
                    setShowPortalCategoryModal(true);
                  }}
                >
                  Manage Portal Categories
                </button>
              )}

              {categoryHistory.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGoBack();
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {isPortalsLoading ? (
              <p className="text-center col-span-full py-5 text-gray-600">Loading...</p>
            ) : (
              <>
                {mappedPortals.map((portal, i) => {
                  const isManuallyAdded = portal.is_manually_added === true;

                  return (
                    <div
                      key={i}
                      onClick={(e) => {
                        if (portal.mapping_found) {
                          e.stopPropagation();
                          setMappedPortals((prev) => prev.map((p) => (p.id === portal.id ? { ...p, selected: !p.selected } : p)));
                        } else {
                          handlePortalCategoryClick(portal);
                        }
                      }}
                      className={`relative flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all ${
                        portal.selected ? "bg-gray-900 border-gray-900 text-white shadow-lg" : "bg-white border-gray-900 hover:border-gray-400"
                      }`}
                    >
                      <div className="w-full">
                        {portal.mapping_found ? (
                          <>
                            <div className="absolute top-3 left-3">
                              {portal.selected ? (
                                <input type="checkbox" checked={portal.selected} onChange={() => setMappedPortals((prev) => prev.map((p, idx) => (idx === i ? { ...p, selected: !p.selected } : p)))} className="w-5 h-5 accent-gray-900" />
                              ) : (
                                <span className="w-4 h-4 border border-gray-400 rounded bg-white"></span>
                              )}
                            </div>
                            <div className="ml-6 mr-8">
                              <p className="text-lg font-semibold">{portal.portalName}</p>
                              <p className="text-sm text-gray-300">{portal.portalParentCategory}</p>
                              <p className="text-xs text-gray-400">{portal.portalCategoryName}</p>
                            </div>
                          </>
                        ) : (
                          <div className="mr-8">
                            <p className="text-lg font-semibold">{portal.portalCategoryName}</p>
                            <p className="text-sm text-gray-300">{portal.portalName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default PortalSelectionSection;