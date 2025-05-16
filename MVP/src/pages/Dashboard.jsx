// src/pages/Dashboard.jsx - With separate Header component
import { useState, useEffect } from "react";
import { supabase } from "../supabase"; // Add Supabase import
import { useAuth } from "../hooks/useAuth"; // Add useAuth import for current user
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Header from "../components/layout/Header";
import { PLACEHOLDER_IMAGE } from "../sampleData"; // Keep only the placeholder import
import NewlyAddedReports from "../components/NewlyAddedReports";
import TopViewReports from "../components/TopViewReports";
import LikeButton from "../components/LikeButton"; // Import LikeButton component

// Default placeholder for missing images - now imported from sampleData.js
// const PLACEHOLDER_IMAGE = "/placeholder-image.jpg";

// IssuePostCard Component
const IssuePostCard = ({ issue, navigate, formatTimeAgo, handleImageError }) => {
  return (
    <article
      key={issue.id}
      className="py-4 px-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
      onClick={() => navigate(`/issues/${issue.id}`)}>
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">{issue.profiles?.name ? issue.profiles.name.charAt(0).toUpperCase() : "A"}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">{issue.profiles?.name || "Anonymous"}</p>
            <p className="text-xs text-gray-500">{formatTimeAgo(issue.created_at)}</p>
          </div>
          {issue.title && <h2 className="mt-0.5 text-base font-medium text-gray-800 leading-tight">{issue.title}</h2>}
          {issue.description && <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap break-words">{issue.description}</p>}
        </div>
      </div>
      {(issue.after_image_path || issue.before_image_path) && (
        <div className="mt-3 -mx-3 sm:mx-0">
          <img
            className="w-full max-h-[500px] object-contain bg-gray-100 sm:rounded-lg"
            src={issue.after_image_path || issue.before_image_path || PLACEHOLDER_IMAGE}
            alt={issue.title || "Issue image"}
            onError={handleImageError}
          />
        </div>
      )}
      {issue.location && <p className="mt-2 text-xs text-gray-500">📍 {issue.location}</p>}
      <div className="mt-3 flex justify-around items-center text-gray-500">
        <LikeButton issueId={issue.id} />

        <button
          className="flex items-center space-x-1 hover:text-blue-500 transition-colors p-1 -m-1 rounded-md"
          onClick={(e) => {
            e.stopPropagation();
            alert("Comment clicked (not implemented)");
          }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
        <button
          className="flex items-center space-x-1 hover:text-green-500 transition-colors p-1 -m-1 rounded-md"
          onClick={(e) => {
            e.stopPropagation();
            alert("Repost clicked (not implemented)");
          }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2m0 0H15"
            />
          </svg>
        </button>
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
      </div>
    </article>
  );
};

const Dashboard = () => {
  const [topIssues, setTopIssues] = useState([]);
  const [newlyAddedIssues, setNewlyAddedIssues] = useState([]);
  const [filteredNewlyAddedIssues, setFilteredNewlyAddedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get authenticated user

  useEffect(() => {
    async function fetchApprovedOrCompletedIssues() {
      try {
        setLoading(true);
        setError(null);

        // Query issues table for approved or completed reports
        const { data, error } = await supabase.from("issues").select("*, profiles:user_id(name)").or("status.eq.Completed,status.eq.In Progress").order("created_at", { ascending: false });

        if (error) throw error;

        console.log("Fetched filtered issues:", data);

        // Set the top issues (most recently approved/completed)
        const topThreeIssues = data?.slice(0, 3) || [];
        setTopIssues(topThreeIssues);

        // Set all issues for the newly added section
        setNewlyAddedIssues(data || []);
        setFilteredNewlyAddedIssues(data || []);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchApprovedOrCompletedIssues();
  }, []);

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE;
    e.target.onerror = null;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") {
      setFilteredNewlyAddedIssues(newlyAddedIssues); // Reset to all newly added issues
      return;
    }
    const searchLower = searchTerm.toLowerCase();
    const filtered = newlyAddedIssues.filter(
      (issue) =>
        issue.title?.toLowerCase().includes(searchLower) ||
        issue.description?.toLowerCase().includes(searchLower) ||
        issue.location?.toLowerCase().includes(searchLower) ||
        (issue.profiles?.name && issue.profiles.name.toLowerCase().includes(searchLower))
    );
    setFilteredNewlyAddedIssues(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-100 md:pb-0">
      {" "}
      {/* Changed bg to gray-100 for better contrast with cards */}
      <Navbar />
      <Header
        title="In Progress & Completed Reports"
        onSearch={handleSearch}
      />
      <main className="flex flex-col md:flex-row max-w-screen-xl mx-auto gap-6 p-4 ">
        {/* Display loading state */}
        {loading && (
          <div className="w-full text-center py-10">
            <div className="spinner animate-pulse text-logo-vibrant-blue">Loading reports...</div>
          </div>
        )}

        {/* Display error message if any */}
        {error && (
          <div className="w-full text-center py-10">
            <div className="bg-red-50 p-4 rounded-lg text-red-700">{error}</div>
          </div>
        )}

        {/* Display content when loaded */}
        {!loading && !error && (
          <>
            {/* Left Side: Newly Added Reports */}
            <div className="w-full md:w-2/3 order-2 md:order-1">
              {filteredNewlyAddedIssues.length > 0 ? (
                <NewlyAddedReports
                  issues={filteredNewlyAddedIssues}
                  navigate={navigate}
                  formatTimeAgo={formatTimeAgo}
                  handleImageError={handleImageError}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">No in progress or completed reports available.</p>
                </div>
              )}
            </div>

            {/* Right Side: Top View Reports */}
            <div className="w-full md:w-1/3 order-1 md:order-2">
              {topIssues.length > 0 ? (
                <TopViewReports
                  issues={topIssues}
                  navigate={navigate}
                  formatTimeAgo={formatTimeAgo}
                  handleImageError={handleImageError}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">No top reports available.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
