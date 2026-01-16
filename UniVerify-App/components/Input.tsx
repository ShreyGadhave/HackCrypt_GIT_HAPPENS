import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
    icon?: React.ReactNode;
}

export default function Input({ label, error, icon, ...props }: InputProps) {
    return (
        <View className="mb-4">
            <Text className="text-gray-700 font-medium text-base mb-2">{label}</Text>
            <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3">
                {icon && <View className="mr-3">{icon}</View>}
                <TextInput
                    className="flex-1 text-gray-900 text-base"
                    placeholderTextColor="#9CA3AF"
                    {...props}
                />
            </View>
            {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
        </View>
    );
}
