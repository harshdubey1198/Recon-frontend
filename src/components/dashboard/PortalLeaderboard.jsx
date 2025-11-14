import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { fetchDomainDistribution, fetchWeeklyPerformanceData } from "../../../server";
import { Award, BarChart3, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import PortalDetailModal from "../Modal/PortalDetailModal";
import DownloadButton from "../DownLoad/DownloadButton";
import WeeklyPerformance from "../Modal/WeeklyPerformance";
import TopContributors from "../Stats/TopContributors";
import TopPerformingCategories from "../Stats/TopPerformingCategories";

const PortalLeaderboard = forwardRef(({ range = "7d", customRange = null }, ref) => {
  const [domains, setDomains] = useState([]);
  const [portalDetailDataGlobal, setPortalDetailDataGlobal] = useState([]);
  const [globalTopContributors, setGlobalTopContributors] = useState([]);
  const [globalTopCategories, setGlobalTopCategories] = useState([]);
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [filterLimit, setFilterLimit] = useState("ALL");

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
        
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600">
            💡 <span className="font-semibold">Pro Tip:</span> Click on any portal row to view detailed analytics and performance insights
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Top Contributors Component */}
        <TopContributors contributors={globalTopContributors} itemsPerPage={8} />

        {/* Top Performing Categories Component */}
        <TopPerformingCategories categories={globalTopCategories} itemsPerPage={8} />
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