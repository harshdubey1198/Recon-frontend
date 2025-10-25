import React from "react";

export default function StatusFilter({ onChange }) {
  const statuses = ["Draft", "Scheduled", "Published", "Failed", "Pending"];

  return (
    <select
      className="border rounded-lg p-2 w-full"
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
