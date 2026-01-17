import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import api from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePhoto?: string;
  studentId?: string;
  rollNo?: string;
  class?: string;
  section?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "@attendx_user";
const TOKEN_KEY = "@attendx_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Handle navigation based on auth state
  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup =
      segments[0] === "(tabs)" || segments[0] === "verification";
    const inPublicGroup =
      segments[0] === "login" ||
      segments[0] === "index" ||
      segments[0] === "location-permission";

    if (!user && inAuthGroup) {
      // User not logged in but trying to access protected routes
      router.replace("/login");
    }
    // Removed aggressive redirect to home for logged-in users to prevent navigation issues
    // The Splash screen (index.tsx) handles the initial redirect
  }, [user, segments, isLoading]);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userData = await AsyncStorage.getItem(STORAGE_KEY);

      // If we have both token and user data, use them immediately
      if (token && userData) {
        try {
          const storedUser = JSON.parse(userData);
          // Set user immediately from storage for persistence
          setUser(storedUser);
          
          // Then try to validate/refresh in background
          try {
            const response = await api.getMe();
            if (response.success && response.data) {
              // Token is valid, update user data from backend
              const validUser: User = {
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role,
                profilePhoto: response.data.profilePhoto,
                studentId: response.data.studentId,
                rollNo: response.data.rollNo,
                class: response.data.class,
                section: response.data.section,
              };
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validUser));
              setUser(validUser);
            }
          } catch (error) {
            // Network error - keep using stored user data
            // Only clear auth if it's a 401 (unauthorized) error
            if (error instanceof Error && error.message.includes("401")) {
              console.log("Token expired, clearing auth");
              await clearAuth();
            } else {
              // Network error - keep user logged in with cached data
              console.log("Network error during token validation, using cached user");
            }
          }
        } catch (error) {
          // Failed to parse stored data
          console.log("Failed to parse stored user data, clearing auth");
          await clearAuth();
        }
      } else {
        // No token or user data, ensure clean state
        setUser(null);
      }
    } catch (error) {
      console.log("Failed to load user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } catch (error) {
      console.error("Failed to clear auth:", error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(email, password);

      if (response.success && response.data && response.token) {
        // Store token
        await AsyncStorage.setItem(TOKEN_KEY, response.token);

        // Store user data with all available fields
        const userData: User = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          profilePhoto: response.data.profilePhoto,
          studentId: response.data.studentId,
          rollNo: response.data.rollNo,
          class: response.data.class,
          section: response.data.section,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error: any) {
      // Don't log error here - let the UI handle it
      // Re-throw with user-friendly message
      throw new Error(error.message || "Login failed. Please try again.");
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.getMe();
      if (response.success && response.data) {
        const userData: User = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          profilePhoto: response.data.profilePhoto,
          studentId: response.data.studentId,
          rollNo: response.data.rollNo,
          class: response.data.class,
          section: response.data.section,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      // Silent log - don't show error when refreshing user data
      // User might be offline temporarily
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
      setUser(null);
      router.replace("/login");
    } catch (error) {
      // Silent log
      console.log("Logout error, forcing to login screen");
      setUser(null);
      router.replace("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
