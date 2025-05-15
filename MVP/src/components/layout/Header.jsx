// src/components/Header.jsx - Modified to conditionally display search
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";

const Header = ({ title = "Completed Reports", showSearch = true, onSearch = null }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  // Check if current page is the submit issue page
  const isSubmitPage = location.pathname === "/submit-issue";

  const handleSearch = (e) => {
    e.preventDefault();
    // Call the onSearch prop function if it exists
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Perform real-time search if onSearch exists and value length is at least 2 characters or empty
    if (onSearch && (value.length >= 2 || value === "")) {
      onSearch(value);
    }
  };

  return (
    <header className="bg-white border-b border-logo-light-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center">
          {/* Page Title - Full width on mobile, left-aligned on desktop */}
          <h1 className="text-lg font-semibold text-logo-dark-blue mb-4 md:mb-0 md:w-1/4">{title}</h1>

          {/* Center Section - Search Bar (conditionally shown) */}
          {showSearch && (
            <div className="w-full md:w-2/4 flex justify-center">
              <form
                onSubmit={handleSearch}
                className="w-full max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-logo-vibrant-blue focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-2.5 text-gray-400">
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={`hidden md:flex md:w-1/4 md:justify-end mt-4 md:mt-0 ${!showSearch ? "md:w-3/4" : ""}`}>
            {!isSubmitPage && (
              <Link
                to="/submit-issue"
                className="inline-flex items-center rounded-xl py-2 px-4 border border-transparent text-sm font-medium shadow-sm text-white bg-logo-vibrant-blue hover:bg-logo-dark-blue">
                Report New Issue
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
