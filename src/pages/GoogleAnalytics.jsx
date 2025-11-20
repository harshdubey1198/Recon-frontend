import React, { useState, useEffect } from "react";
import { ChevronDown, Settings, CheckCircle2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, ComposedChart, Bar, BarChart } from "recharts";

// Import the GA4 API function
import { queryGA4 } from "../../server"; // Assuming queryGA4 function is exported from server.js

const GoogleAnalytics = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Last 7 days");
  const [ga4Data, setGa4Data] = useState(null); // State for storing GA4 data
  const [realtimeData, setRealtimeData] = useState([]); // State for storing real-time data (active users)
  const [realtimeBars, setRealtimeBars] = useState([]); // For real-time bar chart

  const dateRanges = [
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 28 days",
    "Last 30 days",
    "This month",
    "Last month",
  ];

  const countries = ["All Countries", "United States", "India", "China", "Germany", "Singapore"];

  // Function to handle range selection
  const handleSelect = (range) => {
    setSelectedRange(range);
    setFilterOpen(false);
  };

  // Function to handle country selection (though we're not using it for active users)
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  // Function to get the start and end dates based on selected range
  const getDateRange = (range) => {
    const today = new Date();
    let startDate, endDate;

    switch (range) {
      case "Today":
        startDate = endDate = today.toISOString().split("T")[0];
        break;
      case "Yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = endDate = yesterday.toISOString().split("T")[0];
        break;
      case "Last 7 days":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = today;
        startDate = startDate.toISOString().split("T")[0];
        endDate = endDate.toISOString().split("T")[0];
        break;
      case "Last 28 days":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 28);
        endDate = today;
        startDate = startDate.toISOString().split("T")[0];
        endDate = endDate.toISOString().split("T")[0];
        break;
      case "Last 30 days":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        endDate = today;
        startDate = startDate.toISOString().split("T")[0];
        endDate = endDate.toISOString().split("T")[0];
        break;
      case "This month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        startDate = startDate.toISOString().split("T")[0];
        endDate = endDate.toISOString().split("T")[0];
        break;
      case "Last month":
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
        startDate = startDate.toISOString().split("T")[0];
        endDate = endDate.toISOString().split("T")[0];
        break;
      default:
        startDate = endDate = today.toISOString().split("T")[0];
        break;
    }

    return { startDate, endDate };
  };

  // Function to fetch only active users (realtime data)
  const fetchRealtimeData = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedRange); // Get dynamic date range
      const requestData = {
        pid: "497438670", // Replace with the actual pid
        endpoint: "runRealtimeReport", // New endpoint for real-time data (active users only)
        body: {
          metrics: [
            { name: "activeUsers" }
          ]
        },
      };

      const response = await queryGA4(requestData);
      console.log("Realtime response:", response);

      // Process the response to get active users
      const activeUsers = response.data.rows.map((row) => ({
        activeUsers: parseInt(row.metricValues[0].value, 10),
      }));

      setRealtimeBars(activeUsers); // Set active user data for the chart
    } catch (error) {
      console.error("Error fetching GA4 realtime data:", error);
    }
  };

  // Fetch GA4 data for active users, events, and new users
  useEffect(() => {
    const fetchGA4Data = async () => {
      const { startDate, endDate } = getDateRange(selectedRange); // Get dynamic date range
      try {
        const requestData = {
          pid: "497438670", // Replace with the actual pid
          endpoint: "runReport", // Old endpoint for the original data
          body: {
            metrics: [
              { name: "activeUsers" },
              { name: "eventCount" },
              { name: "newUsers" },
            ],
            dateRanges: [
              { startDate, endDate }, // Dynamic date range
            ],
          },
        };

        const response = await queryGA4(requestData);

        // Process the response to structure it in a usable format for old data
        const data = response.data.rows.map((row) => ({
          activeUsers: parseInt(row.metricValues[0].value, 10),
          eventCount: parseInt(row.metricValues[1].value, 10),
          newUsers: parseInt(row.metricValues[2].value, 10),
        }));

        setGa4Data(data); // Set processed data to state
      } catch (error) {
        console.error("Error fetching GA4 data:", error);
      }
    };

    fetchGA4Data();
    fetchRealtimeData(); // Call to fetch real-time data
  }, [selectedRange]); // Trigger on range change

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Filter Dropdown for selecting date range */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div className="text-sm font-medium text-gray-700">Select Date Range</div>
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 p-2 text-sm font-medium text-gray-700"
            >
              {selectedRange}
              <ChevronDown size={16} className="text-gray-600" />
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-md">
                {dateRanges.map((range) => (
                  <div
                    key={range}
                    onClick={() => handleSelect(range)}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    {range}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-4 gap-8 pb-6 border-b border-gray-200">
          {/* Active Users */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-blue-600 text-sm font-medium">Active users</h3>
              <ChevronDown size={16} className="text-gray-600" />
            </div>
            <div className="text-4xl font-normal text-gray-900 mb-1">
              {ga4Data ? ga4Data[0]?.activeUsers : "Loading..."}
            </div>
            <div className="text-red-600 text-sm font-normal">↓ 7.4%</div>
          </div>

          {/* Event Count */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-gray-700 text-sm font-medium">Event count</h3>
              <ChevronDown size={16} className="text-gray-600" />
            </div>
            <div className="text-4xl font-normal text-gray-900 mb-1">
              {ga4Data ? ga4Data[0]?.eventCount : "Loading..."}
            </div>
            <div className="text-green-600 text-sm font-normal">↑ 22.8%</div>
          </div>

          {/* Key Events */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-gray-700 text-sm font-medium">Key events</h3>
              <ChevronDown size={16} className="text-gray-600" />
            </div>
            <div className="text-4xl font-normal text-gray-900 mb-1">0</div>
            <div className="text-gray-400 text-sm font-normal">-</div>
          </div>

          {/* New Users */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-gray-700 text-sm font-medium">New users</h3>
              <ChevronDown size={16} className="text-gray-600" />
            </div>
            <div className="text-4xl font-normal text-gray-900 mb-1">
              {ga4Data ? ga4Data[0]?.newUsers : "Loading..."}
            </div>
            <div className="text-red-600 text-sm font-normal">↓ 9.2%</div>
          </div>
        </div>

        {/* Realtime Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Realtime Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="text-6xl font-normal text-gray-900">
              {realtimeData.length > 0 ? realtimeData[0]?.activeUsers : "Loading..."}
            </div>
          </div>

          {/* Realtime Bar Chart */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="text-xs text-gray-500 font-medium mb-3 tracking-wider">ACTIVE USERS PER COUNTRY</div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={realtimeData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Bar dataKey="activeUsers" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dynamic Country Table */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium tracking-wider">COUNTRY</span>
              <span className="text-xs text-gray-500 font-medium tracking-wider">ACTIVE USERS</span>
            </div>

            <div className="space-y-3">
              {/* Dynamic Table Rows */}
              {realtimeData.length > 0 ? (
                realtimeData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-4 bg-blue-600 rounded"></div>
                      <span className="text-sm text-gray-900">{item.country}</span>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">{item.activeUsers}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No data available</div>
              )}
            </div>

            <a href="#" className="text-blue-600 hover:underline text-sm flex items-center justify-end gap-1 mt-6">
              View realtime
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAnalytics;
