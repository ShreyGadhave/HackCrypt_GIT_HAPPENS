const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const uploadDir = "uploads";
const studentDir = path.join(uploadDir, "students");
const teacherDir = path.join(uploadDir, "teachers");

[uploadDir, studentDir, teacherDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine upload folder based on route
    let folder = uploadDir;
    if (req.baseUrl.includes("students")) {
      folder = studentDir;
    } else if (req.baseUrl.includes("users")) {
      folder = teacherDir;
    }
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: fileFilter,
});

// Upload configurations for different scenarios
const uploadSingle = upload.single("image"); // Single image upload
const uploadProfile = upload.single("profilePhoto"); // Profile photo
const uploadIdCard = upload.single("idCard"); // ID card

// Student uploads - profile photo and ID card
const uploadStudentImages = upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "idCard", maxCount: 1 },
]);

// Teacher uploads - profile photo only
const uploadTeacherImage = upload.single("profilePhoto");

module.exports = {
  upload,
  uploadSingle,
  uploadProfile,
  uploadIdCard,
  uploadStudentImages,
  uploadTeacherImage,
};
