// src/components/Navbar.jsx - With centered navigation links
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart2, Home, Clipboard } from "lucide-react";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth hook

const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth(); // Get user and signOut function

  // State for profile dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);

  // User profile info
  const fullName = user?.user_metadata?.full_name || "User";
  const userEmail = user?.email || "";
  const userInitial = (fullName || "U").charAt(0).toUpperCase();

  // Helper to determine active link
  const isActive = (path) => {
    return location.pathname === path ? "text-indigo-600 border-indigo-600" : "text-gray-500 border-transparent hover:text-indigo-500 hover:border-indigo-500";
  };

  // Check if current page is the submit issue page
  const isSubmitPage = location.pathname === "/submit-issue";

  // Close dropdown on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // Close dropdown if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto">
        {/* Desktop navbar - with 3 sections */}
        <div className="hidden md:flex md:items-center md:justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left section - Logo */}
          <div className="flex items-center flex-shrink-0 w-1/4">
            <BarChart2 className="h-8 w-8 text-indigo-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-800">Community Connect MVP</h1>
          </div>

          {/* Center section - Navigation Links */}
          <div className="flex flex-grow justify-center w-2/4">
            <div className="inline-flex space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive("/dashboard")}`}>
                <Home className="mr-1 h-4 w-4" />
                Home
              </Link>
              <Link
                to="/my-issues"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive("/my-issues")}`}>
                <Clipboard className="mr-1 h-4 w-4" />
                My Reports
              </Link>
            </div>
          </div>

          {/* Right section - Profile dropdown */}
          <div className="flex items-center justify-end w-1/4">
            <div className="relative">
              <button
                ref={trigger}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center">
                <div className="relative w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700">
                  <span className="text-lg font-medium">{userInitial}</span>
                  <span className="absolute -right-0.5 -top-0.5 block h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                </div>
              </button>
              <div
                ref={dropdown}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setDropdownOpen(false)}
                className={`absolute right-0 top-full mt-1 w-[240px] divide-y z-50 divide-gray-200 overflow-hidden rounded-lg bg-white shadow-lg ${dropdownOpen ? "block" : "hidden"}`}>
                <div className="flex flex-col px-4 py-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative aspect-square w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <span className="text-lg font-medium">{userInitial}</span>
                      <span className="absolute -right-0.5 -top-0.5 block h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{fullName}</p>
                    </div>
                  </div>
                  <div className="mt-1 py-2 px-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500 break-all">{userEmail}</p>
                  </div>
                </div>
                <div>
                  <Link
                    to="/profile"
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    View profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Settings
                  </Link>
                </div>
                <div>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-50">
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile navbar - Top */}
        <div className="md:hidden flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <BarChart2 className="h-8 w-8 text-indigo-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-800">Community Connect MVP</h1>
          </div>
        </div>

        {/* Mobile navbar - Bottom */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 z-50">
          <div className="flex justify-between px-4 py-3">
            <Link
              to="/dashboard"
              className={`flex flex-col items-center px-3 py-1 rounded-md ${location.pathname === "/dashboard" ? "text-indigo-600" : "text-gray-500"}`}>
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link
              to="/my-issues"
              className={`flex flex-col items-center px-3 py-1 rounded-md ${location.pathname === "/my-issues" ? "text-indigo-600" : "text-gray-500"}`}>
              <Clipboard className="h-6 w-6" />
              <span className="text-xs mt-1">My Reports</span>
            </Link>
            {/* Keep Submit button in mobile view even when the header button is hidden */}
            {!isSubmitPage ? (
              <Link
                to="/submit-issue"
                className="flex flex-col items-center px-3 py-1 rounded-md text-indigo-600">
                <div className="bg-indigo-600 text-white rounded-full p-1.5 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
                <span className="text-xs mt-1">Report</span>
              </Link>
            ) : (
              <div className="flex flex-col items-center px-3 py-1 rounded-md text-indigo-600">
                <div className="bg-indigo-600 text-white rounded-full p-1.5 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
                <span className="text-xs mt-1">Report</span>
              </div>
            )}
            {/* Profile button for mobile - opens the profile page */}
            <Link
              to="/profile"
              className={`flex flex-col items-center px-3 py-1 rounded-md ${location.pathname === "/profile" ? "text-indigo-600" : "text-gray-500"}`}>
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">{userInitial}</div>
                <span className="absolute -right-0.5 -top-0.5 block h-1.5 w-1.5 rounded-full border-1 border-white bg-green-500"></span>
              </div>
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
