// 📁 components/PortalCategoryModal.jsx
import React from "react";
import { X } from "lucide-react";

const PortalCategoryModal = ({
  show,
  portalList,
  portalCategories,
  setPortalCategories,
  selectedPortal,
  onSelectPortal,
  categoryPage,
  setCategoryPage,
  hasNextPage,
  onSave,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-2xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold mb-4">Manage Portal Categories</h3>

        {/* Portal selector */}
        <select
          className="border p-2 rounded w-full mb-3"
          value={selectedPortal}
          onChange={(e) => {
            onSelectPortal(e.target.value);
            setCategoryPage(1);
          }}
        >
          <option value="">Select Portal</option>
          {portalList.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Category list */}
        {portalCategories.length > 0 ? (
          <ul className="max-h-60 overflow-y-auto border rounded p-2">
            {portalCategories.map((cat) => (
              <li
                key={cat.id}
                className="p-2 border-b text-sm flex items-center justify-between"
              >
                <label className="flex items-center gap-2 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={!!cat.selected}
                    onChange={(e) => {
                      setPortalCategories((prev) =>
                        prev.map((c) =>
                          c.id === cat.id ? { ...c, selected: e.target.checked } : c
                        )
                      );
                    }}
                    className="w-4 h-4 accent-gray-900"
                  />
                  <span className="flex-1">
                    {cat.name} <span className="text-gray-400">({cat.parent_name})</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm text-center mt-2">
            {selectedPortal ? "No categories found." : "Select a portal to view categories."}
          </p>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={categoryPage === 1}
            onClick={() => setCategoryPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-200 rounded text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">Page {categoryPage}</span>
          <button
            disabled={!hasNextPage}
            onClick={() => setCategoryPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Save button */}
        <div className="flex justify-end mt-5">
          <button
            className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-md"
            onClick={onSave}
          >
            Save Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PortalCategoryModal);