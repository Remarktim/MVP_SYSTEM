import React, { useState, useEffect, useMemo } from "react";
import { supabase, supabaseAdmin } from "../../supabase";

const AdminCharts = ({ issues: propIssues }) => {
  const [timeFrame, setTimeFrame] = useState("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [issues, setIssues] = useState([]);

  // Fetch issues data if not provided through props
  useEffect(() => {
    if (propIssues && propIssues.length > 0) {
      setIssues(propIssues);
      return;
    }

    const fetchIssues = async () => {
      setLoading(true);
      try {
        // Use supabase admin client to fetch all issues
        const { data, error } = await supabase.from("issues").select("*, user:user_id(email)").order("created_at", { ascending: false });

        if (error) throw error;

        // Format the issues data similar to what's done in AdminDashboard
        const formattedIssues = data.map((issue) => ({
          ...issue,
          reporter: {
            name: issue.user_email || issue.user?.email || "Unknown User",
            email: issue.user?.email || issue.user_email || "unknown@example.com",
          },
          status: formatStatus(issue.status),
        }));

        setIssues(formattedIssues);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [propIssues]);

  // Format status to match component expectations
  const formatStatus = (status) => {
    if (!status) return "pending";

    const statusLower = status.toLowerCase();
    if (statusLower.includes("complete")) return "completed";
    if (statusLower.includes("progress") || statusLower.includes("in-progress")) return "in-progress";
    if (statusLower.includes("review") || statusLower.includes("pending")) return "pending";

    return "pending"; // default
  };

  // Helper function to get status distribution
  const getStatusDistribution = useMemo(() => {
    const statusCounts = { pending: 0, inProgress: 0, completed: 0 };

    if (!issues || issues.length === 0) {
      return statusCounts;
    }

    issues.forEach((issue) => {
      const status = issue.status ? issue.status.toLowerCase() : "";

      if (status.includes("complete")) statusCounts.completed++;
      else if (status.includes("progress") || status === "in-progress") statusCounts.inProgress++;
      else statusCounts.pending++; // Default to pending for any other status
    });

    return statusCounts;
  }, [issues]);

  // Calculate total issues
  const totalIssues = issues ? issues.length : 0;

  // Calculate percentages
  const pendingPercent = totalIssues ? Math.round((getStatusDistribution.pending / totalIssues) * 100) : 0;
  const inProgressPercent = totalIssues ? Math.round((getStatusDistribution.inProgress / totalIssues) * 100) : 0;
  const completedPercent = totalIssues ? Math.round((getStatusDistribution.completed / totalIssues) * 100) : 0;

  // Generate recent activity data based on issues
  const recentActivity = useMemo(() => {
    if (!issues || issues.length === 0) return [];

    // Filter issues based on timeframe
    let filteredIssues = [...issues];

    if (timeFrame === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      filteredIssues = filteredIssues.filter((issue) => issue.updated_at && new Date(issue.updated_at) >= oneWeekAgo);
    }

    // Sort issues by updated_at (most recent first) and take first 5
    return filteredIssues
      .sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at) : new Date(0);
        const dateB = b.updated_at ? new Date(b.updated_at) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((issue) => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        date: issue.updated_at ? new Date(issue.updated_at).toLocaleDateString() : "Unknown",
        user: issue.reporter?.name || "Unknown User",
      }));
  }, [issues, timeFrame]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm leading-5 text-red-700">Error loading chart data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Status Distribution Chart */}
      <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>

        <div className="space-y-4">
          {/* Pending */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-500">Pending</span>
              <span className="text-sm font-medium text-gray-700">{pendingPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-yellow-400 h-2.5 rounded-full"
                style={{ width: `${pendingPercent}%` }}></div>
            </div>
          </div>

          {/* In Progress */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-500">In Progress</span>
              <span className="text-sm font-medium text-gray-700">{inProgressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${inProgressPercent}%` }}></div>
            </div>
          </div>

          {/* Completed */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-500">Completed</span>
              <span className="text-sm font-medium text-gray-700">{completedPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: `${completedPercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className="text-center p-3 bg-yellow-50 rounded-md">
            <span className="text-xl font-semibold text-yellow-700">{getStatusDistribution.pending}</span>
            <p className="text-xs text-gray-500 mt-1">Pending</p>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-md">
            <span className="text-xl font-semibold text-indigo-700">{getStatusDistribution.inProgress}</span>
            <p className="text-xs text-gray-500 mt-1">In Progress</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-md">
            <span className="text-xl font-semibold text-green-700">{getStatusDistribution.completed}</span>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
        </div>
      </div>

      {/* Recent Activity / Time Trend */}
      <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setTimeFrame("week")}
              className={`px-3 py-1 text-sm font-medium rounded-l-md ${timeFrame === "week" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
              Week
            </button>
            <button
              onClick={() => setTimeFrame("month")}
              className={`px-3 py-1 text-sm font-medium rounded-r-md ${timeFrame === "month" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
              Month
            </button>
          </div>
        </div>

        {recentActivity.length > 0 ? (
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li
                  key={activity.id}
                  className="py-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          activity.status.includes("complete") ? "bg-green-500" : activity.status.includes("progress") ? "bg-indigo-500" : "bg-yellow-500"
                        }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 truncate">by {activity.user}</p>
                    </div>
                    <div className="text-right text-xs text-gray-500">{activity.date}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-56 bg-gray-50 rounded-md">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCharts;
