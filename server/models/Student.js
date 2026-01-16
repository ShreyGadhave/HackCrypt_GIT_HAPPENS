const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide student name'],
      trim: true,
    },
    rollNo: {
      type: String,
      required: [true, 'Please provide roll number'],
      unique: true,
    },
    class: {
      type: String,
      required: [true, 'Please provide class'],
    },
    section: {
      type: String,
      required: [true, 'Please provide section'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    parentName: {
      type: String,
      default: '',
    },
    parentPhone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
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

module.exports = mongoose.model('Student', studentSchema);
