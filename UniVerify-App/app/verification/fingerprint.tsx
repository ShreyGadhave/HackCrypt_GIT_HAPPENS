import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function FingerprintVerificationScreen() {
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(false);
    const pulseAnim = new Animated.Value(1);

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const handleAddFingerprint = () => {
        setIsScanning(true);
        startPulseAnimation();

        // Simulate fingerprint scanning
        setTimeout(() => {
            router.push('/verification/success');
        }, 2000);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="px-4 pt-4 pb-6 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-gray-900 text-xl font-semibold">Fingerprint Verification</Text>
            </View>

            {/* Fingerprint Icon and Animation */}
            <View className="flex-1 items-center justify-center">
                <Animated.View
                    style={{
                        transform: [{ scale: isScanning ? pulseAnim : 1 }],
                    }}
                    className="bg-purple-100 rounded-full p-12 mb-8"
                >
                    <Ionicons
                        name="finger-print"
                        size={120}
                        color={isScanning ? '#8B5CF6' : '#A78BFA'}
                    />
                </Animated.View>

                {/* Instruction Text */}
                <View className="px-8">
                    <Text className="text-gray-900 text-center text-2xl font-bold mb-3">
                        {isScanning ? 'Scanning...' : 'Add Your Fingerprint'}
                    </Text>
                    <Text className="text-gray-500 text-center text-base">
                        {isScanning
                            ? 'Keep your finger on the sensor'
                            : 'Place your finger on the sensor to verify your attendance'}
                    </Text>
                </View>
            </View>

            {/* Bottom Actions */}
            <View className="px-4 pb-8">
                {!isScanning && (
                    <TouchableOpacity
                        onPress={handleAddFingerprint}
                        className="bg-purple-600 rounded-card p-5 items-center shadow-card active:opacity-80"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="finger-print" size={24} color="white" />
                            <Text className="text-white font-semibold text-lg ml-2">Add Fingerprint</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {isScanning && (
                    <View className="bg-purple-600 rounded-card p-5 items-center shadow-card opacity-50">
                        <Text className="text-white font-semibold text-lg">Scanning...</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
