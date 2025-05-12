import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend, LineChart, Line, ResponsiveContainer } from "recharts";

const barData = [
  { name: "Jan", users: 200, sessions: 400 },
  { name: "Feb", users: 300, sessions: 600 },
  { name: "Mar", users: 500, sessions: 900 },
  { name: "Apr", users: 700, sessions: 1200 },
  { name: "May", users: 900, sessions: 1500 },
  { name: "Jun", users: 1200, sessions: 1800 },
];

const lineData = [
  { name: "Week 1", active: 100 },
  { name: "Week 2", active: 120 },
  { name: "Week 3", active: 150 },
  { name: "Week 4", active: 170 },
  { name: "Week 5", active: 200 },
  { name: "Week 6", active: 220 },
];

export default function AdminCharts() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">User Registrations & Sessions</h3>
            <div className="w-full h-[250px]">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ReTooltip />
                  <Legend />
                  <Bar
                    dataKey="users"
                    fill="#4f46e5" // Indigo-600
                  />
                  <Bar
                    dataKey="sessions"
                    fill="#10b981" // Emerald-500
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Active Users Over Time</h3>
            <div className="w-full h-[250px]">
              <ResponsiveContainer
                width="100%"
                height="100%">
                <LineChart
                  data={lineData}
                  margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ReTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#4f46e5" // Indigo-600
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
