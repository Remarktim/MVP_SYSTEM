import React, { memo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase";

// Import icons from library of your choice (this example uses react-icons)
import { RxDashboard } from "react-icons/rx";
import { IoBarChartOutline } from "react-icons/io5";
import { LuListTodo, LuMenu } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { BiSolidDiamond } from "react-icons/bi";
import { MdOutlineStorage } from "react-icons/md";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { TbBug } from "react-icons/tb";

// Create active issues context to share the count
const ActiveIssuesContext = React.createContext(0);

export const useActiveIssues = () => React.useContext(ActiveIssuesContext);

// Group navigation items by category
export const navItems = [
  // Main group
  {
    category: "MAIN",
    items: [
      { text: "Dashboard", icon: <RxDashboard className="h-5 w-5" />, path: "/admin" },
      { text: "Analytics", icon: <IoBarChartOutline className="h-5 w-5" />, path: "/admin/charts" },
      { text: "All Issues", icon: <LuListTodo className="h-5 w-5" />, path: "/admin/issues", showBadge: true },
    ],
  },
];

// Database menu items
export const databaseItems = [
  { text: "Issues", icon: <TbBug className="h-5 w-5" />, path: "/admin/database/issues" },
  { text: "Users", icon: <FiUsers className="h-5 w-5" />, path: "/admin/users" },
];

// ========== Brand Logo Component ==========
export const BrandLogo = memo(() => (
  <div className="flex items-center">
    <span className="text-base font-semibold whitespace-nowrap">MVP</span>
  </div>
));

BrandLogo.displayName = "BrandLogo";

// ========== Category Label Component ==========
const CategoryLabel = memo(({ category, open, isMobile }) => {
  // Only render when sidebar is open or on mobile
  if (!(open && !isMobile) && !isMobile) return null;

  return <span className="px-3 pt-2 pb-1 block font-semibold text-xs text-gray-500 tracking-wider">{category}</span>;
});

CategoryLabel.displayName = "CategoryLabel";

// Active Issues Provider
export const ActiveIssuesProvider = ({ children }) => {
  const [activeIssuesCount, setActiveIssuesCount] = useState(0);
  // Use refs to track subscription state across re-renders
  const channelRef = useRef(null);
  const isSubscribedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Fetch count function that can be called multiple times safely
  const fetchActiveIssuesCount = async () => {
    if (!isMountedRef.current) return;

    try {
      const { count, error } = await supabase.from("issues").select("*", { count: "exact", head: true }).or("status.eq.Under Review,status.eq.In Progress");

      if (error) {
        console.error("Error fetching active issues count:", error);
        return;
      }

      if (isMountedRef.current) {
        setActiveIssuesCount(count || 0);
      }
    } catch (err) {
      console.error("Error in active issues count query:", err);
    }
  };

  useEffect(() => {
    // Set up mounted ref
    isMountedRef.current = true;

    // Always fetch the count initially, regardless of subscription status
    fetchActiveIssuesCount();

    // Only set up subscription if we haven't already
    if (!isSubscribedRef.current) {
      // Release any existing channel first
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (err) {
          console.error("Error cleaning up existing channel:", err);
        }
        channelRef.current = null;
      }

      const channelName = "admin-sidebar-issues-counter";
      const handleDatabaseChange = () => fetchActiveIssuesCount();

      try {
        // Create new channel
        const newChannel = supabase.channel(channelName);
        channelRef.current = newChannel;

        // Set up listener but don't subscribe yet
        newChannel.on("postgres_changes", { event: "*", schema: "public", table: "issues" }, handleDatabaseChange);

        // Attempt subscription with proper status handling
        newChannel.subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log(`Successfully subscribed to: ${channelName}`);
            isSubscribedRef.current = true;
          } else if (err) {
            console.error(`Channel subscription error (${status}):`, err);
            // Don't mark as subscribed if there was an error
            isSubscribedRef.current = false;
          }
        });
      } catch (err) {
        console.error("Exception during channel setup:", err);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;

      // We intentionally don't reset isSubscribedRef here to prevent
      // resubscription during StrictMode's double mount/unmount cycle

      if (channelRef.current) {
        try {
          console.log("Cleaning up subscription in useEffect cleanup");
          supabase.removeChannel(channelRef.current);
        } catch (err) {
          console.error("Error removing channel during cleanup:", err);
        }
        channelRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs once

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      // This second useEffect is a safety net to ensure cleanup
      // when the component truly unmounts (not just during StrictMode's checks)
      if (channelRef.current) {
        try {
          console.log("Final channel cleanup on true unmount");
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          isSubscribedRef.current = false;
        } catch (err) {
          console.error("Error in final cleanup:", err);
        }
      }
    };
  }, []);

  return <ActiveIssuesContext.Provider value={activeIssuesCount}>{children}</ActiveIssuesContext.Provider>;
};

// ========== Sidebar Navigation Item ==========
export const NavItem = memo(({ item, open, isActive, isMobile }) => {
  // Get active issues count if this is the All Issues item
  const activeIssuesCount = useActiveIssues();
  const showBadge = item.showBadge && activeIssuesCount > 0;

  return (
    <div
      className="group"
      title={!open && !isMobile ? item.text : ""}>
      <div className="px-1 mb-0.5">
        <Link
          to={item.path}
          className={`flex items-center min-h-[46px] px-2.5 mx-1 rounded-md relative
            ${
              isActive
                ? "bg-indigo-50 text-indigo-600 before:content-[''] before:absolute before:top-1/2 before:left-0 before:-translate-y-1/2 before:h-3/4 before:w-0.5 before:bg-indigo-600 before:rounded-r"
                : "text-gray-700 hover:bg-gray-100"
            }`}>
          <div className={`flex justify-center ${(open && !isMobile) || isMobile ? "mr-3" : "mx-auto"}`}>
            {React.cloneElement(item.icon, {
              className: `h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-500"}`,
            })}
          </div>

          {/* Only show text when sidebar is open or on mobile */}
          {((open && !isMobile) || isMobile) && (
            <div className="flex items-center justify-between flex-1">
              <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{item.text}</span>

              {/* Notification badge for active issues */}
              {showBadge && <span className="bg-red-500 text-white text-xs py-0.5 px-2 rounded-full font-medium">{activeIssuesCount}</span>}

              {/* Active indicator chip */}
              {isActive && open && !isMobile && !showBadge && <span className="bg-indigo-100 text-indigo-600 text-[10px] py-0.5 px-2 rounded-full font-medium hidden sm:flex">Active</span>}
            </div>
          )}

          {/* Show badge even when sidebar is collapsed */}
          {!(open && !isMobile) && !isMobile && showBadge && (
            <div className="absolute top-1 right-1">
              <span className="bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">{activeIssuesCount}</span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
});

NavItem.displayName = "NavItem";

// ========== Database Dropdown Component ==========
const DatabaseDropdown = memo(({ open, isMobile, location }) => {
  const [expandDatabase, setExpandDatabase] = useState(false);

  // Update the check to handle all database items including /admin/users
  const isDatabaseActive = React.useMemo(() => {
    // Check if current path exactly matches any item in databaseItems
    const isExactMatch = databaseItems.some((item) => location.pathname === item.path);

    // Also keep the original check for paths that contain /admin/database
    const isSubpathMatch = location.pathname.includes("/admin/database");

    return isExactMatch || isSubpathMatch;
  }, [location.pathname]);

  // Auto-expand dropdown if navigating to a database page
  React.useEffect(() => {
    if (isDatabaseActive && ((open && !isMobile) || isMobile)) {
      setExpandDatabase(true);
    }
  }, [isDatabaseActive, open, isMobile, location]);

  // If sidebar collapses, collapse the dropdown too
  React.useEffect(() => {
    if (!open && !isMobile) {
      setExpandDatabase(false);
    }
  }, [open, isMobile]);

  // Only show dropdown content when sidebar is expanded or on mobile
  const showDropdownContent = (open && !isMobile) || isMobile;

  return (
    <>
      <div className="px-1 mb-0.5">
        <button
          onClick={() => showDropdownContent && setExpandDatabase(!expandDatabase)}
          className={`flex items-center w-full min-h-[46px] px-2.5 mx-1 rounded-md relative
            ${
              isDatabaseActive
                ? "bg-indigo-50 text-indigo-600 before:content-[''] before:absolute before:top-1/2 before:left-0 before:-translate-y-1/2 before:h-3/4 before:w-0.5 before:bg-indigo-600 before:rounded-r"
                : "text-gray-700 hover:bg-gray-100"
            }`}>
          <div className={`flex justify-center ${(open && !isMobile) || isMobile ? "mr-3" : "mx-auto"}`}>
            <MdOutlineStorage className={`h-5 w-5 ${isDatabaseActive ? "text-indigo-600" : "text-gray-500"}`} />
          </div>

          {/* Only show text when sidebar is open or on mobile */}
          {showDropdownContent && (
            <div className="flex items-center justify-between flex-1">
              <span className={`text-sm ${isDatabaseActive ? "font-semibold" : "font-medium"}`}>Database</span>
              {expandDatabase ? <IoChevronUp className="h-4 w-4" /> : <IoChevronDown className="h-4 w-4" />}
            </div>
          )}
        </button>
      </div>

      {/* Dropdown content */}
      {showDropdownContent && (
        <div className={`overflow-hidden transition-all duration-200 ease-in ${expandDatabase ? "max-h-40" : "max-h-0"}`}>
          <div className="ml-1 pr-1 pl-3 pb-0.5 border-l border-dashed border-gray-200">
            {databaseItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.text}
                  to={item.path}
                  className={`flex items-center min-h-[38px] py-0.75 px-2.5 mx-1 rounded-md
                    ${isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-700 hover:bg-gray-100"}`}>
                  <div className="mr-2">
                    {React.cloneElement(item.icon, {
                      className: `h-4 w-4 ${isActive ? "text-indigo-600" : "text-gray-500"}`,
                    })}
                  </div>
                  <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{item.text}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
});

DatabaseDropdown.displayName = "DatabaseDropdown";

// ========== Sidebar Content ==========
const SidebarContent = memo(({ open, isMobile, handleDrawerToggle, location }) => {
  return (
    <div className="h-full">
      <div className="px-2 h-16 flex items-center">
        {(open || isMobile) && (
          <div className="flex items-center w-full justify-between">
            <BrandLogo />
            {isMobile && (
              <button
                onClick={handleDrawerToggle}
                className="p-1 rounded-full hover:bg-gray-100">
                <LuMenu className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="border-b border-gray-200" />
      <div className="py-1">
        <div className="px-1">
          {/* Render grouped navigation items */}
          {navItems.map((group, index) => (
            <React.Fragment key={group.category}>
              {/* Add spacing before categories except the first one */}
              {index > 0 && <div className="h-2" />}

              <CategoryLabel
                category={group.category}
                open={open}
                isMobile={isMobile}
              />

              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavItem
                    key={item.text}
                    item={item}
                    open={open}
                    isActive={isActive}
                    isMobile={isMobile}
                  />
                );
              })}
            </React.Fragment>
          ))}

          {/* Add space before Database section */}
          <div className="h-2" />

          {/* Database Category */}
          <CategoryLabel
            category="DATABASE"
            open={open}
            isMobile={isMobile}
          />

          {/* Database Dropdown */}
          <DatabaseDropdown
            open={open}
            isMobile={isMobile}
            location={location}
          />
        </div>
      </div>
    </div>
  );
});

SidebarContent.displayName = "SidebarContent";

// Wrap SidebarContent with the ActiveIssuesProvider
const SidebarContentWithProvider = (props) => (
  <ActiveIssuesProvider>
    <SidebarContent {...props} />
  </ActiveIssuesProvider>
);

SidebarContentWithProvider.displayName = "SidebarContentWithProvider";

export default SidebarContentWithProvider;
