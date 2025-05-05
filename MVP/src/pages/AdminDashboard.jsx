// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../contexts/AuthContext";

const AdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Fetch all issues for admin view
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

  const updateIssueStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from("issues").update({ status: newStatus }).eq("id", id);

      if (error) throw error;

      // Update local state
      setIssues(issues.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue)));
    } catch (error) {
      console.error("Error updating issue:", error.message);
    }
  };

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
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">Admin: {user?.email}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Manage Community Issues</h2>
            <p className="mt-1 text-sm text-gray-600">Review and update the status of reported community issues</p>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="spinner">Loading...</div>
            </div>
          ) : issues.length > 0 ? (
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issue
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
                            Reported on
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {issues.map((issue) => (
                          <tr key={issue.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{issue.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{issue.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${issue.status === "Under Review" ? "bg-yellow-100 text-yellow-800" : issue.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                                {issue.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(issue.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {issue.status === "Under Review" && (
                                <button
                                  onClick={() => updateIssueStatus(issue.id, "In Progress")}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3">
                                  Move to In Progress
                                </button>
                              )}
                              {issue.status === "In Progress" && (
                                <button
                                  onClick={() => updateIssueStatus(issue.id, "Completed")}
                                  className="text-green-600 hover:text-green-900">
                                  Mark as Completed
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-gray-900">No issues reported yet</h3>
              <p className="mt-1 text-sm text-gray-500">Community members haven't reported any issues.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
