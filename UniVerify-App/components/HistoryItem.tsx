import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HistoryItemProps {
    date: string;
    day: string;
    checkIn: string;
    checkOut: string;
    status: 'present' | 'absent' | 'late';
}

export default function HistoryItem({ date, day, checkIn, checkOut, status }: HistoryItemProps) {
    const getStatusIcon = () => {
        if (status === 'present') {
            return <Ionicons name="checkmark-circle" size={24} color="#10B981" />;
        } else if (status === 'absent') {
            return <Ionicons name="close-circle" size={24} color="#EF4444" />;
        } else {
            return <Ionicons name="time" size={24} color="#F59E0B" />;
        }
    };

    const getStatusBgColor = () => {
        if (status === 'present') return 'bg-green-50';
        if (status === 'absent') return 'bg-red-50';
        return 'bg-yellow-50';
    };

    return (
        <View className={`${getStatusBgColor()} rounded-card p-4 mb-3 shadow-card mx-4`}>
            <View className="flex-row items-center justify-between">
                {/* Left: Status Icon */}
                <View className="mr-3">
                    {getStatusIcon()}
                </View>

                {/* Middle: Date and Day */}
                <View className="flex-1">
                    <Text className="text-gray-800 font-semibold text-base">{day}</Text>
                    <Text className="text-gray-500 text-sm">{date}</Text>
                </View>

                {/* Right: Check-in and Check-out Times */}
                <View className="items-end">
                    <View className="flex-row items-center mb-1">
                        <Text className="text-gray-600 text-xs mr-2">Check-In</Text>
                        <Text className="text-gray-800 font-semibold text-sm">{checkIn}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="text-gray-600 text-xs mr-2">Check-Out</Text>
                        <Text className="text-gray-800 font-semibold text-sm">{checkOut}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
