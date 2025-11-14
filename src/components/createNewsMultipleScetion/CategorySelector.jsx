import React from "react";

const CategorySelector = ({
  formData,
  assignedCategories,
  isCategoryLoading,
  nextCategoryPage,
  isLoadingMoreCategories,
  onCategoryChange,
  onLoadMoreCategories,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Category <span className="text-red-500">*</span>
      </label>
      <div className="space-y-2">
        <select
          name="master_category"
          value={formData.master_category ?? ""}
          onChange={onCategoryChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
        >
          {isCategoryLoading ? (
            <option value="">Loading categories...</option>
          ) : (
            <>
              <option value="">-- Select Category --</option>
              {assignedCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              {nextCategoryPage && (
                <option value="load_more" disabled={isLoadingMoreCategories}>
                  {isLoadingMoreCategories
                    ? "Loading more..."
                    : "↓ Load More Categories"}
                </option>
              )}
            </>
          )}
        </select>
      </div>
    </div>
  );
};

export default React.memo(CategorySelector);
