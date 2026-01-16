import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

interface User {
    id: string;
    name: string;
    email: string;
    studentId: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@attendx_user';

// Dummy credentials
const DUMMY_CREDENTIALS = {
    email: 'student@university.edu',
    password: 'password123',
    user: {
        id: 'STU2024001',
        name: 'Jake Blanco',
        email: 'student@university.edu',
        studentId: 'STU2024001',
    },
};

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

        const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'verification';
        const inPublicGroup = segments[0] === 'login' || segments[0] === 'index' || segments[0] === 'location-permission';

        if (!user && inAuthGroup) {
            // User not logged in but trying to access protected routes
            router.replace('/login');
        }
        // Removed aggressive redirect to home for logged-in users to prevent navigation issues
        // The Splash screen (index.tsx) handles the initial redirect
    }, [user, segments, isLoading]);

    const loadUser = async () => {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEY);
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // For demo: Accept any email and password
            // Create a user object from the provided email
            const userData: User = {
                id: 'STU2024001',
                name: 'Jake Blanco',
                email: email,
                studentId: 'STU2024001',
            };

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            setUser(userData);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setUser(null);
            router.replace('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
