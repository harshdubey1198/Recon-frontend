import React, { useState, useEffect } from "react";

export default function TimeRangeFilter({ onChange, value, extraOptions = [] }) {
  const [range, setRange] = useState("");
  const [customDates, setCustomDates] = useState({
    start_date: "",
    end_date: "",
  });

  // ✅ Default filter options
  const baseOptions = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Custom Range", value: "custom" },
  ];

  // ✅ Merge parent-provided extra options (if any)
  const options = [...baseOptions, ...extraOptions];

  useEffect(() => {
    if (value) {
      if (typeof value === "object" && value.date_filter === "custom") {
        setRange("custom");
        setCustomDates({
          start_date: value.start_date || "",
          end_date: value.end_date || "",
        });
      } else if (typeof value === "string") {
        setRange(value);
        setCustomDates({ start_date: "", end_date: "" });
      }
    } else {
      setRange("");
      setCustomDates({ start_date: "", end_date: "" });
    }
  }, [value]);

  const handleSelect = (val) => {
    setRange(val);

    onChange({
      date_filter: val || "",
      start_date: "",
      end_date: "",
    });

    if (val === "custom") {
      setCustomDates({ start_date: "", end_date: "" });
    }
  };

  const handleCustomChange = (key, val) => {
    const updated = { ...customDates, [key]: val };
    setCustomDates(updated);
    if (updated.start_date && updated.end_date) {
      onChange({
        date_filter: "custom",
        start_date: updated.start_date,
        end_date: updated.end_date,
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <select
        className="border border-gray-300 rounded-lg p-2 text-sm w-full focus:ring-1 focus:ring-gray-500"
        value={range}
        onChange={(e) => handleSelect(e.target.value)}
      >
        <option value="">Select Time Range</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {range === "custom" && (
        <div className="flex gap-2 w-full">
          <input
            type="date"
            className="border border-gray-300 rounded-lg p-2 text-sm w-1/2 focus:ring-1 focus:ring-gray-500"
            value={customDates.start_date}
            onChange={(e) => handleCustomChange("start_date", e.target.value)}
          />
          <input
            type="date"
            className="border border-gray-300 rounded-lg p-2 text-sm w-1/2 focus:ring-1 focus:ring-gray-500"
            value={customDates.end_date}
            onChange={(e) => handleCustomChange("end_date", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
