import React, { useEffect, useState } from "react";
import { fetchDistributionRate } from "../../../server";
import SuccessRateChart from "./SuccessRateChart";
import { BarChart3, Activity, PieChart } from "lucide-react";

export default function AnalyticsOverview() {
  const [successData, setSuccessData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSuccessRate = async () => {
    setIsLoading(true);
    try {
      const res = await fetchDistributionRate("daily");
      if (res?.data?.status) {
        setSuccessData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch success rate:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuccessRate();
  }, []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-1 gap-8 mb-10">
      {/* ✅ Chart 1 - Success Rate Trend */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              News Analytics
            </h2> */}
          </div>
          <button
            onClick={loadSuccessRate}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            🔄 Refresh
          </button>
        </div>
        {isLoading ? (
          <div className="text-center py-10 text-gray-400 animate-pulse">
            Loading chart…
          </div>
        ) : (
          <SuccessRateChart data={successData} height={520} 
        //    width={520}
           />
        )}
      </div>

    </div>
  );
}
