import React, { useState } from "react";
import { Search } from "lucide-react";

export default function SearchFilter({ onChange }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center border rounded-lg p-2 w-full"
    >
      <input
        type="text"
        placeholder="Search headline, URL, or ID..."
        className="flex-1 outline-none text-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        className="ml-2 text-gray-500 hover:text-gray-800 transition"
        title="Search"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
}
