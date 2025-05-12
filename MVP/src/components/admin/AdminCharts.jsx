import React, { useState, useMemo } from "react";

const AdminCharts = ({ issues }) => {
  const [timeFrame, setTimeFrame] = useState("month");

  // Helper function to get status distribution
  const getStatusDistribution = useMemo(() => {
    const statusCounts = { pending: 0, inProgress: 0, completed: 0 };

    if (!issues || issues.length === 0) {
      return statusCounts;
    }

    issues.forEach((issue) => {
      const status = issue.status ? issue.status.toLowerCase() : "";

      if (status.includes("complete")) statusCounts.completed++;
      else if (status.includes("progress") || status === "in-progress") statusCounts.inProgress++;
      else statusCounts.pending++; // Default to pending for any other status
    });

    return statusCounts;
  }, [issues]);

  // Calculate total issues
  const totalIssues = issues ? issues.length : 0;

  // Calculate percentages
  const pendingPercent = totalIssues ? Math.round((getStatusDistribution.pending / totalIssues) * 100) : 0;
  const inProgressPercent = totalIssues ? Math.round((getStatusDistribution.inProgress / totalIssues) * 100) : 0;
  const completedPercent = totalIssues ? Math.round((getStatusDistribution.completed / totalIssues) * 100) : 0;

  // Generate recent activity data based on issues
  const recentActivity = useMemo(() => {
    if (!issues || issues.length === 0) return [];

    // Sort issues by updated_at (most recent first) and take first 5
    return [...issues]
      .sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at) : new Date(0);
        const dateB = b.updated_at ? new Date(b.updated_at) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((issue) => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        date: issue.updated_at ? new Date(issue.updated_at).toLocaleDateString() : "Unknown",
        user: issue.reporter?.name || "Unknown User",
      }));
  }, [issues]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Status Distribution Chart */}
      <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>

        <div className="space-y-4">
          {/* Pending */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-500">Pending</span>
              <span className="text-sm font-medium text-gray-700">{pendingPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-yellow-400 h-2.5 rounded-full"
                style={{ width: `${pendingPercent}%` }}></div>
            </div>
          </div>

          {/* In Progress */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-500">In Progress</span>
              <span className="text-sm font-medium text-gray-700">{inProgressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${inProgressPercent}%` }}></div>
            </div>
          </div>

          {/* Completed */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-500">Completed</span>
              <span className="text-sm font-medium text-gray-700">{completedPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: `${completedPercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className="text-center p-3 bg-yellow-50 rounded-md">
            <span className="text-xl font-semibold text-yellow-700">{getStatusDistribution.pending}</span>
            <p className="text-xs text-gray-500 mt-1">Pending</p>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-md">
            <span className="text-xl font-semibold text-indigo-700">{getStatusDistribution.inProgress}</span>
            <p className="text-xs text-gray-500 mt-1">In Progress</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-md">
            <span className="text-xl font-semibold text-green-700">{getStatusDistribution.completed}</span>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
        </div>
      </div>

      {/* Recent Activity / Time Trend */}
      <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setTimeFrame("week")}
              className={`px-3 py-1 text-sm font-medium rounded-l-md ${timeFrame === "week" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
              Week
            </button>
            <button
              onClick={() => setTimeFrame("month")}
              className={`px-3 py-1 text-sm font-medium rounded-r-md ${timeFrame === "month" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
              Month
            </button>
          </div>
        </div>

        {recentActivity.length > 0 ? (
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li
                  key={activity.id}
                  className="py-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          activity.status.includes("complete") ? "bg-green-500" : activity.status.includes("progress") ? "bg-indigo-500" : "bg-yellow-500"
                        }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 truncate">by {activity.user}</p>
                    </div>
                    <div className="text-right text-xs text-gray-500">{activity.date}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-56 bg-gray-50 rounded-md">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCharts;
