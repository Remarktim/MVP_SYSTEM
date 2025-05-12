import React, { memo, useState } from "react";
import { Link } from "react-router-dom";

// Import icons from library of your choice (this example uses react-icons)
import { RxDashboard } from "react-icons/rx";
import { IoBarChartOutline } from "react-icons/io5";
import { LuListTodo, LuMenu } from "react-icons/lu";
import { FiUsers, FiUser } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { BiSolidDiamond } from "react-icons/bi";
import { MdOutlineStorage } from "react-icons/md";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { TbBug } from "react-icons/tb";

// Group navigation items by category
export const navItems = [
  // Main group
  {
    category: "MAIN",
    items: [
      { text: "Dashboard", icon: <RxDashboard className="h-5 w-5" />, path: "/admin" },
      { text: "Analytics", icon: <IoBarChartOutline className="h-5 w-5" />, path: "/admin/charts" },
      { text: "All Issues", icon: <LuListTodo className="h-5 w-5" />, path: "/admin/issues" },
      { text: "Profile", icon: <FiUser className="h-5 w-5" />, path: "/admin/profile" },
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
    <BiSolidDiamond className="text-indigo-600 mr-2 h-5 w-5" />
    <span className="text-base font-semibold whitespace-nowrap">Mantis</span>
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

// ========== Sidebar Navigation Item ==========
export const NavItem = memo(({ item, open, isActive, isMobile }) => {
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

              {/* Active indicator chip */}
              {isActive && open && !isMobile && <span className="bg-indigo-100 text-indigo-600 text-[10px] py-0.5 px-2 rounded-full font-medium hidden sm:flex">Active</span>}
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

  // Check if any database path is active
  const isDatabaseActive = location.pathname.includes("/admin/database");

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

export default SidebarContent;
