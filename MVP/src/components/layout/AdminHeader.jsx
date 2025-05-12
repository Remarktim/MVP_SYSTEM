import React, { memo, useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiGithub, FiMenu } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useAuth } from "../../hooks/useAuth";
import { ShieldCheck, Home } from "lucide-react";

// ========== Notifications Menu ==========
export const NotificationsMenu = memo(({ open, handleClose }) => {
  if (!open) return null;

  return (
    <div className="absolute right-0 mt-1 w-72 bg-white rounded-md shadow-lg z-50 overflow-hidden">
      <div className="max-h-[300px] overflow-y-auto">
        <div
          className="py-2 px-4 hover:bg-gray-50 cursor-pointer"
          onClick={handleClose}>
          2 new notifications
        </div>
        <div
          className="py-2 px-4 hover:bg-gray-50 cursor-pointer"
          onClick={handleClose}>
          System update completed
        </div>
        <div className="border-t border-gray-100"></div>
        <div
          className="py-2 px-4 text-center text-indigo-600 hover:bg-gray-50 cursor-pointer"
          onClick={handleClose}>
          View all notifications
        </div>
      </div>
    </div>
  );
});

NotificationsMenu.displayName = "NotificationsMenu";

// ========== User Profile Menu ==========
export const UserProfileMenu = memo(({ open, handleClose }) => {
  const { user, signOut, isAdmin } = useAuth();

  // User profile info
  const fullName = user?.user_metadata?.full_name || "User";
  const userEmail = user?.email || "";
  const userInitial = (fullName || "U").charAt(0).toUpperCase();

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
          onClick={() => {
            signOut();
            handleClose();
          }}
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

const TopNavBar = memo(({ open, isMobile, currentPage, handleDrawerCollapse, handleDrawerToggle, handleThemeToggle, handleNotifMenu, isDarkMode, notifAnchorEl, handleNotifClose }) => {
  const { user, signOut, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);

  // User profile info
  const fullName = user?.user_metadata?.full_name || "User";
  const userInitial = (fullName || "U").charAt(0).toUpperCase();

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

        {/* Right Side: Actions & User Profile */}
        <div className="flex items-center">
          {/* Theme Toggle */}
          <button
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-full ml-1"
            onClick={handleThemeToggle}
            title={isDarkMode ? "Light Mode" : "Dark Mode"}>
            {isDarkMode ? <IoSunnyOutline className="h-5 w-5" /> : <IoMoonOutline className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-full ml-1"
              onClick={handleNotifMenu}
              title="Notifications">
              <div className="relative">
                <IoNotificationsOutline className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">2</span>
              </div>
            </button>
            {Boolean(notifAnchorEl) && (
              <NotificationsMenu
                open={Boolean(notifAnchorEl)}
                handleClose={handleNotifClose}
              />
            )}
          </div>

          {/* User Avatar */}
          <div className="relative">
            <button
              ref={trigger}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center ml-2">
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
                  <p className="text-sm text-gray-500 break-all">{user?.email || ""}</p>
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
                  onClick={() => {
                    signOut();
                    setDropdownOpen(false);
                  }}
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
