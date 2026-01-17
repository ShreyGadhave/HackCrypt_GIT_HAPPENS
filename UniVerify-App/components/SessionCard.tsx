import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from './Button';

interface SessionCardProps {
    subject: string;
    classroom: string;
    time: string;
    date?: string;
    status: 'live' | 'upcoming' | 'completed';
    onJoin?: () => void;
}

export default function SessionCard({
    subject,
    classroom,
    time,
    date,
    status,
    onJoin,
}: SessionCardProps) {
    const isLive = status === 'live';
    const isCompleted = status === 'completed';
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(0.98)).current;

    useEffect(() => {
        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();

        // Scale animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Pulse animation for live sessions
        if (isLive) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [isLive]);

    const CardContent = () => (
        <View className={`bg-white/95 rounded-card p-5 shadow-card mb-4 ${isCompleted ? 'opacity-70' : ''}`}>
            {/* Status Badge */}
            {isLive && (
                <View className="flex-row items-center mb-3">
                    <LinearGradient
                        colors={['#F44336', '#FF9800']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="rounded-full px-3 py-1 flex-row items-center"
                    >
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <View className="w-2 h-2 bg-white rounded-full mr-2" />
                        </Animated.View>
                        <Text className="text-white font-bold text-xs">LIVE NOW</Text>
                    </LinearGradient>
                </View>
            )}

            {isCompleted && (
                <View className="flex-row items-center mb-3">
                    <View className="bg-gray-100 rounded-full px-3 py-1 flex-row items-center">
                        <Ionicons name="checkmark-circle" size={14} color="#6B7280" className="mr-1" />
                        <Text className="text-gray-600 font-semibold text-xs ml-1">COMPLETED</Text>
                    </View>
                </View>
            )}

            {/* Subject */}
            <Text className="text-gray-900 text-xl font-bold mb-2">{subject}</Text>

            {/* Classroom */}
            <View className="flex-row items-center mb-2">
                <Ionicons name="location-outline" size={18} color="#6B7280" />
                <Text className="text-gray-600 text-base ml-2">{classroom}</Text>
            </View>

            {/* Time */}
            <View className="flex-row items-center mb-4">
                <Ionicons name="time-outline" size={18} color="#6B7280" />
                <Text className="text-gray-600 text-base ml-2">{time}</Text>
                {date && (
                    <Text className="text-gray-500 text-sm ml-2">• {date}</Text>
                )}
            </View>

            {/* Join Button for Live Sessions */}
            {isLive && onJoin && (
                <TouchableOpacity onPress={onJoin} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#2196F3', '#1976D2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="rounded-xl py-3 px-4 flex-row items-center justify-center"
                    >
                        <Ionicons name="videocam" size={20} color="white" />
                        <Text className="text-white font-bold text-base ml-2">Join Session</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}

            {/* Upcoming Badge */}
            {status === 'upcoming' && (
                <View className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-3 border border-primary-100">
                    <Text className="text-primary-700 text-sm text-center font-medium">
                        Starts {date || 'soon'}
                    </Text>
                </View>
            )}
        </View>
    );

    if (isLive) {
        return (
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }}
                className="mx-4"
            >
                <LinearGradient
                    colors={['#F44336', '#FF9800', '#F44336']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-card p-0.5 shadow-glow-red"
                >
                    <CardContent />
                </LinearGradient>
            </Animated.View>
        );
    }

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
            }}
            className="mx-4"
        >
            <CardContent />
        </Animated.View>
    );
}
