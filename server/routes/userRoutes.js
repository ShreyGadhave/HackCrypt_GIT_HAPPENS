const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { uploadTeacherImage } = require("../middleware/uploadMiddleware");

// Get all users (teachers)
router.get("/", protect, authorize("admin"), getUsers);

// Create new teacher (Admin only, with profile photo)
router.post(
  "/create",
  protect,
  authorize("admin"),
  uploadTeacherImage,
  createUser
);

// Get single user
router.get("/:id", protect, getUser);

// Update teacher (Admin only, with profile photo)
router.put("/:id", protect, authorize("admin"), uploadTeacherImage, updateUser);

// Delete teacher (Admin only)
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
