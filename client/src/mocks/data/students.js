import { faker } from '@faker-js/faker';

// Generate mock students
export const students = [
  { id: 1, name: 'Amarjyoti', rollNo: 1, class: 'Class 10', section: '10 A', email: 'amarjyoti@school.edu' },
  { id: 2, name: 'Puja Bhadari', rollNo: 2, class: 'Class 10', section: '10 A', email: 'puja@school.edu' },
  { id: 3, name: 'Jamshed', rollNo: 3, class: 'Class 10', section: '10 A', email: 'jamshed@school.edu' },
  { id: 4, name: 'Birbal', rollNo: 4, class: 'Class 10', section: '10 A', email: 'birbal@school.edu' },
  { id: 5, name: 'Neha', rollNo: 5, class: 'Class 10', section: '10 A', email: 'neha@school.edu' },
  { id: 6, name: 'Pulak', rollNo: 6, class: 'Class 10', section: '10 A', email: 'pulak@school.edu' },
  { id: 7, name: 'Samreen', rollNo: 7, class: 'Class 10', section: '10 A', email: 'samreen@school.edu' },
  { id: 8, name: 'Ezaz', rollNo: 8, class: 'Class 10', section: '10 A', email: 'ezaz@school.edu' },
  { id: 9, name: 'Mushtaq', rollNo: 9, class: 'Class 10', section: '10 A', email: 'mushtaq@school.edu' },
  { id: 10, name: 'Rahil', rollNo: 10, class: 'Class 10', section: '10 A', email: 'rahil@school.edu' },
];

// Generate additional random students
for (let i = 11; i <= 30; i++) {
  students.push({
    id: i,
    name: faker.person.fullName(),
    rollNo: i,
    class: 'Class 10',
    section: '10 A',
    email: faker.internet.email(),
  });
}

export default students;
