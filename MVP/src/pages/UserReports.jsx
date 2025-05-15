// src/pages/UserReports.jsx - With complete delete functionality
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, X, AlertCircle } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Header from "../components/layout/Header";
import DropdownStatusFilter from "../components/layout/DropdownStatusFilter";

const UserReports = () => {
  const [userIssues, setUserIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [displayIssues, setDisplayIssues] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user's issues
  const fetchUserIssues = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .eq("user_id", user.id) // Filter by current user
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("Fetched user issues:", data);
      setUserIssues(data || []);
      setFilteredIssues(data || []);
      setDisplayIssues(data || []);
    } catch (error) {
      console.error("Error fetching user issues:", error.message);
      setError("Failed to load your reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUserIssues();
  }, [user]);

  // Apply filter when activeFilter changes
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredIssues(userIssues);
    } else {
      const statusMap = {
        "under-review": "Under Review",
        "in-progress": "In Progress",
        completed: "Completed",
      };

      const filtered = userIssues.filter((issue) => issue.status === statusMap[activeFilter]);
      setFilteredIssues(filtered);
    }
  }, [activeFilter, userIssues]);

  // Apply search on filtered issues whenever filteredIssues or searchTerm changes
  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === "") {
      setDisplayIssues(filteredIssues);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const searched = filteredIssues.filter(
      (issue) => issue.title?.toLowerCase().includes(searchLower) || issue.description?.toLowerCase().includes(searchLower) || issue.location?.toLowerCase().includes(searchLower)
    );

    setDisplayIssues(searched);
  }, [filteredIssues, searchTerm]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500 text-white";
      case "In Progress":
        return "bg-blue-500 text-white";
      case "Under Review":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Show delete confirmation modal
  const openDeleteModal = (e, issue) => {
    e.stopPropagation(); // Prevent card click
    setIssueToDelete(issue);
    setDeleteModalOpen(true);
  };

  // Handle search functionality
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Function to extract the file path from a URL
  const extractStoragePathFromUrl = (url) => {
    if (!url) return null;

    // Try to extract the path from the URL
    try {
      // Parse the URL to get the pathname
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");

      // The path should be after "/object/public/bucket-name/"
      const publicIndex = pathParts.indexOf("public");
      if (publicIndex !== -1 && publicIndex + 2 < pathParts.length) {
        // Extract everything after the bucket name
        return pathParts.slice(publicIndex + 2).join("/");
      }

      return null;
    } catch (e) {
      console.error("Failed to extract path from URL:", e);
      return null;
    }
  };

  // Handle issue deletion
  const handleDeleteIssue = async () => {
    if (!issueToDelete) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Deleting issue:", issueToDelete);

      // Step 1: Try to delete the associated image from storage if it exists
      if (issueToDelete.before_image_path) {
        try {
          const filePath = extractStoragePathFromUrl(issueToDelete.before_image_path);
          console.log("Extracted file path:", filePath);

          if (filePath) {
            const { error: storageError } = await supabase.storage.from("issue-images").remove([filePath]);

            if (storageError) {
              console.error("Error deleting image from storage:", storageError);
              // Continue with issue deletion even if image deletion fails
            } else {
              console.log("Successfully deleted image from storage");
            }
          }
        } catch (imageError) {
          console.error("Error handling image deletion:", imageError);
          // Continue with issue deletion even if image deletion fails
        }
      }

      // Step 2: Delete the issue record from the database
      const { error } = await supabase.from("issues").delete().eq("id", issueToDelete.id);

      if (error) throw error;

      // Step 3: Update UI
      const updatedIssues = userIssues.filter((issue) => issue.id !== issueToDelete.id);
      setUserIssues(updatedIssues);
      setFilteredIssues(
        activeFilter === "all"
          ? updatedIssues
          : updatedIssues.filter((issue) => {
              const statusMap = {
                "under-review": "Under Review",
                "in-progress": "In Progress",
                completed: "Completed",
              };
              return issue.status === statusMap[activeFilter];
            })
      );

      setSuccess("Report deleted successfully");
      setDeleteModalOpen(false);
      setIssueToDelete(null);

      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error deleting issue:", error.message);
      setError("Failed to delete report. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setIssueToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-14 md:pb-0">
      {/* Navbar */}
      <Navbar />

      {/* Header with Search and Report Button */}
      <Header
        title="My Reports"
        onSearch={handleSearch}
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Title and Filter section */}
        <div className="flex justify-between items-center mb-6">
          <DropdownStatusFilter
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </div>

        {/* Error and Success messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Reports feed with product card design */}
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner animate-pulse-circle text-logo-vibrant-blue">Loading...</div>
          </div>
        ) : displayIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayIssues.map((issue) => (
              <div
                key={issue.id}
                className="max-w-md rounded-xl overflow-hidden shadow-lg hover:shadow-xl bg-white cursor-pointer transition-shadow duration-300 ease-in-out"
                onClick={() => navigate(`/issues/${issue.id}`)}>
                {/* Image section with status badge */}
                <div className="relative">
                  {issue.before_image_path ? (
                    <img
                      className="w-full h-48 object-cover"
                      src={issue.before_image_path}
                      alt="Issue Before"
                      onError={(e) => {
                        console.log("Failed to load image:", issue.before_image_path);
                        e.target.src = "/api/placeholder/500/300";
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-xl">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  <div className={`absolute top-0 right-0 ${getStatusColor(issue.status)} px-2 py-1 m-2 rounded-lg text-xs font-semibold`}>{issue.status}</div>
                </div>

                {/* Content section */}
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2 text-logo-dark-blue">{issue.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 overflow-y-auto break-words leading-relaxed max-h-20 line-clamp-3">{issue.description}</p>
                  <p className="text-gray-500 text-xs mb-4">📍 {issue.location || "No location specified"}</p>
                  <p className="text-gray-500 text-xs mb-4">📅 Reported: {new Date(issue.created_at).toLocaleDateString()}</p>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      className="text-red-500 hover:text-red-700 font-medium py-1 px-2 rounded-lg flex items-center"
                      onClick={(e) => openDeleteModal(e, issue)}>
                      <Trash2
                        size={16}
                        className="mr-1"
                      />
                      Delete
                    </button>
                    <button
                      className="bg-logo-vibrant-blue hover:bg-logo-dark-blue text-white font-bold py-2 px-4 rounded-xl transition-colors duration-300 ease-in-out"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/issues/${issue.id}`);
                      }}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-logo-dark-blue">
              {searchTerm ? "No matching reports found" : activeFilter === "all" ? "You haven't reported any issues yet" : `No ${activeFilter.replace("-", " ")} reports found`}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try using different search terms or clear the search field."
                : activeFilter === "all"
                ? "Create your first report by clicking 'Report New Issue'."
                : "Try selecting a different filter or create a new report."}
            </p>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-gra bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <p className="mb-4 text-gray-600">Are you sure you want to delete this report? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="rounded-xl py-2 px-4 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleDeleteIssue}
                disabled={deleting}
                className="rounded-xl py-2 px-4 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReports;
