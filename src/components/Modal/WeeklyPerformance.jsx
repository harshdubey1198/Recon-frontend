import React, { useRef, useState, useEffect } from 'react';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

const WeeklyPerformance = ({ 
  performanceData = [], 
  range = "7d",
  title = "Weekly Performance",
  showNavigation = true 
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const totalWeeks = Math.ceil(performanceData.length / 7);
  const shouldScroll = (range === "1m" || range === "custom") && performanceData.length > 7;

  // Auto-scroll effect for 1m/custom range
  useEffect(() => {
    if (!shouldScroll || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollWidth = container.clientWidth;

    const interval = setInterval(() => {
      if (!container || isPaused) return;

      const nextWeek = currentWeekIndex < totalWeeks - 1 ? currentWeekIndex + 1 : 0;
      setCurrentWeekIndex(nextWeek);
      container.scrollTo({
        left: nextWeek * scrollWidth,
        behavior: "smooth",
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [shouldScroll, currentWeekIndex, isPaused, totalWeeks]);

  // Manual navigation handlers
  const handlePrevWeek = () => {
    const newIndex = currentWeekIndex > 0 ? currentWeekIndex - 1 : totalWeeks - 1;
    setCurrentWeekIndex(newIndex);
    scrollContainerRef.current?.scrollTo({
      left: newIndex * scrollContainerRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const handleNextWeek = () => {
    const newIndex = currentWeekIndex < totalWeeks - 1 ? currentWeekIndex + 1 : 0;
    setCurrentWeekIndex(newIndex);
    scrollContainerRef.current?.scrollTo({
      left: newIndex * scrollContainerRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  if (!performanceData || performanceData.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl sm:rounded-2xl border border-purple-100 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-500 text-sm text-center py-8">No performance data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-xl sm:rounded-2xl border border-purple-100 p-4 sm:p-6 mb-6 sm:mb-8">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
        </div>

        {/* Navigation Controls - Only show for scrollable content */}
        {shouldScroll && showNavigation && totalWeeks > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 sm:p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
            </button>
            
            <span className="text-[10px] sm:text-xs font-medium text-gray-600 px-1 sm:px-2">
              Week {currentWeekIndex + 1} / {totalWeeks}
            </span>
            
            <button
              onClick={handleNextWeek}
              className="p-1.5 sm:p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              aria-label="Next week"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      {/* Performance Display */}
      {shouldScroll ? (
        // Horizontal scroll view for 1m/custom with data > 7 days
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex overflow-x-hidden w-full pb-2 scroll-smooth snap-x snap-mandatory"
          style={{ scrollBehavior: "smooth", width: "100%", overflow: "hidden" }}
        >
          {Array.from({ length: totalWeeks }).map((_, weekIdx) => (
            <div
              key={`week-${weekIdx}`}
              className="min-w-full snap-center bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex-shrink-0"
            >
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Week {weekIdx + 1}
              </h4>

              {performanceData
                .slice(weekIdx * 7, (weekIdx + 1) * 7)
                .map((day, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 sm:space-x-3 mb-1.5"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 w-8 sm:w-12">
                      {day.day}
                    </span>
                    <div className="flex-1 flex items-center space-x-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-5 sm:h-6 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full flex items-center justify-end pr-2"
                          style={{
                            width: `${
                              day.success > 0
                                ? (day.success / (day.success + day.failed)) * 100
                                : 0
                            }%`,
                          }}
                        >
                          <span className="text-[10px] font-bold text-white">
                            {day.success}
                          </span>
                        </div>
                      </div>
                      {day.failed > 0 && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-red-600">
                            {day.failed}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      ) : (
        // Vertical list view for other ranges
        <div className="space-y-1.5 sm:space-y-2 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          {performanceData.map((day, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-2 sm:space-x-3 mb-1.5"
            >
              <span className="text-xs sm:text-sm font-semibold text-gray-600 w-8 sm:w-12">
                {day.day}
              </span>
              <div className="flex-1 flex items-center space-x-1">
                <div className="flex-1 bg-gray-100 rounded-full h-5 sm:h-6 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${
                        day.success > 0
                          ? (day.success / (day.success + day.failed)) * 100
                          : 0
                      }%`,
                    }}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {day.success}
                    </span>
                  </div>
                </div>
                {day.failed > 0 && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-red-600">
                      {day.failed}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center space-x-3 sm:space-x-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-100">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
          <span className="text-[10px] sm:text-xs text-gray-600">Success</span>
        </div>
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
          <span className="text-[10px] sm:text-xs text-gray-600">Failed</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPerformance;