import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Community Issues Tracker</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-lg border-4 border-dashed border-gray-200 p-4 text-center">
              <h2 className="text-xl font-semibold mb-4">Report and track community issues in your area</h2>
              <p className="mb-6">Join our platform to submit and view local community issues.</p>
              {user ? (
                <Link
                  to="/dashboard"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Go to Dashboard
                </Link>
              ) : (
                <div className="space-x-4">
                  <Link
                    to="/login"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
