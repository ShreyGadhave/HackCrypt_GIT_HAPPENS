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
  generateQRToken,
  joinSession,
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

// QR token generation for attendance
router.post(
  "/:id/qr-token",
  protect,
  authorize("teacher", "admin"),
  generateQRToken
);

// Join session
router.post("/:id/join", protect, joinSession);

module.exports = router;
