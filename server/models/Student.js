const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide student name"],
      trim: true,
    },
    rollNo: {
      type: String,
      required: [true, "Please provide roll number"],
      unique: true,
    },
    class: {
      type: String,
      required: [true, "Please provide class"],
    },
    section: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      select: false,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    idCard: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: Date,
    },
    parentName: {
      type: String,
      default: "",
    },
    parentPhone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only if password is modified)
studentSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Student", studentSchema);
