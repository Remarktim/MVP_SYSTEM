// src/pages/Dashboard.jsx - With separate Header component
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar"; // Import the Navbar without button
import Header from "../components/layout/Header"; // Import the Header with search and button
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import icons for carousel

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const navigate = useNavigate();
  // Track which image is shown for each card (before or after)
  const [activeImageMap, setActiveImageMap] = useState({});

  useEffect(() => {
    // Fetch community issues
    const fetchIssues = async () => {
      try {
        setLoading(true);

        // Fetch issues with profiles data joined
        const { data, error } = await supabase
          .from("issues")
          .select(
            `
            *,
            profiles:user_id (
              id,
              name,
              email,
              contact_number
            )
          `
          )
          .eq("status", "Completed") // Only fetch completed tasks
          .order("created_at", { ascending: false });

        if (error) throw error;

        console.log("Fetched issues with profile data:", data);

        // Initialize image state map - default to showing 'after' image first
        const initialImageMap = {};
        data.forEach((issue) => {
          initialImageMap[issue.id] = "after";
        });
        setActiveImageMap(initialImageMap);
        setIssues(data || []);
      } catch (error) {
        console.error("Error fetching issues:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  // Toggle between before and after images
  const toggleImage = (e, issueId) => {
    e.stopPropagation(); // Prevent card click navigation
    setActiveImageMap((prev) => ({
      ...prev,
      [issueId]: prev[issueId] === "before" ? "after" : "before",
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-14 md:pb-0">
      {/* Navbar */}
      <Navbar />

      {/* Header with Search and Report Button */}
      <Header title="Newsfeed Reports" />

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
                className="max-w-md mx-auto rounded-xl overflow-hidden shadow-md hover:shadow-lg bg-white cursor-pointer"
                onClick={() => navigate(`/issues/${issue.id}`)}>
                {/* Image section with Before/After toggle */}
                <div className="relative group">
                  {activeImageMap[issue.id] === "before" ? (
                    // Show BEFORE image
                    issue.before_image_path ? (
                      <div className="relative">
                        <img
                          className="w-full h-48 object-cover"
                          src={issue.before_image_path}
                          alt="Issue Before"
                          onError={(e) => {
                            e.target.src = "/api/placeholder/500/300";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No before image</span>
                      </div>
                    )
                  ) : // Show AFTER image
                  issue.after_image_path ? (
                    <div className="relative">
                      <img
                        className="w-full h-48 object-cover"
                        src={issue.after_image_path}
                        alt="Issue After"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/500/300";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No after image</span>
                    </div>
                  )}

                  {/* Navigation arrows - only if both images exist, appear on hover */}
                  {issue.before_image_path && issue.after_image_path && (
                    <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => toggleImage(e, issue.id)}
                        className="ml-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transform hover:scale-110 transition-transform duration-200">
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => toggleImage(e, issue.id)}
                        className="mr-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transform hover:scale-110 transition-transform duration-200">
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  )}

                  {/* Hover indicator dots */}
                  {issue.before_image_path && issue.after_image_path && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div
                        className={`h-2 w-2 rounded-full ${activeImageMap[issue.id] === "before" ? "bg-white" : "bg-gray-400"} cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeImageMap[issue.id] !== "before") {
                            setActiveImageMap((prev) => ({ ...prev, [issue.id]: "before" }));
                          }
                        }}></div>
                      <div
                        className={`h-2 w-2 rounded-full ${activeImageMap[issue.id] === "after" ? "bg-white" : "bg-gray-400"} cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeImageMap[issue.id] !== "after") {
                            setActiveImageMap((prev) => ({ ...prev, [issue.id]: "after" }));
                          }
                        }}></div>
                    </div>
                  )}

                  {/* Status badge that changes based on which image is shown */}
                  <div className={`absolute top-0 right-0 ${activeImageMap[issue.id] === "after" ? "bg-green-500" : "bg-gray-700"} text-white px-2 py-1 m-2 rounded-md text-sm font-medium`}>
                    {activeImageMap[issue.id] === "after" ? "AFTER" : "BEFORE"}
                  </div>
                </div>

                {/* Content section */}
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">{issue.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>
                  <p className="text-gray-500 text-xs mb-4">📍 {issue.location || "No location specified"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Posted by {issue.profiles?.name || "anonymous"}</span>
                    <button
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl"
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
            <h3 className="text-lg font-medium text-gray-900">No reports yet</h3>
            <p className="mt-1 text-sm text-gray-500">Community all issues will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
