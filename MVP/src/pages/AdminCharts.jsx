import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Sector } from "recharts";
import { useState, useEffect } from "react";
import { supabase, supabaseAdmin } from "../supabase";
import { ClipboardDocumentCheckIcon, ClockIcon, DocumentCheckIcon, DocumentIcon, UserIcon } from "@heroicons/react/24/outline";

// Custom active shape for enhanced pie chart
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        className="text-lg font-medium">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle
        cx={ex}
        cy={ey}
        r={2}
        fill={fill}
        stroke="none"
      />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333">{`${value} issues`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999">
        {`(${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

const COLORS = ["#f59e0b", "#4f46e5", "#10b981", "#ef4444"];

export default function AdminCharts() {
  // State for active slice in the pie chart
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for chart data
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch issues data for Bar Chart (monthly issues reported/resolved)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: issuesData, error: issuesError } = await supabase.from("issues").select("*").gte("created_at", sixMonthsAgo.toISOString());

        if (issuesError) throw issuesError;

        // Process bar chart data (issues by month)
        const monthlyIssues = processMonthlyIssues(issuesData);
        setBarData(monthlyIssues);

        // Process pie chart data (status distribution)
        const statusDistribution = processStatusDistribution(issuesData);
        setPieData(statusDistribution);

        // Process area chart data (monthly status breakdown)
        const monthlyStatusData = processMonthlyStatusData(issuesData);
        setAreaData(monthlyStatusData);

        // Fetch user data for line chart
        const { data: userData, error: userError } = await supabase.from("profiles").select("created_at");

        if (userError) throw userError;

        // Process line chart data (weekly new users)
        const weeklyUserData = processWeeklyUsers(userData);
        setLineData(weeklyUserData);

        // Set summary statistics
        setTotalIssues(issuesData.length);
        setTotalUsers(userData.length);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Helper function to process issues by month
  const processMonthlyIssues = (issues) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const lastSixMonths = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      lastSixMonths.push(months[monthIndex]);
    }

    // Initialize data structure
    const monthlyData = lastSixMonths.map((month) => ({
      name: month,
      issues: 0,
      resolved: 0,
    }));

    // Count issues and resolved issues by month
    issues.forEach((issue) => {
      const createdAt = new Date(issue.created_at);
      const monthName = months[createdAt.getMonth()];

      // Find the month in our data
      const monthData = monthlyData.find((m) => m.name === monthName);
      if (monthData) {
        monthData.issues++;

        // Count as resolved if status is 'completed'
        if (issue.status && issue.status.toLowerCase().includes("complete")) {
          monthData.resolved++;
        }
      }
    });

    return monthlyData;
  };

  // Helper function to process status distribution for pie chart
  const processStatusDistribution = (issues) => {
    const statusCounts = {
      "Under Review": 0,
      "In Progress": 0,
      Completed: 0,
      Rejected: 0,
    };

    issues.forEach((issue) => {
      const status = issue.status ? issue.status.toLowerCase() : "";

      if (status.includes("complete")) {
        statusCounts["Completed"]++;
      } else if (status.includes("progress") || status === "in-progress") {
        statusCounts["In Progress"]++;
      } else if (status.includes("reject")) {
        statusCounts["Rejected"]++;
      } else {
        statusCounts["Under Review"]++;
      }
    });

    // Convert to array format for recharts
    return Object.keys(statusCounts).map((key) => ({
      name: key,
      value: statusCounts[key],
    }));
  };

  // Helper function to process weekly user data
  const processWeeklyUsers = (users) => {
    // Sort users by creation date
    const sortedUsers = [...users].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Get start date (6 weeks ago)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 42); // 6 weeks * 7 days

    // Initialize weekly buckets
    const weeks = [];
    for (let i = 0; i < 6; i++) {
      weeks.push({
        name: `Week ${i + 1}`,
        activeUsers: 0,
      });
    }

    // Calculate cumulative active users for each week
    for (let i = 0; i < 6; i++) {
      const weekEnd = new Date(startDate);
      weekEnd.setDate(weekEnd.getDate() + (i + 1) * 7);

      // Count all users created before the end of this week
      const usersCount = sortedUsers.filter((u) => new Date(u.created_at) < weekEnd).length;
      weeks[i].activeUsers = usersCount;
    }

    return weeks;
  };

  // Helper function to process monthly status data for area chart
  const processMonthlyStatusData = (issues) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const lastSixMonths = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      lastSixMonths.push(months[monthIndex]);
    }

    // Initialize data structure
    const monthlyData = lastSixMonths.map((month) => ({
      month,
      completed: 0,
      inProgress: 0,
      pending: 0,
      rejected: 0,
    }));

    // Count issues by status and month
    issues.forEach((issue) => {
      const createdAt = new Date(issue.created_at);
      const monthName = months[createdAt.getMonth()];
      const status = issue.status ? issue.status.toLowerCase() : "";

      // Find the month in our data
      const monthData = monthlyData.find((m) => m.month === monthName);
      if (monthData) {
        if (status.includes("complete")) {
          monthData.completed++;
        } else if (status.includes("progress") || status.includes("in-progress")) {
          monthData.inProgress++;
        } else if (status.includes("reject")) {
          monthData.rejected++;
        } else if (status.includes("pending") || status.includes("review")) {
          monthData.pending++;
        }
      }
    });

    return monthlyData;
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 rounded-xl p-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm leading-5 text-red-700">Error loading chart data: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Issues</p>
              <p className="text-3xl font-medium  mt-2">{totalIssues}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center transform will-change-transform">
              <DocumentIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Users</p>
              <p className="text-3xl font-medium mt-2">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center transform will-change-transform">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Issues Reported vs Resolved</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient
                      id="issuesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor="#4f46e5"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#4f46e5"
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                    <linearGradient
                      id="resolvedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280" }}
                    allowDecimals={false}
                  />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "6px",
                      border: "none",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="issues"
                    name="Issues Reported"
                    fill="url(#issuesGradient)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                  <Bar
                    dataKey="resolved"
                    name="Issues Resolved"
                    fill="url(#resolvedGradient)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                    animationBegin={300}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">User Growth</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <LineChart
                  data={lineData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient
                      id="colorActiveUsers"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor="#0ea5e9"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#0ea5e9"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280" }}
                    allowDecimals={false}
                  />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "6px",
                      border: "none",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    name="Total Users"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="url(#colorActiveUsers)"
                    dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Enhanced Pie Chart */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Issue Status Distribution</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    animationDuration={1500}
                    animationEasing="ease-in-out">
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Area Chart */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Issue Status Trends</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <AreaChart
                  data={areaData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient
                      id="completedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                    <linearGradient
                      id="inProgressGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor="#4f46e5"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#4f46e5"
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                    <linearGradient
                      id="rejectedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor="#ef4444"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#ef4444"
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                    <linearGradient
                      id="newPendingGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor="#f59e0b"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#f59e0b"
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280" }}
                    allowDecimals={false}
                  />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "6px",
                      border: "none",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    fill="url(#completedGradient)"
                    name="Completed"
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="rejected"
                    stroke="#ef4444"
                    fill="url(#rejectedGradient)"
                    name="Rejected"
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="#f59e0b"
                    fill="url(#newPendingGradient)"
                    name="Pending"
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="inProgress"
                    stroke="#4f46e5"
                    fill="url(#inProgressGradient)"
                    name="In Progress"
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
