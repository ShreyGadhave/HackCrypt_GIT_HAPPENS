import { http, HttpResponse, delay } from 'msw';
import { attendanceRecords, getAttendanceStats } from '../data/attendance';
import students from '../data/students';

// In-memory storage for modified attendance
let attendanceData = [...attendanceRecords];

export const attendanceHandlers = [
  // Get attendance records
  http.get('/api/attendance', async ({ request }) => {
    await delay(400);
    
    const url = new URL(request.url);
    const classParam = url.searchParams.get('class');
    const section = url.searchParams.get('section');
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');
    
    let filtered = attendanceData;
    
    if (classParam) {
      filtered = filtered.filter(r => {
        const student = students.find(s => s.id === r.studentId);
        return student?.class === classParam;
      });
    }
    
    if (month && year) {
      filtered = filtered.filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === parseInt(month) && date.getFullYear() === parseInt(year);
      });
    }
    
    return HttpResponse.json({
      success: true,
      data: filtered,
      stats: getAttendanceStats(filtered),
    });
  }),
  
  // Get students
  http.get('/api/students', async ({ request }) => {
    await delay(300);
    
    const url = new URL(request.url);
    const classParam = url.searchParams.get('class');
    const section = url.searchParams.get('section');
    
    let filtered = students;
    
    if (classParam) {
      filtered = filtered.filter(s => s.class === classParam);
    }
    
    if (section) {
      filtered = filtered.filter(s => s.section === section);
    }
    
    return HttpResponse.json({
      success: true,
      data: filtered,
    });
  }),
  
  // Mark attendance
  http.post('/api/attendance/mark', async ({ request }) => {
    await delay(400);
    
    const { studentId, date, status } = await request.json();
    
    const existingIndex = attendanceData.findIndex(
      r => r.studentId === studentId && r.date === date
    );
    
    if (existingIndex !== -1) {
      attendanceData[existingIndex].status = status;
    } else {
      const student = students.find(s => s.id === studentId);
      attendanceData.push({
        id: `${studentId}-${date}`,
        studentId,
        studentName: student?.name || 'Unknown',
        date,
        status,
      });
    }
    
    return HttpResponse.json({
      success: true,
      message: 'Attendance marked successfully',
    });
  }),
  
  // Get attendance stats
  http.get('/api/attendance/stats', async () => {
    await delay(300);
    
    const stats = getAttendanceStats(attendanceData);
    const totalDays = Math.floor(attendanceData.length / students.length);
    
    return HttpResponse.json({
      success: true,
      data: {
        ...stats,
        totalDays,
        totalStudents: students.length,
        presentPercentage: ((stats.present / (attendanceData.length - stats.holiday)) * 100).toFixed(2),
      },
    });
  }),
];
