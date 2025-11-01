import React, { useState, useEffect } from "react";
import TimeRangeFilter from "./TimeRangeFilter";
import PortalFilter from "./PortalFilter";
import CategoryFilter from "./CategoryFilter";
import UserFilter from "./UserFilter";
import StatusFilter from "./StatusFilter";
import SearchFilter from "./SearchFilter";
import ClearFilter from "./ClearFilter";
import CustomDateFilter from "./CustomDateFilter";
import DistributionStatusFilter from "./DistributionStatusFilter";

export default function MasterFilter({
  onChange,
  onClear,
  visibleFilters = [],
  initialFilters = {}, 
}) {
  const [filters, setFilters] = useState(initialFilters || {});

  // ✅ Keep internal filters in sync when modal reopens
  useEffect(() => {
    setFilters(initialFilters || {});
  }, [initialFilters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyAllFilters = () => {
    onChange?.(filters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onClear?.(); // 🔹 notify parent to clear and refetch
  };

  const show = (name) => visibleFilters.includes(name);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        {show("date_filter") && (
          <TimeRangeFilter
            value={filters.date_filter}
            onChange={(v) => updateFilter("date_filter", v)}
          />
        )}
        {show("custom_date") && (
          <CustomDateFilter
            value={filters.date_filter}
            onChange={(v) => updateFilter("date_filter", v)}
          />
        )}
        {show("portal_id") && (
          <PortalFilter
            value={filters.portal_id}
            onChange={(v) => updateFilter("portal_id", v)}
          />
        )}
        {show("username") && (
          <UserFilter
            value={filters.username}
            onChange={(v) => updateFilter("username", v)}
          />
        )}
        {show("master_category_id") && (
          <CategoryFilter
            value={filters.master_category_id}
            onChange={(v) => updateFilter("master_category_id", v)}
          />
        )}
        {show("status") && (
          <StatusFilter
            value={filters.status}
            onChange={(v) => updateFilter("status", v)}
          />
        )}
        {show("distribution_status") && (
          <DistributionStatusFilter
            value={filters.distribution_status}
            onChange={(v) => updateFilter("distribution_status", v)}
          />
        )}
        {show("search") && (
          <SearchFilter
            value={filters.search}
            onChange={(v) => updateFilter("search", v)}
          />
        )}
      </div>

      {/* 🔹 Action Buttons */}
      <div className="flex justify-end gap-3 mt-3">
        <ClearFilter onClear={clearAllFilters} />
        <button
          onClick={applyAllFilters}
          className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-all"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
