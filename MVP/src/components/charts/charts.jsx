// src/components/charts/Chart.jsx
import React from "react";

/**
 * Reusable Chart component that can render bar or line charts
 *
 * @param {Object} props
 * @param {string} props.type - 'bar' or 'line'
 * @param {Array} props.data - Array of data points
 * @param {string} props.xKey - Key for x-axis values in data
 * @param {string} props.yKey - Key for y-axis values in data
 * @param {string} props.color - Color of bars or line (tailwind class)
 * @param {number} props.maxValue - Maximum value for scaling
 * @param {function} props.formatXLabel - Function to format x-axis labels
 */
const Chart = ({ type = "bar", data = [], xKey = "label", yKey = "value", color = "bg-indigo-500", maxValue = 100, formatXLabel = (item) => item[xKey] }) => {
  // Default to empty array if data is not provided
  const chartData = data || [];

  // Calculate max value if not provided
  const chartMaxValue = maxValue || Math.max(...chartData.map((item) => item[yKey]), 10);

  return (
    <div className="relative h-80">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500 dark:text-neutral-400 py-2">
        <span>{chartMaxValue}</span>
        <span>{Math.round(chartMaxValue * 0.75)}</span>
        <span>{Math.round(chartMaxValue * 0.5)}</span>
        <span>{Math.round(chartMaxValue * 0.25)}</span>
        <span>0</span>
      </div>

      {/* Chart grid lines */}
      <div className="absolute left-10 right-0 top-0 bottom-0 flex flex-col justify-between py-2">
        <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
        <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
        <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
        <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
        <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
      </div>

      {type === "bar" ? (
        // Bar Chart
        <div className="absolute left-10 right-0 top-0 bottom-8 flex items-end justify-around">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center">
              <div
                className={`w-10 ${color} rounded-t-sm transition-all duration-500`}
                style={{
                  height: `${(item[yKey] / chartMaxValue) * 100}%`,
                  minHeight: item[yKey] > 0 ? "4px" : "0",
                }}></div>
            </div>
          ))}
        </div>
      ) : (
        // Line Chart
        <div className="absolute left-10 right-0 top-0 bottom-8 flex flex-col">
          <svg
            className="w-full h-full"
            preserveAspectRatio="none">
            <polyline
              points={chartData
                .map((item, index) => {
                  const x = (index / (chartData.length - 1)) * 100;
                  const y = 100 - (item[yKey] / chartMaxValue) * 100;
                  return `${x}% ${y}%`;
                })
                .join(" ")}
              fill="none"
              stroke={color.replace("bg-", "stroke-")}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* X-axis labels */}
      <div className="absolute left-10 right-0 bottom-0 flex justify-around">
        {chartData.map((item, index) => (
          <div
            key={index}
            className="text-xs text-gray-500 dark:text-neutral-400 transform -rotate-45 origin-top-left ml-2">
            {formatXLabel(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chart;
