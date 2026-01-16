const User = require("../models/User");
const { generateToken } = require("../utils/tokenUtils");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, subject, phoneNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "teacher",
      subject,
      phoneNumber,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject,
        phoneNumber: user.phoneNumber,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;


    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check for user by email OR username (for students)
    let user = await User.findOne({ email }).select("+password");

    // If not found as User, check if it's a student username
    if (!user) {
      const Student = require("../models/Student");
      const student = await Student.findOne({
        $or: [{ username: email }, { rollNo: email }],
      }).select("+password");

      if (student && student.password) {
        // Convert student to user-like object for consistent response
        user = student;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }


    // Check if password matches
    const isMatch = await user.comparePassword(password);


    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);


    // Return appropriate user data based on type
    const userData = user.role
      ? {
          // User (Teacher/Admin)
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subject: user.subject,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
        }
      : {
          // Student
          id: user._id,
          name: user.name,
          email: user.username || user.rollNo, // Use username as email for students
          role: "student",
          rollNo: user.rollNo,
          class: user.class,
          section: user.section,
        };

    res.json({
      success: true,
      data: userData,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
