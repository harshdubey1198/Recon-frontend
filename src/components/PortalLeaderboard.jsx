
import React, { useState, useEffect } from "react";
import { fetchDomainDistribution, fetchWeeklyPerformanceData, fetchPortalStats } from "../../server";
import { Award, BarChart3, Clock, ArrowUpRight, ArrowDownRight, X, Users, FolderOpen, Tag, ChevronRight } from "lucide-react";

export default function PortalLeaderboard() {
  const [domains, setDomains] = useState([]);
  const [portalDetailDataGlobal, setPortalDetailDataGlobal] = useState([]);
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [portalDetailData, setPortalDetailData] = useState(null);

  const loadDomains = async () => {
    try {
      const res = await fetchDomainDistribution();
      if (res?.data?.status) {
        const mapped = res.data.data.map((d) => ({
          id: d.portal_id,
          name: d.portal_name,
          total: d.total_distributions,
          success: d.successful_distributions,
          failed: d.failed_distributions,
          publishedPercent: d.success_percentage,
          avgPublishTime: d.average_time_taken,
          pending: d.pending_distributions,
          retry: d.retry_counts,
          todayTotal: d.today_total_distributions,
          todaySuccess: d.today_successful_distributions,
          todayFailed: d.today_failed_distributions,
          todayPending: d.today_pending_distributions,
          todayRetry: d.today_retry_counts,
          todayAverageTime: d.today_average_time_taken,
          traffic: `${d.successful_distributions} success / ${d.failed_distributions} failed`,
          todayTraffic: `${d.today_successful_distributions} success / ${d.today_failed_distributions} failed`,
          status:
            d.failed_distributions > 0
              ? "Partial"
              : d.successful_distributions > 0
              ? "Active"
              : "Idle",
        }));
        setDomains(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch domains:", err);
    }
  };

  const loadWeeklyPerformanceData = async () => {
    try {
      const res = await fetchWeeklyPerformanceData();
      console.log("weekly data ", res.data.data);
      
      if (res?.data?.data?.weekly_performance) {
        setPortalDetailDataGlobal(res.data.data.weekly_performance);
      }
    } catch (err) {
      console.error("Failed to fetch weekly performance data:", err);
    }
  };

  const openPortalDetailModal = async (portal) => {
    try {
      const res = await fetchPortalStats(portal.id);
      console.log("Portal stats response:", res.data);

      if (res?.data?.success) {
        const detailData = {
          ...portal,
          topContributors: res.data.data.top_contributors || [],
          topCategories: res.data.data.top_performing_categories || [],
          weeklyPerformance: res.data.data.weekly_performance || [],
        };

        setPortalDetailData(detailData);
        setSelectedPortal(portal);
        setShowPortalModal(true);
      } else {
        console.error("Portal stats API returned invalid status:", res.data);
      }
    } catch (err) {
      console.error("Failed to fetch portal stats:", err);
    }
  };

  const getPerformanceColor = (percent) => {
    if (percent >= 80) return 'text-green-600 bg-green-50';
    if (percent >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  useEffect(() => {
    loadDomains();
    loadWeeklyPerformanceData();
  }, []);

  const refreshData = async () => {
    await Promise.all([loadDomains(), loadWeeklyPerformanceData()]);
  };

  React.useImperativeHandle(React.forwardRef(() => {}), () => ({
    refreshData
  }));

  return (
    <>
      {/* Weekly Performance Chart */}
      <div className="bg-gray-100 rounded-2xl border border-purple-100 p-3 sm:p-4 lg:p-6 mb-6 lg:mb-8">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Weekly Performance</h3>
        </div>
        <div className="space-y-2">
          {portalDetailDataGlobal.map((day, idx) => (
            <div key={idx} className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-600 w-8 sm:w-12">{day.day}</span>
              <div className="flex-1 flex items-center space-x-1">
                <div className="flex-1 bg-white rounded-full h-6 sm:h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full flex items-center justify-end pr-1 sm:pr-2"
                    style={{ width: `${(day.success / 60) * 100}%` }}
                  >
                    <span className="text-[10px] sm:text-xs font-bold text-white">{day.success}</span>
                  </div>
                </div>
                {day.failed > 0 && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs font-bold text-red-600">{day.failed}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-100">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            <span className="text-[10px] sm:text-xs text-gray-600">Success</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
            <span className="text-[10px] sm:text-xs text-gray-600">Failed</span>
          </div>
        </div>
      </div>

      {/* Portal Output Leaderboard */}
     {/* Portal Output Leaderboard */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
        <div className="bg-black p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Portal Output Leaderboard</h3>
              <p className="text-blue-100 text-sm sm:text-base hidden sm:block">Performance metrics across all publishing portals</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Portal</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Publications
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Published %
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Failed
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Avg Time</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Today (T/S/F/R/Avg)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {domains.map((portal, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${
                        index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : index === 2 ? 'bg-orange-100' : 'bg-blue-50'
                      }`}>
                        <span className={`font-bold text-sm ${
                          index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : index === 2 ? 'text-orange-600' : 'text-blue-600'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p
                          className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer text-sm sm:text-base"
                          onClick={() => openPortalDetailModal(portal)}
                        >
                          {portal.name}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          {portal.success === 'up' ? (
                            <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                          )}
                          <span className={portal.success === 'up' ? 'text-green-600' : 'text-red-600'}>
                            {portal.success}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 align-top">
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      {portal.success.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 align-top">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[60px] sm:max-w-[80px]">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            portal.publishedPercent >= 80 ? 'bg-green-500' :
                            portal.publishedPercent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${portal.publishedPercent}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs sm:text-sm font-semibold px-1.5 sm:px-2 py-1 rounded whitespace-nowrap ${getPerformanceColor(portal.publishedPercent)}`}>
                        {portal.publishedPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-700 text-sm sm:text-base">{portal.total}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-red-600 text-sm sm:text-base">{portal.failed}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 align-top">
                    <span className="text-gray-700 font-medium text-sm sm:text-base">{portal.avgPublishTime ? portal.avgPublishTime.toFixed(2) : 0}m</span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-[13px] font-medium">
                      <span className="text-gray-900 bg-gray-100 px-1.5 sm:px-2 py-1 rounded-md whitespace-nowrap">Total: {portal.todayTotal}</span>
                      <span className="text-green-700 bg-green-50 px-1.5 sm:px-2 py-1 rounded-md whitespace-nowrap">Success: {portal.todaySuccess}</span>
                      <span className="text-red-700 bg-red-50 px-1.5 sm:px-2 py-1 rounded-md whitespace-nowrap">Failed: {portal.todayFailed}</span>
                      <span className="text-purple-700 bg-purple-50 px-1.5 sm:px-2 py-1 rounded-md whitespace-nowrap">Retry: {portal.todayRetry}</span>
                      <span className="text-purple-700 bg-purple-50 px-1.5 sm:px-2 py-1 rounded-md whitespace-nowrap">Avg T: {portal.todayAverageTime}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden divide-y divide-gray-100">
          {domains.map((portal, index) => (
            <div
              key={index}
              className="p-4 sm:p-5 hover:bg-blue-50/30 transition-colors cursor-pointer"
              onClick={() => openPortalDetailModal(portal)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : index === 2 ? 'bg-orange-100' : 'bg-blue-50'
                  }`}>
                    <span className={`font-bold text-base sm:text-lg ${
                      index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : index === 2 ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base sm:text-lg truncate">{portal.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs sm:text-sm font-semibold px-2 py-0.5 rounded ${getPerformanceColor(portal.publishedPercent)}`}>
                        {portal.publishedPercent}%
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">{portal.avgPublishTime ? portal.avgPublishTime.toFixed(2) : 0}m avg</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Publications</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{portal.success}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Total</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{portal.total}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-red-600 font-medium">Failed</p>
                  <p className="text-base sm:text-lg font-bold text-red-600">{portal.failed}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-blue-600 font-medium">Avg Time</p>
                  <p className="text-base sm:text-lg font-bold text-blue-600">{portal.avgPublishTime ? portal.avgPublishTime.toFixed(2) : 0}m</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Success Rate</span>
                  <span className="text-xs font-semibold text-gray-900">{portal.publishedPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      portal.publishedPercent >= 80 ? 'bg-green-500' :
                      portal.publishedPercent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${portal.publishedPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Today's Stats */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-2">Today's Activity</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-gray-900 bg-white px-2 py-1 rounded">T: {portal.todayTotal}</span>
                  <span className="text-[10px] sm:text-xs text-green-700 bg-green-50 px-2 py-1 rounded">S: {portal.todaySuccess}</span>
                  <span className="text-[10px] sm:text-xs text-red-700 bg-red-50 px-2 py-1 rounded">F: {portal.todayFailed}</span>
                  <span className="text-[10px] sm:text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded">R: {portal.todayRetry}</span>
                  <span className="text-[10px] sm:text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">Avg: {portal.todayAverageTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600">
            💡 <span className="font-semibold">Pro Tip:</span> Click on any portal row to view detailed analytics and performance insights
          </p>
        </div>
      </div>

      {/* Portal Detail Modal */}
      {showPortalModal && portalDetailData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-7xl w-full max-h-[98vh] overflow-hidden animate-in fade-in duration-300">
            {/* Modal Header */}
            <div className="bg-black p-4 sm:p-6 relative">
              <button
                onClick={() => setShowPortalModal(false)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              
              <div className="flex items-center space-x-3 sm:space-x-4 mr-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">{portalDetailData.name}</h2>
                  <p className="text-xs sm:text-sm text-blue-100 mt-1 hidden sm:block">Detailed Analytics & Performance Insights</p>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-blue-100 text-[10px] sm:text-sm">Total Publications</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-1">{portalDetailData.success}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-blue-100 text-[10px] sm:text-sm">Success Rate</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-1">{portalDetailData.publishedPercent}%</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 col-span-2 lg:col-span-1">
                  <p className="text-blue-100 text-[10px] sm:text-sm">Avg Publish Time</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-1">{portalDetailData.avgPublishTime ? portalDetailData.avgPublishTime.toFixed(2) : 0}m</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(95vh-280px)] p-3 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Top Contributors */}
                <div className="bg-gray-100 rounded-xl sm:rounded-2xl border border-orange-100 p-4 sm:p-6">
                  <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Top Contributors</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {portalDetailData.topContributors?.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {portalDetailData.topContributors.map((user, idx) => (
                          <div key={idx} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-bold text-xs sm:text-sm">
                                    {user.news_post__created_by__username?.[0]?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                    {user.news_post__created_by__username || 'Unknown User'}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-gray-500">Contributor</p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-lg sm:text-2xl font-bold text-black">{user.total_distributions || 0}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">articles</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs sm:text-sm">No contributors found.</p>
                    )}
                  </div>
                </div>

                {/* Weekly Performance Chart */}
                <div className="bg-gray-100 rounded-xl sm:rounded-2xl border border-purple-100 p-4 sm:p-6">
                  <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Weekly Performance</h3>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    {portalDetailData.weeklyPerformance?.length > 0 ? (
                      <div className="space-y-1.5 sm:space-y-2">
                        {portalDetailData.weeklyPerformance.map((day, idx) => (
                          <div key={idx} className="flex items-center space-x-2 sm:space-x-3">
                            <span className="text-xs sm:text-sm font-semibold text-gray-600 w-8 sm:w-12">{day.day}</span>
                            <div className="flex-1 flex items-center space-x-1">
                              <div className="flex-1 bg-white rounded-full h-6 sm:h-8 relative overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full flex items-center justify-end pr-1 sm:pr-2"
                                  style={{ width: `${day.success > 0 ? (day.success / (day.success + day.failed)) * 100 : 0}%` }}
                                >
                                  <span className="text-[10px] sm:text-xs font-bold text-white">{day.success}</span>
                                </div>
                              </div>
                              {day.failed > 0 && (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-[10px] sm:text-xs font-bold text-red-600">{day.failed}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No performance data available.</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-purple-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Success</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Failed</span>
                    </div>
                  </div>
                </div>

                {/* Top Categories - FULL WIDTH */}
                <div className="lg:col-span-2 bg-gray-100 rounded-2xl border border-black/50 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FolderOpen className="w-5 h-5 text-black/80" />
                    <h3 className="text-lg font-bold text-gray-900">Top Performing Categories</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {portalDetailData.topCategories?.length > 0 ? (
                      portalDetailData.topCategories.map((cat, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Tag className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-semibold text-gray-900">{cat.master_category__name || 'Unknown'}</span>
                            </div>
                            <span className="text-sm font-bold text-blue-600">{cat.total_posts || 0} posts</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${cat.percentage || 0}%` }}
                              ></div>
                            </div> */}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm col-span-2">No categories available.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Last updated:</span> Just now
              </p>
              <button
                onClick={() => setShowPortalModal(false)}
                className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}