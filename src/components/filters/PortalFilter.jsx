import React, { useEffect, useState } from "react";
import { fetchPortals } from "../../../server";

export default function PortalFilter({ onChange, value = "" }) {
  const [portals, setPortals] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadPortals = async (page = 1, append = false) => {
    try {
      setIsLoading(true);
      const res = await fetchPortals(page);
      if (res?.data?.status && Array.isArray(res.data.data)) {
        const newData = res.data.data;

        setPortals((prev) => (append ? [...prev, ...newData] : newData));

        const nextUrl = res.data?.pagination?.next;
        if (nextUrl) {
          const nextPageParam = new URL(nextUrl).searchParams.get("page");
          setNextPage(Number(nextPageParam));
        } else {
          setNextPage(null);
        }
      }
    } catch (err) {
      console.error("❌ Failed to fetch portals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortals(); 
  }, []);

  return (
    <select
      className="border rounded-lg p-2 w-full h-[39px]"
      value={value}
      onChange={async (e) => {
        const val = e.target.value;

        if (val === "load_more") {
          if (nextPage) {
            await loadPortals(nextPage, true);
          }
          return;
        }

        onChange(val);
      }}
    >
      <option value="">All Portals</option>

      {portals.map((p) => (
        <option key={p.id} value={p.id}>
          {p.portal_name || p.name}
        </option>
      ))}

      {nextPage && (
        <option value="load_more" disabled={isLoading}>
          {isLoading ? "Loading more..." : "↓ Load More Portals"}
        </option>
      )}
    </select>
  );
}
