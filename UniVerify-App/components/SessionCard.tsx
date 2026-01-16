import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';

interface SessionCardProps {
    subject: string;
    classroom: string;
    time: string;
    date?: string;
    status: 'live' | 'upcoming';
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

    return (
        <View className="bg-white rounded-card p-5 shadow-card mb-4 mx-4">
            {/* Status Badge */}
            {isLive && (
                <View className="flex-row items-center mb-3">
                    <View className="bg-red-100 rounded-full px-3 py-1 flex-row items-center">
                        <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                        <Text className="text-red-700 font-semibold text-xs">LIVE NOW</Text>
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
                <Button
                    title="Join Session"
                    onPress={onJoin}
                    icon={<Ionicons name="videocam" size={20} color="white" />}
                />
            )}

            {/* Upcoming Badge */}
            {!isLive && (
                <View className="bg-gray-100 rounded-lg p-3">
                    <Text className="text-gray-600 text-sm text-center">
                        Starts {date || 'soon'}
                    </Text>
                </View>
            )}
        </View>
    );
}
