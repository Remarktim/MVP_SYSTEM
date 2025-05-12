import { useState, useEffect } from "react";
import { supabase } from "../supabase";
// Import the components we created
import StatCards from "../components/admin/StatCards";
import AdminCharts from "../components/admin/AdminCharts";
import IssueTable from "../components/admin/IssueTable";
// Import icons from react-icons
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { RiGiftLine } from "react-icons/ri";
import { FiMessageSquare } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";

export default function AdminDashboard() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // Initialize stats with the expected structure
  const [stats, setStats] = useState({
    total: { count: 0, change: 0 },
    pending: { count: 0, change: 0 },
    inProgress: { count: 0, change: 0 },
    completed: { count: 0, change: 0 },
  });
  const [issues, setIssues] = useState([]);

  // Load issues from Supabase
  useEffect(() => {
    async function fetchIssues() {
      setLoading(true);
      try {
        // Query issues table
        const { data, error } = await supabase.from("issues").select("*, user:user_id(email)").order("created_at", { ascending: false });

        if (error) throw error;

        // Format the issues data
        const formattedIssues = data.map((issue) => ({
          ...issue,
          reporter: {
            name: issue.user_email || issue.user?.email || "Unknown User",
            email: issue.user?.email || issue.user_email || "unknown@example.com",
          },
          // Map status values to match component expectations
          status: formatStatus(issue.status),
        }));

        setIssues(formattedIssues);
        calculateStats(formattedIssues);
      } catch (error) {
        console.error("Error fetching issues:", error);
        setError(`Failed to load issues: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
  }, []);

  // Format status to match component expectations
  const formatStatus = (status) => {
    if (!status) return "pending";

    const statusLower = status.toLowerCase();
    if (statusLower.includes("complete")) return "completed";
    if (statusLower.includes("progress") || statusLower.includes("in-progress")) return "in-progress";
    if (statusLower.includes("review") || statusLower.includes("pending")) return "pending";

    return "pending"; // default
  };

  // Calculate stats from issues data
  const calculateStats = (issuesData) => {
    // Get counts for each status
    const pending = issuesData.filter((issue) => formatStatus(issue.status) === "pending").length;
    const inProgress = issuesData.filter((issue) => formatStatus(issue.status) === "in-progress").length;
    const completed = issuesData.filter((issue) => formatStatus(issue.status) === "completed").length;
    const total = issuesData.length;

    // Calculate percentage changes (mocked for now)
    // In a real app, you would compare with previous period data
    const getRandomChange = () => Math.floor(Math.random() * 20) - 5;

    setStats({
      total: { count: total, change: getRandomChange() },
      pending: { count: pending, change: getRandomChange() },
      inProgress: { count: inProgress, change: getRandomChange() },
      completed: { count: completed, change: getRandomChange() },
    });
  };

  return (
    <div className="max-w-full overflow-x-hidden">
      {/* Main Content */}
      <div className="w-full">
        <div className="space-y-4 sm:space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setError(null)}
                      className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      <span className="sr-only">Dismiss</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards Section */}
          {loading ? (
            <div className="text-center py-5">
              <div
                className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full"
                role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <StatCards stats={stats} />
          )}

          {/* Charts Section */}
          {!loading && <AdminCharts issues={issues} />}

          {/* Issues Table */}
          <div className="mt-6">
            {/* Header */}
            <div className="mb-4 px-4 sm:px-0">
              <h3 className="text-lg font-semibold text-gray-800">Community Issues</h3>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div
                  className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full"
                  role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
              <IssueTable issues={issues} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
