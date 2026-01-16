import { View, Text } from 'react-native';

interface BadgeProps {
    status: 'present' | 'absent' | 'verified' | 'failed' | 'suspicious';
    text?: string;
}

export default function Badge({ status, text }: BadgeProps) {
    const styles = {
        present: 'bg-green-100 text-green-700',
        absent: 'bg-red-100 text-red-700',
        verified: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
        suspicious: 'bg-orange-100 text-orange-700',
    };

    const labels = {
        present: 'Present',
        absent: 'Absent',
        verified: 'Verified',
        failed: 'Failed',
        suspicious: 'Suspicious',
    };

    return (
        <View className={`px-3 py-1 rounded-full ${styles[status]}`}>
            <Text className={`text-xs font-semibold ${styles[status]}`}>
                {text || labels[status]}
            </Text>
        </View>
    );
}
