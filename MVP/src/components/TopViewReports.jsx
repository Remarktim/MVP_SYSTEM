import React from "react";
import IssuePostCard from "./IssuePostCard";

const TopViewReports = ({ issues, navigate, formatTimeAgo, handleImageError }) => {
  return (
    <section className="bg-gray-50 p-4 rounded-lg shadow-md sticky top-40 z-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">⭐ Top Reports</h2>
      {issues.length > 0 ? (
        <div>
          {issues.map((issue, index) => (
            <IssuePostCard
              key={issue.id}
              issue={issue}
              navigate={navigate}
              formatTimeAgo={formatTimeAgo}
              handleImageError={handleImageError}
              isTopReport={true}
              reportIndex={index}
            />
          ))}
        </div>
      ) : (
        <p className="py-5 text-gray-500 text-center">No top reports to display currently.</p>
      )}
    </section>
  );
};

export default TopViewReports;
