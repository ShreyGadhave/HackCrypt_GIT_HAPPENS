import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface HeaderProps {
    title: string;
    showBack?: boolean;
}

export default function Header({ title, showBack = false }: HeaderProps) {
    const router = useRouter();

    return (
        <View className="bg-white border-b border-gray-200 px-6 py-4 flex-row items-center">
            {showBack && (
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Text className="text-blue-600 text-lg">←</Text>
                </TouchableOpacity>
            )}
            <Text className="text-xl font-bold text-gray-900">{title}</Text>
        </View>
    );
}
