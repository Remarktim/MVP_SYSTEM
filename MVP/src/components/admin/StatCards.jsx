import React from "react";
import { ClipboardDocumentCheckIcon, ClockIcon, DocumentCheckIcon, DocumentIcon } from "@heroicons/react/24/outline";

const StatCards = ({ stats }) => {
  // Define default stats in case none are provided
  const defaultStats = {
    total: { count: 0, change: 0 },
    pending: { count: 0, change: 0 },
    inProgress: { count: 0, change: 0 },
    completed: { count: 0, change: 0 },
  };

  // Use provided stats or defaults
  const displayStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Issues Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-500 truncate">Total Issues</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{displayStats.total.count}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <DocumentIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Issues Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-500 truncate">Pending</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{displayStats.pending.count}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
              <ClipboardDocumentCheckIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* In Progress Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-500 truncate">In Progress</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{displayStats.inProgress.count}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Completed Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-500 truncate">Completed</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{displayStats.completed.count}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <DocumentCheckIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
