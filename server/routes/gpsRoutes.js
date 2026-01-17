const express = require("express");
const router = express.Router();

// @route   GET /teacher/gps
// @desc    Get current GPS location (Mock)
// @access  Public (or Protected if needed, currently Public for simplicity as per request)
router.get("/", (req, res) => {
    // Mock GPS response
    const mockLocation = {
        success: true,
        latitude: 19.1164,
        longitude: 72.90471,
        city: "Powai",
        region: "Maharashtra",
        country: "India",
        ip: "103.127.117.161",
        timezone: "Asia/Kolkata",
        error: null
    };

    res.status(200).json({
        success: true,
        data: mockLocation,
    });
});

// @route   POST /validate
// @desc    Validate if student is within radius of teacher
// @access  Public (Protected in production)
router.post("/validate", (req, res) => {
    const { teacher_lat, teacher_lon, student_lat, student_lon, radius } = req.body;

    if (
        teacher_lat === undefined ||
        teacher_lon === undefined ||
        student_lat === undefined ||
        student_lon === undefined ||
        radius === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields",
        });
    }

    // Haversine formula to calculate distance in meters
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters

    const phi1 = toRad(teacher_lat);
    const phi2 = toRad(student_lat);
    const deltaPhi = toRad(student_lat - teacher_lat);
    const deltaLambda = toRad(student_lon - teacher_lon);

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters

    const allowed = distance <= radius;

    res.status(200).json({
        success: true,
        data: {
            allowed,
            distance,
        },
    });
});

module.exports = router;
