import React, { useState, useEffect } from 'react';
import { Grid3x3, Tag, X, Eye, Calendar, User, TrendingUp, Loader2, TrendingDown, Minus } from 'lucide-react';
import { fetchCategoryHeatmap } from '../../server';

export default function HitMapCategory() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [articlesList, setArticlesList] = useState([]);
  const [apiData, setApiData] = useState(null);
  const [range, setRange] = useState('7d');
  
  // Helper function to determine heatmap cell color based on post count
  const getHeatmapColor = (postCount, maxPosts) => {
    if (maxPosts === 0) return 'bg-gray-100';
    const intensity = postCount / maxPosts;
    if (intensity < 0.2) return 'bg-gray-100';
    if (intensity < 0.4) return 'bg-gray-300';
    if (intensity < 0.6) return 'bg-gray-500';
    if (intensity < 0.8) return 'bg-gray-700';
    return 'bg-gray-900';
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    if (trend === 'increase') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'decrease') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };
  
  // Fetch Heatmap Data from API
  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchCategoryHeatmap(range);
      
      if (response.data.success) {
        const { data } = response.data;
        setApiData(data);
        
        // Transform API data for heatmap
        const categories = data.categories || [];
        const maxPosts = Math.max(...categories.map(cat => cat.current_period_posts), 1);
        
        const transformedData = categories.map(cat => ({
          masterCategoryId: cat.master_category_id,
          masterCategoryName: cat.master_category_name,
          currentPosts: cat.current_period_posts,
          previousPosts: cat.previous_period_posts,
          changeRatio: cat.change_ratio,
          trend: cat.trend,
          intensity: cat.current_period_posts / maxPosts
        }));
        
        setHeatmapData(transformedData);
      }
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      setError('Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cell click to open modal
  const handleCellClick = (cellData) => {
    if (cellData.currentPosts === 0) return;
    setSelectedCell(cellData);
    generateArticlesList(cellData);
    setShowArticleModal(true);
  };
  
  // Generate mock articles list for modal (replace with real API call later)
  const generateArticlesList = (cellData) => {
    const authors = ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams', 'Emily Brown'];
    const articles = Array.from({ length: Math.min(cellData.currentPosts, 10) }, (_, i) => ({
      id: `article-${i + 1}`,
      title: `${cellData.masterCategoryName} Article ${i + 1}: Latest News and Updates`,
      author: authors[Math.floor(Math.random() * authors.length)],
      publishDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      views: Math.floor(Math.random() * 50000) + 1000,
      status: 'Published'
    }));
    setArticlesList(articles);
  };
  
  useEffect(() => {
    loadHeatmapData();
  }, [range]);

  // Calculate grid dimensions (aim for roughly square grid)
  const getGridDimensions = () => {
    const totalCategories = heatmapData.length;
    if (totalCategories === 0) return { cols: 0, rows: 0 };
    
    const cols = Math.ceil(Math.sqrt(totalCategories));
    const rows = Math.ceil(totalCategories / cols);
    return { cols, rows };
  };

  const { cols, rows } = getGridDimensions();
  const maxPosts = Math.max(...heatmapData.map(cat => cat.currentPosts), 1);
  
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-gray-900 animate-spin" />
          <p className="text-gray-600 font-medium">Loading heatmap data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={loadHeatmapData}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Category Heatmap */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-black to-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Category Heatmap</h3>
                <p className="text-gray-300">Publishing activity by master category</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-300 font-medium">Period:</label>
                <select 
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 hover:bg-white/20 transition-colors"
                >
                  <option value="1d" className="bg-gray-800">Last 1 Days</option>
                  <option value="7d" className="bg-gray-800">Last 7 Days</option>
                  <option value="30d" className="bg-gray-800">Last 30 Days</option>
                </select>
              </div>
              {apiData && (
                <div className="text-right">
                  <p className="text-sm text-gray-300">Date Range</p>
                  <p className="text-white font-semibold text-sm">{apiData.current_start} to {apiData.current_end}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Darker colors indicate higher publishing activity. Click any cell to view articles.
            </p>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Less</span>
              <div className="flex space-x-1">
                <div className="w-4 h-4 bg-gray-100 border border-gray-200"></div>
                <div className="w-4 h-4 bg-gray-300 border border-gray-200"></div>
                <div className="w-4 h-4 bg-gray-500 border border-gray-200"></div>
                <div className="w-4 h-4 bg-gray-700 border border-gray-200"></div>
                <div className="w-4 h-4 bg-gray-900 border border-gray-200"></div>
              </div>
              <span className="text-xs text-gray-500">More</span>
            </div>
          </div>
          
          {heatmapData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No categories found for the selected period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Grid cells */}
                <div className="space-y-2">
                  {Array.from({ length: rows }).map((_, rowIdx) => (
                    <div key={rowIdx} className="flex gap-2">
                      {Array.from({ length: cols }).map((_, colIdx) => {
                        const dataIndex = rowIdx * cols + colIdx;
                        const cellData = heatmapData[dataIndex];
                        
                        if (!cellData) {
                          return <div key={colIdx} className="flex-1 h-24 bg-transparent"></div>;
                        }
                        
                        return (
                          <div
                            key={colIdx}
                            className={`flex-1 min-w-0 h-24 ${getHeatmapColor(cellData.currentPosts, maxPosts)} border border-gray-200 rounded-lg ${cellData.currentPosts > 0 ? 'cursor-pointer hover:ring-2 hover:ring-gray-900' : 'cursor-default'} group relative overflow-hidden`}
                            onClick={() => handleCellClick(cellData)}
                          >
                            {/* Category Name */}
                            <div className="absolute inset-0 p-2 flex flex-col justify-between">
                              <div className="flex items-start justify-between">
                                <span className={`text-xs font-semibold ${cellData.intensity > 0.5 ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                                  {cellData.masterCategoryName}
                                </span>
                                {getTrendIcon(cellData.trend)}
                              </div>
                              <div className="flex items-end justify-between">
                                <span className={`text-lg font-bold ${cellData.intensity > 0.5 ? 'text-white' : 'text-gray-900'}`}>
                                  {cellData.currentPosts}
                                </span>
                                {cellData.changeRatio !== 0 && (
                                  <span className={`text-xs font-semibold ${cellData.trend === 'increase' ? 'text-green-600' : cellData.trend === 'decrease' ? 'text-red-600' : 'text-gray-600'} ${cellData.intensity > 0.5 ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'} px-2 py-0.5 rounded`}>
                                    {cellData.changeRatio > 0 ? '+' : ''}{cellData.changeRatio.toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Hover overlay */}
                            {/* <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-center text-white">
                                <p className="text-xs mb-1">Click to view</p>
                                <p className="text-2xl font-bold">{cellData.currentPosts}</p>
                                <p className="text-xs">articles</p>
                              </div>
                            </div> */}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">How to use:</span> Click on any category cell to view published articles. The percentage shows the change compared to the previous period.
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
      
      {/* Article List Modal */}
  {/* {showArticleModal && selectedCell && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 p-6 relative">
              <button
                onClick={() => setShowArticleModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Tag className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedCell.masterCategoryName}</h2>
                  <p className="text-gray-200 mt-1">Category ID: {selectedCell.masterCategoryId}</p>
                </div>
              </div>

              {/* Quick Stats 
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-gray-300 text-sm">Current Period</p>
                  <p className="text-3xl font-bold text-white mt-1">{selectedCell.currentPosts}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-gray-300 text-sm">Previous Period</p>
                  <p className="text-3xl font-bold text-white mt-1">{selectedCell.previousPosts}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-gray-300 text-sm">Change</p>
                  <p className={`text-3xl font-bold mt-1 ${selectedCell.trend === 'increase' ? 'text-green-400' : selectedCell.trend === 'decrease' ? 'text-red-400' : 'text-white'}`}>
                    {selectedCell.changeRatio > 0 ? '+' : ''}{selectedCell.changeRatio.toFixed(0)}%
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-gray-300 text-sm">Showing</p>
                  <p className="text-3xl font-bold text-white mt-1">{articlesList.length}</p>
                </div>
              </div>
            </div>

            {/* Modal Content *
            <div className="overflow-y-auto max-h-[calc(90vh-320px)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Published Articles</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Filter by:</span>
                  <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <option>All Time</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
              </div>

              {/* Articles List 
              <div className="space-y-4">
                {articlesList.map((article, idx) => (
                  <div
                    key={article.id}
                    className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-gray-900 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Article Number Badge *
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                          <span className="text-white font-bold text-lg">#{idx + 1}</span>
                        </div>
                      </div>

                      {/* Article Content *
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                          {article.title}
                        </h4>
                        
                        {/* <div className="flex items-center flex-wrap gap-3 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="font-medium">{article.author}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            <span>{article.publishDate}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Eye className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="font-semibold">{article.views.toLocaleString()} views</span>
                          </div>
                        </div> 

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                              {article.status}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                              {selectedCell.masterCategoryName}
                            </span>
                          </div>
                          
                          <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More *
              {selectedCell.currentPosts > articlesList.length && (
                <div className="mt-6 text-center">
                  <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors">
                    Load More Articles ({selectedCell.currentPosts - articlesList.length} remaining)
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer *
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Published: {articlesList.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Total Views: {articlesList.reduce((sum, a) => sum + a.views, 0).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setShowArticleModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}