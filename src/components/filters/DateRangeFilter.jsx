import React from 'react';
import { Calendar, Filter } from 'lucide-react';

const DateRangeFilter = ({
  range,
  customRange,
  showCustomDateInputs,
  onRangeChange,
  onCustomRangeChange,
  onApplyCustomRange,
  onClearFilter,
  showAllOption = false,
  variant = 'default', // 'default' or 'modal'
  className = ''
}) => {
  const baseFilterClasses = variant === 'modal' 
    ? "bg-white/10 border-white/20 text-white" 
    : "bg-white border-gray-200 text-gray-700";
    
  const baseLabelClasses = variant === 'modal' 
    ? "text-white" 
    : "text-gray-800";
    
  const buttonClasses = variant === 'modal'
    ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
    : "bg-black text-white border-gray-300 hover:bg-black/80";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Filter Label */}
      <div className="flex items-center gap-2 font-semibold text-base">
        <Filter className={`w-4 h-4 ${variant === 'modal' ? 'text-white' : 'text-gray-600'}`} />
        <span className={baseLabelClasses}>Filter:</span>
      </div>

      {/* Date Range Dropdown */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm ${baseFilterClasses}`}>
        <Calendar className={`w-4 h-4 ${variant === 'modal' ? 'text-white' : 'text-gray-500'}`} />
        <select
          value={range}
          onChange={(e) => onRangeChange(e.target.value)}
          className={`text-sm font-medium bg-transparent border-none outline-none cursor-pointer ${
            variant === 'modal' ? 'text-white' : 'text-gray-700'
          }`}
        >
          {showAllOption && <option value="All" className="text-black">All Time</option>}
          <option value="today" className="text-black">Today</option>
          <option value="yesterday" className="text-black">Yesterday</option>
          <option value="7d" className="text-black">Last 7 Days</option>
          <option value="1m" className="text-black">Last Month</option>
          <option value="custom" className="text-black">Custom Range</option>
        </select>
      </div>

      {/* Clear/Reset Filter Button */}
      <button
        onClick={onClearFilter}
        className={`text-sm border rounded-md px-3 py-2 transition ${buttonClasses}`}
      >
        {variant === 'modal' ? 'Reset' : 'Clear Filter'}
      </button>

      {/* Custom Date Inputs */}
      {showCustomDateInputs && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm ${baseFilterClasses}`}>
          <input
            type="date"
            value={customRange.start}
            onChange={(e) => onCustomRangeChange({ ...customRange, start: e.target.value })}
            className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          />
          <span className={variant === 'modal' ? 'text-white' : 'text-gray-500'}>to</span>
          <input
            type="date"
            value={customRange.end}
            onChange={(e) => onCustomRangeChange({ ...customRange, end: e.target.value })}
            className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          />
          <button
            onClick={onApplyCustomRange}
            disabled={!customRange.start || !customRange.end}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;