import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeft, Calendar, Users, ClipboardList, BarChart2, PieChart, Activity } from "lucide-react";

const AdminChartsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLoginData, setUserLoginData] = useState([]);
  const [issueReportData, setIssueReportData] = useState([]);
  const [issueTypeData, setIssueTypeData] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
  });
  const [timeRange, setTimeRange] = useState("year"); // 'year', 'quarter', 'month'

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch user login data - in a real app, you'd have a table tracking logins
        // This is a simulation with mock data
        const mockLoginData = generateMockLoginData();
        setUserLoginData(mockLoginData);

        // Fetch issue reports by month
        const { data: issueData, error: issueError } = await supabase.from("issues").select("created_at, status, title").order("created_at");

        if (issueError) throw issueError;

        // Process issue data by month
        const processedIssueData = processIssueDataByMonth(issueData || []);
        setIssueReportData(processedIssueData);

        // Process issue types
        const issueTypes = processIssueTypes(issueData || []);
        setIssueTypeData(issueTypes);

        // Get user stats
        const { data: usersData, error: usersError } = await supabase.from("profiles").select("id, created_at").order("created_at");

        if (usersError) throw usersError;

        // Calculate user statistics
        calculateUserStats(usersData || []);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Failed to load chart data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on selected time range
  const filteredLoginData = useMemo(() => {
    return filterDataByTimeRange(userLoginData, timeRange);
  }, [userLoginData, timeRange]);

  const filteredIssueData = useMemo(() => {
    return filterDataByTimeRange(issueReportData, timeRange);
  }, [issueReportData, timeRange]);

  // Helper function to generate mock login data
  const generateMockLoginData = () => {
    const data = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Generate data for the last 12 months
    for (let i = 0; i < 12; i++) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentYear - Math.floor((i - currentMonth) / 12);

      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      data.push({
        month: monthNames[month],
        year: year,
        loginCount: Math.floor(Math.random() * 80) + 20, // Random between 20-100
        timestamp: new Date(year, month, 15).toISOString(),
      });
    }

    // Sort by date (oldest first)
    return data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  // Helper function to process issue data by month
  const processIssueDataByMonth = (issueData) => {
    const monthlyCounts = {};

    issueData.forEach((issue) => {
      const date = new Date(issue.created_at);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthYear = `${year}-${month}`;

      monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
    });

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Convert to array format
    const result = Object.entries(monthlyCounts).map(([key, count]) => {
      const [year, month] = key.split("-");
      return {
        month: monthNames[parseInt(month)],
        year: parseInt(year),
        issueCount: count,
        timestamp: new Date(parseInt(year), parseInt(month), 15).toISOString(),
      };
    });

    // Sort by date (oldest first)
    return result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  // Helper function to process issue types (based on title keywords for this demo)
  const processIssueTypes = (issueData) => {
    // This is a simplified categorization based on title keywords
    // In a real app, you'd have a proper category field
    const categories = {
      infrastructure: ["road", "street", "bridge", "building", "infrastructure", "sidewalk", "pathway"],
      utilities: ["water", "electricity", "power", "utility", "gas", "sewage", "drainage"],
      environment: ["tree", "park", "garden", "pollution", "trash", "garbage", "waste", "flood"],
      safety: ["light", "crime", "safety", "dangerous", "hazard", "accident", "security"],
      other: [],
    };

    const categoryCounts = {
      infrastructure: 0,
      utilities: 0,
      environment: 0,
      safety: 0,
      other: 0,
    };

    issueData.forEach((issue) => {
      const title = issue.title.toLowerCase();
      let matched = false;

      for (const [category, keywords] of Object.entries(categories)) {
        if (category === "other") continue;

        for (const keyword of keywords) {
          if (title.includes(keyword)) {
            categoryCounts[category]++;
            matched = true;
            break;
          }
        }

        if (matched) break;
      }

      if (!matched) {
        categoryCounts.other++;
      }
    });

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
    }));
  };

  // Helper function to calculate user statistics
  const calculateUserStats = (usersData) => {
    const totalUsers = usersData.length;

    // Calculate new users this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newUsersThisMonth = usersData.filter((user) => {
      const createdDate = new Date(user.created_at);
      return createdDate >= firstDayOfMonth;
    }).length;

    // For active users, in a real app you'd check login activity
    // Here we'll just use 70% of total as a mock value
    const activeUsers = Math.round(totalUsers * 0.7);

    setUserStats({
      totalUsers,
      activeUsers,
      newUsersThisMonth,
    });
  };

  // Helper function to filter data by selected time range
  const filterDataByTimeRange = (data, range) => {
    const now = new Date();
    let cutoffDate;

    switch (range) {
      case "month":
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "quarter":
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "year":
      default:
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }

    return data.filter((item) => new Date(item.timestamp) >= cutoffDate);
  };

  // Find max values for scaling charts
  const maxLoginCount = useMemo(() => {
    return Math.max(...filteredLoginData.map((d) => d.loginCount), 10);
  }, [filteredLoginData]);

  const maxIssueCount = useMemo(() => {
    return Math.max(...filteredIssueData.map((d) => d.issueCount), 10);
  }, [filteredIssueData]);

  // Format month label based on time range
  const formatMonthLabel = (item) => {
    if (timeRange === "month") {
      return item.month.substring(0, 3);
    } else {
      return `${item.month.substring(0, 3)} '${item.year.toString().slice(-2)}`;
    }
  };

  // Calculate the total issues count across all types
  const totalIssuesByType = useMemo(() => {
    return issueTypeData.reduce((total, item) => total + item.count, 0);
  }, [issueTypeData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-white shadow dark:bg-neutral-800 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/admin")}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-neutral-300" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <BarChart2 className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                Analytics Dashboard
              </h1>
            </div>

            {/* Time range selector */}
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeRange("month")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  timeRange === "month"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-700"
                }`}>
                Month
              </button>
              <button
                onClick={() => setTimeRange("quarter")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  timeRange === "quarter"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-700"
                }`}>
                Quarter
              </button>
              <button
                onClick={() => setTimeRange("year")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  timeRange === "year"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-700"
                }`}>
                Year
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/30 dark:border-red-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
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
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-neutral-800">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3 dark:bg-indigo-900">
                      <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-neutral-400">Total Users</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{userStats.totalUsers}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-neutral-800">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3 dark:bg-green-900">
                      <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-neutral-400">Active Users</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{userStats.activeUsers}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-neutral-800">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3 dark:bg-blue-900">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-neutral-400">New Users This Month</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{userStats.newUsersThisMonth}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Logins Chart */}
              <div className="bg-white p-6 rounded-lg shadow dark:bg-neutral-800">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Logins by Month</h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">Number of user logins tracked over time</p>
                </div>

                <div className="relative h-80">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500 dark:text-neutral-400 py-2">
                    <span>{maxLoginCount}</span>
                    <span>{Math.round(maxLoginCount * 0.75)}</span>
                    <span>{Math.round(maxLoginCount * 0.5)}</span>
                    <span>{Math.round(maxLoginCount * 0.25)}</span>
                    <span>0</span>
                  </div>

                  {/* Chart grid lines */}
                  <div className="absolute left-10 right-0 top-0 bottom-0 flex flex-col justify-between py-2">
                    <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                    <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                    <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                    <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                    <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                  </div>

                  {/* Bars */}
                  <div className="absolute left-10 right-0 top-0 bottom-8 flex items-end justify-around">
                    {filteredLoginData.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center">
                        <div
                          className="w-10 bg-indigo-500 rounded-t-sm transition-all duration-500"
                          style={{
                            height: `${(item.loginCount / maxLoginCount) * 100}%`,
                            minHeight: item.loginCount > 0 ? "4px" : "0",
                          }}></div>
                      </div>
                    ))}
                  </div>

                  {/* X-axis labels */}
                  <div className="absolute left-10 right-0 bottom-0 flex justify-around">
                    {filteredLoginData.map((item, index) => (
                      <div
                        key={index}
                        className="text-xs text-gray-500 dark:text-neutral-400 transform -rotate-45 origin-top-left ml-2">
                        {formatMonthLabel(item)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Issues Report Chart */}
              <div className="bg-white p-6 rounded-lg shadow dark:bg-neutral-800">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Issues Reported by Month</h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">Number of community issues reported over time</p>
                </div>

                <div className="relative h-80">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500 dark:text-neutral-400 py-2">
                    <span>{maxIssueCount}</span>
                    <span>{Math.round(maxIssueCount * 0.75)}</span>
                    <span>{Math.round(maxIssueCount * 0.5)}</span>
                    <span>{Math.round(maxIssueCount * 0.25)}</span>
                    <span>0</span>
                  </div>

                  {/* Chart grid lines */}
                  <div className="absolute left-10 right-0 top-0 bottom-0 flex flex-col justify-between py-2">
                    <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                    <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                    <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                    <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                    <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                  </div>

                  {/* Bars */}
                  <div className="absolute left-10 right-0 top-0 bottom-8 flex items-end justify-around">
                    {filteredIssueData.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center">
                        <div
                          className="w-10 bg-orange-500 rounded-t-sm transition-all duration-500"
                          style={{
                            height: `${(item.issueCount / maxIssueCount) * 100}%`,
                            minHeight: item.issueCount > 0 ? "4px" : "0",
                          }}></div>
                      </div>
                    ))}
                  </div>

                  {/* X-axis labels */}
                  <div className="absolute left-10 right-0 bottom-0 flex justify-around">
                    {filteredIssueData.map((item, index) => (
                      <div
                        key={index}
                        className="text-xs text-gray-500 dark:text-neutral-400 transform -rotate-45 origin-top-left ml-2">
                        {formatMonthLabel(item)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Issue Types Pie Chart */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow dark:bg-neutral-800">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Issue Categories Distribution</h3>
                <p className="text-sm text-gray-500 dark:text-neutral-400">Breakdown of reported issues by category</p>
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start justify-center space-y-6 md:space-y-0 md:space-x-6">
                {/* Pie Chart Visualization */}
                <div className="relative w-64 h-64">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full">
                    {/* Render pie segments, using different colors for each category */}
                    {(() => {
                      let currentAngle = 0;
                      const colors = ["#4f46e5", "#16a34a", "#ea580c", "#0284c7", "#6b7280"];

                      return issueTypeData.map((item, index) => {
                        if (item.count === 0) return null;

                        const percentage = (item.count / totalIssuesByType) * 100;
                        const angleSize = 3.6 * percentage; // 3.6 = 360 / 100

                        // Calculate the SVG arc path
                        const startAngle = currentAngle;
                        currentAngle += angleSize;
                        const endAngle = currentAngle;

                        const startX = 50 + 40 * Math.cos(((startAngle - 90) * Math.PI) / 180);
                        const startY = 50 + 40 * Math.sin(((startAngle - 90) * Math.PI) / 180);
                        const endX = 50 + 40 * Math.cos(((endAngle - 90) * Math.PI) / 180);
                        const endY = 50 + 40 * Math.sin(((endAngle - 90) * Math.PI) / 180);

                        const largeArcFlag = angleSize > 180 ? 1 : 0;

                        const pathData = [`M 50 50`, `L ${startX} ${startY}`, `A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}`, `Z`].join(" ");

                        return (
                          <path
                            key={index}
                            d={pathData}
                            fill={colors[index % colors.length]}
                            stroke="#fff"
                            strokeWidth="0.5"
                          />
                        );
                      });
                    })()}

                    {/* Center circle for donut effect */}
                    <circle
                      cx="50"
                      cy="50"
                      r="25"
                      fill="white"
                    />
                  </svg>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  {issueTypeData.map((item, index) => {
                    const colors = ["bg-indigo-500", "bg-green-500", "bg-orange-500", "bg-blue-500", "bg-gray-500"];
                    const percentage = totalIssuesByType > 0 ? ((item.count / totalIssuesByType) * 100).toFixed(1) : "0.0";

                    return (
                      <div
                        key={index}
                        className="flex items-center">
                        <div className={`w-4 h-4 rounded-sm ${colors[index % colors.length]} mr-2`}></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{item.category}</span>
                        <span className="ml-auto text-sm text-gray-500 dark:text-neutral-400">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Comparison Chart */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow dark:bg-neutral-800">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Engagement Summary</h3>
                <p className="text-sm text-gray-500 dark:text-neutral-400">Comparison of user logins and reported issues</p>
              </div>

              <div className="relative h-80">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500 dark:text-neutral-400 py-2">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>

                {/* Chart grid lines */}
                <div className="absolute left-10 right-0 top-0 bottom-0 flex flex-col justify-between py-2">
                  <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                  <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                  <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                  <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                  <div className="h-px bg-gray-200 dark:bg-neutral-700 w-full"></div>
                </div>

                {/* Lines */}
                <div className="absolute left-10 right-0 top-0 bottom-8 flex flex-col">
                  <svg
                    className="w-full h-full"
                    preserveAspectRatio="none">
                    {/* Login line */}
                    <polyline
                      points={filteredLoginData
                        .map((item, index) => {
                          const x = (index / (filteredLoginData.length - 1)) * 100;
                          const y = 100 - (item.loginCount / maxLoginCount) * 100;
                          return `${x}% ${y}%`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Issues line */}
                    <polyline
                      points={filteredIssueData
                        .map((item, index) => {
                          const x = (index / (filteredIssueData.length - 1)) * 100;
                          const y = 100 - (item.issueCount / maxIssueCount) * 100;
                          return `${x}% ${y}%`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="absolute left-10 right-0 bottom-0 flex justify-between">
                  {filteredLoginData.slice(0, 5).map((item, index) => {
                    const position = index === 0 ? "left-0" : index === 4 ? "right-0" : `left-${index * 25}%`;
                    return (
                      <div
                        key={index}
                        className={`text-xs text-gray-500 dark:text-neutral-400 absolute ${position}`}>
                        {formatMonthLabel(item)}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="absolute top-2 right-2 flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-500 mr-1 rounded"></div>
                    <span className="text-xs text-gray-500 dark:text-neutral-400">Logins</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 mr-1 rounded"></div>
                    <span className="text-xs text-gray-500 dark:text-neutral-400">Issues</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Distribution Chart */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow dark:bg-neutral-800">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Issue Status Distribution</h3>
                <p className="text-sm text-gray-500 dark:text-neutral-400">Current status of all community issues</p>
              </div>

              <div className="space-y-6">
                {/* Issue status breakdown - statically defined for this demo */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-yellow-500 dark:text-yellow-400">Under Review</span>
                    <span className="text-sm text-gray-600 dark:text-neutral-400">35%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-neutral-700">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: "35%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-blue-500 dark:text-blue-400">In Progress</span>
                    <span className="text-sm text-gray-600 dark:text-neutral-400">40%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-neutral-700">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: "40%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-green-500 dark:text-green-400">Completed</span>
                    <span className="text-sm text-gray-600 dark:text-neutral-400">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-neutral-700">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: "25%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Source Note */}
            <div className="mt-4 text-xs text-gray-500 text-center dark:text-neutral-500">
              <p>Note: Login data is simulated for demonstration purposes. In a production environment, this would be replaced with actual login logs.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminChartsPage;
