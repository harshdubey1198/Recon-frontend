import React, { useState, useEffect } from 'react';
import { Grid3x3, AlertTriangle, Clock, Plus, CheckCircle2, Tag, X, Eye, Calendar, User, TrendingUp, Loader2 } from 'lucide-react';
import { fetchInactivityAlerts } from '../../../server';
import { useNavigate } from "react-router-dom";
import HeatMapCategory from './HeatMapCategory';

export default function AnalyticsComponent({ categories }) {
  // State for Heatmap & Inactivity Alerts
  const [activeInactivityTab, setActiveInactivityTab] = useState('24h');
  const [heatmapData, setHeatmapData] = useState([]);
  const navigate = useNavigate();
  const [inactivityAlerts, setInactivityAlerts] = useState({
    '24h': { data: [], pagination: null },
    '48h': { data: [], pagination: null },
    '7d': { data: [], pagination: null }
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [articlesList, setArticlesList] = useState([]);

  // Generate Heatmap Data
  const generateHeatmapData = (categoriesData) => {
    const mainCategories = ['Politics', 'Sports', 'Business', 'Lifestyle', 'Technology'];
    const subcategories = ['Cricket', 'Finance', 'Fashion', 'AI', 'Elections', 'Football', 'Markets', 'Health', 'Gadgets'];
    
    const heatmap = mainCategories.map(mainCat => {
      return subcategories.map(subCat => ({
        mainCategory: mainCat,
        subCategory: subCat,
        publications: Math.floor(Math.random() * 100),
        intensity: Math.random()
      }));
    }).flat();
    
    setHeatmapData(heatmap);
  };

  // Fetch Inactivity Alerts from API
  const loadInactivityAlerts = async (resetData = true) => {
    if (resetData) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    try {
      // Fetch data for all three time ranges (page 1 only for initial load)
      if (resetData) {
        const [response24h, response48h, response7d] = await Promise.all([
          fetchInactivityAlerts('24h', 1),
          fetchInactivityAlerts('48h', 1),
          fetchInactivityAlerts('7d', 1)
        ]);

        // Transform API response to component format
        const transform = (response) => {
          if (!response.data?.data) return { data: [], pagination: null };
          
          const transformedData = response.data.data.map(item => ({
            category: item.master_category,
            lastPublish: item.last_publish || 'Never published',
            assignedTo: item.assigned_users.length > 0 
              ? item.assigned_users.join(', ') 
              : 'Unassigned',
            assignedUsers: item.assigned_users,
            assignedGroups: item.assigned_groups,
            daysInactive: calculateDaysInactive(item.last_publish)
          }));

          return {
            data: transformedData,
            pagination: response.data.pagination
          };
        };

        setInactivityAlerts({
          '24h': transform(response24h),
          '48h': transform(response48h),
          '7d': transform(response7d)
        });
      } else {
        // Load more for active tab only
        const currentData = inactivityAlerts[activeInactivityTab];
        const currentPage = currentData.pagination?.page || 1;
        const nextPage = currentPage + 1;
        
        const response = await fetchInactivityAlerts(activeInactivityTab, nextPage);
        
        if (response.data?.data) {
          const newData = response.data.data.map(item => ({
            category: item.master_category,
            lastPublish: item.last_publish || 'Never published',
            assignedTo: item.assigned_users.length > 0 
              ? item.assigned_users.join(', ') 
              : 'Unassigned',
            assignedUsers: item.assigned_users,
            assignedGroups: item.assigned_groups,
            daysInactive: calculateDaysInactive(item.last_publish)
          }));

          setInactivityAlerts(prev => ({
            ...prev,
            [activeInactivityTab]: {
              data: [...prev[activeInactivityTab].data, ...newData],
              pagination: response.data.pagination
            }
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching inactivity alerts:', err);
      setError('Failed to load inactivity alerts. Please try again.');
      
      // Fallback to empty arrays on error (only if initial load)
      if (resetData) {
        setInactivityAlerts({
          '24h': { data: [], pagination: null },
          '48h': { data: [], pagination: null },
          '7d': { data: [], pagination: null }
        });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Calculate days inactive based on last publish date
  const calculateDaysInactive = (lastPublish) => {
    if (!lastPublish) {
      return 0; // Never published
    }
    
    // Calculate actual days inactive
    const lastDate = new Date(lastPublish);
    const now = new Date();
    const diffTime = Math.abs(now - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

// Infinite scroll handler
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
    const currentData = inactivityAlerts[activeInactivityTab];
    const hasMore = currentData.pagination?.next;
    
    if (bottom && hasMore && !loadingMore && !loading) {
      loadInactivityAlerts(false);
    }
  };
// Initialize data on component mount
  useEffect(() => {
    generateHeatmapData(categories);
    loadInactivityAlerts();
  }, [categories]);

  return (
    <div className="space-y-8">
       {/* hitmap category */}
       <HeatMapCategory/>
     {/* Inactivity Alerts */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-black p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Inactivity Alerts</h3>
                <p className="text-gray-300">Categories with no recent publications (content gaps)</p>
              </div>
            </div>
            <button
              onClick={() => loadInactivityAlerts(true)}
              disabled={loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">{error}</p>
                <button
                  onClick={() => loadInactivityAlerts(true)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { id: '24h', label: 'Last 24 hours' },
              { id: '48h', label: 'Last 48 hours' },
              { id: '7d', label: 'Last 7 days' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveInactivityTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeInactivityTab === tab.id
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {inactivityAlerts[tab.id].data.length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeInactivityTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {inactivityAlerts[tab.id].pagination?.count || inactivityAlerts[tab.id].data.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading inactivity alerts...</p>
            </div>
          ) : (
            /* Alerts Table with Infinite Scroll */
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto" onScroll={handleScroll}>
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Category 
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Last Publish Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Assigned Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Quick Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inactivityAlerts[activeInactivityTab].data.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="text-gray-600 font-medium">All categories are active!</p>
                          <p className="text-sm text-gray-500 mt-1">No inactivity detected in this time period</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {inactivityAlerts[activeInactivityTab].data.map((alert, idx) => (
                        <tr key={idx} className='bg-gray-50 hover:bg-gray-100' >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900 capitalize">{alert.category}</p>
                              {alert.subcategory && (
                                <p className="text-sm text-gray-600">{alert.subcategory}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {alert.lastPublish === 'Never published' ? (
                                  <span className="text-red-600 font-medium">{alert.lastPublish}</span>
                                ) : (
                                  new Date(alert.lastPublish).toLocaleString()
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {alert.assignedUsers.length > 0 ? (
                              <div className="space-y-1">
                                {alert.assignedUsers.slice(0, 2).map((user, userIdx) => (
                                  <div key={userIdx} className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">{user[0].toUpperCase()}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{user}</span>
                                  </div>
                                ))}
                                {alert.assignedUsers.length > 2 && (
                                  <p className="text-xs text-gray-500 ml-10">
                                    +{alert.assignedUsers.length - 2} more
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-gray-600 text-xs font-bold">?</span>
                                </div>
                                <span className="text-sm font-medium text-gray-500">Unassigned</span>
                              </div>
                            )}
                          </td>
                         <td className="px-6 py-4">
                        <button
                            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                            onClick={() => {
                            localStorage.setItem("activeTab", "Create News");
                            window.dispatchEvent(new Event("storage"));
                            navigate("/"); // Adjust path if needed (where SidebarLayout is rendered)
                            }}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Create New
                        </button>
                        </td>
                        </tr>
                      ))}
                      
                      {/* Loading more indicator */}
                      {loadingMore && (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center space-x-3">
                              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                              <p className="text-gray-600 font-medium">Loading more...</p>
                            </div>
                          </td>
                        </tr>
                      )}
                      
                      {/* End of results indicator */}
                      {!inactivityAlerts[activeInactivityTab].pagination?.next && 
                       inactivityAlerts[activeInactivityTab].data.length > 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center">
                            <p className="text-sm text-gray-500">
                              Showing all {inactivityAlerts[activeInactivityTab].pagination?.count || 
                                         inactivityAlerts[activeInactivityTab].data.length} results
                            </p>
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
    </div>
      </div>
  
     
    </div>
  );
}