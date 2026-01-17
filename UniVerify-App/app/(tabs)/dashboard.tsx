import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Animated,
    TouchableOpacity,
    Dimensions,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Mock data - replace with actual API calls
    const [stats, setStats] = useState({
        totalSessions: 45,
        attended: 42,
        percentage: 93,
        thisWeek: 5,
        thisMonth: 18,
    });

    // Recent sessions data
    const [recentSessions, setRecentSessions] = useState([
        { id: 1, subject: 'Mathematics', date: '2026-01-17', time: '09:00 AM', status: 'present', teacher: 'Dr. Smith' },
        { id: 2, subject: 'Physics', date: '2026-01-17', time: '11:00 AM', status: 'present', teacher: 'Prof. Johnson' },
        { id: 3, subject: 'Chemistry', date: '2026-01-16', time: '02:00 PM', status: 'present', teacher: 'Dr. Williams' },
        { id: 4, subject: 'English', date: '2026-01-16', time: '10:00 AM', status: 'absent', teacher: 'Ms. Brown' },
        { id: 5, subject: 'Computer Sci', date: '2026-01-15', time: '01:00 PM', status: 'present', teacher: 'Mr. Davis' },
    ]);

    // Weekly attendance data
    const weeklyData = [
        { day: 'Mon', attended: 5, total: 5 },
        { day: 'Tue', attended: 4, total: 5 },
        { day: 'Wed', attended: 5, total: 5 },
        { day: 'Thu', attended: 5, total: 5 },
        { day: 'Fri', attended: 4, total: 5 },
        { day: 'Sat', attended: 3, total: 3 },
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 800);
    };

    const onRefresh = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setRefreshing(true);

        // Simulate API refresh
        await new Promise(resolve => setTimeout(resolve, 1500));

        setRefreshing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleCardPress = (cardType: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Navigate or show details
    };

    const StatCard = ({ icon, title, value, subtitle, colors, iconBg, onPress }: any) => {
        const [scaleAnim] = useState(new Animated.Value(1));

        const handlePressIn = () => {
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }).start();
        };

        return (
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
            >
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                    }}
                >
                    <LinearGradient
                        colors={colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-3xl p-5 mb-4"
                        style={{
                            shadowColor: colors[0],
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.3,
                            shadowRadius: 10,
                            elevation: 8,
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-white/80 text-sm mb-2 font-medium">{title}</Text>
                                <Text className="text-white text-4xl font-bold mb-1">{value}</Text>
                                {subtitle && <Text className="text-white/70 text-xs">{subtitle}</Text>}
                            </View>
                            <View className={`${iconBg} rounded-2xl p-4`}>
                                <Ionicons name={icon} size={32} color="white" />
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    const SkeletonLoader = () => (
        <View className="px-6">
            {[1, 2, 3].map((i) => (
                <View key={i} className="bg-gray-200 rounded-3xl h-24 mb-4 animate-pulse" />
            ))}
        </View>
    );

    const EmptyState = () => (
        <View className="items-center py-12">
            <View className="bg-purple-100 rounded-full p-6 mb-4">
                <Ionicons name="calendar-outline" size={48} color="#9333EA" />
            </View>
            <Text className="text-gray-800 text-lg font-bold mb-2">No Sessions Yet</Text>
            <Text className="text-gray-500 text-sm text-center px-8">
                Your attendance records will appear here once you start attending sessions
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="px-6 pt-6 pb-4">
                    <Text className="text-4xl font-bold text-gray-800 mb-2">Dashboard</Text>
                    <Text className="text-gray-600 text-base">Loading your data...</Text>
                </View>
                <SkeletonLoader />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#9333EA"
                        colors={['#9333EA']}
                    />
                }
            >
                {/* Header */}
                <View className="px-6 pt-6 pb-4">
                    <Text className="text-4xl font-bold text-gray-800 mb-2">
                        Dashboard
                    </Text>
                    <Text className="text-gray-600 text-base">
                        Track your attendance performance
                    </Text>
                </View>

                {/* Stats Grid */}
                <View className="px-6">
                    <View className="flex-row gap-3 mb-4">
                        <View className="flex-1">
                            <StatCard
                                icon="calendar-outline"
                                title="Total"
                                value={stats.totalSessions}
                                subtitle="Sessions"
                                colors={['#3B82F6', '#2563EB']}
                                iconBg="bg-blue-500/20"
                                onPress={() => handleCardPress('total')}
                            />
                        </View>
                        <View className="flex-1">
                            <StatCard
                                icon="checkmark-done"
                                title="Attended"
                                value={stats.attended}
                                subtitle="Sessions"
                                colors={['#10B981', '#059669']}
                                iconBg="bg-green-500/20"
                                onPress={() => handleCardPress('attended')}
                            />
                        </View>
                    </View>

                    <StatCard
                        icon="trending-up"
                        title="Attendance Rate"
                        value={`${stats.percentage}%`}
                        subtitle="Overall performance"
                        colors={['#9333EA', '#7C3AED']}
                        iconBg="bg-purple-500/20"
                        onPress={() => handleCardPress('rate')}
                    />
                </View>

                {/* Weekly Overview Table */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                    className="px-6 mt-2"
                >
                    <View
                        className="bg-white rounded-3xl p-5"
                        style={{
                            shadowColor: '#9333EA',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 5,
                        }}
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-800">
                                This Week
                            </Text>
                            <View className="bg-purple-100 rounded-full px-3 py-1.5">
                                <Text className="text-purple-700 text-xs font-semibold">
                                    {stats.thisWeek} / {weeklyData.reduce((acc, day) => acc + day.total, 0)} Sessions
                                </Text>
                            </View>
                        </View>

                        {/* Table Header */}
                        <View className="flex-row bg-purple-50 rounded-xl p-3 mb-2">
                            <Text className="flex-1 text-purple-900 font-semibold text-sm">Day</Text>
                            <Text className="w-20 text-purple-900 font-semibold text-sm text-center">Attended</Text>
                            <Text className="w-20 text-purple-900 font-semibold text-sm text-center">Rate</Text>
                        </View>

                        {/* Table Rows */}
                        {weeklyData.map((day, index) => {
                            const rate = Math.round((day.attended / day.total) * 100);
                            return (
                                <TouchableOpacity
                                    key={day.day}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center py-3 ${index !== weeklyData.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                >
                                    <View className="flex-1 flex-row items-center">
                                        <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                                            <Text className="text-purple-700 font-bold text-sm">{day.day}</Text>
                                        </View>
                                        <Text className="text-gray-800 font-medium">{day.day}day</Text>
                                    </View>
                                    <Text className="w-20 text-gray-700 text-center font-semibold">
                                        {day.attended}/{day.total}
                                    </Text>
                                    <View className="w-20 items-center">
                                        <View className={`px-2 py-1 rounded-full ${rate === 100 ? 'bg-green-100' : rate >= 80 ? 'bg-blue-100' : 'bg-orange-100'
                                            }`}>
                                            <Text className={`text-xs font-bold ${rate === 100 ? 'text-green-700' : rate >= 80 ? 'text-blue-700' : 'text-orange-700'
                                                }`}>
                                                {rate}%
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* Recent Sessions Table */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                    className="px-6 mt-4 mb-6"
                >
                    <View
                        className="bg-white rounded-3xl p-5"
                        style={{
                            shadowColor: '#9333EA',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 5,
                        }}
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-800">
                                Recent Sessions
                            </Text>
                            <TouchableOpacity
                                className="bg-purple-100 rounded-full px-3 py-1.5"
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                            >
                                <Text className="text-purple-700 text-xs font-semibold">View All</Text>
                            </TouchableOpacity>
                        </View>

                        {recentSessions.length === 0 ? (
                            <EmptyState />
                        ) : (
                            recentSessions.map((session, index) => (
                                <TouchableOpacity
                                    key={session.id}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                    activeOpacity={0.7}
                                    className={`py-4 ${index !== recentSessions.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                >
                                    <View className="flex-row items-center justify-between mb-2">
                                        <View className="flex-1">
                                            <Text className="text-gray-800 font-bold text-base mb-1">
                                                {session.subject}
                                            </Text>
                                            <Text className="text-gray-500 text-xs">
                                                {session.teacher}
                                            </Text>
                                        </View>
                                        <View className={`px-3 py-1.5 rounded-full flex-row items-center ${session.status === 'present' ? 'bg-green-100' : 'bg-red-100'
                                            }`}>
                                            <Ionicons
                                                name={session.status === 'present' ? 'checkmark-circle' : 'close-circle'}
                                                size={14}
                                                color={session.status === 'present' ? '#059669' : '#DC2626'}
                                            />
                                            <Text className={`ml-1 text-xs font-bold ${session.status === 'present' ? 'text-green-700' : 'text-red-700'
                                                }`}>
                                                {session.status === 'present' ? 'Present' : 'Absent'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                                        <Text className="text-gray-500 text-xs ml-1 mr-3">{session.date}</Text>
                                        <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                                        <Text className="text-gray-500 text-xs ml-1">{session.time}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </Animated.View>

                {/* Monthly Summary Footer */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                    }}
                    className="px-6 mb-6"
                >
                    <LinearGradient
                        colors={['#9333EA', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-3xl p-6"
                        style={{
                            shadowColor: '#9333EA',
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.3,
                            shadowRadius: 10,
                            elevation: 8,
                        }}
                    >
                        <Text className="text-white text-lg font-bold mb-4">Monthly Summary</Text>
                        <View className="flex-row justify-between">
                            <View className="items-center">
                                <Text className="text-white/80 text-xs mb-1">This Month</Text>
                                <Text className="text-white text-2xl font-bold">{stats.thisMonth}</Text>
                            </View>
                            <View className="w-px bg-white/20" />
                            <View className="items-center">
                                <Text className="text-white/80 text-xs mb-1">Avg Rate</Text>
                                <Text className="text-white text-2xl font-bold">{stats.percentage}%</Text>
                            </View>
                            <View className="w-px bg-white/20" />
                            <View className="items-center">
                                <Text className="text-white/80 text-xs mb-1">Streak</Text>
                                <View className="flex-row items-center">
                                    <Ionicons name="flame" size={20} color="#FCD34D" />
                                    <Text className="text-white text-2xl font-bold ml-1">12</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
