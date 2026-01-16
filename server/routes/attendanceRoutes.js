const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Placeholder routes - will be implemented later
router.get('/', protect, (req, res) => {
  res.json({ success: true, data: [] });
});

module.exports = router;
