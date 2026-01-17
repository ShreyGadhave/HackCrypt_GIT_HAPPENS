const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Please provide subject"],
      trim: true,
    },
    topic: {
      type: String,
      default: "",
    },
    class: {
      type: String,
      required: [true, "Please provide class"],
    },
    section: {
      type: String,
      required: [true, "Please provide section"],
    },
    date: {
      type: Date,
      required: [true, "Please provide date"],
    },
    startTime: {
      type: String,
      required: [true, "Please provide start time"],
    },
    endTime: {
      type: String,
      required: [true, "Please provide end time"],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    gpsLocation: {
      latitude: Number,
      longitude: Number,
      city: String,
      region: String,
      country: String,
      ip: String,
      timezone: String,
      accuracy: Number,
      timestamp: Date,
    },
    joinRecords: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          default: "joined",
        },
        location: {
          latitude: Number,
          longitude: Number,
        },
        deviceInfo: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Session", sessionSchema);
