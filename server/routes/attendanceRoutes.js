const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAttendanceRecords,
  getAttendanceStats,
  getDayWiseSummary,
  getSessionWiseSummary,
  getStudentAttendance,
} = require("../controllers/attendanceController");

// Statistics and summaries
router.get("/stats", protect, getAttendanceStats);
router.get("/day-summary", protect, authorize("admin"), getDayWiseSummary);
router.get("/session-summary", protect, getSessionWiseSummary);

// Student-specific attendance
router.get("/student/:studentId", protect, getStudentAttendance);

// General attendance records
router.get("/", protect, getAttendanceRecords);

module.exports = router;
