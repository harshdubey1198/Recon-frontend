import React, { useState, useEffect } from 'react';
import { Grid3x3, X, TrendingUp, Loader2, TrendingDown, Minus } from 'lucide-react';
import { fetchCategoryHeatmap } from '../../../server';
import HeatmapFilter from '../filters/HeatmapFilter';

export default function HeatMapCategory() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [range, setRange] = useState('7d');
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

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
      
      // Pass custom dates if range is custom
      const customDates = range === "custom" ? customRange : null;
      const response = await fetchCategoryHeatmap(range, customDates);
      
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

  // Handle custom range apply
  const handleApplyCustomRange = () => {
    if (customRange.start && customRange.end) {
      console.log("Applying custom range:", customRange);
      loadHeatmapData();
    }
  };
  
  // Handle cell click to open modal
  const handleCellClick = (cellData) => {
    if (cellData.currentPosts === 0) return;
    setSelectedCell(cellData);
    setShowArticleModal(true);
  };
  
  useEffect(() => {
    // Only load data when range changes to non-custom values
    // For custom range, wait for Apply button click
    if (range !== "custom") {
      loadHeatmapData();
    }
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
            
            {/* Using HeatmapFilter Component */}
            <HeatmapFilter
              range={range}
              setRange={setRange}
              customRange={customRange}
              setCustomRange={setCustomRange}
              onApplyCustomRange={handleApplyCustomRange}
              apiData={apiData}
            />
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Darker colors indicate higher publishing activity.
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
                <div className="space-y-2 mt-1">
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
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}