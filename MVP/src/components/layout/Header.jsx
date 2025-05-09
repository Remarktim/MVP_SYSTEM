// src/components/Header.jsx - With centered search bar and responsive button
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";

const Header = ({ title = "Completed Reports" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  // Check if current page is the submit issue page
  const isSubmitPage = location.pathname === "/submit-issue";

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchTerm);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center">
          {/* Page Title - Full width on mobile, left-aligned on desktop */}
          <h1 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0 md:w-1/4">{title}</h1>

          {/* Center Section - Search Bar */}
          <div className="w-full md:w-2/4 flex justify-center">
            <form
              onSubmit={handleSearch}
              className="w-full max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 text-gray-400">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Section - Action Button (hidden on mobile) */}
          <div className="hidden md:flex md:w-1/4 md:justify-end mt-4 md:mt-0">
            {/* Conditionally show Report New Issue button */}
            {!isSubmitPage && (
              <Link
                to="/submit-issue"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
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
