import React from "react";

const IssueTable = ({ issues }) => {
  // Helper functions
  const getStatusColor = (status) => {
    if (!status) return "bg-yellow-100 text-yellow-800";

    const statusLower = status.toLowerCase();
    if (statusLower.includes("complete")) return "bg-green-100 text-green-800";
    if (statusLower.includes("progress") || statusLower === "in-progress") return "bg-indigo-100 text-indigo-800";
    if (statusLower.includes("reject")) return "bg-red-100 text-red-800"; // Handle Rejected
    return "bg-yellow-100 text-yellow-800"; // Default for pending/under review/etc.
  };

  const getStatusLabel = (status) => {
    if (!status) return "Pending";

    const statusLower = status.toLowerCase();
    if (statusLower.includes("complete")) return "Completed";
    if (statusLower.includes("progress") || statusLower === "in-progress") return "In Progress";
    if (statusLower.includes("review")) return "Under Review";
    if (statusLower.includes("reject")) return "Rejected"; // Handle Rejected
    return "Pending"; // Default
  };

  const getTimeSince = (timestamp) => {
    if (!timestamp) return "Unknown";

    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Less than a day, show hours
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        // Less than an hour, show minutes
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      // Less than a week, show days
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 30) {
      // Less than a month, show weeks
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
    } else {
      // More than a month, just show the date
      return date.toLocaleDateString();
    }
  };

  // Helper to format user initials
  const getUserInitial = (reporter) => {
    if (!reporter || !reporter.name) return "U";
    return reporter.name.charAt(0).toUpperCase();
  };

  // Helper to truncate long text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get the 5 most recent issues
  const recentIssues = issues
    ? [...issues]
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return dateB - dateA; // Sort by newest first
        })
        .slice(0, 5)
    : [];

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Issue
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase  truncate">
              Description
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reported By
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recentIssues.length > 0 ? (
            recentIssues.map((issue) => (
              <tr
                key={issue.id}
                className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-0">
                      <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs line-clamp-2 overflow-hidden">{truncateText(issue.description, 100)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{issue.location || "N/A"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-800">{getUserInitial(issue.reporter)}</span>
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">{issue.reporter ? issue.reporter.name : "Unknown"}</div>
                      <div className="text-xs text-gray-500">{issue.reporter ? issue.reporter.email : "unknown@example.com"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(issue.status)}`}>{getStatusLabel(issue.status)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{issue.created_at ? new Date(issue.created_at).toLocaleDateString() : "Unknown"}</div>
                  <div className="text-xs">{getTimeSince(issue.created_at)}</div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="px-6 py-4 text-center text-sm text-gray-500">
                No issues found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-right">
        <span className="text-xs text-gray-500">Showing latest 5 reports of {issues ? issues.length : 0} total</span>
      </div>
    </div>
  );
};

export default IssueTable;
