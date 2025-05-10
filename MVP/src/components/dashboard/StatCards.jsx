import React from "react";

const StatCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Issues Card */}
      <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-x-2">
            <span className="text-xs font-semibold uppercase text-gray-600 dark:text-neutral-400">Total Issues</span>
          </div>
          <div className="mt-1 flex items-center gap-x-2">
            <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">{stats.totalIssues}</h3>
          </div>
        </div>
      </div>

      {/* Under Review Card */}
      <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-x-2">
            <span className="text-xs font-semibold uppercase text-yellow-500">Under Review</span>
          </div>
          <div className="mt-1 flex items-center gap-x-2">
            <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">{stats.underReview}</h3>
          </div>
        </div>
      </div>

      {/* In Progress Card */}
      <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-x-2">
            <span className="text-xs font-semibold uppercase text-blue-500">In Progress</span>
          </div>
          <div className="mt-1 flex items-center gap-x-2">
            <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">{stats.inProgress}</h3>
          </div>
        </div>
      </div>

      {/* Completed Card */}
      <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-x-2">
            <span className="text-xs font-semibold uppercase text-green-500">Completed</span>
          </div>
          <div className="mt-1 flex items-center gap-x-2">
            <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">{stats.completed}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
