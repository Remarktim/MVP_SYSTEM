// src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    // Fetch community issues
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("issues").select("*").order("created_at", { ascending: false });

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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Community Connect MVP</h1>
              </div>
            </div>

            {/* Tailgrids Account Dropdown Integration */}
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
                      to="/profile"
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      View profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Settings
                    </Link>
                  </div>
                  <div>
                    <Link
                      to="/my-issues"
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      My reported issues
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
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0 mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Community Issues</h2>
            <Link
              to="/submit-issue"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              Report New Issue
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="spinner">Loading...</div>
            </div>
          ) : issues.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {issues.map((issue) => (
                  <li key={issue.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-indigo-600 truncate">{issue.title}</h3>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${issue.status === "Under Review" ? "bg-yellow-100 text-yellow-800" : issue.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">{issue.location}</p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>Reported on {new Date(issue.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 line-clamp-2">{issue.description}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-gray-900">No issues reported yet</h3>
              <p className="mt-1 text-sm text-gray-500">Be the first to report a community issue.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
