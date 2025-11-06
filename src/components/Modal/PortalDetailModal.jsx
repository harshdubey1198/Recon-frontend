import React, { useRef, useCallback, useState } from 'react';
import { X, Award, Users, BarChart3, FolderOpen, Tag } from 'lucide-react';
import formatUsername from '../../utils/formateName';

export default function PortalDetailModal({ isOpen, onClose, portalData 
}) {
  const [modalContributorsPage, setModalContributorsPage] = useState(1);
  const modalContributorsRef = useRef(null);
  const ITEMS_PER_PAGE = 8;

  const handleModalScroll = useCallback(() => {
    if (!modalContributorsRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = modalContributorsRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setModalContributorsPage(prev => {
        const maxPage = Math.ceil((portalData?.topContributors?.length || 0) / ITEMS_PER_PAGE);
        return prev < maxPage ? prev + 1 : prev;
      });
    }
  }, [portalData?.topContributors?.length]);

  if (!isOpen || !portalData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[100vh] overflow-hidden animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-black p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{portalData.name}</h2>
              <p className="text-blue-100 mt-1">Detailed Analytics & Performance Insights</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-100 text-sm">Total Publications</p>
              <p className="text-3xl font-bold text-white mt-1">{portalData.success}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-100 text-sm">Success Rate</p>
              <p className="text-3xl font-bold text-white mt-1">{portalData.publishedPercent}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-100 text-sm">Avg Publish Time</p>
              <p className="text-3xl font-bold text-white mt-1">
                {portalData.avgPublishTime ? portalData.avgPublishTime.toFixed(2) : 0}s
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-100 text-sm">Failed</p>
              <p className="text-3xl font-bold text-white mt-1">{portalData.failed}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-280px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Contributors */}
            <div className="bg-gray-100 rounded-2xl border border-orange-100 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-black" />
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
                      scrollbarColor: '#d1d5db #f3f4f6'
                    }}
                  >
                    {portalData.topContributors
                      .slice(0, modalContributorsPage * ITEMS_PER_PAGE)
                      .map((user, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
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
                            <p className="text-2xl font-bold text-black">{user.total_distributions || 0}</p>
                            <p className="text-xs text-gray-500">articles</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {modalContributorsPage * ITEMS_PER_PAGE < portalData.topContributors.length && (
                      <div className="text-center py-2">
                        <p className="text-xs text-gray-500">load more...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No contributors found.</p>
                )}
              </div>
            </div>

            {/* Weekly Performance */}
            <div className="bg-gray-100 rounded-2xl border border-purple-100 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-black" />
                <h3 className="text-lg font-bold text-gray-900">Weekly Performance</h3>
              </div>
              <div className="space-y-2">
                {portalData.weeklyPerformance?.length > 0 ? (
                  <div className="space-y-2">
                    {portalData.weeklyPerformance.map((day, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-gray-600 w-12">{day.day}</span>
                        <div className="flex-1 flex items-center space-x-1">
                          <div className="flex-1 bg-white rounded-full h-8 relative overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${day.success > 0 ? (day.success / (day.success + day.failed)) * 100 : 0}%` }}
                            >
                              <span className="text-xs font-bold text-white">{day.success}</span>
                            </div>
                          </div>
                          {day.failed > 0 && (
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-red-600">{day.failed}</span>
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

            {/* Top Performing Categories */}
            <div className="lg:col-span-2 bg-gray-100 rounded-2xl border border-black/50 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FolderOpen className="w-5 h-5 text-black/80" />
                <h3 className="text-lg font-bold text-gray-900">Top Performing Categories</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portalData.topCategories?.length > 0 ? (
                  portalData.topCategories.map((cat, idx) => (
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
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm col-span-2">No categories available.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Last updated:</span> Just now
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}