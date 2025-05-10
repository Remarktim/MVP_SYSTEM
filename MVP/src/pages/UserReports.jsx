// src/pages/UserReports.jsx - With dropdown status filter
import { useState, useEffect, useRef } from "react";
import { userReports } from "../data/sampleData";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import Navbar from "../components/layout/Navbar"; // Import the Navbar with centered links
import Header from "../components/layout/Header"; // Import the Header with centered search
import DropdownStatusFilter from "../components/layout/DropdownStatusFilter"; // Import the dropdown filter

const UserReports = () => {
  const [userIssues, setUserIssues] = useState(userReports);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
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
        setFilteredIssues(data || []);
      } catch (error) {
        console.error("Error fetching user issues:", error.message);
      } finally {
        setLoading(false);
      }
    };

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
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Title and Filter section */}
        <div className="flex justify-between items-center mb-6">
          <DropdownStatusFilter
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </div>

        {/* Reports feed with product card design */}
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner">Loading...</div>
          </div>
        ) : filteredIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
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
            <h3 className="text-lg font-medium text-gray-900">{activeFilter === "all" ? "You haven't reported any issues yet" : `No ${activeFilter.replace("-", " ")} reports found`}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeFilter === "all" ? "Create your first report by clicking 'Report New Issue'." : "Try selecting a different filter or create a new report."}
            </p>
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
                className="rounded-xl py-2 px-4 border border-gray-300  text-gray-700 bg-white hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleDeleteIssue}
                className="rounded-xl py-2 px-4 bg-red-600 text-white  hover:bg-red-700">
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
