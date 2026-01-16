const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getStudents,
  getStudent,
} = require("../controllers/studentController");

// Get all students with filters
router.get("/", protect, getStudents);

// Get single student
router.get("/:id", protect, getStudent);

module.exports = router;
