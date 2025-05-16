import React, { useState, useEffect } from "react";
import { PLACEHOLDER_IMAGE } from "../sampleData"; // Import directly
import LikeButton from "./LikeButton"; // Import LikeButton component

const IssuePostCard = ({ issue, navigate, formatTimeAgo, handleImageError, isTopReport = false, reportIndex }) => {
  const [isHovered, setIsHovered] = useState(false);
  // Default to 'after' if available, else 'before', or null if neither
  const [currentImageType, setCurrentImageType] = useState(() => {
    if (issue.after_image_path) return "after";
    if (issue.before_image_path) return "before";
    return null;
  });

  const hasBothImages = issue.after_image_path && issue.before_image_path;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (hasBothImages) {
      setCurrentImageType("before");
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (hasBothImages) {
      setCurrentImageType("after");
    }
  };

  let imageSrc = PLACEHOLDER_IMAGE;
  if (currentImageType === "after" && issue.after_image_path) {
    imageSrc = issue.after_image_path;
  } else if (currentImageType === "before" && issue.before_image_path) {
    imageSrc = issue.before_image_path;
  } else if (issue.after_image_path) {
    // Fallback if currentImageType was 'before' but no before_image
    imageSrc = issue.after_image_path;
    if (currentImageType !== "after") setCurrentImageType("after"); // Correct state
  } else if (issue.before_image_path) {
    // Fallback if currentImageType was 'after' but no after_image
    imageSrc = issue.before_image_path;
    if (currentImageType !== "before") setCurrentImageType("before"); // Correct state
  }

  // Reset image type if issue changes or images on current issue change
  useEffect(() => {
    if (issue.after_image_path) {
      setCurrentImageType("after");
    } else if (issue.before_image_path) {
      setCurrentImageType("before");
    } else {
      setCurrentImageType(null);
    }
  }, [issue.id, issue.after_image_path, issue.before_image_path]);

  return (
    <article
      key={issue.id}
      className="py-4 px-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer p"
      onClick={() => navigate(`/issues/${issue.id}`)}>
      <div className="flex space-x-3 items-start">
        {isTopReport && <div className="text-lg font-semibold text-gray-600 pt-2 pr-1">{reportIndex + 1}.</div>}
        <div className="flex-shrink-0">
          <div className={`h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold ${isTopReport ? "mt-1" : ""}`}>
            {issue.profiles?.name ? issue.profiles.name.charAt(0).toUpperCase() : "A"}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">{issue.profiles?.name || "Anonymous"}</p>
            <p className="text-xs text-gray-500">{formatTimeAgo(issue.created_at)}</p>
          </div>
          {issue.title && <h2 className="mt-0.5 text-base font-medium text-gray-800 leading-tight">{issue.title}</h2>}
          {issue.description && !isTopReport && <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap break-words">{issue.description}</p>}
          {issue.description && isTopReport && <p className="mt-1 text-sm text-gray-700 truncate">{issue.description}</p>}
        </div>
      </div>
      {(issue.after_image_path || issue.before_image_path) && (
        <div
          className={`mt-3 ${isTopReport ? "ml-8" : "-mx-3 sm:mx-0"} relative group`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          <img
            className="w-full max-h-[500px] object-contain bg-gray-100 sm:rounded-lg"
            src={imageSrc}
            alt={issue.title || "Issue image"}
            onError={handleImageError}
          />
          {isHovered && hasBothImages && (
            <>
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">{currentImageType === "after" ? "After" : "Before"}</div>
              <button
                onClick={handlePrevImage}
                disabled={currentImageType === "before"}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                disabled={currentImageType === "after"}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
          {isHovered && !hasBothImages && (issue.after_image_path || issue.before_image_path) && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">{issue.after_image_path ? "After" : "Before"}</div>
          )}
        </div>
      )}
      {issue.location && <p className={`mt-2 text-xs text-gray-500 ${isTopReport ? "ml-8" : ""}`}>📍 {issue.location}</p>}
      <div className={`mt-3 flex items-center text-gray-500 ${isTopReport ? "justify-center space-x-4 ml-8" : "justify-center"}`}>
        <LikeButton
          issueId={issue.id}
          size={isTopReport ? "small" : "default"}
        />

        {isTopReport && (
          <button
            className="flex items-center space-x-1 text-xs font-medium text-logo-vibrant-blue hover:text-logo-dark-blue transition-colors p-1 -m-1 rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/issues/${issue.id}`);
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        )}
      </div>
    </article>
  );
};

export default IssuePostCard;
