const Student = require("../models/Student");
const fs = require("fs");
const path = require("path");

// Helper function to generate username from name
const generateUsername = (name, rollNo) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, "");
  const cleanRoll = rollNo.replace(/\s+/g, "").toLowerCase();
  return `${cleanName}_${cleanRoll}`;
};

// Helper function to generate password from name and roll number
const generatePassword = (name, rollNo) => {
  const firstName = name.split(" ")[0].toLowerCase();
  return `${firstName}${rollNo}`;
};

// @desc    Get all students with optional filters
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res) => {
  try {
    const { class: className, section, gender, search } = req.query;

    // Build filter object
    const filter = {};

    if (className) filter.class = className;
    if (section) filter.section = section;
    if (gender) filter.gender = gender;

    // Search by name or roll number
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNo: { $regex: search, $options: "i" } },
      ];
    }

    const students = await Student.find(filter).sort({ rollNo: 1 });

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message,
    });
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
  console.log(req.params);
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student",
      error: error.message,
    });
  }
};

// @desc    Create new student
// @route   POST /api/students/create
// @access  Private (Admin only)
exports.createStudent = async (req, res) => {
  try {
    const { name, rollNo, class: className, section, gender } = req.body;

    // Check if student with same roll number exists
    const existingStudent = await Student.findOne({ rollNo });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this roll number already exists",
      });
    }

    // Generate username and password
    const username = generateUsername(name, rollNo);
    const password = generatePassword(name, rollNo);

    // Create student object
    const studentData = {
      name,
      rollNo,
      class: className,
      section,
      gender,
      username,
      password,
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePhoto) {
        studentData.profilePhoto = req.files.profilePhoto[0].path;
      }
      if (req.files.idCard) {
        studentData.idCard = req.files.idCard[0].path;
      }
    }

    const student = await Student.create(studentData);

    // Remove password from response
    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: studentResponse,
      credentials: {
        username,
        password: generatePassword(name, rollNo), // Send plain password for first time
      },
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({
      success: false,
      message: "Error creating student",
      error: error.message,
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin only)
exports.updateStudent = async (req, res) => {
  try {
    const { name, rollNo, class: className, section, gender } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if roll number is being changed and if it's already taken
    if (rollNo && rollNo !== student.rollNo) {
      const existingStudent = await Student.findOne({ rollNo });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: "Roll number already exists",
        });
      }
    }

    // Update basic fields
    if (name) {
      student.name = name;
      // Regenerate username if name or rollNo changed
      if (rollNo) {
        student.username = generateUsername(name, rollNo);
      } else {
        student.username = generateUsername(name, student.rollNo);
      }
    }
    if (rollNo) student.rollNo = rollNo;
    if (className) student.class = className;
    if (section) student.section = section;
    if (gender) student.gender = gender;

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePhoto) {
        // Delete old profile photo if exists
        if (student.profilePhoto && fs.existsSync(student.profilePhoto)) {
          fs.unlinkSync(student.profilePhoto);
        }
        student.profilePhoto = req.files.profilePhoto[0].path;
      }
      if (req.files.idCard) {
        // Delete old ID card if exists
        if (student.idCard && fs.existsSync(student.idCard)) {
          fs.unlinkSync(student.idCard);
        }
        student.idCard = req.files.idCard[0].path;
      }
    }

    await student.save();

    res.json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "Error updating student",
      error: error.message,
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Delete associated files
    if (student.profilePhoto && fs.existsSync(student.profilePhoto)) {
      fs.unlinkSync(student.profilePhoto);
    }
    if (student.idCard && fs.existsSync(student.idCard)) {
      fs.unlinkSync(student.idCard);
    }

    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting student",
      error: error.message,
    });
  }
};
