import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const [role, setRole] = useState<'student' | 'faculty'>('student');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = () => {
        if (role === 'student') {
            router.push('/student/dashboard');
        } else {
            router.push('/faculty/dashboard');
        }
    };

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1 px-6 justify-center">
                <Text className="text-4xl font-bold text-gray-900 mb-2">Welcome to</Text>
                <Text className="text-4xl font-bold text-blue-600 mb-8">AttendX</Text>

                {/* Role Selector */}
                <View className="flex-row gap-3 mb-6">
                    <TouchableOpacity
                        onPress={() => setRole('student')}
                        className={`flex-1 py-3 rounded-xl ${role === 'student' ? 'bg-blue-600' : 'bg-gray-100'
                            }`}
                    >
                        <Text
                            className={`text-center font-semibold ${role === 'student' ? 'text-white' : 'text-gray-600'
                                }`}
                        >
                            Student
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setRole('faculty')}
                        className={`flex-1 py-3 rounded-xl ${role === 'faculty' ? 'bg-blue-600' : 'bg-gray-100'
                            }`}
                    >
                        <Text
                            className={`text-center font-semibold ${role === 'faculty' ? 'text-white' : 'text-gray-600'
                                }`}
                        >
                            Faculty
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Input Fields */}
                <View className="gap-4 mb-6">
                    <View>
                        <Text className="text-gray-700 mb-2 font-medium">Username</Text>
                        <TextInput
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter your username"
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                        />
                    </View>
                    <View>
                        <Text className="text-gray-700 mb-2 font-medium">Password</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            secureTextEntry
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                        />
                    </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    onPress={handleLogin}
                    className="bg-blue-600 py-4 rounded-xl"
                >
                    <Text className="text-white text-center font-bold text-lg">Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
