import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import VerificationOption from '@/components/VerificationOption';

export default function PresenceScreen() {
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="dark" />
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 pt-6 pb-8">
                    <Text className="text-gray-900 text-4xl font-bold mb-3">Mark Attendance</Text>
                    <Text className="text-gray-600 text-lg">Choose a verification method to mark your presence</Text>
                </View>

                {/* Verification Options */}
                <View className="pb-6">
                    <VerificationOption
                        icon="scan"
                        title="Face Verification"
                        description="Scan your face to verify attendance"
                        route="/verification/face"
                        iconColor="#2196F3"
                    />

                    <VerificationOption
                        icon="finger-print"
                        title="Fingerprint Verification"
                        description="Use your fingerprint to verify"
                        route="/verification/fingerprint"
                        iconColor="#8B5CF6"
                    />

                    <VerificationOption
                        icon="card"
                        title="ID Verification"
                        description="Scan your student ID card"
                        route="/verification/id"
                        iconColor="#10B981"
                    />

                    <VerificationOption
                        icon="qr-code"
                        title="QR Code Scanner"
                        description="Scan QR code to mark attendance"
                        route="/verification/qr-scanner"
                        iconColor="#F59E0B"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}


