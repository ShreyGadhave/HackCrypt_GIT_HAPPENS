import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const success = await login(email, password);
        setLoading(false);

        if (success) {
            router.push('/location-permission');
        } else {
            Alert.alert(
                'Login Failed',
                'Invalid email or password. Please try again.'
            );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
                    {/* Header */}
                    <View className="px-6 pt-12 pb-8">
                        <View className="items-center mb-8">
                            <View className="bg-primary-100 rounded-full w-20 h-20 items-center justify-center mb-4">
                                <Text className="text-4xl">📱</Text>
                            </View>
                            <Text className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</Text>
                            <Text className="text-gray-500 text-base text-center">
                                Sign in to continue to AttendX
                            </Text>
                        </View>
                    </View>

                    {/* Login Form */}
                    <View className="px-6 flex-1">
                        <Input
                            label="Email or Student ID"
                            placeholder="Enter your email or ID"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={<Ionicons name="mail-outline" size={20} color="#6B7280" />}
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            icon={<Ionicons name="lock-closed-outline" size={20} color="#6B7280" />}
                        />

                        <View className="mt-6">
                            <Button
                                title="Login"
                                onPress={handleLogin}
                                loading={loading}
                                icon={<Ionicons name="log-in-outline" size={24} color="white" />}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

