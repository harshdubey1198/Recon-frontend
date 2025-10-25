import React, { useState } from "react";

export default function TimeRangeFilter({ onChange }) {
  const [rangeType, setRangeType] = useState("today");
  const [customRange, setCustomRange] = useState({ start_date: "", end_date: "" });

  const options = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "7days" },
    { label: "Custom Range", value: "custom" },
  ];

  const handleSelect = (value) => {
    setRangeType(value);

    if (value !== "custom") {
      onChange({ date_filter: value, start_date: "", end_date: "" });
    }
  };

  const handleCustomChange = (key, value) => {
    const updated = { ...customRange, [key]: value };
    setCustomRange(updated);

    if (updated.start_date && updated.end_date) {
      onChange({ date_filter: "custom", ...updated });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <select
        className="border rounded-lg p-2 w-full"
        value={rangeType}
        onChange={(e) => handleSelect(e.target.value)}
      >
        <option value="">Select Time Range</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {rangeType === "custom" && (
        <div className="flex gap-2">
          <input
            type="date"
            className="border rounded-lg p-2 w-full"
            value={customRange.start_date}
            onChange={(e) => handleCustomChange("start_date", e.target.value)}
          />
          <input
            type="date"
            className="border rounded-lg p-2 w-full"
            value={customRange.end_date}
            onChange={(e) => handleCustomChange("end_date", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
