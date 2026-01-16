import { View, Text } from 'react-native';
import Card from './Card';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
}

export default function StatCard({ title, value, subtitle, color = 'blue' }: StatCardProps) {
    const colorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-600',
        orange: 'text-orange-600',
    };

    return (
        <Card className="flex-1">
            <Text className="text-gray-600 text-sm mb-1">{title}</Text>
            <Text className={`text-3xl font-bold ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                {value}
            </Text>
            {subtitle && <Text className="text-gray-500 text-xs mt-1">{subtitle}</Text>}
        </Card>
    );
}
