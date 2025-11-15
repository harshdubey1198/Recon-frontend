import React, { useState, useEffect } from 'react';
import { X, Award, Loader2, Loader } from 'lucide-react';
import { toast } from "react-toastify";
import { fetchPortalStats } from "../../../server";
import WeeklyPerformance from './WeeklyPerformance';
import DateRangeFilter from '../filters/DateRangeFilter';
import TopContributors from '../Stats/TopContributors';
import TopPerformingCategories from '../Stats/TopPerformingCategories';

export default function PortalDetailModal({ 
  isOpen, 
  onClose, 
  portalId, 
  portalName, 
  initialRange = "7d", 
  initialCustomRange = null 
}) {
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
    }
  }, [isOpen, initialRange, initialCustomRange]);

  // Load portal stats
  useEffect(() => {
    if (!portalId || !isOpen) return;

    if (modalRange === "All") {
      fetchAllData(); 
    } else if (modalRange === "custom" && modalCustomRange?.start && modalCustomRange?.end) {
      handleApplyCustomRange(); 
    } else {
      loadPortalStats(); 
    }
  }, [portalId, isOpen, modalRange, modalCustomRange]);

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
          successPost: apiData.kpi_summary?.success_posts || 0,
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
    } 
    finally {
    setLoading(false); // ← THIS FIXES YOUR ISSUE
  }
  };

  const handleModalRangeChange = (newRange) => {
    if (newRange === "custom") {
      setShowCustomDateInputs(true);
    } else if (newRange === "All") {
      const today = new Date().toISOString().split('T')[0];
      setModalCustomRange({ start: "2024-01-01", end: today });
      setShowCustomDateInputs(false);
      setModalRange("All");
      fetchAllData();
    } else {
      setShowCustomDateInputs(false);
      setModalCustomRange({ start: "", end: "" });
      setModalRange(newRange);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const customDates = {
        start: "2024-01-01",
        end: today
      };
      
      const res = await fetchPortalStats(portalId, "custom", customDates);
      
      if (res?.data?.success && res.data.data) {
        const apiData = res.data.data;
        
        setPortalData({
          name: portalName,
          success: apiData.kpi_summary?.total_posts || 0,
          successPost: apiData.kpi_summary?.success_posts || 0,
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

  const handleModalCustomRangeChange = (newCustomRange) => {
    setModalCustomRange(newCustomRange);
  };

  const handleApplyCustomRange = async () => {
    if (modalCustomRange.start && modalCustomRange.end) {
      setShowCustomDateInputs(false);
      setModalRange("custom");
      
      try {
        const customDates = {
          start: modalCustomRange.start,
          end: modalCustomRange.end
        };
        
        const res = await fetchPortalStats(portalId, "custom", customDates);
        
        if (res?.data?.success && res.data.data) {
          const apiData = res.data.data;
          
          setPortalData({
            name: portalName,
            success: apiData.kpi_summary?.total_posts || 0,
            successPost: apiData.kpi_summary?.success_posts || 0,
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
      } 
    }
  };

  const handleClearFilter = () => {
    setModalRange("7d");
    setModalCustomRange({ start: "", end: "" });
    setShowCustomDateInputs(false);
  };

  if (!isOpen) return null;

  // 🧩 Loading State
  if (loading)
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center w-[400px]">
          <Loader className="w-8 h-8 text-gray-600 animate-spin mb-2" />
          <p className="text-gray-700 font-medium">Loading ...</p>
        </div>
      </div>
    );

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
              <div className="flex items-center gap-3 justify-end">
                {/* Date Range Filter Component */}
                <DateRangeFilter
                  range={modalRange}
                  customRange={modalCustomRange}
                  showCustomDateInputs={showCustomDateInputs}
                  onRangeChange={handleModalRangeChange}
                  onCustomRangeChange={handleModalCustomRangeChange}
                  onApplyCustomRange={handleApplyCustomRange}
                  onClearFilter={handleClearFilter}
                  showAllOption={true}
                  variant="modal"
                />

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
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
            
            {/* Top Contributors Component */}
            <TopContributors contributors={portalData.topContributors} itemsPerPage={8} />

            {/* Top Performing Categories Component */}
            <TopPerformingCategories categories={portalData.topCategories} itemsPerPage={8} />

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