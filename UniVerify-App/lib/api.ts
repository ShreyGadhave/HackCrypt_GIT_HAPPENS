import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "@/constants/config";

// Backend API base URL
const API_BASE_URL = API_CONFIG.BASE_URL;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("@attendx_token");
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add any additional headers from options
      if (options.headers) {
        Object.assign(headers, options.headers);
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Create abort controller for manual timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.TIMEOUT
      );

      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log("API Response status:", response.status);

        const data = await response.json();

        console.log("API Response data:", {
          success: data.success,
          hasData: !!data.data,
          hasToken: !!data.token,
        });

        if (!response.ok) {
          console.log("API Error:", data.message);
          throw new Error(data.message || "Request failed");
        }

        return data;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error: any) {
      // Provide more specific error messages
      if (error.name === "AbortError") {
        const url = `${this.baseURL}${endpoint}`;
        throw new Error(
          `Connection timeout.\n\nTrying to reach: ${url}\n\nPlease verify:\n1. Backend server is running\n2. URL in config.ts is correct\n3. You're on the same network`
        );
      }
      if (error.message?.includes("Network request failed")) {
        const url = `${this.baseURL}${endpoint}`;
        throw new Error(
          `Cannot connect to server.\n\nAttempted URL: ${url}\n\nChecklist:\n✓ Backend running? (npm start in server folder)\n✓ Correct IP in config.ts?\n✓ Same WiFi network?\n✓ Firewall allowing port 5000?`
        );
      }
      if (error.message?.includes("Failed to fetch")) {
        throw new Error("Network error. Please check your connection.");
      }
      // Pass through server error messages (like "Invalid credentials")
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    console.log("API: Attempting login with:", {
      email,
      baseURL: this.baseURL,
    });
    return this.request<{
      id: string;
      name: string;
      email: string;
      role: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<{
      id: string;
      name: string;
      email: string;
      role: string;
    }>("/auth/me");
  }

  // Student endpoints
  async getStudent(studentId: string) {
    return this.request(`/students/${studentId}`);
  }

  async getStudents(params?: { search?: string; class?: string; section?: string; gender?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.class) queryParams.append('class', params.class);
    if (params?.section) queryParams.append('section', params.section);
    if (params?.gender) queryParams.append('gender', params.gender);
    
    const queryString = queryParams.toString();
    return this.request(`/students${queryString ? `?${queryString}` : ''}`);
  }

  // Attendance endpoints
  async markAttendance(qrToken: string, studentId: string) {
    return this.request("/attendance/mark", {
      method: "POST",
      body: JSON.stringify({ qrToken, studentId }),
    });
  }

  async getStudentAttendance(studentId: string) {
    return this.request(`/attendance/student/${studentId}`);
  }
}

export default new ApiClient(API_BASE_URL);
