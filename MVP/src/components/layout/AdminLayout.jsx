import React, { lazy, useMemo, useCallback, useEffect, useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

// Import separated components using lazy loading
const TopNavBar = lazy(() => import("./AdminHeader"));
const SidebarContent = lazy(() => import("./AdminSidebar"));
import { navItems } from "./AdminSidebar";

// Fallback component when lazy components are loading
const LoadingFallback = () => <div className="h-full w-full"></div>;

// Constants
const drawerWidth = 260;
const collapsedWidth = 72;

// ========== Main Layout Component ==========
export default function AdminLayout() {
  // State management
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Hooks
  const location = useLocation();

  // Check for mobile screens
  const isMobileScreen = () => window.innerWidth < 768;
  const isSmallScreen = () => window.innerWidth < 640;
  const [isMobile, setIsMobile] = useState(isMobileScreen());
  const [isSmall, setIsSmall] = useState(isSmallScreen());

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileScreen());
      setIsSmall(isSmallScreen());
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get current page title - memoized to prevent recalculation on every render
  const currentPage = useMemo(() => {
    const found = navItems.flatMap((group) => group.items).find((item) => location.pathname === item.path);
    return found ? found.text : "Admin";
  }, [location.pathname]);

  // Auto-collapse sidebar on mobile/small screens
  useEffect(() => {
    if (isMobile && open) {
      setOpen(false);
    } else if (!isMobile && !open && !isSmall) {
      setOpen(true);
    }
  }, [isMobile, isSmall, open]);

  // Toggle drawer for mobile view
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [mobileOpen]);

  // Collapse drawer for desktop view
  const handleDrawerCollapse = useCallback(() => {
    setOpen(!open);
  }, [open]);

  // User profile menu handlers
  const handleMenu = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Notification menu handlers
  const handleNotifMenu = useCallback((event) => {
    setNotifAnchorEl(event.currentTarget);
  }, []);

  const handleNotifClose = useCallback(() => {
    setNotifAnchorEl(null);
  }, []);

  // Theme toggle handler
  const handleThemeToggle = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode]);

  // Props for sidebar content
  const sidebarContentProps = useMemo(
    () => ({
      open,
      isMobile: false,
      handleDrawerToggle,
      location,
    }),
    [open, handleDrawerToggle, location]
  );

  // Props for top navbar
  const topNavBarProps = useMemo(
    () => ({
      open,
      isMobile,
      currentPage,
      handleDrawerCollapse,
      handleDrawerToggle,
      handleThemeToggle,
      handleNotifMenu,
      handleMenu,
      isDarkMode,
      notifAnchorEl,
      anchorEl,
      handleNotifClose,
      handleClose,
      drawerWidth,
      collapsedWidth,
    }),
    [open, isMobile, currentPage, handleDrawerCollapse, handleDrawerToggle, handleThemeToggle, handleNotifMenu, handleMenu, isDarkMode, notifAnchorEl, anchorEl, handleNotifClose, handleClose]
  );

  // Props for mobile sidebar content
  const mobileSidebarContentProps = useMemo(
    () => ({
      open: true, // Always fully open in mobile drawer mode
      isMobile: true,
      handleDrawerToggle,
      location,
    }),
    [handleDrawerToggle, location]
  );

  // Memoize Tailwind classes without template strings
  const sidebarWidth = open ? "w-[260px]" : "w-[72px]";
  const mainWidth = open ? "w-[calc(100%-260px)]" : "w-[calc(100%-72px)]";

  return (
    <div className="flex min-h-screen overflow-hidden relative">
      {/* Top Navigation Bar */}
      <Suspense fallback={<LoadingFallback />}>
        <TopNavBar {...topNavBarProps} />
      </Suspense>

      {/* Sidebar Navigation - Only for desktop */}
      <div
        className={`transition-all duration-200 ease-in-out hidden md:block flex-shrink-0 z-[1100] ${sidebarWidth}`}
        aria-label="navigation sidebar">
        {/* Desktop Drawer - Fixed position */}
        <div className={`h-full border-r border-gray-200 overflow-x-hidden transition-all duration-200 ease-in-out ${sidebarWidth}`}>
          <Suspense fallback={<LoadingFallback />}>
            <SidebarContent {...sidebarContentProps} />
          </Suspense>
        </div>
      </div>

      {/* Mobile Drawer - This appears as an overlay */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-[1300] transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={handleDrawerToggle}>
          <div
            className={`fixed inset-y-0 left-0 w-[260px] bg-white shadow-lg transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out`}
            onClick={(e) => e.stopPropagation()}>
            <Suspense fallback={<LoadingFallback />}>
              <SidebarContent {...mobileSidebarContentProps} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-grow overflow-auto h-screen relative z-[1] bg-gray-50 transition-all duration-200 ease-in-out ${isMobile ? "w-full" : mainWidth}`}>
        <div className="h-16"></div> {/* Spacer for the AppBar */}
        {/* Content container with padding */}
        <div className="p-4 sm:p-6">
          <Outlet /> {/* Render child routes */}
        </div>
      </div>
    </div>
  );
}
