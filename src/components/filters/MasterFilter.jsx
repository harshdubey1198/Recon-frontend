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
  timeRangeOptions = [],
}) {
  const [filters, setFilters] = useState(initialFilters || {});

  useEffect(() => {
    setFilters(initialFilters || {});
  }, [initialFilters]);

  const updateFilter = (key, value) => {
    if (key === "date_filter" && typeof value === "object" && value !== null) {
      // 👉 Case 1: Custom range object { date_filter: "custom", start_date, end_date }
      if (value.date_filter === "custom") {
        setFilters((prev) => ({
          ...prev,
          date_filter: value,                       // pura object store karo
          start_date: value.start_date || "",      // optional: top-level bhi rakh sakte ho
          end_date: value.end_date || "",
        }));
        return; // yahin return, neeche wala common setFilter na chale
      }
  
      // 👉 Case 2: TimeRangeFilter se aaya object { value: "today", label: "Today" } etc.
      value = value.value || value.date_filter || "";
    }
  
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  

  const applyAllFilters = () => onChange?.(filters);
  const clearAllFilters = () => {
    setFilters({});
    onClear?.();
  };

  const show = (name) => visibleFilters.includes(name);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        {show("date_filter") && (
          <TimeRangeFilter
            value={filters.date_filter}
            onChange={(v) => updateFilter("date_filter", v)}
            extraOptions={timeRangeOptions} // 👈 dynamic per page
          />
        )}

        {/* other filters remain unchanged */}
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
            selectedUserID={filters.user_id}
            onChange={(username, id) => {
              updateFilter("username", username);
              updateFilter("user_id", id);
            }}
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

