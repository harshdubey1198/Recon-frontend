import React, { useEffect, useState } from "react";
import { fetchMasterCategories } from "../../../server";

export default function CategoryFilter({ onChange, value = "" }) {
  const [categories, setCategories] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCategories = async (page = 1, append = false) => {
    try {
      setIsLoading(true);
      const res = await fetchMasterCategories(page);
      if (res?.data?.status && Array.isArray(res.data.data)) {
        const newData = res.data.data;

        setCategories((prev) => (append ? [...prev, ...newData] : newData));

        const nextUrl = res.data?.pagination?.next;
        if (nextUrl) {
          const nextPageParam = new URL(nextUrl).searchParams.get("page");
          setNextPage(Number(nextPageParam));
        } else {
          setNextPage(null);
        }
      }
    } catch (err) {
      console.error("❌ Failed to fetch master categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <select
      className="border rounded-lg p-2 w-full"
      value={value}
      onChange={async (e) => {
        const val = e.target.value;

        if (val === "load_more") {
          if (nextPage) {
            await loadCategories(nextPage, true);
          }
          return;
        }

        onChange(val);
      }}
    >
      <option value="">All Categories</option>

      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.master_category_name || c.name}
        </option>
      ))}

      {nextPage && (
        <option value="load_more" disabled={isLoading}>
          {isLoading ? "Loading more..." : "↓ Load More Categories"}
        </option>
      )}
    </select>
  );
}
