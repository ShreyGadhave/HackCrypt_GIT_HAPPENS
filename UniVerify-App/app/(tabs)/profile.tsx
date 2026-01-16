import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import ProfileInfoCard from '@/components/ProfileInfoCard';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';

interface StudentData {
    _id: string;
    name: string;
    rollNo: string;
    class: string;
    section: string;
    username?: string;
    dateOfBirth?: string;
    parentName?: string;
    parentContact?: string;
    address?: string;
}

export default function ProfileScreen() {
    const { user, logout, refreshUser } = useAuth();
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            // Refresh user data from backend (silently fails if offline)
            await refreshUser();
            
            // If user has a student ID, fetch student details
            if (user?.id) {
                try {
                    const response = await api.getStudent(user.id);
                    if (response.success && response.data) {
                        setStudentData(response.data);
                    }
                } catch (error: any) {
                    console.log('No student data available:', error.message);
                    // Continue with cached user data if backend is unavailable
                }
            }
        } catch (error: any) {
            console.error('Failed to fetch profile data:', error.message);
            // Show user-friendly message if completely offline
            Alert.alert(
                'Network Error',
                'Unable to connect to server. Displaying cached profile data.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => logout(),
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar style="dark" />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text className="text-gray-600 mt-4">Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const displayName = studentData?.name || user?.name || 'User';
    const displayId = studentData?.rollNo || user?.id || 'N/A';
    const displayEmail = user?.email || 'N/A';
    const displayClass = studentData?.class ? `Class ${studentData.class}` : 'N/A';
    const displaySection = studentData?.section ? `Section ${studentData.section}` : 'N/A';

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="dark" />
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 pt-6 pb-6">
                    <Text className="text-gray-900 text-4xl font-bold">Profile</Text>
                </View>

                {/* Avatar and Basic Info */}
                <View className="items-center mb-8">
                    <View className="bg-primary-100 rounded-full w-28 h-28 items-center justify-center mb-4">
                        <Text className="text-6xl">👤</Text>
                    </View>
                    <Text className="text-gray-900 text-3xl font-bold mb-2">{displayName}</Text>
                    <Text className="text-gray-500 text-lg">{displayId}</Text>
                    {user?.role && (
                        <View className="mt-2 px-3 py-1 bg-blue-100 rounded-full">
                            <Text className="text-blue-700 text-sm font-medium capitalize">{user.role}</Text>
                        </View>
                    )}
                </View>

                {/* Personal Information Section */}
                <View className="px-6 mb-6">
                    <Text className="text-gray-900 text-xl font-bold mb-4">Personal Information</Text>
                </View>

                {/* Profile Information Cards */}
                <View className="pb-6">
                    <ProfileInfoCard
                        label="Email"
                        value={displayEmail}
                        icon={<Ionicons name="mail" size={24} color="#2196F3" />}
                    />

                    {studentData?.class && (
                        <ProfileInfoCard
                            label="Class"
                            value={displayClass}
                            icon={<Ionicons name="book" size={24} color="#10B981" />}
                        />
                    )}

                    {studentData?.section && (
                        <ProfileInfoCard
                            label="Section"
                            value={displaySection}
                            icon={<Ionicons name="grid" size={24} color="#F59E0B" />}
                        />
                    )}

                    {studentData?.username && (
                        <ProfileInfoCard
                            label="Username"
                            value={studentData.username}
                            icon={<Ionicons name="person" size={24} color="#8B5CF6" />}
                        />
                    )}

                    {studentData?.parentName && (
                        <ProfileInfoCard
                            label="Parent Name"
                            value={studentData.parentName}
                            icon={<Ionicons name="people" size={24} color="#EC4899" />}
                        />
                    )}

                    {studentData?.parentContact && (
                        <ProfileInfoCard
                            label="Parent Contact"
                            value={studentData.parentContact}
                            icon={<Ionicons name="call" size={24} color="#EF4444" />}
                        />
                    )}
                </View>

                {/* Settings Section */}
                <View className="px-6 mb-4">
                    <Text className="text-gray-900 text-xl font-bold mb-4">Settings</Text>
                </View>

                <View className="px-4 mb-6">
                    <TouchableOpacity className="bg-white rounded-card p-4 shadow-card mb-3 active:opacity-80">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <Ionicons name="notifications-outline" size={24} color="#6B7280" />
                                <Text className="text-gray-900 font-medium text-base ml-3">Notifications</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-white rounded-card p-4 shadow-card active:opacity-80">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
                                <Text className="text-gray-900 font-medium text-base ml-3">Help & Support</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <View className="px-4 pb-8">
                    <Button
                        title="Logout"
                        onPress={handleLogout}
                        variant="danger"
                        icon={<Ionicons name="log-out-outline" size={24} color="white" />}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

