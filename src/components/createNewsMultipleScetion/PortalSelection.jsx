import React from "react";
import { Settings } from "lucide-react";

const PortalSelection = ({
  mappedPortals,
  onPortalToggle,
  onLoadMore,
  hasNextPage,
  isLoadingMore,
  onManageCategories,
}) => {
  return (
    <section className="space-y-5 mt-2 border-2 p-2 border-gray-200 rounded">
      <div className="flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Settings className="w-5 h-5 text-gray-700" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Select Portals to Publish
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mappedPortals.map((portal, i) => (
          <label
            key={i}
            className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all ${
              portal.selected
                ? "bg-gray-900 border-gray-900 text-white shadow-lg"
                : "bg-white border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              type="checkbox"
              checked={portal.selected === true}
              onChange={() => onPortalToggle(i)}
              className="w-5 h-5 accent-gray-900"
            />
            <div>
              <p className="font-medium">{portal.portalName}</p>
              <p className="text-xs text-gray-400">{portal.portalCategoryName}</p>
            </div>
          </label>
        ))}
      </div>
      {hasNextPage && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? "Loading more..." : "Load More Portals"}
          </button>
        </div>
      )}
      <div className="flex justify-end mt-3">
        <button
          type="button"
          className="px-3 py-2 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
          onClick={onManageCategories}
        >
          Manage Portal Categories
        </button>
      </div>
    </section>
  );
};

export default React.memo(PortalSelection);