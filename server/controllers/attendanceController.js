const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Session = require("../models/Session");

// @desc    Get attendance records with filters
// @route   GET /api/attendance
// @access  Private
exports.getAttendanceRecords = async (req, res) => {
  try {
    const {
      class: className,
      section,
      month,
      year,
      startDate,
      endDate,
      student,
      session,
    } = req.query;

    // Build filter object
    const filter = {};

    // Date filtering
    if (month && year) {
      // Get attendance for specific month
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, parseInt(month) + 1, 0);
      filter.date = { $gte: monthStart, $lte: monthEnd };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Student filter
    if (student) {
      filter.student = student;
    }

    // Session filter
    if (session) {
      filter.session = session;
    }

    // If class/section provided, filter students first
    let studentIds = null;
    if (className || section) {
      const studentFilter = {};
      if (className) studentFilter.class = className;
      if (section) studentFilter.section = section;

      const students = await Student.find(studentFilter).select("_id");
      studentIds = students.map((s) => s._id);
      filter.student = { $in: studentIds };
    }

    // If teacher role, only show their sessions' attendance
    if (req.user.role === "teacher") {
      const teacherSessions = await Session.find({
        teacher: req.user._id,
      }).select("_id");
      const sessionIds = teacherSessions.map((s) => s._id);
      filter.session = { $in: sessionIds };
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate("student", "name rollNo class section")
      .populate("session", "subject topic date startTime endTime")
      .populate("markedBy", "name email")
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords,
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance records",
      error: error.message,
    });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private
exports.getAttendanceStats = async (req, res) => {
  try {
    const { class: className, section, month, year, student } = req.query;

    // Build filter
    const filter = {};

    // Date filtering
    if (month && year) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, parseInt(month) + 1, 0);
      filter.date = { $gte: monthStart, $lte: monthEnd };
    }

    // Student filter
    if (student) {
      filter.student = student;
    } else if (className || section) {
      // Filter by class/section
      const studentFilter = {};
      if (className) studentFilter.class = className;
      if (section) studentFilter.section = section;

      const students = await Student.find(studentFilter).select("_id");
      const studentIds = students.map((s) => s._id);
      filter.student = { $in: studentIds };
    }

    // If teacher, only their sessions
    if (req.user.role === "teacher") {
      const teacherSessions = await Session.find({
        teacher: req.user._id,
      }).select("_id");
      const sessionIds = teacherSessions.map((s) => s._id);
      filter.session = { $in: sessionIds };
    }

    // Aggregate statistics
    const stats = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total count
    const totalRecords = await Attendance.countDocuments(filter);

    // Calculate percentage
    const statsWithPercentage = stats.map((stat) => ({
      status: stat._id,
      count: stat.count,
      percentage:
        totalRecords > 0 ? ((stat.count / totalRecords) * 100).toFixed(2) : 0,
    }));

    res.json({
      success: true,
      data: {
        total: totalRecords,
        byStatus: statsWithPercentage,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance statistics",
      error: error.message,
    });
  }
};

// @desc    Get day-wise attendance summary (for admin view)
// @route   GET /api/attendance/day-summary
// @access  Private (Admin)
exports.getDayWiseSummary = async (req, res) => {
  try {
    const {
      class: className,
      section,
      month,
      year,
      startDate,
      endDate,
    } = req.query;

    // Build filter
    const filter = {};

    // Date filtering
    if (month && year) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, parseInt(month) + 1, 0);
      filter.date = { $gte: monthStart, $lte: monthEnd };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Get students by class/section
    const studentFilter = {};
    if (className) studentFilter.class = className;
    if (section) studentFilter.section = section;

    const students = await Student.find(studentFilter);
    const studentIds = students.map((s) => s._id);
    filter.student = { $in: studentIds };

    // Get all sessions in the date range
    const sessionFilter = {
      date: filter.date,
    };
    if (className) sessionFilter.class = className;
    if (section) sessionFilter.section = section;

    const sessions = await Session.find(sessionFilter);

    // Group attendance by student and date
    const attendanceRecords = await Attendance.find(filter)
      .populate("student")
      .populate("session")
      .sort({ date: 1 });

    // Create day-wise summary
    const summary = {};

    // Initialize summary for each student and date
    students.forEach((student) => {
      if (!summary[student._id]) {
        summary[student._id] = {
          student: {
            _id: student._id,
            name: student.name,
            rollNo: student.rollNo,
            class: student.class,
            section: student.section,
          },
          days: {},
        };
      }
    });

    // Process attendance records
    attendanceRecords.forEach((record) => {
      const studentId = record.student._id.toString();
      const dateKey = record.date.toISOString().split("T")[0];

      if (!summary[studentId].days[dateKey]) {
        summary[studentId].days[dateKey] = {
          date: dateKey,
          sessions: [],
          presentCount: 0,
          totalCount: 0,
        };
      }

      summary[studentId].days[dateKey].sessions.push({
        sessionId: record.session?._id,
        subject: record.session?.subject,
        status: record.status,
      });

      summary[studentId].days[dateKey].totalCount++;
      if (record.status === "present") {
        summary[studentId].days[dateKey].presentCount++;
      }
    });

    // Calculate total sessions per day from sessions collection
    const sessionsByDate = {};
    sessions.forEach((session) => {
      const dateKey = session.date.toISOString().split("T")[0];
      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = 0;
      }
      sessionsByDate[dateKey]++;
    });

    // Add total session count to summary
    Object.keys(summary).forEach((studentId) => {
      Object.keys(summary[studentId].days).forEach((dateKey) => {
        const totalSessionsForDay = sessionsByDate[dateKey] || 0;
        summary[studentId].days[dateKey].totalSessionsAvailable =
          totalSessionsForDay;
      });
    });

    res.json({
      success: true,
      data: Object.values(summary),
      sessionsByDate,
    });
  } catch (error) {
    console.error("Error fetching day-wise summary:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching day-wise attendance summary",
      error: error.message,
    });
  }
};

// @desc    Get session-wise attendance (for teacher view)
// @route   GET /api/attendance/session-summary
// @access  Private (Teacher)
exports.getSessionWiseSummary = async (req, res) => {
  try {
    const { sessionId, class: className, section } = req.query;

    // Build session filter
    const sessionFilter = {};

    // If teacher, only their sessions
    if (req.user.role === "teacher") {
      sessionFilter.teacher = req.user._id;
    }

    if (sessionId) {
      sessionFilter._id = sessionId;
    }

    if (className) sessionFilter.class = className;
    if (section) sessionFilter.section = section;

    // Get sessions
    const sessions = await Session.find(sessionFilter).sort({ date: -1 });

    // Get students
    const studentFilter = {};
    if (className) studentFilter.class = className;
    if (section) studentFilter.section = section;

    const students = await Student.find(studentFilter);

    // Get attendance for these sessions
    const sessionIds = sessions.map((s) => s._id);
    const attendanceRecords = await Attendance.find({
      session: { $in: sessionIds },
    })
      .populate("student")
      .populate("session");

    // Group by session
    const summary = sessions.map((session) => {
      const sessionAttendance = attendanceRecords.filter(
        (record) => record.session._id.toString() === session._id.toString()
      );

      const studentAttendance = students.map((student) => {
        const record = sessionAttendance.find(
          (att) => att.student._id.toString() === student._id.toString()
        );

        return {
          student: {
            _id: student._id,
            name: student.name,
            rollNo: student.rollNo,
          },
          status: record ? record.status : null,
          markedAt: record ? record.createdAt : null,
        };
      });

      return {
        session: {
          _id: session._id,
          subject: session.subject,
          topic: session.topic,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status,
        },
        attendance: studentAttendance,
        statistics: {
          total: students.length,
          present: sessionAttendance.filter((a) => a.status === "present")
            .length,
          absent: sessionAttendance.filter((a) => a.status === "absent").length,
          leave: sessionAttendance.filter((a) => a.status === "leave").length,
          unmarked: students.length - sessionAttendance.length,
        },
      };
    });

    res.json({
      success: true,
      count: summary.length,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching session-wise summary:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching session-wise attendance summary",
      error: error.message,
    });
  }
};

// @desc    Get student attendance report
// @route   GET /api/attendance/student/:studentId
// @access  Private
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year, startDate, endDate } = req.query;

    // Build filter
    const filter = { student: studentId };

    // Date filtering
    if (month && year) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, parseInt(month) + 1, 0);
      filter.date = { $gte: monthStart, $lte: monthEnd };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate("session", "subject topic date startTime endTime")
      .sort({ date: -1 });

    // Calculate statistics
    const stats = {
      total: attendanceRecords.length,
      present: attendanceRecords.filter((r) => r.status === "present").length,
      absent: attendanceRecords.filter((r) => r.status === "absent").length,
      leave: attendanceRecords.filter((r) => r.status === "leave").length,
    };

    stats.attendancePercentage =
      stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        records: attendanceRecords,
        statistics: stats,
      },
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student attendance",
      error: error.message,
    });
  }
};
