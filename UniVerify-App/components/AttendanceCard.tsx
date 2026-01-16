import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AttendanceCardProps {
    checkInTime?: string;
    checkOutTime?: string;
}

export default function AttendanceCard({ checkInTime, checkOutTime }: AttendanceCardProps) {
    const [currentTime, setCurrentTime] = useState('');

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

        return () => clearInterval(interval);
    }, []);

    return (
        <View className="bg-primary-600 rounded-card p-6 shadow-card mx-4 mb-6">
            {/* Current Time Display */}
            <Text className="text-white text-4xl font-bold text-center mb-6">
                {currentTime}
            </Text>

            {/* Check-in and Check-out Status */}
            <View className="flex-row justify-between">
                {/* Check-in */}
                <View className="bg-primary-500 rounded-xl p-4 flex-1 mr-2">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-white text-sm font-medium">Check-In</Text>
                        {checkInTime && (
                            <View className="bg-green-400 rounded-full p-1">
                                <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                        )}
                    </View>
                    <Text className="text-white text-lg font-bold">
                        {checkInTime || '--:--:--'}
                    </Text>
                </View>

                {/* Check-out */}
                <View className="bg-primary-500 rounded-xl p-4 flex-1 ml-2">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-white text-sm font-medium">Check-Out</Text>
                        {checkOutTime && (
                            <View className="bg-green-400 rounded-full p-1">
                                <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                        )}
                    </View>
                    <Text className="text-white text-lg font-bold">
                        {checkOutTime || '--:--:--'}
                    </Text>
                </View>
            </View>
        </View>
    );
}
