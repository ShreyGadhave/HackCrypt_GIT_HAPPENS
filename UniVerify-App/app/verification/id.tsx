import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function IDVerificationScreen() {
    const router = useRouter();
    const [isCaptured, setIsCaptured] = useState(false);

    const handleCapture = () => {
        setIsCaptured(true);
        // Simulate verification delay
        setTimeout(() => {
            router.push('/verification/success');
        }, 1500);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar style="light" />

            {/* Header */}
            <View className="px-4 pt-4 pb-6 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-semibold">ID Verification</Text>
            </View>

            {/* Camera View with ID Card Frame */}
            <View className="flex-1 items-center justify-center">
                {/* ID Card Frame Overlay */}
                <View className="relative">
                    <View className="w-80 h-52 border-4 border-white rounded-2xl opacity-80">
                        {/* Corner Indicators */}
                        <View className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-2xl" />
                        <View className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-2xl" />
                        <View className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-2xl" />
                        <View className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-2xl" />

                        {/* ID Card Icon */}
                        <View className="flex-1 items-center justify-center">
                            <Ionicons name="card-outline" size={64} color="rgba(255,255,255,0.5)" />
                        </View>
                    </View>
                </View>

                {/* Instruction Text */}
                <View className="mt-8 px-8">
                    <Text className="text-white text-center text-lg font-medium">
                        {isCaptured ? 'Verifying ID...' : 'Place your ID card within the frame'}
                    </Text>
                    <Text className="text-gray-400 text-center text-sm mt-2">
                        {isCaptured ? 'Please wait' : 'Ensure all details are clearly visible'}
                    </Text>
                </View>
            </View>

            {/* Bottom Actions */}
            <View className="px-4 pb-8">
                {!isCaptured && (
                    <TouchableOpacity
                        onPress={handleCapture}
                        className="bg-green-600 rounded-full p-5 items-center active:opacity-80"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="camera" size={24} color="white" />
                            <Text className="text-white font-semibold text-lg ml-2">Scan ID Card</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {isCaptured && (
                    <View className="bg-green-600 rounded-full p-5 items-center opacity-50">
                        <Text className="text-white font-semibold text-lg">Processing...</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
