const Student = require("../models/Student");

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
