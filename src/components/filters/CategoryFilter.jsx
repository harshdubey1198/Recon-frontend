import React, { useEffect, useState } from "react";
import { fetchMasterCategories } from "../../../server";

export default function CategoryFilter({ onChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMasterCategories().then((res) => {
      if (res?.data?.status) setCategories(res.data.data);
    });
  }, []);

  return (
    <select
      className="border rounded-lg p-2 w-full"
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All Categories</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.master_category_name || c.name}
        </option>
      ))}
    </select>
  );
}
