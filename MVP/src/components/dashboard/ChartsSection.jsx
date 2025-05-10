import React, { useEffect, useState } from "react";

const ChartsSection = ({ issues }) => {
  const [statusData, setStatusData] = useState({
    underReview: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    // Calculate data for status distribution
    const underReview = issues.filter((issue) => issue.status === "Under Review").length;
    const inProgress = issues.filter((issue) => issue.status === "In Progress").length;
    const completed = issues.filter((issue) => issue.status === "Completed").length;

    setStatusData({
      underReview,
      inProgress,
      completed,
    });
  }, [issues]);

  const totalIssues = issues.length;

  // Calculate percentages for the bar chart
  const underReviewPercentage = totalIssues ? (statusData.underReview / totalIssues) * 100 : 0;
  const inProgressPercentage = totalIssues ? (statusData.inProgress / totalIssues) * 100 : 0;
  const completedPercentage = totalIssues ? (statusData.completed / totalIssues) * 100 : 0;

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
                  {statusData.underReview} ({underReviewPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-neutral-700">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${underReviewPercentage}%` }}></div>
              </div>
            </div>

            {/* In Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-blue-500 dark:text-blue-400">In Progress</span>
                <span className="text-sm text-gray-600 dark:text-neutral-400">
                  {statusData.inProgress} ({inProgressPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-neutral-700">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${inProgressPercentage}%` }}></div>
              </div>
            </div>

            {/* Completed Bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-green-500 dark:text-green-400">Completed</span>
                <span className="text-sm text-gray-600 dark:text-neutral-400">
                  {statusData.completed} ({completedPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-neutral-700">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${completedPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Chart */}
      <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 md:p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">Resolution Timeline</h3>

          <div className="mt-4">
            <div className="space-y-3">
              {issues.slice(0, 5).map((issue, index) => (
                <div
                  key={issue.id}
                  className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`size-3 rounded-full mt-1 ${issue.status === "Completed" ? "bg-green-500" : issue.status === "In Progress" ? "bg-blue-500" : "bg-yellow-500"}`}></div>
                  </div>
                  <div className="ms-3">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-neutral-200">{issue.title}</h4>
                    <div className="mt-1 flex items-center gap-x-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          issue.status === "Completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : issue.status === "In Progress"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}>
                        {issue.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-neutral-500">{new Date(issue.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
