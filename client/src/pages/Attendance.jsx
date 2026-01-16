import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { setAttendanceRecords, setStudents, markAttendance, setFilters, setLoading } from '../features/attendance/attendanceSlice';
import api from '../lib/api';
import { getStatusColor, getStatusLabel, getWeekDays } from '../lib/utils';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

const Attendance = () => {
  const dispatch = useAppDispatch();
  const { records, students, filters, loading } = useAppSelector((state) => state.attendance);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [weekDays, setWeekDays] = useState([]);
  
  useEffect(() => {
    fetchAttendanceData();
    if (viewMode === 'week') {
      setWeekDays(getWeekDays());
    }
  }, [selectedMonth, selectedYear, viewMode]);
  
  const fetchAttendanceData = async () => {
    dispatch(setLoading(true));
    try {
      // Fetch students
      const studentsRes = await api.get('/students?class=Class 10&section=10 A');
      if (studentsRes.success) {
        dispatch(setStudents(studentsRes.data));
      }
      
      // Fetch attendance records
      const attendanceRes = await api.get(
        `/attendance?class=Class 10&section=10 A&month=${selectedMonth}&year=${selectedYear}`
      );
      if (attendanceRes.success) {
        dispatch(setAttendanceRecords(attendanceRes.data));
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  const getAttendanceStatus = (studentId, dateString) => {
    const record = records.find(
      (r) => r.studentId === studentId && r.date === dateString
    );
    return record?.status || null;
  };
  
  const handleMarkAttendance = async (studentId, dateString, status) => {
    try {
      const response = await api.post('/attendance/mark', {
        studentId,
        date: dateString,
        status,
      });
      
      if (response.success) {
        dispatch(markAttendance({ studentId, date: dateString, status }));
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };
  
  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
          <p className="text-gray-600 mt-1">Track and manage student attendance</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
          </div>
          
          <button className="btn-primary flex items-center gap-2">
            <Download size={20} />
            Generate Report
          </button>
        </div>
      </div>
      
      {/* Month Navigator */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => handleMonthChange('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {monthNames[selectedMonth]} {selectedYear}
            </h2>
            <p className="text-sm text-gray-600">Class 10 A</p>
          </div>
          
          <button
            onClick={() => handleMonthChange('next')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        {/* Attendance Grid */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading attendance...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white z-10 px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200 min-w-[150px]">
                    Student Name
                  </th>
                  {viewMode === 'week' ? (
                    weekDays.map((day) => (
                      <th key={day.dateString} className="px-2 py-3 text-center text-xs font-semibold text-gray-700 border-b-2 border-gray-200 min-w-[60px]">
                        <div>{day.dayName}</div>
                        <div className="text-gray-500">{day.date}</div>
                      </th>
                    ))
                  ) : (
                    Array.from({ length: 7 }, (_, i) => (
                      <th key={i + 1} className="px-2 py-3 text-center text-xs font-semibold text-gray-700 border-b-2 border-gray-200 min-w-[50px]">
                        {i + 1}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-800">
                      <div>{student.name}</div>
                      <div className="text-xs text-gray-500">Roll: {student.rollNo}</div>
                    </td>
                    {viewMode === 'week' ? (
                      weekDays.map((day) => {
                        const status = getAttendanceStatus(student.id, day.dateString);
                        return (
                          <td key={day.dateString} className="px-2 py-3 text-center">
                            <div className="flex justify-center">
                              <div className="relative group">
                                <button
                                  className={`status-badge ${getStatusColor(status)}`}
                                  onClick={() => {
                                    // Cycle through statuses: null -> present -> absent -> leave -> present
                                    const statusCycle = ['present', 'absent', 'leave'];
                                    const currentIndex = status ? statusCycle.indexOf(status) : -1;
                                    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
                                    handleMarkAttendance(student.id, day.dateString, nextStatus);
                                  }}
                                >
                                  {getStatusLabel(status)}
                                </button>
                                
                                {/* Tooltip */}
                                <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                                  Click to change
                                </div>
                              </div>
                            </div>
                          </td>
                        );
                      })
                    ) : (
                      Array.from({ length: 7 }, (_, i) => {
                        const date = new Date(selectedYear, selectedMonth, i + 1);
                        const dateString = date.toISOString().split('T')[0];
                        const status = getAttendanceStatus(student.id, dateString);
                        return (
                          <td key={i + 1} className="px-2 py-3 text-center">
                            <div className="flex justify-center">
                              <button
                                className={`status-badge ${getStatusColor(status)}`}
                                onClick={() => {
                                  const statusCycle = ['present', 'absent', 'leave'];
                                  const currentIndex = status ? statusCycle.indexOf(status) : -1;
                                  const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
                                  handleMarkAttendance(student.id, dateString, nextStatus);
                                }}
                              >
                                {getStatusLabel(status)}
                              </button>
                            </div>
                          </td>
                        );
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="status-badge status-present">P</div>
            <span className="text-sm text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="status-badge status-absent">A</div>
            <span className="text-sm text-gray-600">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="status-badge status-leave">L</div>
            <span className="text-sm text-gray-600">Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="status-badge status-holiday">H</div>
            <span className="text-sm text-gray-600">Holiday</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
