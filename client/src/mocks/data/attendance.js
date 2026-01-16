import students from './students';

// Status types: 'present', 'absent', 'leave', 'holiday'
const statuses = ['present', 'absent', 'leave'];

// Generate attendance records for the past 30 days
const generateAttendance = () => {
  const records = [];
  const today = new Date();
  
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateString = date.toISOString().split('T')[0];
    
    // Check if it's a weekend (Saturday = 6, Sunday = 0)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    students.forEach(student => {
      if (isWeekend) {
        // Mark weekends as holidays
        records.push({
          id: `${student.id}-${dateString}`,
          studentId: student.id,
          studentName: student.name,
          date: dateString,
          status: 'holiday',
        });
      } else {
        // Random attendance with weighted probability
        const random = Math.random();
        let status;
        if (random < 0.85) {
          status = 'present'; // 85% present
        } else if (random < 0.95) {
          status = 'absent'; // 10% absent
        } else {
          status = 'leave'; // 5% leave
        }
        
        records.push({
          id: `${student.id}-${dateString}`,
          studentId: student.id,
          studentName: student.name,
          date: dateString,
          status,
        });
      }
    });
  }
  
  return records;
};

export const attendanceRecords = generateAttendance();

// Statistics helper
export const getAttendanceStats = (records) => {
  const stats = {
    present: 0,
    absent: 0,
    leave: 0,
    holiday: 0,
  };
  
  records.forEach(record => {
    stats[record.status]++;
  });
  
  return stats;
};

export default attendanceRecords;
