import React from "react";
import { XCircle } from "lucide-react";

export default function ClearFilter({ onClear }) {
  return (
    <button
      onClick={onClear}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-all"
    >
      <XCircle className="w-4 h-4 text-gray-500" />
      Clear Filters
    </button>
  );
}
