import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, lazy, Suspense } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "react-hot-toast";

// Lazily load page components
const Login = lazy(() => import("./components/auth/Login"));
const Signup = lazy(() => import("./components/auth/Signup"));
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserReports = lazy(() => import("./pages/UserReports"));
const IssueDetail = lazy(() => import("./pages/IssueDetail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SubmitIssue = lazy(() => import("./pages/SubmitIssue"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminCharts = lazy(() => import("./pages/AdminCharts"));
const AdminIssues = lazy(() => import("./pages/AdminIssues"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const ReportDetail = lazy(() => import("./pages/ReportDetail"));
const AuthRedirect = lazy(() => import("./pages/AuthRedirect"));
const DatabaseIssues = lazy(() => import("./pages/admin/DatabaseIssues"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));

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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Suspense fallback={<div>Loading...</div>}>
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

            {/* Admin Login - separate from user login */}
            <Route
              path="/admin-login"
              element={<AdminLogin />}
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

            {/* Admin routes - using new AdminRoute component */}
            <Route element={<AdminRoute />}>
              <Route
                path="/admin"
                element={<AdminLayout />}>
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
                  path="profile"
                  element={<AdminProfile />}
                />
                <Route
                  path="settings"
                  element={<AdminSettings />}
                />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
