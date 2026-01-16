import { http, HttpResponse, delay } from "msw";
import { users } from "../data/users";
import { students } from "../data/students";

let teachersList = [...users.filter((u) => u.role === "teacher")];
let studentsList = [...students];

export const usersHandlers = [
  // Get all teachers
  http.get("/api/users", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const role = url.searchParams.get("role");

    if (role === "teacher") {
      return HttpResponse.json({
        success: true,
        data: teachersList,
      });
    }

    return HttpResponse.json({
      success: true,
      data: users,
    });
  }),

  // Create new user (teacher)
  http.post("/api/users/create", async ({ request }) => {
    await delay(300);
    const data = await request.json();

    const newTeacher = {
      id: teachersList.length + 100,
      ...data,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        data.name
      )}&background=0099FF&color=fff`,
      password: "teacher123",
    };

    teachersList.push(newTeacher);

    return HttpResponse.json({
      success: true,
      data: newTeacher,
      message: "Teacher created successfully",
    });
  }),

  // Update user (teacher)
  http.put("/api/users/:id", async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const data = await request.json();

    const index = teachersList.findIndex((t) => t.id === parseInt(id));
    if (index !== -1) {
      teachersList[index] = {
        ...teachersList[index],
        ...data,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          data.name
        )}&background=0099FF&color=fff`,
      };

      return HttpResponse.json({
        success: true,
        data: teachersList[index],
        message: "Teacher updated successfully",
      });
    }

    return HttpResponse.json(
      {
        success: false,
        message: "Teacher not found",
      },
      { status: 404 }
    );
  }),

  // Delete user (teacher)
  http.delete("/api/users/:id", async ({ params }) => {
    await delay(300);
    const { id } = params;

    const index = teachersList.findIndex((t) => t.id === parseInt(id));
    if (index !== -1) {
      teachersList.splice(index, 1);

      return HttpResponse.json({
        success: true,
        message: "Teacher deleted successfully",
      });
    }

    return HttpResponse.json(
      {
        success: false,
        message: "Teacher not found",
      },
      { status: 404 }
    );
  }),

  // Get all students (with optional class filter)
  http.get("/api/students", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const classParam = url.searchParams.get("class");
    const section = url.searchParams.get("section");

    let filteredStudents = studentsList;

    if (classParam && classParam !== "all") {
      filteredStudents = studentsList.filter((s) => s.class === classParam);
    }

    if (section) {
      filteredStudents = filteredStudents.filter((s) => s.section === section);
    }

    return HttpResponse.json({
      success: true,
      data: filteredStudents,
    });
  }),

  // Create new student
  http.post("/api/students/create", async ({ request }) => {
    await delay(300);
    const data = await request.json();

    const newStudent = {
      id: studentsList.length + 100,
      ...data,
    };

    studentsList.push(newStudent);

    return HttpResponse.json({
      success: true,
      data: newStudent,
      message: "Student created successfully",
    });
  }),

  // Update student
  http.put("/api/students/:id", async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const data = await request.json();

    const index = studentsList.findIndex((s) => s.id === parseInt(id));
    if (index !== -1) {
      studentsList[index] = {
        ...studentsList[index],
        ...data,
      };

      return HttpResponse.json({
        success: true,
        data: studentsList[index],
        message: "Student updated successfully",
      });
    }

    return HttpResponse.json(
      {
        success: false,
        message: "Student not found",
      },
      { status: 404 }
    );
  }),

  // Delete student
  http.delete("/api/students/:id", async ({ params }) => {
    await delay(300);
    const { id } = params;

    const index = studentsList.findIndex((s) => s.id === parseInt(id));
    if (index !== -1) {
      studentsList.splice(index, 1);

      return HttpResponse.json({
        success: true,
        message: "Student deleted successfully",
      });
    }

    return HttpResponse.json(
      {
        success: false,
        message: "Student not found",
      },
      { status: 404 }
    );
  }),
];
