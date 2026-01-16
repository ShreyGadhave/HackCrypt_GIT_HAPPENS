import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AttendanceCard from '@/components/AttendanceCard';
import HistoryItem from '@/components/HistoryItem';
import SessionCard from '@/components/SessionCard';
import { studentData, attendanceHistory, sessions, getCurrentDate } from '@/data/studentData';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const currentDate = getCurrentDate();
    const liveSessions = sessions.filter(s => s.status === 'live');
    const upcomingSessions = sessions.filter(s => s.status === 'upcoming');

    const handleJoinSession = (subject: string) => {
        Alert.alert('Join Session', `Joining ${subject} session...`);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="dark" />
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 pt-6 pb-4">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-1">
                            <Text className="text-gray-600 text-sm mb-1">Welcome back,</Text>
                            <Text className="text-gray-900 text-3xl font-bold">{studentData.name}</Text>
                        </View>
                        <View className="bg-primary-50 rounded-full p-3">
                            <Ionicons name="notifications-outline" size={26} color="#2196F3" />
                        </View>
                    </View>
                    <Text className="text-gray-500 text-base">{currentDate}</Text>
                </View>

                {/* Attendance Status Card */}
                <AttendanceCard checkInTime="07:58:59" checkOutTime="16:10:12" />

                {/* My Sessions */}
                <View className="px-6 mb-4">
                    <Text className="text-gray-900 text-xl font-bold mb-4">My Sessions</Text>
                </View>

                {/* Live Sessions */}
                {liveSessions.length > 0 && (
                    <View className="mb-4">
                        {liveSessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                subject={session.subject}
                                classroom={session.classroom}
                                time={session.time}
                                status={session.status}
                                onJoin={() => handleJoinSession(session.subject)}
                            />
                        ))}
                    </View>
                )}

                {/* Upcoming Sessions */}
                {upcomingSessions.length > 0 && (
                    <View className="mb-6">
                        {upcomingSessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                subject={session.subject}
                                classroom={session.classroom}
                                time={session.time}
                                date={session.date}
                                status={session.status}
                            />
                        ))}
                    </View>
                )}

                {/* Recent Attendance Section */}
                <View className="px-6 mb-4">
                    <Text className="text-gray-900 text-xl font-bold mb-4">Recent Attendance</Text>
                </View>

                {/* Attendance History List */}
                <View className="pb-6">
                    {attendanceHistory.map((record) => (
                        <HistoryItem
                            key={record.id}
                            date={record.date}
                            day={record.day}
                            checkIn={record.checkIn}
                            checkOut={record.checkOut}
                            status={record.status}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

