const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Placeholder routes - will be implemented later
router.get('/', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, data: [] });
});

module.exports = router;
