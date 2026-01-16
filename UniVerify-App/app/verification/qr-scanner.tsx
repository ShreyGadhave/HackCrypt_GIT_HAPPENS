import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Button from '@/components/Button';

export default function QRScannerScreen() {
    const router = useRouter();
    const [scanned, setScanned] = useState(false);
    const [scannedData, setScannedData] = useState<string>('');
    const [permission, requestPermission] = useCameraPermissions();

    if (!permission) {
        // Camera permissions are still loading
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
                <Text className="text-white text-lg">Loading camera...</Text>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center px-6">
                <Ionicons name="camera-outline" size={64} color="white" />
                <Text className="text-white text-xl font-bold mt-4 mb-2 text-center">
                    Camera Permission Required
                </Text>
                <Text className="text-gray-400 text-center mb-6">
                    We need camera access to scan QR codes for attendance verification
                </Text>
                <Button
                    title="Grant Permission"
                    onPress={requestPermission}
                    icon={<Ionicons name="camera" size={24} color="white" />}
                />
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4"
                >
                    <Text className="text-gray-400 text-base">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (!scanned) {
            setScanned(true);
            setScannedData(data);
            // Navigate to success screen after a brief delay
            setTimeout(() => {
                router.push('/verification/success');
            }, 500);
        }
    };

    const handleScanAgain = () => {
        setScanned(false);
        setScannedData('');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar style="light" />

            {/* Header */}
            <View className="px-4 pt-4 pb-4 flex-row items-center absolute top-10 left-0 right-0 z-10">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-gray-800/80 rounded-full p-3 active:opacity-80"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-semibold ml-4 shadow-md">QR Code Scanner</Text>
            </View>

            {/* Camera View */}
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            >
                {/* QR Frame Overlay */}
                <View className="flex-1 items-center justify-center bg-black/40">
                    <View className="relative">
                        <View className="w-72 h-72 border-4 border-white rounded-3xl bg-transparent">
                            {/* Corner Indicators */}
                            <View className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-green-400 rounded-tl-3xl" />
                            <View className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-green-400 rounded-tr-3xl" />
                            <View className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-green-400 rounded-bl-3xl" />
                            <View className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-green-400 rounded-br-3xl" />
                        </View>
                    </View>

                    {/* Instruction Text */}
                    <View className="mt-8 px-8">
                        <Text className="text-white text-center text-lg font-medium shadow-md">
                            {scanned ? 'QR Code Scanned!' : 'Position QR code within the frame'}
                        </Text>
                        <Text className="text-gray-300 text-center text-sm mt-2 shadow-md">
                            {scanned ? 'Verifying...' : 'The QR code will be scanned automatically'}
                        </Text>
                        {scanned && scannedData && (
                            <View className="mt-4 bg-gray-800/90 rounded-xl p-4">
                                <Text className="text-gray-400 text-xs text-center mb-1">Scanned Data:</Text>
                                <Text className="text-white text-sm text-center font-mono" numberOfLines={3}>
                                    {scannedData}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </CameraView>

            {/* Manual Scan Button (for testing) */}
            {!scanned && (
                <View className="absolute bottom-10 left-4 right-4">
                    <Button
                        title="Simulate Scan (Demo)"
                        onPress={() => handleBarCodeScanned({ type: 'QR', data: 'demo-qr-code' })}
                        variant="secondary"
                        icon={<Ionicons name="scan" size={24} color="white" />}
                    />
                </View>
            )}

            {/* Scan Again Button */}
            {scanned && (
                <View className="absolute bottom-10 left-4 right-4">
                    <Button
                        title="Scan Again"
                        onPress={handleScanAgain}
                        icon={<Ionicons name="refresh" size={24} color="white" />}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}
