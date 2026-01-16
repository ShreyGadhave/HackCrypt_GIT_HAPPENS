import React from 'react';
import { View, Text } from 'react-native';

interface ProfileInfoCardProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

export default function ProfileInfoCard({ label, value, icon }: ProfileInfoCardProps) {
    return (
        <View className="bg-white rounded-card p-4 mb-3 shadow-card mx-4">
            <View className="flex-row items-center">
                {icon && <View className="mr-3">{icon}</View>}
                <View className="flex-1">
                    <Text className="text-gray-500 text-sm mb-1">{label}</Text>
                    <Text className="text-gray-800 font-semibold text-base">{value}</Text>
                </View>
            </View>
        </View>
    );
}
