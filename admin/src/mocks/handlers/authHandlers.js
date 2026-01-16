import { http, HttpResponse, delay } from "msw";
import users from "../data/users";

export const authHandlers = [
  // Login
  http.post("/api/auth/login", async ({ request }) => {
    await delay(500); // Simulate network delay

    const { email, password } = await request.json();

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return HttpResponse.json({
        success: true,
        user: userWithoutPassword,
        role: user.role,
        token: "mock-jwt-token-" + user.id,
      });
    }

    return HttpResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }),

  // Logout
  http.post("/api/auth/logout", async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  }),

  // Get current user
  http.get("/api/auth/me", async ({ request }) => {
    await delay(300);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    // Mock token validation
    const userId = authHeader.split("-").pop();
    const user = users.find((u) => u.id.toString() === userId);

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return HttpResponse.json({
        success: true,
        user: userWithoutPassword,
      });
    }

    return HttpResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }),
];
