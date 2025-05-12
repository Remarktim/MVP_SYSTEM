// src/components/charts/PieChart.jsx
import React, { useMemo } from "react";

/**
 * Reusable PieChart component
 *
 * @param {Object} props
 * @param {Array} props.data - Array of data objects with category and value properties
 * @param {string} props.categoryKey - Key for category in data objects
 * @param {string} props.valueKey - Key for value in data objects
 * @param {boolean} props.donut - Whether to render as a donut chart
 * @param {Array} props.colors - Array of color classes to use
 */
const PieChart = ({ data = [], categoryKey = "category", valueKey = "value", donut = true, colors = ["bg-indigo-500", "bg-green-500", "bg-orange-500", "bg-blue-500", "bg-gray-500"] }) => {
  // Calculate total value
  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item[valueKey], 0);
  }, [data, valueKey]);

  // Map colors to hex values for SVG
  const colorMap = {
    "bg-indigo-500": "#6366f1",
    "bg-green-500": "#22c55e",
    "bg-orange-500": "#f97316",
    "bg-blue-500": "#3b82f6",
    "bg-gray-500": "#6b7280",
    "bg-red-500": "#ef4444",
    "bg-yellow-500": "#eab308",
    "bg-purple-500": "#a855f7",
    "bg-pink-500": "#ec4899",
    "bg-teal-500": "#14b8a6",
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-center space-y-6 md:space-y-0 md:space-x-6">
      {/* Pie Chart Visualization */}
      <div className="relative w-64 h-64">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full">
          {/* Render pie segments */}
          {(() => {
            let currentAngle = 0;

            return data.map((item, index) => {
              if (item[valueKey] === 0) return null;

              const percentage = (item[valueKey] / total) * 100;
              const angleSize = 3.6 * percentage; // 3.6 = 360 / 100

              // Calculate the SVG arc path
              const startAngle = currentAngle;
              currentAngle += angleSize;
              const endAngle = currentAngle;

              const startX = 50 + 40 * Math.cos(((startAngle - 90) * Math.PI) / 180);
              const startY = 50 + 40 * Math.sin(((startAngle - 90) * Math.PI) / 180);
              const endX = 50 + 40 * Math.cos(((endAngle - 90) * Math.PI) / 180);
              const endY = 50 + 40 * Math.sin(((endAngle - 90) * Math.PI) / 180);

              const largeArcFlag = angleSize > 180 ? 1 : 0;

              const pathData = [`M 50 50`, `L ${startX} ${startY}`, `A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}`, `Z`].join(" ");

              const color = colorMap[colors[index % colors.length]] || "#6b7280";

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="0.5"
                />
              );
            });
          })()}

          {/* Center circle for donut effect */}
          {donut && (
            <circle
              cx="50"
              cy="50"
              r="25"
              fill="white"
            />
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item[valueKey] / total) * 100).toFixed(1) : "0.0";

          return (
            <div
              key={index}
              className="flex items-center">
              <div className={`w-4 h-4 rounded-sm ${colors[index % colors.length]} mr-2`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{item[categoryKey]}</span>
              <span className="ml-auto text-sm text-gray-500 dark:text-neutral-400">
                {item[valueKey]} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PieChart;
