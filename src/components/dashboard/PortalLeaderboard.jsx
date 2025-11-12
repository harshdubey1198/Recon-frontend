import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { fetchDomainDistribution, fetchWeeklyPerformanceData, fetchPortalStats } from "../../../server";
import { Award, BarChart3, Clock, ArrowUpRight, ArrowDownRight, Users, FolderOpen, Tag } from "lucide-react";
import formatUsername from "../../utils/formateName";
import PortalDetailModal from "../Modal/PortalDetailModal";
import DownloadButton from "../DownLoad/DownloadButton";

const PortalLeaderboard = forwardRef(({ range = "7d", customRange = null }, ref) => {
  const [domains, setDomains] = useState([]);
  const [portalDetailDataGlobal, setPortalDetailDataGlobal] = useState([]);
  const [globalTopContributors, setGlobalTopContributors] = useState([]);
  const [globalTopCategories, setGlobalTopCategories] = useState([]);
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [portalDetailData, setPortalDetailData] = useState(null);
  const [filterLimit, setFilterLimit] = useState("ALL");
  const [globalContributorsPage, setGlobalContributorsPage] = useState(1);
  const globalContributorsRef = useRef(null);
  const ITEMS_PER_PAGE = 8;
const [isPaused, setIsPaused] = useState(false);

  const loadDomains = async () => {
    try {
      const customDates = range === "custom" ? customRange : null;
      const res = await fetchDomainDistribution(range, customDates);
      console.log("portalData",res.data.data);
      
      if (res?.data?.status) {
        const mapped = res.data.data.portals.map((d) => ({
          id: d.portal_id,
          name: d.portal_name,
          total: d.total_distributions,
          success: d.successful_distributions,
          failed: d.failed_distributions,
          publishedPercent: d.success_percentage,
          avgPublishTime: d.average_time_taken,
          pending: d.pending_distributions,
          retry: d.retry_counts,
          
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
      const customDates = range === "custom" ? customRange : null;
      const res = await fetchWeeklyPerformanceData(range, customDates);
      
      if (res?.data?.data) {
        if (res.data.data.performance_trend) {
            const trend = res.data.data.performance_trend;
          // Limit to 7 recent days if range is longer (1m/custom)
          const limitedTrend =
            (range === "1m" || range === "custom")
              ? trend.slice(-7)
              : trend;
          setPortalDetailDataGlobal(limitedTrend);
        }
        if (res.data.data.top_contributors) {
          setGlobalTopContributors(res.data.data.top_contributors);
        }
        if (res.data.data.top_performing_categories) {
          setGlobalTopCategories(res.data.data.top_performing_categories);
        }
      }
    } catch (err) {
      console.error("Failed to fetch weekly performance data:", err);
    }
  };

  const openPortalDetailModal = async (portal) => {
    try {
      const res = await fetchPortalStats(portal.id);

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

  const handleGlobalScroll = useCallback(() => {
    if (!globalContributorsRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = globalContributorsRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setGlobalContributorsPage(prev => {
        const maxPage = Math.ceil(globalTopContributors.length / ITEMS_PER_PAGE);
        return prev < maxPage ? prev + 1 : prev;
      });
    }
  }, [globalTopContributors.length]);

  const getPerformanceColor = (percent) => {
    if (percent >= 80) return 'text-green-600 bg-green-50';
    if (percent >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Load data whenever range changes
 useEffect(() => {
   loadDomains();
   loadWeeklyPerformanceData();
 }, []);

  const refreshData = async (newRange, newCustomRange) => {
    const effectiveRange = newRange || range;
    const effectiveCustomRange = newCustomRange || customRange;
    
    const customDates = effectiveRange === "custom" ? effectiveCustomRange : null;
    
    await Promise.all([
      fetchDomainDistribution(effectiveRange, customDates).then(res => {
        if (res?.data?.status) {
          const mapped = res.data.data.portals.map((d) => ({
            id: d.portal_id,
            name: d.portal_name,
            total: d.total_distributions,
            success: d.successful_distributions,
            failed: d.failed_distributions,
            publishedPercent: d.success_percentage,
            avgPublishTime: d.average_time_taken,
            pending: d.pending_distributions,
            retry: d.retry_counts,
            
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
      }),
      fetchWeeklyPerformanceData(effectiveRange, customDates).then(res => {
        if (res?.data?.data) {
          if (res.data.data.performance_trend) {
           const trend = res.data.data.performance_trend;
          const limitedTrend = trend;
           setPortalDetailDataGlobal(limitedTrend);
          }
          if (res.data.data.top_contributors) {
            setGlobalTopContributors(res.data.data.top_contributors);
          }
          if (res.data.data.top_performing_categories) {
            setGlobalTopCategories(res.data.data.top_performing_categories);
          }
        }
      })
    ]);
  };

  useImperativeHandle(ref, () => ({
    refreshData
  }));

  const filteredDomains = filterLimit === "ALL" 
    ? domains 
    : domains.slice(0, parseInt(filterLimit));

  const downloadData = filteredDomains.map((portal, index) => ({
    rank: index + 1,
    ...portal
  }));

  const portalColumns = [
    { key: 'rank', label: 'Rank' },
    { key: 'name', label: 'Portal' },
    { key: 'success', label: 'Total_Publications' },
    { key: 'total', label: 'Total_Distributions' },
    { key: 'failed', label: 'Failed' },
    { key: 'publishedPercent', label: 'Success_Rate', getValue: (row) => `${row.publishedPercent}%` },
    { key: 'avgPublishTime', label: 'Avg_Publish_Time', getValue: (row) => row.avgPublishTime ? row.avgPublishTime.toFixed(2) : 0 },
    { key: 'retry', label: 'retry_counts' },
    
  ];

  const scrollContainerRef = useRef(null);

useEffect(() => {
  if (range !== "1m" || !scrollContainerRef.current) return;

  const container = scrollContainerRef.current;
  const totalWeeks = Math.ceil(portalDetailDataGlobal.length / 7);
  const scrollWidth = container.clientWidth;
  let currentWeek = 0;

  const interval = setInterval(() => {
    if (!container || isPaused) return;

    currentWeek++;
    container.scrollTo({
      left: currentWeek * scrollWidth,
      behavior: "smooth",
    });

    // 👇 when we’re almost at the end of duplicate track, jump back silently
    const maxScroll = scrollWidth * (totalWeeks * 2 - 1);
    if (container.scrollLeft >= maxScroll - 10) {
      setTimeout(() => {
        container.scrollTo({ left: 0, behavior: "auto" });
        currentWeek = 0;
      }, 500); // short delay after last smooth move
    }
  }, 2000);

  return () => clearInterval(interval);
}, [range, portalDetailDataGlobal.length, isPaused]);




  return (
    <>
      {/* Portal Output Leaderboard */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
        <div className="bg-black p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-50">Portal Output Leaderboard</h3>
                <p className="text-blue-100 text-sm sm:text-base hidden sm:block">Performance metrics across all publishing portals</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-white font-medium text-sm">Show:</label>
                <select
                  value={filterLimit}
                  onChange={(e) => setFilterLimit(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-sm text-white backdrop-blur-sm hover:bg-white/20 transition cursor-pointer"
                >
                  <option value="ALL" className="text-black">All</option>
                  <option value="10" className="text-black">10</option>
                  <option value="20" className="text-black">20</option>
                  <option value="30" className="text-black">30</option>
                </select>
              </div>

              <DownloadButton 
                data={downloadData}
                columns={portalColumns}
                filename="Portal_Performance_Report_All_Portals"
              />
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
                  Retry
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDomains.map((portal, index) => (
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
                    <span className="text-base sm:text-lg font-bold text-gray-600">
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
                  <td className="px-3 sm:px-6 py-3 sm:py-4 align-top">
                    <span className="text-base sm:text-lg font-bold text-gray-600">{portal.total}</span>

                    </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-red-600 text-sm sm:text-base">{portal.failed}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 align-top">
                    <span className="text-gray-700 font-medium text-sm sm:text-base">{portal.avgPublishTime ? portal.avgPublishTime.toFixed(2) : 0}s</span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 align-top">
                    <span className="text-base sm:text-lg font-bold text-gray-600">{portal.retry}</span>
                     
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600">
            💡 <span className="font-semibold">Pro Tip:</span> Click on any portal row to view detailed analytics and performance insights
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Top Contributors */}
        <div className="bg-gray-100 rounded-xl sm:rounded-2xl border border-orange-100 p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Top Contributors</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {globalTopContributors?.length > 0 ? (
              <div 
                ref={globalContributorsRef}
                onScroll={handleGlobalScroll}
                className="space-y-2 sm:space-y-3 max-h-[400px] overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}
              >
                {globalTopContributors.slice(0, globalContributorsPage * ITEMS_PER_PAGE).map((user, idx) => (
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
                            {formatUsername(user.news_post__created_by__username || 'Unknown User')}
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
                {globalContributorsPage * ITEMS_PER_PAGE < globalTopContributors.length && (
                  <div className="text-center py-2">
                    <p className="text-xs text-gray-500">load more...</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">No contributors found.</p>
            )}
          </div>
        </div>

        {/* Top Performing Categories */}
        <div className="bg-gray-100 rounded-xl sm:rounded-2xl border border-black/50 p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-black/80" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Top Performing Categories</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {globalTopCategories?.length > 0 ? (
              globalTopCategories.map((cat, idx) => (
                <div key={idx} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <span className="font-semibold text-sm sm:text-base text-gray-900 truncate">{cat.master_category__name || 'Unknown'}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-blue-600 flex-shrink-0 ml-2">{cat.total_posts || 0} posts</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">No categories available.</p>
            )}
          </div>
        </div>
      </div>

     {/* Weekly Performance */}
          <div className="bg-gray-100 rounded-xl sm:rounded-2xl border border-purple-100 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Weekly Performance</h3>
            </div>

        {/* Auto-scroll for 1 month range */}
            <div
              ref={scrollContainerRef}
              onMouseEnter={() => setIsPaused(true)}   // ⏸️ pause on hover
              onMouseLeave={() => setIsPaused(false)}  // ▶️ resume scroll
              className={`${
                range === "1m"
                  ? "flex overflow-x-hidden w-full pb-2 scroll-smooth snap-x snap-mandatory"
                  : "space-y-1.5 sm:space-y-2"
              }`}
              style={{ scrollBehavior: "smooth", width: "100%", overflow: "hidden" }}
            >
              {/* Render actual weeks + duplicate for smooth looping */}
             <>
                    {range === "1m"|| range === "custom" &&
                        Array.from({ length: Math.ceil(portalDetailDataGlobal.length / 7) }).map((_, weekIdx) => (
                          <div
                            key={`week-${weekIdx}`}
                            className="min-w-full snap-center bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex-shrink-0"
                          >
                           
                          {(range === "1m" || range === "custom") && (
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Week {weekIdx + 1}
                            </h4>
                          )}
                   
                            {portalDetailDataGlobal
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

                {/* Duplicate for smooth infinite scroll */}
                
                {Array.from({ length: Math.ceil(portalDetailDataGlobal.length / 7) }).map((_, weekIdx) => (
                  <div
                    key={`clone-${weekIdx}`}
                    className="min-w-full snap-center bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex-shrink-0 opacity-80"
                  >
                     {(range === "1m" || range === "custom") && (
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Week {weekIdx + 1}
                    </h4>
                  )}

                    
                    {portalDetailDataGlobal
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
              </>
            </div>


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


      {/* Portal Detail Modal */}
      <PortalDetailModal
          isOpen={showPortalModal}
          onClose={() => setShowPortalModal(false)}
          portalData={portalDetailData}
          portalId={selectedPortal?.id}
          portalName={selectedPortal?.name}
          initialRange={range}
          initialCustomRange={customRange}
        />
    </>
  );
});

PortalLeaderboard.displayName = 'PortalLeaderboard';

export default PortalLeaderboard;