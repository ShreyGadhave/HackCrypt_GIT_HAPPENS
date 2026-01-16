import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import ProfileInfoCard from '@/components/ProfileInfoCard';
import Button from '@/components/Button';
import { studentData } from '@/data/studentData';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const { logout } = useAuth();

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
                        <Text className="text-6xl">{studentData.avatar}</Text>
                    </View>
                    <Text className="text-gray-900 text-3xl font-bold mb-2">{studentData.name}</Text>
                    <Text className="text-gray-500 text-lg">{studentData.id}</Text>
                </View>

                {/* Personal Information Section */}
                <View className="px-6 mb-6">
                    <Text className="text-gray-900 text-xl font-bold mb-4">Personal Information</Text>
                </View>

                {/* Profile Information Cards */}
                <View className="pb-6">
                    <ProfileInfoCard
                        label="College"
                        value={studentData.college}
                        icon={<Ionicons name="school" size={24} color="#2196F3" />}
                    />

                    <ProfileInfoCard
                        label="Department"
                        value={studentData.department}
                        icon={<Ionicons name="book" size={24} color="#10B981" />}
                    />

                    <ProfileInfoCard
                        label="Year"
                        value={studentData.year}
                        icon={<Ionicons name="calendar" size={24} color="#F59E0B" />}
                    />

                    <ProfileInfoCard
                        label="Email"
                        value={studentData.email}
                        icon={<Ionicons name="mail" size={24} color="#EF4444" />}
                    />
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

