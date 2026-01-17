const Session = require("../models/Session");
const Attendance = require("../models/Attendance");

// @desc    Get all sessions with optional filters
// @route   GET /api/sessions
// @access  Private
exports.getSessions = async (req, res) => {
  try {
    const {
      teacher,
      class: className,
      section,
      status,
      startDate,
      endDate,
    } = req.query;

    // Build filter object
    const filter = {};

    // If user is a teacher, only show their sessions
    if (req.user.role === "teacher") {
      filter.teacher = req.user._id;
    } else if (teacher) {
      // Admin can filter by specific teacher
      filter.teacher = teacher;
    }

    if (className) filter.class = className;
    if (section) filter.section = section;
    if (status) filter.status = status;

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const sessions = await Session.find(filter)
      .populate("teacher", "name email subject")
      .sort({ date: -1, startTime: -1 });

    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sessions",
      error: error.message,
    });
  }
};

// @desc    Get single session by ID
// @route   GET /api/sessions/:id
// @access  Private
exports.getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate(
      "teacher",
      "name email subject"
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if teacher is trying to access someone else's session
    if (
      req.user.role === "teacher" &&
      session.teacher._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this session",
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching session",
      error: error.message,
    });
  }
};

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private (Teacher/Admin)
exports.createSession = async (req, res) => {
  try {
    const {
      class: className,
      section,
      subject,
      date,
      startTime,
      endTime,
      topic,
      gpsLocation,
    } = req.body;

    // Validation
    const missingFields = [];
    if (!className) missingFields.push("class");
    if (!section) missingFields.push("section");
    if (!subject) missingFields.push("subject");
    if (!date) missingFields.push("date");
    if (!startTime) missingFields.push("startTime");
    if (!endTime) missingFields.push("endTime");

    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      console.log("Request body:", req.body);
      return res.status(400).json({
        success: false,
        message: `Please provide all required fields: ${missingFields.join(", ")}`,
      });
    }

    // If teacher, use their ID; if admin, require teacher ID
    let teacherId;
    if (req.user.role === "teacher") {
      teacherId = req.user._id;
    } else if (req.body.teacher) {
      teacherId = req.body.teacher;
    } else {
      return res.status(400).json({
        success: false,
        message: "Admin must specify teacher ID",
      });
    }

    // Check for overlapping sessions
    const sessionDate = new Date(date);
    const overlappingSessions = await Session.find({
      teacher: teacherId,
      date: sessionDate,
      status: { $ne: "cancelled" },
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    });

    if (overlappingSessions.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Session time overlaps with an existing session",
      });
    }

    const session = await Session.create({
      teacher: teacherId,
      class: className,
      section,
      subject,
      date: sessionDate,
      startTime,
      endTime,
      topic: topic || "",
      status: "scheduled",
      gpsLocation,
    });

    const populatedSession = await Session.findById(session._id).populate(
      "teacher",
      "name email subject"
    );

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: populatedSession,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({
      success: false,
      message: "Error creating session",
      error: error.message,
    });
  }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private (Teacher/Admin)
exports.updateSession = async (req, res) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check authorization
    if (
      req.user.role === "teacher" &&
      session.teacher.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this session",
      });
    }

    // Don't allow updating completed sessions
    if (session.status === "completed" && req.body.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot modify completed session",
      });
    }

    // Update fields
    const allowedUpdates = [
      "class",
      "section",
      "subject",
      "date",
      "startTime",
      "endTime",
      "topic",
      "status",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        session[field] = req.body[field];
      }
    });

    await session.save();

    const updatedSession = await Session.findById(session._id).populate(
      "teacher",
      "name email subject"
    );

    res.json({
      success: true,
      message: "Session updated successfully",
      data: updatedSession,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({
      success: false,
      message: "Error updating session",
      error: error.message,
    });
  }
};

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private (Teacher/Admin)
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check authorization
    if (
      req.user.role === "teacher" &&
      session.teacher.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this session",
      });
    }

    // Don't allow deleting completed sessions with attendance records
    if (session.status === "completed") {
      const attendanceCount = await Attendance.countDocuments({
        session: session._id,
      });

      if (attendanceCount > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete completed session with attendance records. Consider cancelling instead.",
        });
      }
    }

    await session.deleteOne();

    res.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting session",
      error: error.message,
    });
  }
};

// @desc    Get session statistics
// @route   GET /api/sessions/stats
// @access  Private
exports.getSessionStats = async (req, res) => {
  try {
    const filter = {};

    // If teacher, only their sessions
    if (req.user.role === "teacher") {
      filter.teacher = req.user._id;
    }

    const stats = await Session.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSessions = await Session.countDocuments(filter);

    res.json({
      success: true,
      data: {
        total: totalSessions,
        byStatus: stats,
      },
    });
  } catch (error) {
    console.error("Error fetching session stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching session statistics",
      error: error.message,
    });
  }
};

// @desc    Generate QR token for session
// @route   POST /api/sessions/:id/qr-token
// @access  Private (Teacher/Admin)
exports.generateQRToken = async (req, res) => {
  try {
    const jwt = require("jsonwebtoken");

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check authorization - teacher can only generate for their own sessions
    if (
      req.user.role === "teacher" &&
      session.teacher.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to generate QR for this session",
      });
    }

    // Validate session is active (scheduled or ongoing)
    if (session.status === "completed" || session.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot generate QR for ${session.status} session`,
      });
    }

    // Calculate expiration time (session end time)
    const sessionDate = new Date(session.date);
    const [endHours, endMinutes] = session.endTime.split(":");
    const expirationTime = new Date(sessionDate);
    expirationTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    // Check if session has already expired
    if (expirationTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Session has already ended",
      });
    }

    // Create JWT payload with session details
    const payload = {
      sessionId: session._id.toString(),
      teacherId: session.teacher.toString(),
      class: session.class,
      section: session.section,
      subject: session.subject,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
    };

    // Generate JWT token that expires at session end time
    const expiresIn = Math.floor((expirationTime - new Date()) / 1000); // seconds until expiration

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: expiresIn,
    });

    res.json({
      success: true,
      data: {
        token,
        expiresAt: expirationTime,
      },
    });
  } catch (error) {
    console.error("Error generating QR token:", error);
    res.status(500).json({
      success: false,
      message: "Error generating QR token",
      error: error.message,
    });
  }
};

// @desc    Join a session
// @route   POST /api/sessions/:id/join
// @access  Private (Student)
exports.joinSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    // We might need Student model if we want to update Student's joinedSessions too
    // const Student = require("../models/Student"); 

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check if session is active
    if (session.status === "completed" || session.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot join a completed or cancelled session",
      });
    }

    const userId = req.user._id;
    const { latitude, longitude } = req.body;

    // Check if already joined
    const alreadyJoined = session.joinRecords.some(
      (record) => record.student.toString() === userId.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "You have already joined this session",
      });
    }

    // Add to joinRecords
    session.joinRecords.push({
      student: userId,
      timestamp: new Date(),
      status: "joined",
      location: {
        latitude,
        longitude,
      },
    });

    await session.save();

    res.json({
      success: true,
      message: "Successfully joined session",
      data: session, // Returning the updated session
    });
  } catch (error) {
    console.error("Error joining session:", error);
    res.status(500).json({
      success: false,
      message: "Error joining session",
      error: error.message,
    });
  }
};
