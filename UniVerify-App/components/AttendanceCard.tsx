import React, { useState, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AttendanceCardProps {
    checkInTime?: string;
    checkOutTime?: string;
}

export default function AttendanceCard({ checkInTime, checkOutTime }: AttendanceCardProps) {
    const [currentTime, setCurrentTime] = useState('');
    const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}:${seconds}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);

        // Mount animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Pulse animation for time
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        return () => clearInterval(interval);
    }, []);

    return (
        <Animated.View
            style={{ transform: [{ scale: scaleAnim }] }}
            className="mx-4 mb-6 rounded-card overflow-hidden shadow-glow"
        >
            <LinearGradient
                colors={['#2196F3', '#9C27B0', '#3949AB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6"
            >
                {/* Glassmorphism overlay */}
                <View className="absolute inset-0 bg-white/10" style={{ backdropFilter: 'blur(10px)' }} />

                {/* Current Time Display */}
                <Animated.View
                    style={{ transform: [{ scale: pulseAnim }] }}
                    className="mb-6"
                >
                    <Text className="text-white text-5xl font-bold text-center" style={{ textShadowColor: 'rgba(255, 255, 255, 0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 }}>
                        {currentTime}
                    </Text>
                    <Text className="text-white/80 text-sm text-center mt-2">Current Time</Text>
                </Animated.View>

                {/* Check-in and Check-out Status */}
                <View className="flex-row justify-between">
                    {/* Check-in */}
                    <View className="bg-white/20 rounded-xl p-4 flex-1 mr-2 border-2 border-white/30">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-white text-sm font-semibold">Check-In</Text>
                            {checkInTime && (
                                <View className="bg-teal-400 rounded-full p-1">
                                    <Ionicons name="checkmark" size={16} color="white" />
                                </View>
                            )}
                        </View>
                        <Text className="text-white text-xl font-bold">
                            {checkInTime || '--:--:--'}
                        </Text>
                    </View>

                    {/* Check-out */}
                    <View className="bg-white/20 rounded-xl p-4 flex-1 ml-2 border-2 border-white/30">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-white text-sm font-semibold">Check-Out</Text>
                            {checkOutTime && (
                                <View className="bg-teal-400 rounded-full p-1">
                                    <Ionicons name="checkmark" size={16} color="white" />
                                </View>
                            )}
                        </View>
                        <Text className="text-white text-xl font-bold">
                            {checkOutTime || '--:--:--'}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}
