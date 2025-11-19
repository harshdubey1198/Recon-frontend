import React, { useState, useEffect } from "react";
import { ChevronDown, Check, Settings, CheckCircle2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  ComposedChart,
  Bar,
  BarChart,
} from "recharts";

// Import the GA4 API function
import { queryGA4 } from "../../server"; // Assuming queryGA4 function is exported from server.js

const GoogleAnalytics = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Last 7 days");
  const [ga4Data, setGa4Data] = useState(null); // State for storing GA4 data

  const dateRanges = [
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 28 days",
    "Last 30 days",
    "This month",
    "Last month",
  ];

  const chartData = [
    { day: "11\nNov", current: 2800, previous: 3500, peer: 1000 },
    { day: "12", current: 3200, previous: 3300, peer: 1000 },
    { day: "13", current: 4500, previous: 4000, peer: 1000 },
    { day: "14", current: 2500, previous: 4200, peer: 1000 },
    { day: "15", current: 2700, previous: 3000, peer: 1000 },
    { day: "16", current: 2300, previous: 2700, peer: 1000 },
    { day: "17", current: 2700, previous: 2500, peer: 1000 },
  ];

  const realtimeBars = [
    12, 15, 18, 22, 19, 16, 20, 25, 18, 14, 11, 13, 16, 20, 22, 19, 17, 21, 24, 20, 18, 15, 19, 23, 25, 22, 20, 18, 21, 24,
  ];

  // Function to handle range selection
  const handleSelect = (range) => {
    setSelectedRange(range);
    setFilterOpen(false);
  };

  // Fetch GA4 data when the selected range changes
  useEffect(() => {
    const fetchGA4Data = async () => {
      try {
        const requestData = {
          pid: "497438670", // Replace with the actual pid
          endpoint: "runReport",
          body: {
            metrics: [
              { name: "activeUsers" },
              { name: "eventCount" },
              { name: "newUsers" },
            ],
            dimensions: [
              { name: "country" }
            ],
            dateRanges: [
              { startDate: "7daysAgo", endDate: "today" } // Can adjust based on selectedRange
            ]
          },
        };

        const response = await queryGA4(requestData);

        // Process the response to structure it in a usable format
        const data = response.data.rows.map(row => ({
          country: row.dimensionValues[0].value,
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
  }, [selectedRange]); // Trigger on range change

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
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

        {/* Main Content Area */}
        <div className="grid grid-cols-[1fr_400px] gap-6">
          {/* Left Chart Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Chart Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Settings size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <CheckCircle2 size={20} className="text-green-600" />
                </button>
                <ChevronDown size={20} className="text-gray-600" />
              </div>
            </div>

            {/* Chart Area */}
            <div className="p-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} ticks={[0, 1000, 2000, 3000, 4000, 5000]} tickFormatter={(value) => `${value / 1000}K`} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="peer" fill="#d1fae5" stroke="none" fillOpacity={0.6} />
                    <Line type="monotone" dataKey="previous" stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="current" stroke="#1d4ed8" strokeWidth={2.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Realtime Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Realtime Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium tracking-wider">ACTIVE USERS IN LAST 30 MINUTES</span>
                <ChevronDown size={16} className="text-gray-600" />
              </div>
              <div className="text-6xl font-normal text-gray-900">56</div>
            </div>

            {/* Bar Chart */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="text-xs text-gray-500 font-medium mb-3 tracking-wider">ACTIVE USERS PER MINUTE</div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={realtimeBars.map((val, i) => ({ value: val, index: i }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAnalytics;
