// src/pages/IssueDetail.jsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { Link, useParams, useNavigate } from "react-router-dom";
import { BarChart2, ChevronLeft } from "lucide-react";

const IssueDetail = () => {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const trigger = useRef(null);
  const dropdown = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // Close dropdown if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center">
                <BarChart2 className="h-8 w-8 text-indigo-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-800">Community Connect</h1>
              </Link>
            </div>

            {/* User profile dropdown */}
            <div className="flex items-center">
              <div className="relative inline-block">
                <button
                  ref={trigger}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center">
                  <div className="relative w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700">
                    <span className="text-lg font-medium">{(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}</span>
                    <span className="absolute -right-0.5 -top-0.5 block h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                  </div>
                  <span className="ml-1 text-gray-500">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`duration-100 ${dropdownOpen ? "-scale-y-100" : ""}`}>
                      <path
                        d="M10 14.25C9.8125 14.25 9.65625 14.1875 9.5 14.0625L2.3125 7C2.03125 6.71875 2.03125 6.28125 2.3125 6C2.59375 5.71875 3.03125 5.71875 3.3125 6L10 12.5312L16.6875 5.9375C16.9688 5.65625 17.4062 5.65625 17.6875 5.9375C17.9688 6.21875 17.9688 6.65625 17.6875 6.9375L10.5 14C10.3437 14.1562 10.1875 14.25 10 14.25Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </button>
                <div
                  ref={dropdown}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => setDropdownOpen(false)}
                  className={`absolute right-0 top-full mt-1 w-[240px] divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-lg ${dropdownOpen ? "block" : "hidden"}`}>
                  <div className="flex flex-col px-4 py-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="relative aspect-square w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                        <span className="text-lg font-medium">{(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}</span>
                        <span className="absolute -right-0.5 -top-0.5 block h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user?.user_metadata?.full_name || "User"}</p>
                      </div>
                    </div>
                    <div className="mt-1 py-2 px-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500 break-all">{user?.email}</p>
                    </div>
                  </div>
                  <div>
                    <Link
                      to="/dashboard"
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Reports Feed
                    </Link>
                    <Link
                      to="/my-issues"
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      My Reports
                    </Link>
                  </div>
                  <div>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-50">
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

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
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">{issue.title}</h1>
                  </div>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(issue.status)}`}>{issue.status}</span>
                </div>

                <p className="text-gray-600 mb-6 whitespace-pre-line">{issue.description}</p>

                {/* Before & After images - if they exist */}
                {(issue.before_image_url || issue.after_image_url) && (
                  <div className="flex flex-col lg:flex-row gap-6 mb-6">
                    {issue.before_image_url && (
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">BEFORE</p>
                        <img
                          src={issue.before_image_url}
                          alt="Before"
                          className="w-full rounded-md object-cover h-80"
                          onError={(e) => {
                            e.target.src = "/api/placeholder/800/600";
                          }}
                        />
                      </div>
                    )}
                    {issue.after_image_url && (
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">AFTER</p>
                        <img
                          src={issue.after_image_url}
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
