// src/components/admin/AdminCharts.jsx
import React, { useEffect, useState, useMemo } from "react";

const AdminCharts = ({ issues }) => {
  // State for tracking metrics and statistics
  const [issueStats, setIssueStats] = useState({
    statusDistribution: {
      underReview: 0,
      inProgress: 0,
      completed: 0,
    },
    weeklyStats: [],
    locationData: [],
    timeToResolution: 0,
  });

  // Calculate statistics when issues change
  useEffect(() => {
    if (!issues || issues.length === 0) {
      return;
    }

    // Calculate status distribution
    const underReview = issues.filter((issue) => issue.status === "Under Review").length;
    const inProgress = issues.filter((issue) => issue.status === "In Progress").length;
    const completed = issues.filter((issue) => issue.status === "Completed").length;

    // Calculate weekly stats (last 6 weeks)
    const weeklyData = calculateWeeklyStats(issues);

    // Group by location
    const locationData = calculateLocationData(issues);

    // Calculate average time to resolution
    const avgResolutionTime = calculateResolutionTime(issues);

    setIssueStats({
      statusDistribution: {
        underReview,
        inProgress,
        completed,
      },
      weeklyStats: weeklyData,
      locationData,
      timeToResolution: avgResolutionTime,
    });
  }, [issues]);

  // Calculate percentages for the status chart
  const statusPercentages = useMemo(() => {
    const total = issueStats.statusDistribution.underReview + issueStats.statusDistribution.inProgress + issueStats.statusDistribution.completed;

    if (total === 0) return { underReview: 0, inProgress: 0, completed: 0 };

    return {
      underReview: (issueStats.statusDistribution.underReview / total) * 100,
      inProgress: (issueStats.statusDistribution.inProgress / total) * 100,
      completed: (issueStats.statusDistribution.completed / total) * 100,
    };
  }, [issueStats.statusDistribution]);

  // Helper function to calculate weekly statistics
  const calculateWeeklyStats = (issueData) => {
    // Get dates for the last 6 weeks
    const weekDates = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const weekStartDate = new Date(today);
      weekStartDate.setDate(today.getDate() - i * 7);
      weekDates.push({
        weekStart: new Date(weekStartDate),
        label: `Week ${6 - i}`,
        reported: 0,
        resolved: 0,
      });
    }

    // Count issues reported and resolved in each week
    issueData.forEach((issue) => {
      const createdDate = new Date(issue.created_at);
      const resolvedDate = issue.resolved_at ? new Date(issue.resolved_at) : null;

      // Count reported issues
      for (let week of weekDates) {
        const weekEndDate = new Date(week.weekStart);
        weekEndDate.setDate(week.weekStart.getDate() + 7);

        if (createdDate >= week.weekStart && createdDate < weekEndDate) {
          week.reported += 1;
        }

        // Count resolved issues
        if (resolvedDate && resolvedDate >= week.weekStart && resolvedDate < weekEndDate) {
          week.resolved += 1;
        }
      }
    });

    return weekDates;
  };

  // Helper function to group issues by location
  const calculateLocationData = (issueData) => {
    // Group by location and count
    const locationCounts = {};

    issueData.forEach((issue) => {
      if (issue.location) {
        const location = issue.location.split(",")[0].trim(); // Take first part of location
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    });

    // Convert to array and sort by count
    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 locations
  };

  // Helper function to calculate average resolution time
  const calculateResolutionTime = (issueData) => {
    const resolvedIssues = issueData.filter((issue) => issue.status === "Completed" && issue.resolved_at);

    if (resolvedIssues.length === 0) return 0;

    const totalTime = resolvedIssues.reduce((sum, issue) => {
      const createdDate = new Date(issue.created_at);
      const resolvedDate = new Date(issue.resolved_at);
      const timeDiff = resolvedDate - createdDate;
      return sum + timeDiff;
    }, 0);

    // Return average in days
    return Math.round(totalTime / resolvedIssues.length / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Status Distribution Chart */}
      <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 md:p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">Issue Status Distribution</h3>

          <div className="mt-4 space-y-3">
            {/* Under Review Bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-yellow-500 dark:text-yellow-400">Under Review</span>
                <span className="text-sm text-gray-600 dark:text-neutral-400">
                  {issueStats.statusDistribution.underReview} ({statusPercentages.underReview.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-neutral-700">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${statusPercentages.underReview}%` }}></div>
              </div>
            </div>

            {/* In Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-blue-500 dark:text-blue-400">In Progress</span>
                <span className="text-sm text-gray-600 dark:text-neutral-400">
                  {issueStats.statusDistribution.inProgress} ({statusPercentages.inProgress.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-neutral-700">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${statusPercentages.inProgress}%` }}></div>
              </div>
            </div>

            {/* Completed Bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-green-500 dark:text-green-400">Completed</span>
                <span className="text-sm text-gray-600 dark:text-neutral-400">
                  {issueStats.statusDistribution.completed} ({statusPercentages.completed.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-neutral-700">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${statusPercentages.completed}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Metrics Chart */}
      <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 md:p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200 mb-4">Weekly Issue Tracking</h3>

          <div className="relative h-48">
            {/* Bar Chart */}
            <div className="flex h-40 items-end space-x-2">
              {issueStats.weeklyStats.map((week, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end justify-center space-x-1">
                    {/* Reported Issues Bar */}
                    <div
                      className="w-3 bg-blue-500 rounded-t transition-all duration-500"
                      style={{
                        height: `${week.reported * 10}%`,
                        maxHeight: "100%",
                        minHeight: week.reported > 0 ? "8px" : "0",
                      }}></div>

                    {/* Resolved Issues Bar */}
                    <div
                      className="w-3 bg-green-500 rounded-t transition-all duration-500"
                      style={{
                        height: `${week.resolved * 10}%`,
                        maxHeight: "100%",
                        minHeight: week.resolved > 0 ? "8px" : "0",
                      }}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 dark:text-neutral-400">{week.label}</span>
                </div>
              ))}
            </div>

            {/* Chart Legend */}
            <div className="flex justify-center mt-2">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 bg-blue-500 mr-1 rounded"></div>
                <span className="text-xs text-gray-500 dark:text-neutral-400">Reported</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 mr-1 rounded"></div>
                <span className="text-xs text-gray-500 dark:text-neutral-400">Resolved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Metrics */}
      <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 md:p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">Top Locations</h3>

          <div className="mt-4">
            {issueStats.locationData.length > 0 ? (
              <div className="space-y-4">
                {issueStats.locationData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{item.location}</span>
                      <span className="text-sm text-gray-600 dark:text-neutral-400">
                        {item.count} {item.count === 1 ? "issue" : "issues"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-neutral-700">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${(item.count / issueStats.locationData[0].count) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-neutral-400">No location data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolution Time Metric */}
      <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 md:p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">Resolution Metrics</h3>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg dark:bg-neutral-700">
              <p className="text-sm text-gray-500 dark:text-neutral-400">Average Resolution Time</p>
              <div className="mt-2 flex items-end">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">{issueStats.timeToResolution}</span>
                <span className="ml-1 text-sm text-gray-600 dark:text-neutral-400">days</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg dark:bg-neutral-700">
              <p className="text-sm text-gray-500 dark:text-neutral-400">Completion Rate</p>
              <div className="mt-2 flex items-end">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">{issues.length > 0 ? Math.round((issueStats.statusDistribution.completed / issues.length) * 100) : 0}</span>
                <span className="ml-1 text-sm text-gray-600 dark:text-neutral-400">%</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg dark:bg-neutral-700">
              <p className="text-sm text-gray-500 dark:text-neutral-400">Total Issues</p>
              <div className="mt-2 flex items-end">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">{issues.length}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg dark:bg-neutral-700">
              <p className="text-sm text-gray-500 dark:text-neutral-400">Issues In Progress</p>
              <div className="mt-2 flex items-end">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">{issueStats.statusDistribution.inProgress}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCharts;
