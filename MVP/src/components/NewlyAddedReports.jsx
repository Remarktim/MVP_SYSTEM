import React from "react";
import IssuePostCard from "./IssuePostCard";

const NewlyAddedReports = ({ issues, navigate, formatTimeAgo, handleImageError }) => {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 px-3 py-4 sticky top-48 md:top-40 bg-white z-10 border-b border-gray-200">📰 Newly Added Reports</h2>
      {issues.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {issues.map((issue) => (
            <IssuePostCard
              key={issue.id}
              issue={issue}
              navigate={navigate}
              formatTimeAgo={formatTimeAgo}
              handleImageError={handleImageError}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-logo-dark-blue">No matching reports found</h3>
          <p className="mt-1 text-sm text-gray-500">Try different search terms or check back later!</p>
        </div>
      )}
    </section>
  );
};

export default NewlyAddedReports;
