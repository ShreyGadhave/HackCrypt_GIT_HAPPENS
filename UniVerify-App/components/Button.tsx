import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon,
    fullWidth = true,
}: ButtonProps) {
    const getVariantStyles = () => {
        if (disabled) {
            return 'bg-gray-300';
        }

        switch (variant) {
            case 'primary':
                return 'bg-primary-600';
            case 'secondary':
                return 'bg-gray-600';
            case 'danger':
                return 'bg-red-500';
            default:
                return 'bg-primary-600';
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`${getVariantStyles()} rounded-card p-4 shadow-card active:opacity-80 ${fullWidth ? 'w-full' : ''
                }`}
        >
            <View className="flex-row items-center justify-center">
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        {icon && <View className="mr-2">{icon}</View>}
                        <Text className="text-white font-semibold text-lg">{title}</Text>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
}
