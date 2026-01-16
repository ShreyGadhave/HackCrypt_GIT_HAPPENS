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
import { ChevronLeft, ChevronRight, Download, Clock } from "lucide-react";

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
    // Get sessions for the current week for teacher view
    if (!isAdmin && sessions.length > 0) {
      const todaySessions = sessions.slice(0, 5); // Get first 5 sessions as current week
      setSelectedWeekSessions(todaySessions);
    }
  }, [sessions, isAdmin]);

  const fetchAttendanceData = async () => {
    dispatch(setLoading(true));
    try {
      // Fetch students
      const studentsRes = await api.get(
        "/students?class=Class 10&section=10 A"
      );
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

      // Fetch sessions for teacher view
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
    const record = records.find(
      (r) => r.studentId === studentId && r.date === dateString
    );
    return record?.status || null;
  };

  const getSessionAttendanceCount = (studentId, dateString) => {
    // Calculate how many sessions student attended on a specific day
    const dayRecords = records.filter(
      (r) => r.studentId === studentId && r.date === dateString
    );
    const presentCount = dayRecords.filter(
      (r) => r.status === "present"
    ).length;
    const totalSessions = 5; // Assume 5 sessions per day
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isAdmin ? "Daily Attendance" : "Session Attendance"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? "Track student attendance day-wise with session counts"
              : "Mark attendance for your sessions"}
          </p>
        </div>

        <button className="btn-primary flex items-center gap-2">
          <Download size={20} />
          Generate Report
        </button>
      </div>

      {/* Month Navigator */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => handleMonthChange("prev")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {isAdmin
                ? `${monthNames[selectedMonth]} ${selectedYear}`
                : "Current Week Sessions"}
            </h2>
            <p className="text-sm text-gray-600">Class 10 A</p>
          </div>

          <button
            onClick={() => handleMonthChange("next")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Attendance Grid */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading attendance...
            </div>
          ) : isAdmin ? (
            /* Admin View - Day-wise with Session Counts */
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white z-10 px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200 min-w-[150px]">
                    Student Name
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.dateString}
                      className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-b-2 border-gray-200 min-w-[100px]"
                    >
                      <div>{day.dayName}</div>
                      <div className="text-gray-500">{day.date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-800">
                      <div>{student.name}</div>
                      <div className="text-xs text-gray-500">
                        Roll: {student.rollNo}
                      </div>
                    </td>
                    {weekDays.map((day) => {
                      const status = getAttendanceStatus(
                        student.id,
                        day.dateString
                      );
                      const { present, total } = getSessionAttendanceCount(
                        student.id,
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
                  <th className="sticky left-0 bg-white z-10 px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200 min-w-[150px]">
                    Student Name
                  </th>
                  {selectedWeekSessions.map((session) => (
                    <th
                      key={session.id}
                      className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-b-2 border-gray-200 min-w-[120px]"
                    >
                      <div className="font-semibold">{session.subject}</div>
                      <div className="text-gray-500">{session.topic}</div>
                      <div className="flex items-center justify-center gap-1 text-gray-500 mt-1">
                        <Clock size={12} />
                        <span>{session.time}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-800">
                      <div>{student.name}</div>
                      <div className="text-xs text-gray-500">
                        Roll: {student.rollNo}
                      </div>
                    </td>
                    {selectedWeekSessions.map((session) => {
                      // For simplicity, use session date as identifier
                      const status = getAttendanceStatus(
                        student.id,
                        session.date
                      );
                      return (
                        <td key={session.id} className="px-3 py-3 text-center">
                          <div className="flex justify-center">
                            <div className="relative group">
                              <button
                                className={`status-badge ${getStatusColor(
                                  status
                                )} text-sm px-3 py-1.5`}
                                onClick={() => {
                                  // Cycle through statuses: null -> present -> absent -> leave -> present
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
                                    student.id,
                                    session.id,
                                    nextStatus
                                  );
                                }}
                              >
                                {getStatusLabel(status) || "Mark"}
                              </button>

                              {/* Tooltip */}
                              <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-20">
                                Click to mark
                              </div>
                            </div>
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
          {isAdmin && (
            <div className="flex items-center gap-2">
              <div className="status-badge status-holiday">H</div>
              <span className="text-sm text-gray-600">Holiday</span>
            </div>
          )}
        </div>

        {/* Info Note for Admin */}
        {isAdmin && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
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
