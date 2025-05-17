import React, { memo } from "react";
import IssuePostCard from "./IssuePostCard";

const TopViewReports = memo(({ issues, navigate, formatTimeAgo, handleImageError }) => {
  return (
    <section className="bg-gray-50 p-4 rounded-lg shadow-md sticky top-36 z-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">❤️ Most Liked Reports</h2>
      {issues.length > 0 ? (
        <div>
          {issues.map((issue, index) => (
            <div
              key={issue.id}
              className="mb-2">
              <div className="mb-1 text-xs font-medium text-gray-500 flex justify-between items-center">
                <span>#{index + 1} Ranked</span>
                <span>{issue.likeCount || 0} likes</span>
              </div>
              <IssuePostCard
                issue={issue}
                navigate={navigate}
                formatTimeAgo={formatTimeAgo}
                handleImageError={handleImageError}
                isTopReport={true}
                reportIndex={index}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="py-5 text-gray-500 text-center">No top liked reports to display currently.</p>
      )}
    </section>
  );
});

TopViewReports.displayName = "TopViewReports";

export default TopViewReports;
