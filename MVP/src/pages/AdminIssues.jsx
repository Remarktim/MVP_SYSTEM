import { useState, useEffect } from "react";
import { FiSearch, FiEye } from "react-icons/fi";
import { BsClockHistory, BsCheckCircle } from "react-icons/bs";
import { AiOutlineExclamationCircle, AiOutlineClose } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";

function getStatusColor(status) {
  switch (status) {
    case "Under Review":
      return "bg-blue-100 text-blue-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    case "In Progress":
      return "bg-yellow-100 text-yellow-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "Under Review":
      return <AiOutlineExclamationCircle className="h-5 w-5 text-blue-500" />;
    case "Completed":
      return <BsCheckCircle className="h-5 w-5 text-green-500" />;
    case "In Progress":
      return <BsClockHistory className="h-5 w-5 text-yellow-500" />;
    case "Rejected":
      return <AiOutlineClose className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
}

function getFilterButtonStyle(isActive, status) {
  let baseStyle = "px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ";

  if (status === "Under Review") {
    return baseStyle + (isActive ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800 hover:bg-blue-200");
  } else if (status === "In Progress") {
    return baseStyle + (isActive ? "bg-yellow-600 text-white" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200");
  } else if (status === "Completed") {
    return baseStyle + (isActive ? "bg-green-600 text-white" : "bg-green-100 text-green-800 hover:bg-green-200");
  } else if (status === "Rejected") {
    return baseStyle + (isActive ? "bg-red-600 text-white" : "bg-red-100 text-red-800 hover:bg-red-200");
  } else {
    return baseStyle + (isActive ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300");
  }
}

export default function AdminIssues() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState("Under Review");
  const [searchTerm, setSearchTerm] = useState("");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch issues from Supabase
  useEffect(() => {
    let isMounted = true;

    async function fetchIssues() {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        console.log("Fetching issues from Supabase...");

        // Simplified query to avoid join errors
        const { data, error } = await supabase.from("issues").select("*, user_id").order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        if (!isMounted) return;

        console.log("Issues data received:", data);

        // Get user information in a separate query
        const userIds = data.filter((issue) => issue.user_id).map((issue) => issue.user_id);
        let userProfiles = {};

        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("id, name, contact_number").in("id", userIds);

          if (!profilesError && profilesData) {
            // Create a map of user_id to profile data
            profilesData.forEach((profile) => {
              userProfiles[profile.id] = profile;
            });
          } else {
            console.error("Error fetching profiles:", profilesError);
          }
        }

        // Transform the data to match our expected format
        const formattedData = data
          .map((issue) => {
            try {
              const profile = issue.user_id ? userProfiles[issue.user_id] : null;

              return {
                id: issue.id,
                title: issue.title || "Untitled Issue",
                status: issue.status || "Under Review",
                priority: issue.priority || "Medium",
                description: issue.description || "No description provided",
                // Use name from profile if available
                reportedBy: profile?.name || "Anonymous",
                contactNumber: profile?.contact_number || null,
                reportedAt: issue.created_at ? new Date(issue.created_at).toLocaleDateString() : "Unknown date",
                category: issue.category || "Uncategorized",
                location: issue.location || "No location specified",
              };
            } catch (err) {
              console.error("Error processing issue:", issue, err);
              return null;
            }
          })
          .filter(Boolean); // Filter out any null items

        setIssues(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching issues:", error);
        if (isMounted) {
          setError("Failed to load issues. Please try again later.");
          setLoading(false);
        }
      }
    }

    fetchIssues();

    // Cleanup function to prevent setting state on unmounted component
    return () => {
      isMounted = false;
    };
  }, [location]);

  // Get counts for each status
  const getStatusCounts = () => {
    const counts = {
      All: issues.length,
      "Under Review": 0,
      "In Progress": 0,
      Completed: 0,
      Rejected: 0,
    };

    issues.forEach((issue) => {
      if (counts[issue.status] !== undefined) {
        counts[issue.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Filter and search issues
  const filteredIssues = issues
    .filter((issue) => filter === "All" || issue.status === filter)
    .filter((issue) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        searchTerm === "" ||
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower) ||
        issue.category.toLowerCase().includes(searchLower) ||
        (issue.reportedBy && issue.reportedBy.toLowerCase().includes(searchLower))
      );
    });

  // Navigate to report detail page
  const handleViewDetails = (issueId) => {
    navigate(`/admin/reports/${issueId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AiOutlineClose className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            setTimeout(() => window.location.reload(), 300);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="">
      {/* Page Header with Title and Search */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Issue Reports</h2>

        {/* Search Box */}
        <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
              <span className="text-xl">&times;</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("All")}
          className={getFilterButtonStyle(filter === "All", "All")}>
          <span>All</span>
          <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs ml-1">{statusCounts.All}</span>
        </button>
        <button
          onClick={() => setFilter("Under Review")}
          className={getFilterButtonStyle(filter === "Under Review", "Under Review")}>
          <AiOutlineExclamationCircle className="h-4 w-4" />
          <span>Under Review</span>
          <span className="bg-white text-blue-800 px-2 py-0.5 rounded-full text-xs ml-1">{statusCounts["Under Review"]}</span>
        </button>
        <button
          onClick={() => setFilter("In Progress")}
          className={getFilterButtonStyle(filter === "In Progress", "In Progress")}>
          <BsClockHistory className="h-4 w-4" />
          <span>In Progress</span>
          <span className="bg-white text-yellow-800 px-2 py-0.5 rounded-full text-xs ml-1">{statusCounts["In Progress"]}</span>
        </button>
        <button
          onClick={() => setFilter("Completed")}
          className={getFilterButtonStyle(filter === "Completed", "Completed")}>
          <BsCheckCircle className="h-4 w-4" />
          <span>Completed</span>
          <span className="bg-white text-green-800 px-2 py-0.5 rounded-full text-xs ml-1">{statusCounts["Completed"]}</span>
        </button>
        <button
          onClick={() => setFilter("Rejected")}
          className={getFilterButtonStyle(filter === "Rejected", "Rejected")}>
          <AiOutlineClose className="h-4 w-4" />
          <span>Rejected</span>
          <span className="bg-white text-red-800 px-2 py-0.5 rounded-full text-xs ml-1">{statusCounts["Rejected"]}</span>
        </button>
      </div>

      {filteredIssues.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No issues found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
              {/* Card Header with Status */}
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    {getStatusIcon(issue.status)}
                    <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>{issue.status}</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{issue.title}</h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{issue.description}</p>

                {/* Category tag */}
                <div className="flex flex-wrap items-center text-xs text-gray-500 mb-3">
                  <span className="border border-gray-200 rounded-full px-2 py-1">{issue.category}</span>
                </div>

                {/* Reporter Info with contact number */}
                <div className="flex items-center mt-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                    {issue.reportedBy && typeof issue.reportedBy === "string" && issue.reportedBy.length > 0 ? issue.reportedBy.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-800">{issue.reportedBy && typeof issue.reportedBy === "string" && issue.reportedBy.length > 0 ? issue.reportedBy : "Anonymous"}</p>
                    <p className="text-xs text-gray-500">{issue.reportedAt}</p>
                    {issue.contactNumber && <p className="text-xs text-gray-500">📞 {issue.contactNumber}</p>}
                  </div>
                </div>
              </div>

              {/* Card Footer with View Details button */}
              <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 mt-auto">
                <button
                  onClick={() => handleViewDetails(issue.id)}
                  className="w-full px-3 py-2 bg-white text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50 transition-colors duration-200 text-sm font-medium flex items-center justify-center">
                  <FiEye className="h-4 w-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
