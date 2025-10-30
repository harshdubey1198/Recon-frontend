import React from "react";

export default function StatusFilter({ onChange, value = "" }) {
  const statuses = ["Draft","Published"];

  return (
    <select
      className="border rounded-lg p-2 w-full h-[39px]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All Statuses</option>
      {statuses.map((status) => (
        <option key={status} value={status.toUpperCase()}>
          {status}
        </option>
      ))}
    </select>
  );
}
