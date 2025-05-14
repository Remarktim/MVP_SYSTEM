import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { supabase } from "../../supabase";

const ISSUES_PER_PAGE = 10;

export default function DatabaseIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetchIssues() {
      try {
        setLoading(true);
        setError(null);

        const from = (currentPage - 1) * ISSUES_PER_PAGE;
        const to = from + ISSUES_PER_PAGE - 1;

        // Fetch issues with join to get reporter names
        const {
          data,
          error: fetchError,
          count,
        } = await supabase
          .from("issues")
          .select(
            `
            id, 
            title, 
            description, 
            location, 
            status, 
            created_at,
            user_id,
            profiles(name)
          `,
            { count: "exact" }
          )
          .order("created_at", { ascending: false })
          .range(from, to);

        if (fetchError) throw fetchError;

        // Format the data to flatten the join result
        const formattedData =
          data?.map((issue) => ({
            ...issue,
            reporter_name: issue.profiles?.name || "Unknown",
          })) || [];

        setIssues(formattedData);
        setTotalPages(Math.ceil((count || 0) / ISSUES_PER_PAGE));
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to load issues. " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get color for status badge
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
      case "pending":
      case "under review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
      case "closed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Issues</h2>

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">{error}</div>}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="animate-pulse">Loading issues...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500">
                      No issues found
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{issue.reporter_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{issue.title || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="line-clamp-2 overflow-hidden max-w-xs">{issue.description || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.location || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(issue.status)}`}>{issue.status || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.created_at ? new Date(issue.created_at).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="py-3 px-4 flex items-center justify-between border-t border-gray-200">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                <FiChevronLeft className="mr-2 h-5 w-5" />
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                Next
                <FiChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
