import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { setAttendanceRecords, setStudents, setLoading } from '../features/attendance/attendanceSlice';
import { setSessions } from '../features/sessions/sessionsSlice';
import api from '../lib/api';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, FileText, TrendingUp, Calendar, Clock } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState('week'); // 'week' or 'month'
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
  
  useEffect(() => {
    fetchDashboardData();
  }, [filter]);
  
  const fetchDashboardData = async () => {
    dispatch(setLoading(true));
    try {
      // Fetch attendance stats
      const attendanceRes = await api.get('/attendance/stats');
      if (attendanceRes.success) {
        setStats(prev => ({ ...prev, ...attendanceRes.data }));
      }
      
      // Fetch students
      const studentsRes = await api.get('/students?class=Class 10&section=10 A');
      if (studentsRes.success) {
        dispatch(setStudents(studentsRes.data));
      }
      
      // Fetch sessions
      const sessionsRes = await api.get('/sessions');
      if (sessionsRes.success) {
        dispatch(setSessions(sessionsRes.data));
        setStats(prev => ({ ...prev, totalSessions: sessionsRes.data.length }));
      }
      
      // Fetch files count
      const filesRes = await api.get('/files');
      if (filesRes.success) {
        setStats(prev => ({ ...prev, totalFiles: filesRes.data.length }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  // Pie chart data for attendance
  const pieData = [
    { name: 'Present', value: stats.present, color: '#0099FF' },
    { name: 'Absent', value: stats.absent, color: '#FF6B35' },
    { name: 'Leave', value: stats.leave, color: '#9CA3AF' },
  ];
  
  // Bar chart data (mock weekly data)
  const barData = [
    { name: 'Mon', present: 28, absent: 2 },
    { name: 'Tue', present: 27, absent: 3 },
    { name: 'Wed', present: 29, absent: 1 },
    { name: 'Thu', present: 26, absent: 4 },
    { name: 'Fri', present: 28, absent: 2 },
    { name: 'Sat', present: 25, absent: 5 },
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
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your attendance and sessions</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'week'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'month'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Month
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Class 10 A"
          color="bg-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Attendance Rate"
          value={`${stats.presentPercentage}%`}
          subtitle="This month"
          color="bg-green-500"
        />
        <StatCard
          icon={BookOpen}
          title="Total Sessions"
          value={stats.totalSessions}
          subtitle="All time"
          color="bg-purple-500"
        />
        <StatCard
          icon={FileText}
          title="Course Files"
          value={stats.totalFiles}
          subtitle="Uploaded"
          color="bg-orange-500"
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Attendance Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bar Chart - Weekly Attendance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#0099FF" name="Present" />
              <Bar dataKey="absent" fill="#FF6B35" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Attendance marked for Class 10 A</p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">New session created: Mathematics - Algebra</p>
              <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText size={20} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Assignment uploaded: Chapter 5 Questions</p>
              <p className="text-xs text-gray-500 mt-1">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
