export interface Student {
    id: string;
    name: string;
    email: string;
    college: string;
    department: string;
    year: string;
    avatar: string;
}

export interface AttendanceRecord {
    id: string;
    date: string;
    checkIn: string;
    checkOut: string;
    status: 'present' | 'absent' | 'late';
    day: string;
}

export interface AttendanceStats {
    totalDays: number;
    present: number;
    absent: number;
    percentage: number;
}

export interface Session {
    id: string;
    subject: string;
    classroom: string;
    time: string;
    date?: string;
    status: 'live' | 'upcoming';
}

export const studentData: Student = {
    id: 'STU2024001',
    name: 'Jake Blanco',
    email: 'student@university.edu',
    college: 'University of Technology',
    department: 'Computer Science',
    year: '3rd Year',
    avatar: '👨‍🎓',
};

export const attendanceStats: AttendanceStats = {
    totalDays: 45,
    present: 38,
    absent: 7,
    percentage: 84.4,
};

export const sessions: Session[] = [
    {
        id: '1',
        subject: 'Data Structures',
        classroom: 'Room 301, Block A',
        time: '10:00 AM - 11:30 AM',
        status: 'live',
    },
    {
        id: '2',
        subject: 'Web Development',
        classroom: 'Lab 205, Block B',
        time: '02:00 PM - 03:30 PM',
        status: 'live',
    },
    {
        id: '3',
        subject: 'Database Management',
        classroom: 'Room 402, Block A',
        time: '11:45 AM - 01:15 PM',
        date: 'Tomorrow',
        status: 'upcoming',
    },
    {
        id: '4',
        subject: 'Machine Learning',
        classroom: 'Lab 301, Block C',
        time: '03:45 PM - 05:15 PM',
        date: 'Tomorrow',
        status: 'upcoming',
    },
];

export const attendanceHistory: AttendanceRecord[] = [
    {
        id: '1',
        date: '16-01-2026',
        day: 'Friday',
        checkIn: '07:58:59',
        checkOut: '16:10:12',
        status: 'present',
    },
    {
        id: '2',
        date: '15-01-2026',
        day: 'Thursday',
        checkIn: '07:35:03',
        checkOut: '18:30:45',
        status: 'present',
    },
    {
        id: '3',
        date: '14-01-2026',
        day: 'Wednesday',
        checkIn: '--:--:--',
        checkOut: '--:--:--',
        status: 'absent',
    },
    {
        id: '4',
        date: '13-01-2026',
        day: 'Tuesday',
        checkIn: '07:58:00',
        checkOut: '16:01:03',
        status: 'present',
    },
    {
        id: '5',
        date: '12-01-2026',
        day: 'Monday',
        checkIn: '08:15:22',
        checkOut: '17:05:18',
        status: 'late',
    },
];

export const getCurrentDate = (): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const now = new Date();
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    return `${dayName}, ${day} ${month} ${year}`;
};

export const getCurrentTime = (): string => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
};
