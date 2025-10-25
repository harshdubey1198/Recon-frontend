import React, { useState } from "react";
import TimeRangeFilter from "./TimeRangeFilter";
import PortalFilter from "./PortalFilter";
import CategoryFilter from "./CategoryFilter";
import UserFilter from "./UserFilter";
import StatusFilter from "./StatusFilter";
import SearchFilter from "./SearchFilter";

export default function MasterFilter({ onChange, visibleFilters = [] }) {
  const [filters, setFilters] = useState({});

  const updateFilter = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onChange?.(updated);
  };

  // Helper function to check visibility
  const show = (name) => visibleFilters.includes(name);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm">
      {show("date_filter") && (
        <TimeRangeFilter onChange={(v) => updateFilter("date_filter", v)} />
      )}
      {show("portal_id") && (
        <PortalFilter onChange={(v) => updateFilter("portal_id", v)} />
      )}
      {show("master_category_id") && (
        <CategoryFilter
          onChange={(v) => updateFilter("master_category_id", v)}
        />
      )}
      {show("username") && (
        <UserFilter onChange={(v) => updateFilter("username", v)} />
      )}
      {show("status") && (
        <StatusFilter onChange={(v) => updateFilter("status", v)} />
      )}
      {show("search") && (
        <SearchFilter onChange={(v) => updateFilter("search", v)} />
      )}
    </div>
  );
}
