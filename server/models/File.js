const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide file name"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "Assignment",
        "Notes",
        "Study Material",
        "Question Paper",
        "Solution",
        "Notice",
        "Circular",
        "Policy",
        "Event",
        "Announcement",
      ],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    class: {
      type: String,
    },
    section: {
      type: String,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("File", fileSchema);
