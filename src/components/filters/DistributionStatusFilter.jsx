import React from "react";

export default function DistributionStatusFilter({ onChange, value = "" }) {
  const statuses = ["SUCCESS", "PENDING", "FAILED"];

  return (
    <select
      className="border rounded-lg p-2 w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Distribution Statuses</option>
      {statuses.map((status) => (
        <option key={status} value={status.toUpperCase()}>
          {status}
        </option>
      ))}
    </select>
  );
}
