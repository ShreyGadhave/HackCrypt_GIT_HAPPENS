import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Button from '@/components/Button';

export default function LocationPermissionScreen() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAllowLocation = async () => {
        setLoading(true);

        try {
            // Request location permission
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status === 'granted') {
                // Permission granted, navigate to main app
                setTimeout(() => {
                    router.replace('/(tabs)/home');
                }, 500);
            } else {
                // Permission denied, but still allow access for demo
                setTimeout(() => {
                    router.replace('/(tabs)/home');
                }, 500);
            }
        } catch (error) {
            console.error('Location permission error:', error);
            // Still navigate to main app for demo purposes
            setTimeout(() => {
                router.replace('/(tabs)/home');
            }, 500);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        router.replace('/(tabs)/home');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="dark" />

            <View className="flex-1 px-6 justify-center">
                {/* Icon */}
                <View className="items-center mb-8">
                    <View className="bg-primary-100 rounded-full w-32 h-32 items-center justify-center mb-6">
                        <Ionicons name="location" size={64} color="#2196F3" />
                    </View>

                    {/* Title */}
                    <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
                        Enable Location
                    </Text>

                    {/* Description */}
                    <Text className="text-gray-600 text-base text-center leading-6">
                        We need your location to verify that you're attending from the correct campus or classroom.
                    </Text>
                </View>

                {/* Benefits List */}
                <View className="bg-white rounded-card p-6 shadow-card mb-8">
                    <View className="flex-row items-start mb-4">
                        <View className="bg-green-100 rounded-full p-2 mr-3">
                            <Ionicons name="checkmark" size={16} color="#10B981" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 font-semibold mb-1">Accurate Attendance</Text>
                            <Text className="text-gray-600 text-sm">
                                Ensures you're marking attendance from the right location
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-start mb-4">
                        <View className="bg-green-100 rounded-full p-2 mr-3">
                            <Ionicons name="checkmark" size={16} color="#10B981" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 font-semibold mb-1">Prevent Fraud</Text>
                            <Text className="text-gray-600 text-sm">
                                Protects against proxy attendance
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-start">
                        <View className="bg-green-100 rounded-full p-2 mr-3">
                            <Ionicons name="checkmark" size={16} color="#10B981" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 font-semibold mb-1">Privacy Protected</Text>
                            <Text className="text-gray-600 text-sm">
                                Your location is only used during attendance marking
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Buttons */}
                <View className="space-y-3">
                    <Button
                        title="Allow Location"
                        onPress={handleAllowLocation}
                        loading={loading}
                        icon={<Ionicons name="location" size={24} color="white" />}
                    />

                    <Button
                        title="Skip for Now"
                        onPress={handleSkip}
                        variant="secondary"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
