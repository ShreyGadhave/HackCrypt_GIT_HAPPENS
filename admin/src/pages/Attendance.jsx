import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import {
  setAttendanceRecords,
  setStudents,
  markAttendance,
  setLoading,
} from "../features/attendance/attendanceSlice";
import { setSessions } from "../features/sessions/sessionsSlice";
import { selectIsAdmin } from "../features/auth/authSelectors";
import api from "../lib/api";
import { getStatusColor, getStatusLabel, getWeekDays } from "../lib/utils";
import { ChevronLeft, ChevronRight, Download, Clock, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const Attendance = () => {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const { records, students, loading } = useAppSelector(
    (state) => state.attendance
  );
  const { sessions } = useAppSelector((state) => state.sessions);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [weekDays, setWeekDays] = useState([]);
  const [selectedWeekSessions, setSelectedWeekSessions] = useState([]);

  useEffect(() => {
    fetchAttendanceData();
    setWeekDays(getWeekDays());
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (!isAdmin && sessions.length > 0) {
      const completedSessions = sessions
        .filter((session) => session.status === "completed")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setSelectedWeekSessions(completedSessions);
    }
  }, [sessions, isAdmin]);

  const fetchAttendanceData = async () => {
    dispatch(setLoading(true));
    try {
      const studentsRes = await api.get("/students?class=10&section=A");
      if (studentsRes.success) {
        dispatch(setStudents(studentsRes.data));
      }

      const attendanceRes = await api.get(
        `/attendance?class=10&section=A&month=${selectedMonth}&year=${selectedYear}`
      );
      if (attendanceRes.success) {
        dispatch(setAttendanceRecords(attendanceRes.data));
      }

      if (!isAdmin) {
        const sessionsRes = await api.get("/sessions");
        if (sessionsRes.success) {
          dispatch(setSessions(sessionsRes.data));
        }
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getAttendanceStatus = (studentId, dateString) => {
    const record = records.find((r) => {
      const recordStudentId = r.student?._id || r.student;
      const recordDate = r.date
        ? new Date(r.date).toISOString().split("T")[0]
        : null;
      return recordStudentId === studentId && recordDate === dateString;
    });
    return record?.status || null;
  };

  const getSessionAttendanceCount = (studentId, dateString) => {
    const dayRecords = records.filter((r) => {
      const recordStudentId = r.student?._id || r.student;
      const recordDate = r.date
        ? new Date(r.date).toISOString().split("T")[0]
        : null;
      return recordStudentId === studentId && recordDate === dateString;
    });

    const presentCount = dayRecords.filter(
      (r) => r.status === "present"
    ).length;
    const totalSessions = dayRecords.length > 0 ? dayRecords.length : 0;

    return { present: presentCount, total: totalSessions };
  };

  const handleMarkAttendance = async (studentId, dateOrSessionId, status) => {
    try {
      const response = await api.post("/attendance/mark", {
        studentId,
        date: typeof dateOrSessionId === "string" ? dateOrSessionId : null,
        sessionId: typeof dateOrSessionId === "number" ? dateOrSessionId : null,
        status,
      });

      if (response.success) {
        dispatch(
          markAttendance({
            studentId,
            date:
              typeof dateOrSessionId === "string"
                ? dateOrSessionId
                : new Date().toISOString().split("T")[0],
            status,
          })
        );
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
    }
  };

  const handleMonthChange = (direction) => {
    if (direction === "prev") {
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isAdmin ? "Daily Attendance" : "Session Attendance"}
          </h1>
          <p className="text-gray-600">
            {isAdmin
              ? "Track student attendance day-wise with session counts"
              : "Mark attendance for your sessions"}
          </p>
        </div>

        <button className="btn-primary flex items-center gap-2 transform hover:scale-105 transition-transform">
          <Download size={20} />
          Generate Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in">
        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">{students.length}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <CalendarIcon size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Attendance</p>
              <p className="text-3xl font-bold text-gray-800">92%</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">This Week</p>
              <p className="text-3xl font-bold text-gray-800">{weekDays.length}</p>
              <p className="text-xs text-gray-500 mt-1">Days tracked</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table Card */}
      <div className="card animate-fade-in">
        {/* Month Navigator */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-purple-100">
          <button
            onClick={() => handleMonthChange("prev")}
            className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-purple-600" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {isAdmin
                ? `${monthNames[selectedMonth]} ${selectedYear}`
                : "Current Week Sessions"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Class 10 A</p>
          </div>

          <button
            onClick={() => handleMonthChange("next")}
            className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-purple-600" />
          </button>
        </div>

        {/* Attendance Grid */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-pulse">Loading attendance...</div>
            </div>
          ) : isAdmin ? (
            /* Admin View - Day-wise with Session Counts */
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-gradient-to-r from-purple-50 to-purple-100 z-10 px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-purple-200 min-w-[150px]">
                    Student Name
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.dateString}
                      className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-b-2 border-purple-200 min-w-[100px] bg-gradient-to-r from-purple-50 to-purple-100"
                    >
                      <div className="font-bold">{day.dayName}</div>
                      <div className="text-gray-500 font-normal">{day.date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr
                    key={student._id}
                    className={`border-b border-purple-50 hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-purple-50/20"
                      }`}
                  >
                    <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-800">
                      <div>{student.name}</div>
                      <div className="text-xs text-gray-500">
                        Roll: {student.rollNo}
                      </div>
                    </td>
                    {weekDays.map((day) => {
                      const status = getAttendanceStatus(
                        student._id,
                        day.dateString
                      );
                      const { present, total } = getSessionAttendanceCount(
                        student._id,
                        day.dateString
                      );

                      return (
                        <td key={day.dateString} className="px-3 py-3">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`status-badge ${getStatusColor(
                                status
                              )} text-xs px-2 py-1`}
                            >
                              {getStatusLabel(status) || "-"}
                            </span>
                            <span className="text-xs text-gray-600 font-medium">
                              {present}/{total} sessions
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Teacher View - Session-wise Attendance */
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-gradient-to-r from-purple-50 to-purple-100 z-10 px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-purple-200 min-w-[150px]">
                    Student Name
                  </th>
                  {selectedWeekSessions.map((session) => (
                    <th
                      key={session._id}
                      className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-b-2 border-purple-200 min-w-[120px] bg-gradient-to-r from-purple-50 to-purple-100"
                    >
                      <div className="font-bold">{session.subject}</div>
                      <div className="text-gray-500 font-normal">{session.topic}</div>
                      <div className="flex items-center justify-center gap-1 text-gray-500 mt-1">
                        <Clock size={12} />
                        <span>{session.startTime}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr
                    key={student._id}
                    className={`border-b border-purple-50 hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-purple-50/20"
                      }`}
                  >
                    <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-800">
                      <div>{student.name}</div>
                      <div className="text-xs text-gray-500">
                        Roll: {student.rollNo}
                      </div>
                    </td>
                    {selectedWeekSessions.map((session) => {
                      const sessionDateString = session.date
                        ? new Date(session.date).toISOString().split("T")[0]
                        : null;

                      const status = getAttendanceStatus(
                        student._id,
                        sessionDateString
                      );
                      return (
                        <td key={session._id} className="px-3 py-3 text-center">
                          <div className="flex justify-center">
                            <button
                              className={`status-badge ${getStatusColor(
                                status
                              )} text-sm px-3 py-1.5 hover:scale-110 transition-transform cursor-pointer`}
                              onClick={() => {
                                const statusCycle = [
                                  "present",
                                  "absent",
                                  "leave",
                                ];
                                const currentIndex = status
                                  ? statusCycle.indexOf(status)
                                  : -1;
                                const nextStatus =
                                  statusCycle[
                                  (currentIndex + 1) % statusCycle.length
                                  ];
                                handleMarkAttendance(
                                  student._id,
                                  session._id,
                                  nextStatus
                                );
                              }}
                            >
                              {getStatusLabel(status) || "Mark"}
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-purple-100">
          <div className="flex items-center gap-2">
            <div className="status-badge status-present">P</div>
            <span className="text-sm text-gray-600 font-medium">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="status-badge status-absent">A</div>
            <span className="text-sm text-gray-600 font-medium">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="status-badge status-leave">L</div>
            <span className="text-sm text-gray-600 font-medium">Leave</span>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <div className="status-badge status-holiday">H</div>
              <span className="text-sm text-gray-600 font-medium">Holiday</span>
            </div>
          )}
        </div>

        {/* Info Note for Admin */}
        {isAdmin && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl">
            <p className="text-sm text-purple-800">
              <strong>Note:</strong> The session count shows how many sessions
              each student attended out of the total sessions for that day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
