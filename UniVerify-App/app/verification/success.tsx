import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SuccessScreen() {
    const router = useRouter();
    const scaleAnim = new Animated.Value(0);

    useEffect(() => {
        // Success animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

    const getCurrentDateTime = () => {
        const now = new Date();
        const date = now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const time = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        return { date, time };
    };

    const { date, time } = getCurrentDateTime();

    const handleBackToHome = () => {
        router.push('/(tabs)/home');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="dark" />

            <View className="flex-1 items-center justify-center px-6">
                {/* Success Icon with Animation */}
                <Animated.View
                    style={{
                        transform: [{ scale: scaleAnim }],
                    }}
                    className="bg-green-100 rounded-full p-8 mb-8"
                >
                    <Ionicons name="checkmark-circle" size={100} color="#10B981" />
                </Animated.View>

                {/* Success Message */}
                <Text className="text-gray-900 text-3xl font-bold text-center mb-3">
                    Attendance Marked!
                </Text>
                <Text className="text-gray-500 text-base text-center mb-8">
                    Your attendance has been successfully verified and recorded
                </Text>

                {/* Date and Time Card */}
                <View className="bg-white rounded-card p-6 shadow-card w-full mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <Ionicons name="calendar" size={20} color="#6B7280" />
                            <Text className="text-gray-600 text-sm ml-2">Date</Text>
                        </View>
                        <Text className="text-gray-900 font-semibold text-base">{date}</Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="time" size={20} color="#6B7280" />
                            <Text className="text-gray-600 text-sm ml-2">Time</Text>
                        </View>
                        <Text className="text-gray-900 font-semibold text-base">{time}</Text>
                    </View>
                </View>

                {/* Back to Home Button */}
                <TouchableOpacity
                    onPress={handleBackToHome}
                    className="bg-primary-600 rounded-card p-5 w-full items-center shadow-card active:opacity-80"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="home" size={24} color="white" />
                        <Text className="text-white font-semibold text-lg ml-2">Back to Home</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
