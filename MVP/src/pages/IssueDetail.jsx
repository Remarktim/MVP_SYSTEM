// src/pages/IssueDetail.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Navbar from "../components/layout/Navbar";

const IssueDetail = () => {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch issue detail
    const fetchIssueDetail = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("issues").select("*").eq("id", id).single();

        if (error) throw error;
        setIssue(data);
      } catch (error) {
        console.error("Error fetching issue:", error.message);
        navigate("/"); // Redirect to home if issue not found
      } finally {
        setLoading(false);
      }
    };

    fetchIssueDetail();
  }, [id, navigate]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Use the Navbar component instead of custom header */}
      <Navbar />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner">Loading...</div>
          </div>
        ) : issue ? (
          <div className="w-full">
            {/* Back button */}
            <div className="mb-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-indigo-600 hover:text-indigo-800">
                <ChevronLeft className="h-5 w-5" />
                <span>Back to reports</span>
              </button>
            </div>

            {/* Issue detail */}
            <div className="bg-white rounded-lg shadow">
              {/* Report header with status */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-gray-800">{issue.title}</h1>
                  </div>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(issue.status)}`}>{issue.status}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 whitespace-pre-line break-words leading-relaxed max-h-[500px] overflow-y-auto pr-2">{issue.description}</p>

                {/* Before & After images - if they exist */}
                {(issue.before_image_path || issue.after_image_path) && (
                  <div className="flex flex-col lg:flex-row gap-6 mb-6">
                    {issue.before_image_path && (
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">BEFORE</p>
                        <img
                          src={issue.before_image_path}
                          alt="Before"
                          className="w-full rounded-md object-cover h-80"
                          onError={(e) => {
                            e.target.src = "/api/placeholder/800/600";
                          }}
                        />
                      </div>
                    )}
                    {issue.after_image_path && (
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">AFTER</p>
                        <img
                          src={issue.after_image_path}
                          alt="After"
                          className="w-full rounded-md object-cover h-80"
                          onError={(e) => {
                            e.target.src = "/api/placeholder/800/600";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Location info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700 font-medium">📍 Location</p>
                  <p className="text-gray-800">{issue.location || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Issue not found</h3>
            <p className="mt-1 text-sm text-gray-500">The issue you're looking for doesn't exist or has been removed.</p>
            <div className="mt-4">
              <Link
                to="/"
                className="text-indigo-600 hover:text-indigo-800">
                Return to home
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default IssueDetail;
