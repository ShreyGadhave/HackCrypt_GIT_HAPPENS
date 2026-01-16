export const studentData = {
    name: "Rahul Sharma",
    rollNumber: "21CS101",
    attendancePercentage: 78,
    totalClasses: 45,
    attended: 35,
    absent: 10,
};

export const weeklyAttendance = [
    { day: "Mon", present: 4, absent: 1 },
    { day: "Tue", present: 5, absent: 0 },
    { day: "Wed", present: 3, absent: 2 },
    { day: "Thu", present: 4, absent: 1 },
    { day: "Fri", present: 5, absent: 0 },
];

export const todayClass = {
    subject: "Data Structures",
    time: "10:00 AM - 11:00 AM",
    room: "Room 301",
    faculty: "Dr. Priya Mehta",
};

export const attendanceHistory = [
    {
        month: "January",
        subjects: [
            { name: "Data Structures", present: 12, total: 15, percentage: 80 },
            { name: "Operating Systems", present: 10, total: 14, percentage: 71 },
            { name: "DBMS", present: 13, total: 16, percentage: 81 },
        ],
    },
    {
        month: "December",
        subjects: [
            { name: "Data Structures", present: 14, total: 16, percentage: 87 },
            { name: "Operating Systems", present: 13, total: 15, percentage: 86 },
            { name: "DBMS", present: 15, total: 16, percentage: 93 },
        ],
    },
];

export const facultyData = {
    name: "Dr. Priya Mehta",
    subject: "Data Structures",
    totalStudents: 60,
    presentToday: 52,
    verified: 50,
    failed: 2,
    suspicious: 0,
};

export const classStudents = [
    { id: 1, name: "Rahul Sharma", rollNumber: "21CS101", status: "verified" },
    { id: 2, name: "Priya Patel", rollNumber: "21CS102", status: "verified" },
    { id: 3, name: "Amit Kumar", rollNumber: "21CS103", status: "verified" },
    { id: 4, name: "Sneha Reddy", rollNumber: "21CS104", status: "failed" },
    { id: 5, name: "Vikram Singh", rollNumber: "21CS105", status: "verified" },
    { id: 6, name: "Ananya Iyer", rollNumber: "21CS106", status: "verified" },
    { id: 7, name: "Rohan Gupta", rollNumber: "21CS107", status: "verified" },
    { id: 8, name: "Kavya Nair", rollNumber: "21CS108", status: "failed" },
];
