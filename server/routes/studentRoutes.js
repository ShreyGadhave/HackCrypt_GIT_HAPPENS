const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { uploadStudentImages } = require("../middleware/uploadMiddleware");

// Get all students with filters
router.get("/", protect, getStudents);

// Create new student (Admin only, with image uploads)
router.post(
  "/create",
  protect,
  authorize("admin"),
  uploadStudentImages,
  createStudent
);

// Get single student
router.get("/:id", protect, getStudent);

// Update student (Admin only, with image uploads)
router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadStudentImages,
  updateStudent
);

// Delete student (Admin only)
router.delete("/:id", protect, authorize("admin"), deleteStudent);

module.exports = router;
