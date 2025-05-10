import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import IssueTable from "../components/dashboard/IssueTable";
import AdminCharts from "../components/dashboard/AdminCharts";
import StatCards from "../components/dashboard/StatCards";
import ChartsSection from "../components/dashboard/ChartsSection";
import ResolutionModal from "../components/dashboard/ResolutionModal";
import { Search, Bell, ChevronDown, UserCircle, LogOut, PieChart, BarChart2, BarChart } from "lucide-react";

const AdminDashboard = () => {
  // State management
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [afterImage, setAfterImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Refs for UI elements
  const trigger = useRef(null);
  const dropdown = useRef(null);
  const searchInputRef = useRef(null);

  // Hooks
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Calculate stats from issues - memoized to avoid recalculation on every render
  const stats = useMemo(() => {
    if (!issues.length)
      return {
        totalIssues: 0,
        inProgress: 0,
        completed: 0,
        underReview: 0,
      };

    return {
      totalIssues: issues.length,
      inProgress: issues.filter((issue) => issue.status === "In Progress").length,
      completed: issues.filter((issue) => issue.status === "Completed").length,
      underReview: issues.filter((issue) => issue.status === "Under Review").length,
    };
  }, [issues]);

  // Fetch issues data
  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.from("issues").select("*, profiles(name)").order("created_at", { ascending: false });

      if (error) throw error;

      setIssues(data || []);
      setFilteredIssues(data || []);
    } catch (err) {
      console.error("Error fetching issues:", err.message);
      setError("Failed to load issues. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Dropdown click outside handler
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };

    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [dropdownOpen]);

  // Dropdown escape key handler
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [dropdownOpen]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredIssues(issues);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = issues.filter(
      (issue) =>
        issue.title?.toLowerCase().includes(lowerCaseQuery) ||
        issue.description?.toLowerCase().includes(lowerCaseQuery) ||
        issue.location?.toLowerCase().includes(lowerCaseQuery) ||
        issue.profiles?.name?.toLowerCase().includes(lowerCaseQuery)
    );

    setFilteredIssues(filtered);
  }, [searchQuery, issues]);

  // Handle image preview
  const handleImageChange = useCallback((e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setAfterImage(null);
      setImagePreview(null);
      return;
    }

    const file = e.target.files[0];

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setAfterImage(file);

    // Create a preview of the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Update issue status
  const updateIssueStatus = useCallback(async (id, newStatus) => {
    try {
      const { error } = await supabase.from("issues").update({ status: newStatus }).eq("id", id);

      if (error) throw error;

      // Update local state efficiently
      setIssues((prevIssues) => prevIssues.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue)));

      // Also update filtered issues if necessary
      setFilteredIssues((prevFiltered) => prevFiltered.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue)));
    } catch (err) {
      console.error("Error updating issue:", err.message);
      setError("Failed to update issue status. Please try again.");
    }
  }, []);

  // Open resolution modal
  const openResolutionModal = useCallback((issue) => {
    setSelectedIssue(issue);
    setResolutionNotes("");
    setAfterImage(null);
    setImagePreview(null);
    setIsModalOpen(true);
    setError(null);
  }, []);

  // Close resolution modal
  const closeResolutionModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIssue(null);
    setError(null);
  }, []);

  // Mark issue as completed
  const markAsCompleted = useCallback(async () => {
    if (!selectedIssue) return;
    if (!resolutionNotes.trim()) {
      setError("Resolution notes are required");
      return;
    }

    setUploadLoading(true);
    setError(null);

    try {
      let afterImagePath = null;

      // Upload after image if provided
      if (afterImage) {
        const fileExt = afterImage.name.split(".").pop();
        const fileName = `${selectedIssue.id}-after-${Date.now()}.${fileExt}`;
        const filePath = `issue-images/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("issue-images").upload(filePath, afterImage, {
          cacheControl: "3600",
          upsert: true,
        });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage.from("issue-images").getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          afterImagePath = urlData.publicUrl;
        }
      }

      // Update the issue status and add resolution notes
      const updateData = {
        status: "Completed",
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
      };

      // Add after image path if an image was uploaded
      if (afterImagePath) {
        updateData.after_image_path = afterImagePath;
      }

      const { error } = await supabase.from("issues").update(updateData).eq("id", selectedIssue.id);

      if (error) throw error;

      // Update local state
      const updateIssue = (issue) => {
        if (issue.id === selectedIssue.id) {
          return {
            ...issue,
            status: "Completed",
            resolution_notes: resolutionNotes,
            after_image_path: afterImagePath || issue.after_image_path,
            resolved_at: new Date().toISOString(),
          };
        }
        return issue;
      };

      setIssues((prev) => prev.map(updateIssue));
      setFilteredIssues((prev) => prev.map(updateIssue));

      closeResolutionModal();
    } catch (err) {
      console.error("Error marking issue as completed:", err.message);
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  }, [selectedIssue, resolutionNotes, afterImage, closeResolutionModal]);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Error signing out:", err.message);
    }
  }, [signOut, navigate]);

  // Handle search submit
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    // Search is already handled by the useEffect
    // Focus back to input for better UX
    searchInputRef.current?.focus();
  }, []);

  // Reset search
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setFilteredIssues(issues);
  }, [issues]);

  // Get user's name or initial for the avatar
  const userInitial = useMemo(() => {
    const name = user?.user_metadata?.full_name || user?.email || "U";
    return name.charAt(0).toUpperCase();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-48 w-full bg-white border-b border-gray-200 text-sm py-2.5 lg:ps-64 dark:bg-neutral-800 dark:border-neutral-700">
        <nav className="px-4 sm:px-6 flex basis-full items-center w-full mx-auto">
          <div className="me-5 lg:me-0 lg:hidden flex items-center">
            <a
              className="flex-none text-xl inline-block font-semibold focus:outline-none"
              href="#">
              <span className="font-bold text-gray-800 dark:text-white">Admin Dashboard</span>
            </a>
          </div>

          <div className="w-full flex items-center justify-end ms-auto md:justify-between gap-x-1 md:gap-x-3">
            <div className="hidden md:block">
              {/* Search Input */}
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5">
                    <Search className="size-4 text-gray-400 dark:text-white/60" />
                  </div>
                  <input
                    type="text"
                    ref={searchInputRef}
                    className="py-2 ps-10 pe-16 block w-full bg-white border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder:text-neutral-400 dark:focus:ring-neutral-600"
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Clear search</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="flex flex-row items-center justify-end gap-1">
              {/* Mobile search button */}
              <button
                type="button"
                onClick={() => searchInputRef.current?.focus()}
                className="md:hidden size-9.5 relative inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700">
                <Search className="size-4" />
                <span className="sr-only">Search</span>
              </button>

              {/* Notifications button */}
              <button
                type="button"
                className="size-9.5 relative inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700">
                <Bell className="size-4" />
                <span className="sr-only">Notifications</span>
                {/* Notification badge */}
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-neutral-800"></span>
              </button>

              {/* User Dropdown */}
              <div className="flex items-center">
                <div className="relative inline-block">
                  <button
                    ref={trigger}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2">
                    <div className="relative w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700">
                      <span className="text-lg font-medium">{userInitial}</span>
                      <span className="absolute -right-0.5 -top-0.5 block h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-neutral-800"></span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    ref={dropdown}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={() => setDropdownOpen(false)}
                    className={`absolute right-0 top-full mt-1 w-[240px] divide-y divide-gray-700 overflow-hidden rounded-lg bg-white shadow-lg dark:bg-neutral-800 dark:divide-neutral-700 ${
                      dropdownOpen ? "block" : "hidden"
                    }`}>
                    <div className="flex flex-col px-4 py-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative aspect-square w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                          <span className="text-lg font-medium">{userInitial}</span>
                          <span className="absolute -right-0.5 -top-0.5 block h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-neutral-800"></span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin User"}</p>
                          <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full dark:bg-indigo-900 dark:text-indigo-300">Admin</span>
                        </div>
                      </div>
                      <div className="mt-1 py-2 px-3 bg-gray-50 rounded-md dark:bg-neutral-700">
                        <p className="text-sm text-gray-500 break-all dark:text-neutral-400">{user?.email}</p>
                      </div>
                    </div>
                    <div>
                      <Link
                        to="/profile"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-700">
                        <UserCircle className="h-4 w-4" />
                        View profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-700">
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        User Dashboard
                      </Link>
                    </div>
                    <div>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-neutral-700">
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* End User Dropdown */}
            </div>
          </div>
        </nav>
      </header>
      {/* End Header */}

      {/* Sidebar */}
      <div
        id="hs-application-sidebar"
        className="hs-overlay w-64 h-full hidden fixed inset-y-0 start-0 z-60 bg-white border-e border-gray-200 lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 dark:bg-neutral-800 dark:border-neutral-700">
        <div className="relative flex flex-col h-full max-h-full">
          <div className="px-6 pt-4 flex items-center">
            {/* Logo */}
            <a
              className="flex-none text-xl font-semibold"
              href="#">
              <span className="text-blue-600 dark:text-white">Community Hub</span>
            </a>
            {/* End Logo */}
          </div>

          {/* Navigation */}
          <div className="h-full overflow-y-auto">
            <nav className="hs-accordion-group p-3 w-full flex flex-col flex-wrap">
              <ul className="flex flex-col space-y-1">
                <li>
                  <a
                    className="flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-gray-800 rounded-lg hover:bg-gray-100 dark:bg-neutral-700 dark:text-white"
                    href="#">
                    <svg
                      className="shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Dashboard
                  </a>
                </li>

                <li>
                  <Link
                    className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    to="/issues">
                    <svg
                      className="shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <rect
                        width="18"
                        height="18"
                        x="3"
                        y="4"
                        rx="2"
                        ry="2"
                      />
                      <line
                        x1="16"
                        x2="16"
                        y1="2"
                        y2="6"
                      />
                      <line
                        x1="8"
                        x2="8"
                        y1="2"
                        y2="6"
                      />
                      <line
                        x1="3"
                        x2="21"
                        y1="10"
                        y2="10"
                      />
                    </svg>
                    All Issues
                  </Link>
                </li>

                <li>
                  <Link
                    className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    to="/users">
                    <svg
                      className="shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle
                        cx="9"
                        cy="7"
                        r="4"
                      />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Users
                  </Link>
                </li>

                <li>
                  <Link
                    className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    to="/settings">
                    <svg
                      className="shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />
                    </svg>
                    Settings
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          {/* End Navigation */}
        </div>
      </div>
      {/* End Sidebar */}

      {/* Main Content */}
      <div className="w-full lg:ps-64">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Page Title */}
          <div className="px-4 sm:px-0 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">Manage community issues and track metrics</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 dark:bg-red-900/30 dark:border-red-800">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setError(null)}
                      className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:text-red-400 dark:hover:bg-red-900">
                      <span className="sr-only">Dismiss</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards Section */}
          {loading ? (
            <div className="text-center py-5">
              <div
                className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"
                role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <StatCards stats={stats} />
          )}

          {/* Charts Section */}
          {!loading && <AdminCharts issues={filteredIssues} />}

          {/* Issues Table */}
          <div className="mt-6">
            {/* Filter controls */}
            <div className="flex justify-between items-center mb-4 px-4 sm:px-0">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Community Issues</h3>

              {/* Filter dropdown could go here */}
              {searchQuery && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredIssues.length} of {issues.length} issues
                  <button
                    onClick={clearSearch}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    Clear filter
                  </button>
                </p>
              )}
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div
                  className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"
                  role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
              <IssueTable
                issues={filteredIssues}
                updateIssueStatus={updateIssueStatus}
                openResolutionModal={openResolutionModal}
              />
            )}

            {/* Empty state when no issues match the search */}
            {!loading && filteredIssues.length === 0 && (
              <div className="text-center py-8 px-4 bg-white rounded-lg shadow dark:bg-neutral-800">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-neutral-200">No issues found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                  {searchQuery ? "No issues match your search criteria. Try a different search term." : "You don't have any reported issues yet."}
                </p>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* End Main Content */}

      {/* Resolution Modal */}
      {isModalOpen && selectedIssue && (
        <ResolutionModal
          isOpen={isModalOpen}
          closeModal={closeResolutionModal}
          selectedIssue={selectedIssue}
          resolutionNotes={resolutionNotes}
          setResolutionNotes={setResolutionNotes}
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
          setAfterImage={setAfterImage}
          setImagePreview={setImagePreview}
          markAsCompleted={markAsCompleted}
          uploadLoading={uploadLoading}
          error={error}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
