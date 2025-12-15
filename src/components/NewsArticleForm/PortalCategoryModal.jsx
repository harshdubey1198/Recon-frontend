import React from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { fetchPortalParentCategories, fetchSubCategoriesByParent } from "../../../server";

const PortalCategoryModal = ({
  showPortalCategoryModal,
  setShowPortalCategoryModal,
  selectedPortalForCategories,
  setSelectedPortalForCategories,
  portalList,
  portalCategoriesModal,
  setPortalCategoriesModal,
  isSubcategoryView,
  setIsSubcategoryView,
  setMappedPortals,
  setShowPortalSection,
  formData,
}) => {
  if (!showPortalCategoryModal) return null;

  return (
   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">


      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-2xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={() => {
            setShowPortalCategoryModal(false);
            setSelectedPortalForCategories("");
            setIsSubcategoryView(false);
            setPortalCategoriesModal([]);
          }}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold mb-4">
          {!selectedPortalForCategories ? "Select Portal" : isSubcategoryView ? "Select Subcategory" : "Select Category"}
        </h3>

        {formData.master_category && showPortalCategoryModal && (
          <select
            className="border p-2 rounded w-full mb-3"
            value={selectedPortalForCategories}
            onChange={(e) => {
              setSelectedPortalForCategories(e.target.value);
            }}
          >
            <option value="">Select Portal</option>
            {portalList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}

        {isSubcategoryView && (
          <button
            type="button"
            className="mb-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
            onClick={async () => {
              setIsSubcategoryView(false);
              const res = await fetchPortalParentCategories(selectedPortalForCategories, 1);
              const categories = res?.data?.data?.parent_categories || [];
              const cleanCategories = categories.map((cat) => ({
                parent_name: cat.parent_name,
                parent_external_id: cat.parent_external_id,
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
                      const subCatRes = await fetchSubCategoriesByParent(selectedPortalForCategories, cat.parent_external_id);
                      const subcats = subCatRes?.data?.data?.categories || [];

                      if (subcats.length > 0) {
                        setPortalCategoriesModal(subcats);
                        setIsSubcategoryView(true);
                      } else {
                        toast.info("No subcategories found");
                      }
                    } catch (err) {
                      console.error("Error fetching subcategories:", err);
                      toast.error("Failed to load subcategories");
                    }
                  }
                }}
              >
                <label className="flex items-center gap-2 cursor-pointer w-full" onClick={(e) => { if (isSubcategoryView) e.stopPropagation(); }}>
                  {isSubcategoryView && (
                    <input
                      type="checkbox"
                      checked={cat.selected || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        const isChecked = e.target.checked;
                        setPortalCategoriesModal((prev) => prev.map((c) => ({ ...c, selected: c.external_id === cat.external_id ? isChecked : c.selected })));
                      }}
                    />
                  )}
                  <span className="flex-1">{isSubcategoryView ? cat.name : cat.parent_name}</span>
                  {!isSubcategoryView && <span className="text-xs text-gray-500">→</span>}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm text-center mt-2">No categories found</p>
        )}

        {isSubcategoryView && (
          <div className="flex justify-end mt-5">
            <button
              className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-md"
              onClick={() => {
                const selectedCats = portalCategoriesModal.filter((c) => c.selected);
                if (selectedCats.length === 0) {
                  toast.warning("Please select at least one subcategory.");
                  return;
                }

                const selectedPortalData = portalList.find((p) => p.id === Number(selectedPortalForCategories));
                const actualPortalName = selectedPortalData?.name || "Unknown Portal";

                setMappedPortals((prev) => {
                  const updated = [...prev];
                  selectedCats.forEach((cat) => {
                    const exists = updated.some((p) => p.portalName === actualPortalName && p.portalCategoryId === cat.external_id);
                    if (!exists) {
                      updated.push({
                        id: cat.id,
                        portalId: Number(selectedPortalForCategories),
                        portalName: actualPortalName,
                        portalCategoryName: cat.name,
                        portalParentCategory: cat.parent_name,
                        portalCategoryId: cat.external_id,
                        selected: true,
                        is_manually_added: true,
                      });
                    }
                  });
                  return updated;
                });

                toast.success(`${selectedCats.length} subcategor${selectedCats.length > 1 ? "ies" : "y"} added`);

                setShowPortalCategoryModal(false);
                setIsSubcategoryView(false);
                setSelectedPortalForCategories("");
                setPortalCategoriesModal([]);
                setShowPortalSection(true);
              }}
            >
              Save Selected
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalCategoryModal;