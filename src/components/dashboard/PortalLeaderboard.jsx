import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { fetchDomainDistribution, fetchWeeklyPerformanceData } from "../../../server";
import { Award, BarChart3, Clock, Users, FolderOpen, Tag } from "lucide-react";
import formatUsername from "../../utils/formateName";
import PortalDetailModal from "../Modal/PortalDetailModal";
import DownloadButton from "../DownLoad/DownloadButton";
import WeeklyPerformance from "../Modal/WeeklyPerformance";

const PortalLeaderboard = forwardRef(({ range = "7d", customRange = null }, ref) => {
  const [domains, setDomains] = useState([]);
  const [portalDetailDataGlobal, setPortalDetailDataGlobal] = useState([]);
  const [globalTopContributors, setGlobalTopContributors] = useState([]);
  const [globalTopCategories, setGlobalTopCategories] = useState([]);
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [filterLimit, setFilterLimit] = useState("ALL");
  const [globalContributorsPage, setGlobalContributorsPage] = useState(1);
  const globalContributorsRef = useRef(null);
  const ITEMS_PER_PAGE = 8;

  const loadDomains = async () => {
    try {
      const customDates = range === "custom" ? customRange : null;
      const res = await fetchDomainDistribution(range, customDates);
      
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
          setPortalDetailDataGlobal(trend);
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

  const openPortalDetailModal = (portal) => {
    setSelectedPortal(portal);
    setShowPortalModal(true);
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

  useEffect(() => {
    loadDomains();
    loadWeeklyPerformanceData();
  }, [range, customRange]);

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
            setPortalDetailDataGlobal(trend);
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
    { key: 'retry', label: 'Retry_Counts' },
  ];

  return (
    <>
      {/* Portal Output Leaderboard */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
        <div className="bg-black to-gray-800 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Portal Output Leaderboard</h3>
                <p className="text-gray-300 text-sm sm:text-base hidden sm:block">Performance metrics across all publishing portals</p>
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
                filename="Portal_Performance_Report"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Portal</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Publications
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Failed
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Avg Time</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Retry
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDomains.map((portal, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  onClick={() => openPortalDetailModal(portal)}
                >
                  <td className=" sm:px-6 py-3 sm:py-4 align-top">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 
                        'bg-gradient-to-br from-blue-400 to-blue-600'
                      }`}>
                        <span className="font-bold text-sm text-white">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                          {portal.name}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            portal.status === 'Active' ? 'bg-green-100 text-green-700' :
                            portal.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {portal.status}
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
                            portal.publishedPercent >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            portal.publishedPercent >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                            'bg-gradient-to-r from-red-500 to-red-600'
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
                    <span className="text-base sm:text-lg font-bold text-gray-700">{portal.total}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-sm sm:text-base font-semibold text-red-600">{portal.failed}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 align-top">
                    <span className="text-gray-700 font-medium text-sm sm:text-base">
                      {portal.avgPublishTime ? portal.avgPublishTime.toFixed(2) : 0}s
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 align-top">
                    <span className="text-base sm:text-lg font-bold text-purple-600">{portal.retry}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600">
            💡 <span className="font-semibold">Pro Tip:</span> Click on any portal row to view detailed analytics and performance insights
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Top Contributors */}
        <div className="bg-gray-100 rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-md">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <div className="p-2 bg-black rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
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
                  scrollbarColor: '#fb923c #fed7aa'
                }}
              >
                {globalTopContributors.slice(0, globalContributorsPage * ITEMS_PER_PAGE).map((user, idx) => (
                  <div key={idx} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-200 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
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
                        <p className="text-lg sm:text-2xl font-bold text-orange-600">{user.total_distributions || 0}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">articles</p>
                      </div>
                    </div>
                  </div>
                ))}
                {globalContributorsPage * ITEMS_PER_PAGE < globalTopContributors.length && (
                  <div className="text-center py-2">
                    <p className="text-xs text-gray-500">Scroll for more...</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm text-center py-8">No contributors found.</p>
            )}
          </div>
        </div>

        {/* Top Performing Categories */}
        <div className="bg-gray-100 rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-md">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <div className="p-2 bg-black/80 rounded-lg">
              <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Top Performing Categories</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {globalTopCategories?.length > 0 ? (
              globalTopCategories.map((cat, idx) => (
                <div key={idx} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                        <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <span className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                        {cat.master_category__name || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-blue-600 flex-shrink-0 ml-2">
                      {cat.total_posts || 0} posts
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm text-center py-8">No categories available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Performance Component */}
      <WeeklyPerformance 
        performanceData={portalDetailDataGlobal}
        range={range}
        title="Weekly Performance"
        showNavigation={true}
      />

      {/* Portal Detail Modal */}
      <PortalDetailModal
        isOpen={showPortalModal}
        onClose={() => setShowPortalModal(false)}
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