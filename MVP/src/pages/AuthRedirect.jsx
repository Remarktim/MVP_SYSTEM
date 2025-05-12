import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AuthRedirect = () => {
  const { user, isAdmin, loading } = useAuth();
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    // Only set the redirect path once loading is complete
    if (!loading) {
      if (!user) {
        console.log("No user found, redirecting to login");
        setRedirectPath("/login");
      } else if (isAdmin) {
        console.log("Admin user detected, redirecting to admin dashboard");
        setRedirectPath("/admin");
      } else {
        console.log("Regular user detected, redirecting to user dashboard");
        setRedirectPath("/dashboard");
      }
    }
  }, [user, isAdmin, loading]);

  // Show loading spinner while determining where to redirect
  if (loading || !redirectPath) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-lg text-gray-600">Redirecting...</span>
      </div>
    );
  }

  // Redirect once path is determined
  return (
    <Navigate
      to={redirectPath}
      replace
    />
  );
};

export default AuthRedirect;
