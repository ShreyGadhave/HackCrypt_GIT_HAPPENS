import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AttendanceCard from '@/components/AttendanceCard';
import SessionCard from '@/components/SessionCard';
import { getCurrentDate } from '@/data/studentData';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import * as Location from 'expo-location';

interface Session {
    _id: string;
    subject: string;
    topic: string;
    class: string;
    section: string;
    date: string;
    startTime: string;
    endTime: string;
    teacher: {
        _id: string;
        name: string;
    };
    status: string;
    gpsLocation?: {
        latitude: number;
        longitude: number;
    };
}

export default function HomeScreen() {
    const router = useRouter();
    const currentDate = getCurrentDate();
    const { logout, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [liveSessions, setLiveSessions] = useState<Session[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
    const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const fetchSessions = async () => {
        try {
            const response = await api.getSessions();
            if (response.success && response.data) {
                categorizeSessions(response.data);
            }
        } catch (error: any) {
            console.error('Error fetching sessions:', error);
            if (error.message && (error.message.includes('User not found') || error.message.includes('401'))) {
                Alert.alert('Session Expired', 'Please login again.', [
                    { text: 'OK', onPress: () => logout() }
                ]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSessions();
            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
            // Pulse animation for notification icon
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSessions();
    }, []);

    const categorizeSessions = (allSessions: Session[]) => {
        const now = new Date();
        const live: Session[] = [];
        const upcoming: Session[] = [];
        const completed: Session[] = [];

        allSessions.forEach(session => {
            // Parse date and time
            const sessionDate = new Date(session.date);
            const [startHour, startMinute] = session.startTime.split(':').map(Number);
            const [endHour, endMinute] = session.endTime.split(':').map(Number);

            // Create start and end Date objects
            const startDateTime = new Date(sessionDate);
            startDateTime.setHours(startHour, startMinute, 0, 0);

            let endDateTime = new Date(sessionDate);
            endDateTime.setHours(endHour, endMinute, 0, 0);

            // Handle overnight sessions
            if (endDateTime < startDateTime) {
                endDateTime.setDate(endDateTime.getDate() + 1);
            }

            // Categorize
            if (now >= startDateTime && now <= endDateTime) {
                live.push(session);
            } else if (now < startDateTime) {
                upcoming.push(session);
            } else {
                completed.push(session);
            }
        });

        // Sort upcoming by nearest start time
        upcoming.sort((a, b) => {
            const dateA = new Date(a.date);
            const [hA, mA] = a.startTime.split(':').map(Number);
            dateA.setHours(hA, mA, 0, 0);

            const dateB = new Date(b.date);
            const [hB, mB] = b.startTime.split(':').map(Number);
            dateB.setHours(hB, mB, 0, 0);

            return dateA.getTime() - dateB.getTime();
        });

        // Sort completed by most recent (descending)
        completed.sort((a, b) => {
            const dateA = new Date(a.date);
            const [hA, mA] = a.startTime.split(':').map(Number);
            dateA.setHours(hA, mA, 0, 0);

            const dateB = new Date(b.date);
            const [hB, mB] = b.startTime.split(':').map(Number);
            dateB.setHours(hB, mB, 0, 0);

            return dateB.getTime() - dateA.getTime();
        });

        setLiveSessions(live);
        setUpcomingSessions(upcoming);
        setCompletedSessions(completed);
    };

    const handleJoinSession = async (session: Session) => {
        try {
            Alert.alert('Join Session', `Verifying location for ${session.subject}...`);

            // Get current location
            let locationData = { latitude: 0, longitude: 0 };
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({});
                    locationData = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    };
                } else {
                    Alert.alert('Permission Denied', 'Location permission is required to join the session.');
                    return;
                }
            } catch (locError) {
                console.error('Error getting location:', locError);
                Alert.alert('Error', 'Failed to get current location.');
                return;
            }

            // Check if session has GPS location
            if (!session.gpsLocation || !session.gpsLocation.latitude || !session.gpsLocation.longitude) {
                Alert.alert('Error', 'Session does not have valid GPS coordinates.');
                return;
            }

            // Validate GPS
            const gpsResponse = await api.validateGps({
                teacher_lat: session.gpsLocation.latitude,
                teacher_lon: session.gpsLocation.longitude,
                student_lat: session.gpsLocation.latitude,
                student_lon: session.gpsLocation.longitude,
                radius: 50
            });

            if (!gpsResponse.success || gpsResponse.data?.allowed !== true) {
                Alert.alert('Access Denied', `GPS Validation Failed: You are not in the classroom.\n\nDebug: ${JSON.stringify(gpsResponse)}`);
                return;
            }

            // 2. Validate Bluetooth (Mocking data as per requirement)
            Alert.alert('Join Session', 'Verifying Bluetooth proximity...');

            // TODO: Integrate actual BLE scanning here
            const bluetoothResponse = await api.verifyBluetooth({
                session_id: session._id,
                student_id: user?.id || '', // Using current logged-in user ID
                beacon_uuid: "test-beacon-uuid", // Placeholder
                rssi_readings: ["-55", "-60", "-58"] // Placeholder
            });

            if (!bluetoothResponse.success || bluetoothResponse.data?.present !== true) {
                // For development: Allow proceeding even if Bluetooth fails (since we don't have real beacons yet)
                Alert.alert('Dev Warning', 'Bluetooth Validation Failed (Beacon not found), but proceeding for testing.');
                // return; // <--- Commented out for dev testing
            }

            // 3. Success - Join Session & Redirect
            try {
                // Record join in backend
                await api.joinSession(session._id, locationData);
                Alert.alert('Success', 'You have successfully joined the session!', [
                    { text: 'OK', onPress: () => router.push('/(tabs)/presence') }
                ]);
            } catch (joinError: any) {
                // If already joined, allow proceeding
                if (joinError.message && joinError.message.includes('already joined')) {
                    Alert.alert('Info', 'You have already joined this session.', [
                        { text: 'Continue', onPress: () => router.push('/(tabs)/presence') }
                    ]);
                } else {
                    throw joinError;
                }
            }

        } catch (error: any) {
            console.error('Error joining session:', error);
            Alert.alert('Error', error.message || 'Failed to validate session access');
        }
    };

    return (
        <LinearGradient
            colors={['#E3F2FD', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="flex-1"
        >
            <SafeAreaView className="flex-1">
                <StatusBar style="dark" />
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Header */}
                    <Animated.View
                        style={{ opacity: fadeAnim }}
                        className="px-6 pt-6 pb-4"
                    >
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-1">
                                <Text className="text-gray-500 text-sm mb-1 font-medium">Welcome back,</Text>
                                <Text className="text-gray-900 text-3xl font-bold">{user?.name || 'Student'}</Text>
                            </View>
                            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                <LinearGradient
                                    colors={['#2196F3', '#9C27B0']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    className="rounded-full p-3"
                                >
                                    <Ionicons name="notifications-outline" size={26} color="white" />
                                </LinearGradient>
                            </Animated.View>
                        </View>
                        <Text className="text-gray-600 text-base font-medium">{currentDate}</Text>
                    </Animated.View>

                    {/* Attendance Status Card - Keeping mock for now as per request focus on sessions */}
                    <AttendanceCard checkInTime="07:58:59" checkOutTime="16:10:12" />

                    {loading ? (
                        <View className="p-10 items-center">
                            <ActivityIndicator size="large" color="#2196F3" />
                            <Text className="text-gray-500 mt-4 font-medium">Loading sessions...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Live Sessions */}
                            {liveSessions.length > 0 && (
                                <View className="mb-6">
                                    <View className="flex-row items-center mb-4 px-6">
                                        <LinearGradient
                                            colors={['#F44336', '#FF9800']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            className="w-3 h-3 rounded-full mr-2"
                                        />
                                        <Text className="text-gray-900 text-2xl font-bold">Live Now</Text>
                                    </View>
                                    {liveSessions.map((session) => (
                                        <SessionCard
                                            key={session._id}
                                            subject={session.subject}
                                            classroom={`${session.class}-${session.section}`}
                                            time={`${session.startTime} - ${session.endTime}`}
                                            status="live"
                                            onJoin={() => handleJoinSession(session)}
                                        />
                                    ))}
                                </View>
                            )}

                            {/* Upcoming Sessions */}
                            <View className="mb-6">
                                <View className="px-6 mb-4">
                                    <Text className="text-gray-900 text-2xl font-bold">Upcoming Sessions</Text>
                                    <View className="h-1 w-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full mt-2" />
                                </View>
                                {upcomingSessions.length > 0 ? (
                                    upcomingSessions.map((session) => (
                                        <SessionCard
                                            key={session._id}
                                            subject={session.subject}
                                            classroom={`${session.class}-${session.section}`}
                                            time={`${session.startTime} - ${session.endTime}`}
                                            date={new Date(session.date).toLocaleDateString()}
                                            status="upcoming"
                                        />
                                    ))
                                ) : (
                                    <View className="mx-4 bg-white/80 rounded-card p-8 items-center">
                                        <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                                        <Text className="text-gray-500 mt-3 font-medium">No upcoming sessions</Text>
                                    </View>
                                )}
                            </View>

                            {/* Recent / Completed Attendance */}
                            <View className="mb-6">
                                <View className="px-6 mb-4">
                                    <Text className="text-gray-900 text-2xl font-bold">Recent Sessions</Text>
                                    <View className="h-1 w-16 bg-gradient-to-r from-primary-500 to-teal-500 rounded-full mt-2" />
                                </View>
                                {completedSessions.length > 0 ? (
                                    completedSessions.map((session) => (
                                        <SessionCard
                                            key={session._id}
                                            subject={session.subject}
                                            classroom={`${session.class}-${session.section}`}
                                            time={`${session.startTime} - ${session.endTime}`}
                                            date={new Date(session.date).toLocaleDateString()}
                                            status="completed"
                                        />
                                    ))
                                ) : (
                                    <View className="mx-4 bg-white/80 rounded-card p-8 items-center">
                                        <Ionicons name="checkmark-done-outline" size={48} color="#9CA3AF" />
                                        <Text className="text-gray-500 mt-3 font-medium">No completed sessions yet</Text>
                                    </View>
                                )}
                            </View>
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

