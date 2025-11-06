import React from 'react';

export default function HeatmapFilter({ range, setRange, customRange, setCustomRange, onApplyCustomRange,apiData }) {
  return (
    <div className="flex items-center space-x-4">
      {/* Time Range Selector */}
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-300 font-medium">Period:</label>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 hover:bg-white/20 transition-colors"
        >
          <option value="1d" className="bg-gray-800">Last 1 Day</option>
          <option value="7d" className="bg-gray-800">Last 7 Days</option>
          <option value="30d" className="bg-gray-800">Last 30 Days</option>
          <option value="custom" className="bg-gray-800">Custom Range</option>
        </select>

        {/* Custom Date Range Inputs */}
        {range === "custom" && (
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={customRange.start}
              onChange={(e) =>
                setCustomRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />

            <span className="text-gray-300">to</span>

            <input
              type="date"
              value={customRange.end}
              onChange={(e) =>
                setCustomRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />

            <button
              onClick={onApplyCustomRange}
              disabled={!customRange.start || !customRange.end}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Date Range Display */}
      {apiData && (
        <div className="text-right">
          <p className="text-sm text-gray-300">Date Range</p>
          <p className="text-white font-semibold text-sm">
            {apiData.current_start} to {apiData.current_end}
          </p>
        </div>
      )}
    </div>
  );
}