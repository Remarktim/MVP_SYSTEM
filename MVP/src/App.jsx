import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import UserReports from "./pages/UserReports";
import IssueDetail from "./pages/IssueDetail";
import ResetPassword from "./pages/ResetPassword";
import SubmitIssue from "./pages/SubmitIssue";
import Profile from "./pages/Profile";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCharts from "./pages/AdminCharts";
import AdminIssues from "./pages/AdminIssues";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import ReportDetail from "./pages/ReportDetail";
import AuthRedirect from "./pages/AuthRedirect";
import AdminProfile from "./pages/AdminProfile";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Admin route component - updated to check both user_metadata and app_metadata
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check for admin role in both metadata objects
  const hasAdminRole = isAdmin || user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin";

  if (!hasAdminRole) {
    console.log("Access denied: User is not an admin", {
      email: user.email,
      metadata: user.user_metadata,
      app_metadata: user.app_metadata,
    });
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Use AuthRedirect component for root path */}
          <Route
            path="/"
            element={<AuthRedirect />}
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/signup"
            element={<Signup />}
          />
          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />
          <Route
            path="/home"
            element={<Home />}
          />

          {/* Dashboard - Reports Feed */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* My Reports Page */}
          <Route
            path="/my-issues"
            element={
              <ProtectedRoute>
                <UserReports />
              </ProtectedRoute>
            }
          />

          {/* Issue Detail Page */}
          <Route
            path="/issues/:id"
            element={
              <ProtectedRoute>
                <IssueDetail />
              </ProtectedRoute>
            }
          />

          {/* Submit New Issue Page */}
          <Route
            path="/submit-issue"
            element={
              <ProtectedRoute>
                <SubmitIssue />
              </ProtectedRoute>
            }
          />

          {/* User Profile Page */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
            <Route
              index
              element={<AdminDashboard />}
            />
            <Route
              path="charts"
              element={<AdminCharts />}
            />
            <Route
              path="issues"
              element={<AdminIssues />}
            />
            <Route
              path="reports/:id"
              element={<ReportDetail />}
            />
            <Route
              path="users"
              element={<AdminUsers />}
            />
            <Route
              path="settings"
              element={<AdminSettings />}
            />
            <Route
              path="profile"
              element={<AdminProfile />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
