const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  getSessionStats,
} = require("../controllers/sessionController");

// Session statistics
router.get("/stats", protect, getSessionStats);

// CRUD operations
router
  .route("/")
  .get(protect, getSessions)
  .post(protect, authorize("teacher", "admin"), createSession);

router
  .route("/:id")
  .get(protect, getSession)
  .put(protect, authorize("teacher", "admin"), updateSession)
  .delete(protect, authorize("teacher", "admin"), deleteSession);

module.exports = router;
