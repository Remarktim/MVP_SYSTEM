// src/pages/UserReports.jsx - With separate Header component
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import Navbar from "../components/layout/Navbar"; // Import the Navbar without button
import Header from "../components/layout/Header"; // Import the Header with search and button

const UserReports = () => {
  const [userIssues, setUserIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user's issues
    const fetchUserIssues = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("issues")
          .select("*")
          .eq("user_id", user.id) // Filter by current user
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUserIssues(data || []);
      } catch (error) {
        console.error("Error fetching user issues:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserIssues();
  }, [user]);

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

  // Handle issue deletion
  const handleDeleteIssue = async () => {
    if (!issueToDelete) return;

    try {
      const { error } = await supabase.from("issues").delete().eq("id", issueToDelete.id);

      if (error) throw error;

      // Remove from UI
      setUserIssues(userIssues.filter((issue) => issue.id !== issueToDelete.id));
      setDeleteModalOpen(false);
      setIssueToDelete(null);
    } catch (error) {
      console.error("Error deleting issue:", error.message);
      alert("Failed to delete issue. Please try again.");
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
      <Header title="My Reports" />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Reports feed with product card design */}
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner">Loading...</div>
          </div>
        ) : userIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userIssues.map((issue) => (
              <div
                key={issue.id}
                className="max-w-md rounded-md overflow-hidden shadow-md hover:shadow-lg bg-white cursor-pointer"
                onClick={() => navigate(`/issues/${issue.id}`)}>
                {/* Image section with status badge */}
                <div className="relative">
                  {issue.before_image_url ? (
                    <img
                      className="w-full h-48 object-cover"
                      src={issue.before_image_url}
                      alt="Issue Before"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/500/300";
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  <div className={`absolute top-0 right-0 ${getStatusColor(issue.status)} px-2 py-1 m-2 rounded-md text-sm font-medium`}>{issue.status}</div>
                </div>

                {/* Content section */}
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">{issue.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>
                  <p className="text-gray-500 text-xs mb-4">📍 {issue.location || "No location specified"}</p>
                  <p className="text-gray-500 text-xs mb-4">📅 Reported: {new Date(issue.created_at).toLocaleDateString()}</p>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      className="text-red-500 hover:text-red-700 font-medium py-1 px-2 rounded flex items-center"
                      onClick={(e) => openDeleteModal(e, issue)}>
                      <Trash2
                        size={16}
                        className="mr-1"
                      />
                      Delete
                    </button>
                    <button
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded"
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
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">You haven't reported any issues yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first report by clicking 'Report New Issue'.</p>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleDeleteIssue}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReports;
