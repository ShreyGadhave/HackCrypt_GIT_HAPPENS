import { View } from 'react-native';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
    return (
        <View className={`bg-white rounded-xl p-4 shadow-sm ${className}`}>
            {children}
        </View>
    );
}
