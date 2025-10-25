import React, { useEffect, useState } from "react";
import { fetchPortals } from "../../../server";

export default function PortalFilter({ onChange }) {
  const [portals, setPortals] = useState([]);

  useEffect(() => {
    fetchPortals().then((res) => {
      if (res?.data?.status) setPortals(res.data.data);
    });
  }, []);

  return (
    <select
      className="border rounded-lg p-2 w-full"
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All Portals</option>
      {portals.map((p) => (
        <option key={p.id} value={p.id}>
          {p.portal_name || p.name}
        </option>
      ))}
    </select>
  );
}
