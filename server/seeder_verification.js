const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Student = require("./models/Student");
const Session = require("./models/Session");
const Attendance = require("./models/Attendance");
const File = require("./models/File");

// Load env vars
dotenv.config();

// Connect to DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected...");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// Sample data
const users = [
    {
        name: "Udita Pathak",
        email: "admin@school.edu",
        password: "admin123",
        role: "admin",
        avatar: "https://ui-avatars.com/api/?name=Udita+Pathak&background=0099FF&color=fff",
    },
    {
        name: "John Teacher",
        email: "teacher@school.edu",
        password: "teacher123",
        role: "teacher",
        subject: "Mathematics",
        phoneNumber: "+91 98765 43210",
        avatar: "https://ui-avatars.com/api/?name=John+Teacher&background=0099FF&color=fff",
    },
];

const students = [
    {
        name: "Rahul Sharma",
        rollNo: "101",
        class: "10",
        section: "A",
        gender: "Male",
    },
];

// Import data
const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log("Clearing existing data...");
        await User.deleteMany();
        await Student.deleteMany();
        await Session.deleteMany();
        await Attendance.deleteMany();
        await File.deleteMany();

        // Import Users
        console.log("Importing users...");
        const createdUsers = await User.create(users);
        const teacher = createdUsers.find((u) => u.role === "teacher");

        // Import Students
        console.log("Importing students...");
        await Student.create(students);

        // Create verification sessions
        console.log("Creating verification sessions...");

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const sessions = [
            // LIVE SESSION (01:00 - 02:00, assuming current time is 01:38)
            {
                subject: "Mathematics",
                topic: "Live Session Test",
                date: now,
                startTime: "01:00",
                endTime: "02:00",
                class: "10",
                section: "A",
                teacher: teacher._id,
                status: "scheduled",
            },
            // UPCOMING SESSION (Today 03:00 - 04:00)
            {
                subject: "Science",
                topic: "Upcoming Session Test",
                date: now,
                startTime: "03:00",
                endTime: "04:00",
                class: "10",
                section: "A",
                teacher: teacher._id,
                status: "scheduled",
            },
            // COMPLETED SESSION (Yesterday 10:00 - 11:00)
            {
                subject: "English",
                topic: "Completed Session Test",
                date: yesterday,
                startTime: "10:00",
                endTime: "11:00",
                class: "10",
                section: "A",
                teacher: teacher._id,
                status: "completed",
            },
            // OVERNIGHT LIVE SESSION (Yesterday 23:00 - Today 02:00)
            {
                subject: "Physics",
                topic: "Overnight Session Test",
                date: yesterday,
                startTime: "23:00",
                endTime: "02:00",
                class: "10",
                section: "A",
                teacher: teacher._id,
                status: "scheduled",
            },
        ];

        await Session.create(sessions);
        console.log("Sessions created successfully");

        console.log("\n✅ Verification data imported!");
        console.log("Login with: teacher@school.edu / teacher123");

        process.exit();
    } catch (err) {
        console.error("Error importing data:", err);
        process.exit(1);
    }
};

importData();
