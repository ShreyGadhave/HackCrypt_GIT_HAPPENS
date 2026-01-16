import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import {
  setAttendanceRecords,
  setStudents,
  setLoading,
} from "../features/attendance/attendanceSlice";
import { setSessions } from "../features/sessions/sessionsSlice";
import { selectIsAdmin } from "../features/auth/authSelectors";
import api from "../lib/api";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const [filter, setFilter] = useState("week");
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    leave: 0,
    holiday: 0,
    totalStudents: 30,
    totalSessions: 0,
    totalFiles: 0,
    presentPercentage: 0,
  });
  const [dailyAttendanceData, setDailyAttendanceData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [filter]);

  const fetchDashboardData = async () => {
    dispatch(setLoading(true));
    try {
      // Fetch attendance stats
      const attendanceRes = await api.get("/attendance/stats");
      if (attendanceRes.success) {
        setStats((prev) => ({ ...prev, ...attendanceRes.data }));
      }

      // Fetch students
      const studentsRes = await api.get(
        "/students?class=Class 10&section=10 A"
      );
      if (studentsRes.success) {
        dispatch(setStudents(studentsRes.data));
      }

      // Fetch sessions
      const sessionsRes = await api.get("/sessions");
      if (sessionsRes.success) {
        dispatch(setSessions(sessionsRes.data));
        setStats((prev) => ({
          ...prev,
          totalSessions: sessionsRes.data.length,
        }));
      }

      // Fetch files count
      const filesRes = await api.get("/files");
      if (filesRes.success) {
        setStats((prev) => ({ ...prev, totalFiles: filesRes.data.length }));
      }

      // Generate daily attendance data for admin view
      if (isAdmin) {
        const dailyData = generateDailyAttendanceData();
        setDailyAttendanceData(dailyData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Generate mock daily attendance data for admin view
  const generateDailyAttendanceData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((day) => ({
      day,
      totalStudents: 30,
      present: Math.floor(Math.random() * 5) + 25,
      absent: Math.floor(Math.random() * 4) + 1,
      leave: Math.floor(Math.random() * 2),
      sessions: Math.floor(Math.random() * 2) + 4,
    }));
  };

  // Pie chart data - for teacher: session attendance, for admin: overall attendance
  const pieData = [
    { name: "Present", value: stats.present, color: "#0099FF" },
    { name: "Absent", value: stats.absent, color: "#FF6B35" },
    { name: "Leave", value: stats.leave, color: "#9CA3AF" },
  ];

  // Bar chart data for teacher (weekly session completion)
  const teacherBarData = [
    { name: "Mon", completed: 5, scheduled: 5 },
    { name: "Tue", completed: 4, scheduled: 5 },
    { name: "Wed", completed: 5, scheduled: 5 },
    { name: "Thu", completed: 3, scheduled: 5 },
    { name: "Fri", completed: 5, scheduled: 5 },
    { name: "Sat", completed: 2, scheduled: 3 },
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isAdmin ? "Admin Dashboard" : "Teacher Dashboard"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? "Overview of school-wide attendance and statistics"
              : "Overview of your sessions and attendance"}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("week")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "week"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setFilter("month")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "month"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatCard
              icon={Users}
              title="Total Students"
              value={stats.totalStudents}
              subtitle="Active"
              color="bg-blue-500"
            />
            <StatCard
              icon={Calendar}
              title="Avg Daily Attendance"
              value={`${stats.presentPercentage}%`}
              subtitle="This month"
              color="bg-green-500"
            />
            <StatCard
              icon={BookOpen}
              title="Total Sessions Today"
              value="8"
              subtitle="Across all classes"
              color="bg-purple-500"
            />
            <StatCard
              icon={FileText}
              title="Notices"
              value={stats.totalFiles}
              subtitle="Published"
              color="bg-orange-500"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={BookOpen}
              title="My Sessions"
              value={stats.totalSessions}
              subtitle="All time"
              color="bg-blue-500"
            />
            <StatCard
              icon={Calendar}
              title="Completed Today"
              value="3"
              subtitle="Out of 5 sessions"
              color="bg-green-500"
            />
            <StatCard
              icon={Users}
              title="Avg Attendance"
              value={`${stats.presentPercentage}%`}
              subtitle="In my sessions"
              color="bg-purple-500"
            />
            <StatCard
              icon={FileText}
              title="Materials Shared"
              value={stats.totalFiles}
              subtitle="This month"
              color="bg-orange-500"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      {isAdmin ? (
        /* Admin View - Daily Student Attendance */
        <div className="grid grid-cols-1 gap-6">
          {/* Line Chart - Daily Student Attendance Trend */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Daily Student Attendance (This Week)
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={dailyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#0099FF"
                  strokeWidth={2}
                  name="Present"
                />
                <Line
                  type="monotone"
                  dataKey="absent"
                  stroke="#FF6B35"
                  strokeWidth={2}
                  name="Absent"
                />
                <Line
                  type="monotone"
                  dataKey="leave"
                  stroke="#9CA3AF"
                  strokeWidth={2}
                  name="On Leave"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Sessions per Day */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Total Sessions Per Day
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" fill="#8B5CF6" name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Teacher View - Session-based Statistics */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Session Attendance Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              My Sessions - Attendance Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart - Session Completion */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Session Completion (This Week)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teacherBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#0099FF" name="Completed" />
                <Bar dataKey="scheduled" fill="#E5E7EB" name="Scheduled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {isAdmin ? (
            <>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    Daily attendance marked for all classes
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    New notice published: Parent-Teacher Meeting
                  </p>
                  <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    8 sessions completed across all classes
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    Attendance marked for Class 10 A - Mathematics
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    New session created: Mathematics - Algebra
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    Assignment uploaded: Chapter 5 Questions
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
