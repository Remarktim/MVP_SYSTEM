// src/pages/Dashboard.jsx - With separate Header component
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar"; // Import the Navbar without button
import Header from "../components/layout/Header"; // Import the Header with search and button

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch community issues
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("issues")
          .select("*")
          .eq("status", "Completed") // Only fetch completed tasks
          .order("created_at", { ascending: false });

        if (error) throw error;
        setIssues(data || []);
      } catch (error) {
        console.error("Error fetching issues:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pb-14 md:pb-0">
      {/* Navbar */}
      <Navbar />

      {/* Header with Search and Report Button */}
      <Header title="Completed Reports" />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Reports feed with product card design */}
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner">Loading...</div>
          </div>
        ) : issues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="max-w-md mx-auto rounded-md overflow-hidden shadow-md hover:shadow-lg bg-white cursor-pointer"
                onClick={() => navigate(`/issues/${issue.id}`)}>
                {/* Image section with "Completed" badge */}
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
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 m-2 rounded-md text-sm font-medium">COMPLETED</div>
                </div>

                {/* Content section */}
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">{issue.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>
                  <p className="text-gray-500 text-xs mb-4">📍 {issue.location || "No location specified"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Posted by {issue.user_email?.split("@")[0] || "anonymous"}</span>
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
            <h3 className="text-lg font-medium text-gray-900">No completed reports yet</h3>
            <p className="mt-1 text-sm text-gray-500">Completed community issues will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
