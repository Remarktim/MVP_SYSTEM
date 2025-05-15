import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentAdmin, initializeAdmin } from "../../utils/adminAuth";

const AdminRoute = () => {
  const [adminState, setAdminState] = useState({
    admin: null,
    loading: true,
  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // First try to get from memory/storage
        let admin = getCurrentAdmin();

        // If not found, try to initialize from session
        if (!admin) {
          admin = await initializeAdmin();
        }

        setAdminState({
          admin,
          loading: false,
        });
      } catch (error) {
        console.error("Error checking admin status:", error);
        setAdminState({
          admin: null,
          loading: false,
        });
      }
    };

    checkAdmin();
  }, []);

  if (adminState.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">Verifying admin access...</span>
      </div>
    );
  }

  if (!adminState.admin) {
    console.log("Access denied: Not authenticated as admin");
    return (
      <Navigate
        to="/admin-login"
        replace
      />
    );
  }

  return <Outlet />;
};

export default AdminRoute;
