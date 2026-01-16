import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SummaryCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
}

export default function SummaryCard({
    title,
    value,
    subtitle,
    icon,
    color,
    bgColor,
}: SummaryCardProps) {
    return (
        <View className="bg-white rounded-card p-5 shadow-card flex-1 mx-2">
            <View className={`${bgColor} rounded-full w-12 h-12 items-center justify-center mb-3`}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text className="text-gray-500 text-sm mb-1">{title}</Text>
            <Text className="text-gray-900 text-2xl font-bold mb-1">{value}</Text>
            {subtitle && <Text className="text-gray-400 text-xs">{subtitle}</Text>}
        </View>
    );
}
