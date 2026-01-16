import { faker } from "@faker-js/faker";

// Generate mock sessions/lectures
const subjects = [
  "Mathematics",
  "Science",
  "English",
  "Social Studies",
  "Computer Science",
  "Physics",
];
const topics = {
  Mathematics: [
    "Algebra",
    "Geometry",
    "Trigonometry",
    "Calculus",
    "Statistics",
  ],
  Science: ["Biology", "Chemistry", "Physics", "Environmental Science"],
  English: ["Grammar", "Literature", "Writing Skills", "Poetry"],
  "Social Studies": ["History", "Geography", "Civics", "Economics"],
  "Computer Science": [
    "Programming",
    "Data Structures",
    "Web Development",
    "Databases",
  ],
  Physics: ["Mechanics", "Optics", "Electricity", "Modern Physics"],
};

const generateSessions = () => {
  const sessions = [];
  const today = new Date();

  for (let i = 0; i < 20; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 2); // Sessions every 2 days

    const subject = faker.helpers.arrayElement(subjects);
    const topic = faker.helpers.arrayElement(topics[subject] || ["General"]);

    sessions.push({
      id: i + 1,
      subject,
      topic,
      title: `${subject} - ${topic}`,
      description: faker.lorem.sentence(),
      date: date.toISOString().split("T")[0],
      time: `${faker.number.int({ min: 9, max: 15 })}:00`,
      duration: faker.helpers.arrayElement([45, 60, 90]), // minutes
      class: "Class 10",
      section: "10 A",
      teacher: faker.person.fullName(),
      room: `Room ${faker.number.int({ min: 101, max: 120 })}`,
      status: i < 5 ? "upcoming" : "completed",
      attendanceCount: i >= 5 ? faker.number.int({ min: 25, max: 30 }) : null,
      createdAt: date.toISOString(),
    });
  }

  return sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const sessions = generateSessions();

export default sessions;
