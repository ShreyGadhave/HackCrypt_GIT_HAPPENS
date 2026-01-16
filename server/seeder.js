const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Session = require('./models/Session');
const Attendance = require('./models/Attendance');
const File = require('./models/File');

// Load env vars
dotenv.config();

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Sample data
const users = [
  {
    name: 'Udita Pathak',
    email: 'admin@school.edu',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Udita+Pathak&background=0099FF&color=fff',
  },
  {
    name: 'John Teacher',
    email: 'teacher@school.edu',
    password: 'teacher123',
    role: 'teacher',
    subject: 'Mathematics',
    phoneNumber: '+91 98765 43210',
    avatar: 'https://ui-avatars.com/api/?name=John+Teacher&background=0099FF&color=fff',
  },
  {
    name: 'Sarah Teacher',
    email: 'sarah@school.edu',
    password: 'teacher123',
    role: 'teacher',
    subject: 'Science',
    phoneNumber: '+91 98765 43211',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Teacher&background=0099FF&color=fff',
  },
  {
    name: 'Michael Johnson',
    email: 'michael@school.edu',
    password: 'teacher123',
    role: 'teacher',
    subject: 'English',
    phoneNumber: '+91 98765 43212',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Johnson&background=0099FF&color=fff',
  },
  {
    name: 'Emily Davis',
    email: 'emily@school.edu',
    password: 'teacher123',
    role: 'teacher',
    subject: 'Social Studies',
    phoneNumber: '+91 98765 43213',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=0099FF&color=fff',
  },
];

const students = [
  { name: 'Rahul Sharma', rollNo: '101', class: '10', section: 'A', gender: 'Male' },
  { name: 'Priya Patel', rollNo: '102', class: '10', section: 'A', gender: 'Female' },
  { name: 'Amit Kumar', rollNo: '103', class: '10', section: 'A', gender: 'Male' },
  { name: 'Sneha Gupta', rollNo: '104', class: '10', section: 'A', gender: 'Female' },
  { name: 'Vikram Singh', rollNo: '105', class: '10', section: 'A', gender: 'Male' },
  { name: 'Anjali Reddy', rollNo: '106', class: '10', section: 'A', gender: 'Female' },
  { name: 'Rohan Mehta', rollNo: '107', class: '10', section: 'A', gender: 'Male' },
  { name: 'Pooja Singh', rollNo: '108', class: '10', section: 'A', gender: 'Female' },
  { name: 'Arjun Nair', rollNo: '109', class: '10', section: 'A', gender: 'Male' },
  { name: 'Divya Iyer', rollNo: '110', class: '10', section: 'A', gender: 'Female' },
];

// Import data
const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Student.deleteMany();
    await Session.deleteMany();
    await Attendance.deleteMany();
    await File.deleteMany();

    // Import Users
    console.log('Importing users...');
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);

    // Import Students
    console.log('Importing students...');
    const createdStudents = await Student.create(students);
    console.log(`${createdStudents.length} students created`);

    // Get a teacher for sessions
    const teacher = createdUsers.find(u => u.role === 'teacher');

    // Create sample sessions
    console.log('Creating sample sessions...');
    const sessions = [
      {
        subject: 'Mathematics',
        topic: 'Algebra Basics',
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago (Monday)
        startTime: '09:00',
        endTime: '10:00',
        class: '10',
        section: 'A',
        teacher: teacher._id,
        status: 'completed',
      },
      {
        subject: 'Mathematics',
        topic: 'Geometry - Triangles',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (Tuesday)
        startTime: '10:00',
        endTime: '11:00',
        class: '10',
        section: 'A',
        teacher: teacher._id,
        status: 'completed',
      },
      {
        subject: 'Mathematics',
        topic: 'Trigonometry',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago (Wednesday)
        startTime: '11:00',
        endTime: '12:00',
        class: '10',
        section: 'A',
        teacher: teacher._id,
        status: 'completed',
      },
      {
        subject: 'Mathematics',
        topic: 'Calculus Introduction',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (Thursday)
        startTime: '09:00',
        endTime: '10:00',
        class: '10',
        section: 'A',
        teacher: teacher._id,
        status: 'completed',
      },
      {
        subject: 'Mathematics',
        topic: 'Statistics and Probability',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (Friday)
        startTime: '10:00',
        endTime: '11:00',
        class: '10',
        section: 'A',
        teacher: teacher._id,
        status: 'completed',
      },
      {
        subject: 'Mathematics',
        topic: 'Coordinate Geometry',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (Saturday)
        startTime: '11:00',
        endTime: '12:00',
        class: '10',
        section: 'A',
        teacher: teacher._id,
        status: 'completed',
      },
      {
        subject: 'Mathematics',
        topic: 'Linear Equations',
        date: new Date(), // Today (Sunday)
        startTime: '09:00',
        endTime: '10:00',
        class: '10',
        section: 'A',
        teacher: teacher._id,
        status: 'scheduled',
      },
      {
        subject: 'Mathematics',
        topic: 'Quadratic Equations',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day ahead (Monday)
        startTime: '10:00',
        endTime: '11:00',
        class: '10',
        section: 'A',
        teacher: teacher._id,
        status: 'scheduled',
      },
      {
        subject: 'Mathematics',
        topic: 'Sets and Functions',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days ahead (Tuesday)
        startTime: '11:00',
        endTime: '12:00',
        class: '10',
        section: 'A',
        teacher: teacher._id,
        status: 'scheduled',
      },
      {
        subject: 'Mathematics',
        topic: 'Number Theory',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days ahead (Wednesday)
        startTime: '09:00',
        endTime: '10:00',
        class: '10',
        section: 'A',
        teacher: teacher._id,
        status: 'scheduled',
      },
    ];

    const createdSessions = await Session.create(sessions);
    console.log(`${createdSessions.length} sessions created`);

    // Create sample attendance records
    console.log('Creating sample attendance records...');
    const attendanceRecords = [];
    const statuses = ['present', 'absent', 'leave'];

    for (let i = 0; i < 6; i++) { // For first 6 sessions (completed)
      for (let student of createdStudents) {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        attendanceRecords.push({
          student: student._id,
          date: createdSessions[i].date,
          status: randomStatus,
          session: createdSessions[i]._id,
          markedBy: teacher._id,
        });
      }
    }

    await Attendance.create(attendanceRecords);
    console.log(`${attendanceRecords.length} attendance records created`);

    console.log('\n✅ Data imported successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@school.edu / admin123');
    console.log('Teacher: teacher@school.edu / teacher123');
    
    process.exit();
  } catch (err) {
    console.error('Error importing data:', err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await connectDB();
    
    await User.deleteMany();
    await Student.deleteMany();
    await Session.deleteMany();
    await Attendance.deleteMany();
    await File.deleteMany();
    
    console.log('✅ Data deleted successfully!');
    process.exit();
  } catch (err) {
    console.error('Error deleting data:', err);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}
