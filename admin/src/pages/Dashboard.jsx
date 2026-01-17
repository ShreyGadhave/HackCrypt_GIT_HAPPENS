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
  Activity,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

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
      const attendanceRes = await api.get("/attendance/stats");
      if (attendanceRes.success) {
        setStats((prev) => ({ ...prev, ...attendanceRes.data }));
      }

      const studentsRes = await api.get(
        "/students?class=Class 10&section=10 A"
      );
      if (studentsRes.success) {
        dispatch(setStudents(studentsRes.data));
      }

      const sessionsRes = await api.get("/sessions");
      if (sessionsRes.success) {
        dispatch(setSessions(sessionsRes.data));
        setStats((prev) => ({
          ...prev,
          totalSessions: sessionsRes.data.length,
        }));
      }

      const filesRes = await api.get("/files");
      if (filesRes.success) {
        setStats((prev) => ({ ...prev, totalFiles: filesRes.data.length }));
      }

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

  const pieData = [
    { name: "Present", value: stats.present, color: "#10B981" },
    { name: "Absent", value: stats.absent, color: "#EF4444" },
    { name: "Leave", value: stats.leave, color: "#9CA3AF" },
  ];

  const teacherBarData = [
    { name: "Mon", completed: 5, scheduled: 5 },
    { name: "Tue", completed: 4, scheduled: 5 },
    { name: "Wed", completed: 5, scheduled: 5 },
    { name: "Thu", completed: 3, scheduled: 5 },
    { name: "Fri", completed: 5, scheduled: 5 },
    { name: "Sat", completed: 2, scheduled: 3 },
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, gradient, trend }) => (
    <motion.div
      className="card card-hover group"
      style={{
        boxShadow: '0 10px 30px rgba(147, 51, 234, 0.15), 0 5px 15px rgba(147, 51, 234, 0.1)',
      }}
      whileHover={{
        y: -5,
        boxShadow: '0 15px 40px rgba(147, 51, 234, 0.2), 0 8px 20px rgba(147, 51, 234, 0.15)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {trend && (
              <motion.span
                className={`text-xs px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {trend > 0 ? '+' : ''}{trend}%
              </motion.span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <motion.div
          className={`p-4 rounded-xl ${gradient} shadow-lg`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon size={24} className="text-white" />
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isAdmin ? "Admin Dashboard" : "Teacher Dashboard"}
          </h1>
          <p className="text-gray-600">
            {isAdmin
              ? "Overview of school-wide attendance and statistics"
              : "Overview of your sessions and attendance"}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={() => setFilter("week")}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${filter === "week"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "bg-white text-gray-700 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
              }`}
            style={{
              boxShadow: filter === "week"
                ? '0 8px 20px rgba(147, 51, 234, 0.3)'
                : '0 4px 12px rgba(147, 51, 234, 0.1)',
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 10px 25px rgba(147, 51, 234, 0.35)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            Week
          </motion.button>
          <motion.button
            onClick={() => setFilter("month")}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${filter === "month"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "bg-white text-gray-700 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
              }`}
            style={{
              boxShadow: filter === "month"
                ? '0 8px 20px rgba(147, 51, 234, 0.3)'
                : '0 4px 12px rgba(147, 51, 234, 0.1)',
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 10px 25px rgba(147, 51, 234, 0.35)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            Month
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatCard
              icon={Users}
              title="Total Students"
              value={stats.totalStudents}
              subtitle="Active"
              gradient="stat-card-blue"
              trend={5}
            />
            <StatCard
              icon={Activity}
              title="Avg Daily Attendance"
              value={`${stats.presentPercentage}%`}
              subtitle="This month"
              gradient="stat-card-green"
              trend={3}
            />
            <StatCard
              icon={BookOpen}
              title="Total Sessions Today"
              value="8"
              subtitle="Across all classes"
              gradient="stat-card-purple"
              trend={-2}
            />
            <StatCard
              icon={FileText}
              title="Notices"
              value={stats.totalFiles}
              subtitle="Published"
              gradient="stat-card-orange"
              trend={12}
            />
          </>
        ) : (
          <>
            <StatCard
              icon={BookOpen}
              title="My Sessions"
              value={stats.totalSessions}
              subtitle="All time"
              gradient="stat-card-blue"
              trend={8}
            />
            <StatCard
              icon={Calendar}
              title="Completed Today"
              value="3"
              subtitle="Out of 5 sessions"
              gradient="stat-card-green"
              trend={0}
            />
            <StatCard
              icon={Award}
              title="Avg Attendance"
              value={`${stats.presentPercentage}%`}
              subtitle="In my sessions"
              gradient="stat-card-purple"
              trend={5}
            />
            <StatCard
              icon={FileText}
              title="Materials Shared"
              value={stats.totalFiles}
              subtitle="This month"
              gradient="stat-card-pink"
              trend={15}
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      {isAdmin ? (
        <div className="grid grid-cols-1 gap-6">
          <motion.div
            className="card"
            style={{
              boxShadow: '0 10px 30px rgba(147, 51, 234, 0.12)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Daily Student Attendance Trend
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={16} />
                <span>This Week</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={dailyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E9D5FF",
                    borderRadius: "0.75rem",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Present"
                  dot={{ fill: "#10B981", r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="absent"
                  stroke="#EF4444"
                  strokeWidth={3}
                  name="Absent"
                  dot={{ fill: "#EF4444", r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="leave"
                  stroke="#9CA3AF"
                  strokeWidth={3}
                  name="On Leave"
                  dot={{ fill: "#9CA3AF", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            className="card"
            style={{
              boxShadow: '0 10px 30px rgba(147, 51, 234, 0.12)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Total Sessions Per Day
              </h3>
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E9D5FF",
                    borderRadius: "0.75rem",
                  }}
                />
                <Legend />
                <Bar dataKey="sessions" fill="#9333EA" name="Sessions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            className="card"
            style={{
              boxShadow: '0 10px 30px rgba(147, 51, 234, 0.12)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
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
                  outerRadius={90}
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
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600 font-medium">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="card"
            style={{
              boxShadow: '0 10px 30px rgba(147, 51, 234, 0.12)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Session Completion (This Week)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teacherBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E9D5FF",
                    borderRadius: "0.75rem",
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill="#9333EA" name="Completed" radius={[8, 8, 0, 0]} />
                <Bar dataKey="scheduled" fill="#E9D5FF" name="Scheduled" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Recent Activity */}
      <motion.div
        className="card"
        style={{
          boxShadow: '0 10px 30px rgba(147, 51, 234, 0.12)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {isAdmin ? (
            <>
              <motion.div
                className="flex items-start gap-4 pb-4 border-b border-purple-100 hover:bg-purple-50/50 -mx-6 px-6 py-3 transition-colors rounded-lg"
                whileHover={{ x: 5 }}
              >
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                  <Users size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    Daily attendance marked for all classes
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </div>
              </motion.div>
              <motion.div
                className="flex items-start gap-4 pb-4 border-b border-purple-100 hover:bg-purple-50/50 -mx-6 px-6 py-3 transition-colors rounded-lg"
                whileHover={{ x: 5 }}
              >
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                  <FileText size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    New notice published: Parent-Teacher Meeting
                  </p>
                  <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                </div>
              </motion.div>
              <motion.div
                className="flex items-start gap-4 hover:bg-purple-50/50 -mx-6 px-6 py-3 transition-colors rounded-lg"
                whileHover={{ x: 5 }}
              >
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                  <BookOpen size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    8 sessions completed across all classes
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                className="flex items-start gap-4 pb-4 border-b border-purple-100 hover:bg-purple-50/50 -mx-6 px-6 py-3 transition-colors rounded-lg"
                whileHover={{ x: 5 }}
              >
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                  <Calendar size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    Attendance marked for Class 10 A - Mathematics
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </motion.div>
              <motion.div
                className="flex items-start gap-4 pb-4 border-b border-purple-100 hover:bg-purple-50/50 -mx-6 px-6 py-3 transition-colors rounded-lg"
                whileHover={{ x: 5 }}
              >
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                  <BookOpen size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    New session created: Mathematics - Algebra
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                </div>
              </motion.div>
              <motion.div
                className="flex items-start gap-4 hover:bg-purple-50/50 -mx-6 px-6 py-3 transition-colors rounded-lg"
                whileHover={{ x: 5 }}
              >
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                  <FileText size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    Assignment uploaded: Chapter 5 Questions
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
