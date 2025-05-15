import React, { memo, useMemo, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiGithub, FiMenu } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { adminSignOut, getCurrentAdmin } from "../../utils/adminAuth";
import { Home } from "lucide-react";

// ========== User Profile Menu ==========
export const UserProfileMenu = memo(({ open, handleClose }) => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  // User profile info
  const fullName = user?.user_metadata?.full_name || "User";
  const userEmail = user?.email || "";
  const userInitial = (fullName || "U").charAt(0).toUpperCase();

  // Handle admin sign out
  const handleAdminSignOut = async () => {
    await adminSignOut();
    handleClose();
    navigate("/admin-login");
  };

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-1 w-[240px] divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-lg z-50">
      <div className="flex flex-col px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative aspect-square w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            <span className="text-lg font-medium">{userInitial}</span>
            <span className="absolute -right-0.5 -top-0.5 block h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{fullName}</p>
            {isAdmin && <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">Admin</span>}
          </div>
        </div>
        <div className="mt-1 py-2 px-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500 break-all">{userEmail}</p>
        </div>
      </div>
      <div>
        <Link
          to={isAdmin ? "/admin/profile" : "/profile"}
          className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          View profile
        </Link>
        <Link
          to="/dashboard"
          className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-gray-50">
          <span className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            User Dashboard
          </span>
        </Link>
        <button
          onClick={handleAdminSignOut}
          className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-50">
          Sign out
        </button>
      </div>
    </div>
  );
});

UserProfileMenu.displayName = "UserProfileMenu";

// ========== GitHub Icon Component ==========
export const GitHubIcon = memo(() => <FiGithub className="h-5 w-5" />);

GitHubIcon.displayName = "GitHubIcon";

const TopNavBar = memo(({ open, isMobile, currentPage, handleDrawerCollapse, handleDrawerToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);

  // Get admin user from our dedicated admin auth system
  const adminUser = getCurrentAdmin();

  // User profile info
  const fullName = adminUser?.user_metadata?.full_name || user?.user_metadata?.name || "Admin";
  const userEmail = adminUser?.email || user?.email || "";
  const userInitial = (fullName || "A").charAt(0).toUpperCase();

  // Handle admin sign out
  const handleAdminSignOut = async () => {
    await adminSignOut();
    setDropdownOpen(false);
    navigate("/admin-login");
  };

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

  // Calculate header position classes
  const headerPosition = useMemo(() => {
    if (isMobile) {
      return "fixed top-0 left-0 right-0";
    }
    return open ? "fixed top-0 left-[260px] right-0" : "fixed top-0 left-[72px] right-0";
  }, [open, isMobile]);

  return (
    <div className={`${headerPosition} bg-white border-b border-gray-200 shadow-sm z-10 transition-all duration-200 ease-in-out backdrop-blur-md`}>
      <div className="flex justify-between items-center h-16 px-4">
        {/* Left Side: Menu Toggle & Page Title */}
        <div className="flex items-center">
          <button
            className={`text-gray-700 hover:bg-gray-100 p-2 rounded-full mr-2 ${isMobile || !open ? "flex" : "hidden"}`}
            onClick={isMobile ? handleDrawerToggle : handleDrawerCollapse}
            aria-label="open drawer">
            <FiMenu className="h-5 w-5" />
          </button>

          <h1 className="text-lg font-medium text-gray-800 flex items-center">{currentPage}</h1>
        </div>

        {/* Right Side: User Profile Only */}
        <div className="flex items-center">
          {/* User Avatar */}
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
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">Admin</span>
                  </div>
                </div>
                <div className="mt-1 py-2 px-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500 break-all">{userEmail}</p>
                </div>
              </div>
              <div>
                <Link
                  to="/admin/profile"
                  className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  View profile
                </Link>
                <button
                  onClick={handleAdminSignOut}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-50">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TopNavBar.displayName = "TopNavBar";

export default TopNavBar;
