import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface VerificationOptionProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    route: string;
    iconColor?: string;
}

export default function VerificationOption({
    icon,
    title,
    description,
    route,
    iconColor = '#2196F3'
}: VerificationOptionProps) {
    const router = useRouter();

    return (
        <TouchableOpacity
            onPress={() => router.push(route as any)}
            className="bg-white rounded-card p-6 mb-4 shadow-card mx-4 active:opacity-80"
        >
            <View className="flex-row items-center">
                {/* Icon */}
                <View className="bg-primary-50 rounded-full p-4 mr-4">
                    <Ionicons name={icon} size={32} color={iconColor} />
                </View>

                {/* Text Content */}
                <View className="flex-1">
                    <Text className="text-gray-800 font-semibold text-lg mb-1">{title}</Text>
                    <Text className="text-gray-500 text-sm">{description}</Text>
                </View>

                {/* Arrow Icon */}
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );
}
