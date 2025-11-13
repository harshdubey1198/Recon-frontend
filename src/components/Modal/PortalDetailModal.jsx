import React, { useRef, useCallback, useState, useEffect } from 'react';
import { X, Award, Users, FolderOpen, Tag, Calendar, Filter } from 'lucide-react';
import { toast } from "react-toastify";
import { fetchPortalStats } from "../../../server";
import formatUsername from '../../utils/formateName';
import WeeklyPerformance from '../Modal/WeeklyPerformance';

export default function PortalDetailModal({ 
  isOpen, 
  onClose, 
  portalId, 
  portalName, 
  initialRange = "7d", 
  initialCustomRange = null 
}) {
  const [modalContributorsPage, setModalContributorsPage] = useState(1);
  const modalContributorsRef = useRef(null);
  const ITEMS_PER_PAGE = 8;

  // Loading and data state
  const [loading, setLoading] = useState(true);
  const [portalData, setPortalData] = useState(null);

  // Independent filter state
  const [modalRange, setModalRange] = useState(initialRange);
  const [modalCustomRange, setModalCustomRange] = useState(initialCustomRange || { start: "", end: "" });
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);

  // Reset filter when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalRange(initialRange);
      setModalCustomRange(initialCustomRange || { start: "", end: "" });
      setShowCustomDateInputs(initialRange === "custom");
      setModalContributorsPage(1);
      setLoading(true);
    }
  }, [isOpen, initialRange, initialCustomRange]);

  // Load portal stats
  useEffect(() => {
    if (portalId && isOpen && modalRange !== "custom") {
      loadPortalStats();
    }
  }, [portalId, modalRange, isOpen]);

  const loadPortalStats = async () => {
    try {
      setLoading(true);
      const customDates = modalRange === "custom" && modalCustomRange?.start && modalCustomRange?.end ? {
        start: modalCustomRange.start,
        end: modalCustomRange.end
      } : null;
      
      const res = await fetchPortalStats(portalId, modalRange, customDates);
      
      if (res?.data?.success && res.data.data) {
        const apiData = res.data.data;
        
        setPortalData({
          name: portalName,
           success: apiData.kpi_summary?.total_posts || 0,
           successPost:apiData.kpi_summary?.success_posts || 0,
            publishedPercent: apiData.kpi_summary?.success_ratio || 0,
            avgPublishTime: apiData.kpi_summary?.average_time_to_publish || 0,
            failed: apiData.kpi_summary?.failed_posts || 0,
           topContributors: apiData.top_contributors || [],
          weeklyPerformance: apiData.performance_trend || [],
          topCategories: apiData.top_performing_categories || [],
          dateRange: apiData.date_range
        });
      } else {
        toast.error("Failed to load portal stats.");
        setPortalData(null);
      }
    } catch (err) {
      console.error("Error fetching portal stats:", err);
      toast.error("Server error while fetching portal stats.");
      setPortalData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleModalRangeChange = (newRange) => {
    if (newRange === "custom") {
      setShowCustomDateInputs(true);
    } else {
      setShowCustomDateInputs(false);
      setModalCustomRange({ start: "", end: "" });
      setModalRange(newRange);
    }
  };

  const handleApplyCustomRange = async () => {
    if (modalCustomRange.start && modalCustomRange.end) {
      setShowCustomDateInputs(false);
      setModalRange("custom");
      
      try {
        setLoading(true);
        const customDates = {
          start: modalCustomRange.start,
          end: modalCustomRange.end
        };
        
        const res = await fetchPortalStats(portalId, "custom", customDates);
        
        if (res?.data?.success && res.data.data) {
          const apiData = res.data.data;
          
          setPortalData({
            name: portalName,
            success: apiData.total_publications || 0,
            publishedPercent: apiData.success_rate || 0,
            avgPublishTime: apiData.average_publish_time || 0,
            failed: apiData.failed_distributions || 0,
            topContributors: apiData.top_contributors || [],
            weeklyPerformance: apiData.performance_trend || [],
            topCategories: apiData.top_performing_categories || [],
            dateRange: apiData.date_range
          });
        } else {
          toast.error("Failed to load portal stats.");
          setPortalData(null);
        }
      } catch (err) {
        console.error("Error fetching portal stats:", err);
        toast.error("Server error while fetching portal stats.");
        setPortalData(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModalScroll = useCallback(() => {
    if (!modalContributorsRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = modalContributorsRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setModalContributorsPage(prev => {
        const maxPage = Math.ceil((portalData?.topContributors?.length || 0) / ITEMS_PER_PAGE);
        return prev < maxPage ? prev + 1 : prev;
      });
    }
  }, [portalData?.topContributors?.length, ITEMS_PER_PAGE]);

  if (!isOpen) return null;

  
  // Empty State
  if (!portalData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center w-[400px]">
          <p className="text-lg font-medium text-gray-700">No stats available for this portal.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-black p-6 relative rounded-t-3xl">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            {/* Left Side: Portal Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white">{portalData.name}</h2>
                <p className="text-gray-300 mt-1">Detailed Analytics & Performance Insights</p>

                {portalData.dateRange && (
                  <p className="text-sm text-gray-400 mt-1">
                    {portalData.dateRange.start_date} to {portalData.dateRange.end_date} 
                    <span className="ml-2 px-2 py-0.5 bg-white/30 rounded text-xs text-white">
                      {portalData.dateRange.range_type}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Right Side: Filter + Close */}
            <div className="flex flex-col gap-3 mt-4 md:mt-0">
              {/* Filter Row */}
              <div className="flex items-center gap-3 justify-end">
                {/* Filter Icon & Label */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-white" />
                  <span className="text-white text-sm sm:text-base font-medium">Filter:</span>
                </div>

                {/* Filter Dropdown */}
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/20 backdrop-blur-sm">
                  <Calendar className="w-4 h-4 text-white" />
                  <select
                    value={modalRange}
                    onChange={(e) => handleModalRangeChange(e.target.value)}
                    className="text-sm font-medium text-white bg-transparent border-none outline-none cursor-pointer"
                  >
                    <option value="today" className="text-black">Today</option>
                    <option value="yesterday" className="text-black">Yesterday</option>
                    <option value="7d" className="text-black">Last 7 Days</option>
                    <option value="1m" className="text-black">Last Month</option>
                    <option value="custom" className="text-black">Custom Range</option>
                  </select>
                </div>

                {/* Clear Filter Button */}
                <button
                  onClick={() => {
                    setModalRange("7d");
                    setModalCustomRange({ start: "", end: "" });
                    setShowCustomDateInputs(false);
                  }}
                  className="bg-white/10 text-sm text-white border border-white/20 rounded-md px-3 py-2 hover:bg-white/20 transition backdrop-blur-sm"
                >
                  Clear
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Custom Date Inputs Row */}
              {showCustomDateInputs && (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/20 backdrop-blur-sm">
                  <input
                    type="date"
                    value={modalCustomRange.start}
                    onChange={(e) => setModalCustomRange(prev => ({ ...prev, start: e.target.value }))}
                    className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                  <span className="text-white">to</span>
                  <input
                    type="date"
                    value={modalCustomRange.end}
                    onChange={(e) => setModalCustomRange(prev => ({ ...prev, end: e.target.value }))}
                    className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                  <button
                    onClick={handleApplyCustomRange}
                    disabled={!modalCustomRange.start || !modalCustomRange.end}
                    className="px-3 py-1 bg-white text-black text-sm rounded-md hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-gray-300 text-sm">Total Publications</p>
              <p className="text-3xl font-bold text-white mt-1">{portalData.success}</p>
            </div>
             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-gray-300 text-sm">Success Post</p>
              <p className="text-3xl font-bold text-white mt-1">{portalData.successPost}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-gray-300 text-sm">Success Rate</p>
              <p className="text-3xl font-bold text-white mt-1">{portalData.publishedPercent}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-gray-300 text-sm">Avg Publish Time</p>
              <p className="text-3xl font-bold text-white mt-1">
                {portalData.avgPublishTime ? portalData.avgPublishTime.toFixed(2) : 0}s
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-gray-300 text-sm">Failed</p>
              <p className="text-3xl font-bold text-white mt-1">{portalData.failed}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-380px)] p-6 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Contributors */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 shadow-md">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-black/80 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Top Contributors</h3>
              </div>
              <div className="space-y-3">
                {portalData.topContributors?.length > 0 ? (
                  <div 
                    ref={modalContributorsRef}
                    onScroll={handleModalScroll}
                    className="space-y-3 max-h-[400px] overflow-y-auto pr-2"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#fb923c #fed7aa'
                    }}
                  >
                    {portalData.topContributors
                      .slice(0, modalContributorsPage * ITEMS_PER_PAGE)
                      .map((user, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-4 border border-orange-200 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-sm">
                                {user.news_post__created_by__username?.[0]?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {formatUsername(user.news_post__created_by__username || 'Unknown User')}
                              </p>
                              <p className="text-xs text-gray-500">Contributor</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-600">{user.total_distributions || 0}</p>
                            <p className="text-xs text-gray-500">articles</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {modalContributorsPage * ITEMS_PER_PAGE < portalData.topContributors.length && (
                      <div className="text-center py-2">
                        <p className="text-xs text-gray-500">Scroll for more...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">No contributors found.</p>
                )}
              </div>
            </div>

            {/* Top Performing Categories */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-md">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-black/80 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Top Performing Categories</h3>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#3b82f6 #bfdbfe'
                }}
              >
                {portalData.topCategories?.length > 0 ? (
                  portalData.topCategories.map((cat, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                            <Tag className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900">{cat.master_category__name || 'Unknown'}</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{cat.total_posts || 0} posts</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">No categories available.</p>
                )}
              </div>
            </div>

            {/* Weekly Performance - Full Width */}
            <div className="lg:col-span-2">
              <WeeklyPerformance
                performanceData={portalData.weeklyPerformance || []}
                range={modalRange}
                title="Performance Trend"
                showNavigation={true}
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 flex items-center justify-between rounded-b-3xl">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Last updated:</span> Just now
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}