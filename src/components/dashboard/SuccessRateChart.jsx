import React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, } from "recharts";

/**
 * @param {Array} data 
 * @param {Number | String} width 
 * @param {Number} height 
 */
const SuccessRateChart = ({ data = [], width = "100%", height = 300 }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        📈 Success Rate Trend
      </h3>

      <ResponsiveContainer width={width} height={height}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
            formatter={(value, name) => [
              `${value}${name === "success_rate" ? "%" : ""}`,
              name.replace("_", " "),
            ]}
          />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="success_rate"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Success Rate (%)"
          />
          <Line
            type="monotone"
            dataKey="failed_count"
            stroke="#ef4444"
            strokeWidth={1.5}
            dot={false}
            name="Failed Count"
          />
          <Line
            type="monotone"
            dataKey="success_count"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={false}
            name="Success Count"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SuccessRateChart;
