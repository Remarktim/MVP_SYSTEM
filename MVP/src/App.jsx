import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import DatabaseIssues from "./pages/admin/DatabaseIssues";

// Protected route component
const ProtectedRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
};

// Admin route component
const AdminRoute = () => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!isAdmin) {
    console.log("Access denied: User is not an admin", {
      email: user.email,
    });
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
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

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
            <Route
              path="/my-issues"
              element={<UserReports />}
            />
            <Route
              path="/issues/:id"
              element={<IssueDetail />}
            />
            <Route
              path="/submit-issue"
              element={<SubmitIssue />}
            />
            <Route
              path="/profile"
              element={<Profile />}
            />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
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
                path="database/issues"
                element={<DatabaseIssues />}
              />
              <Route
                path="settings"
                element={<AdminSettings />}
              />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
