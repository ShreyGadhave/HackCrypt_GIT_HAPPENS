import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Timings for the guided flow
const STEP_DURATION_OPEN_1 = 2000;
const STEP_DURATION_CLOSE = 2000;
const STEP_DURATION_OPEN_2 = 1000;

type VerificationState =
    | 'IDLE'            // Waiting to start
    | 'GUIDE_OPEN_1'    // "Keep eyes open"
    | 'GUIDE_CLOSE'     // "Close eyes briefly"
    | 'GUIDE_OPEN_2'    // "Open eyes again"
    | 'CAPTURING'       // Taking photo
    | 'COMPLETED';      // Photo taken, review

export default function FaceVerificationScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    // State
    const [verificationState, setVerificationState] = useState<VerificationState>('IDLE');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [instruction, setInstruction] = useState('Position your face within the frame');

    // Timer refs to clear timeouts if component unmounts or state resets
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
        return () => clearTimer();
    }, [permission]);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const startVerification = () => {
        setVerificationState('GUIDE_OPEN_1');
        setInstruction('Keep your eyes open...');

        clearTimer();
        timerRef.current = setTimeout(() => {
            setVerificationState('GUIDE_CLOSE');
            setInstruction('Now close your eyes briefly...');

            timerRef.current = setTimeout(() => {
                setVerificationState('GUIDE_OPEN_2');
                setInstruction('Open your eyes again!');

                timerRef.current = setTimeout(() => {
                    capturePhoto();
                }, STEP_DURATION_OPEN_2);
            }, STEP_DURATION_CLOSE);
        }, STEP_DURATION_OPEN_1);
    };

    const capturePhoto = async () => {
        if (!cameraRef.current) return;

        setVerificationState('CAPTURING');
        setInstruction('Capturing...');

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: true,
                skipProcessing: false,
            });

            if (photo) {
                setCapturedImage(photo.uri);
                setVerificationState('COMPLETED');
                setInstruction('Verification Complete');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to capture photo');
            resetFlow();
        }
    };

    const resetFlow = () => {
        clearTimer();
        setCapturedImage(null);
        setVerificationState('IDLE');
        setInstruction('Position your face within the frame');
    };

    const handleConfirm = () => {
        router.push('/verification/success');
    };

    if (!permission) {
        return <View className="flex-1 bg-gray-900" />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center p-4">
                <Text className="text-white text-center text-lg mb-4">Camera permission is required.</Text>
                <TouchableOpacity onPress={requestPermission} className="bg-primary-600 px-6 py-3 rounded-full">
                    <Text className="text-white font-semibold">Grant Permission</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar style="light" />

            {/* Header */}
            <View className="px-4 pt-4 pb-6 flex-row items-center z-10">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-semibold">Face Verification</Text>
            </View>

            <View className="flex-1 overflow-hidden m-4 rounded-3xl relative bg-black">
                {capturedImage ? (
                    <Image source={{ uri: capturedImage }} className="flex-1" resizeMode="cover" />
                ) : (
                    <CameraView
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        facing="front"
                    />
                )}

                {/* Overlays */}
                {!capturedImage && (
                    <View className="absolute inset-0 items-center justify-center pointer-events-none">
                        {/* Frame */}
                        <View className={`w-64 h-80 border-4 rounded-3xl opacity-80 ${verificationState === 'COMPLETED' ? 'border-green-500' :
                                verificationState !== 'IDLE' ? 'border-primary-400' : 'border-gray-500'
                            }`}>
                            {/* Corners */}
                            <View className={`absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 rounded-tl-3xl ${verificationState === 'COMPLETED' ? 'border-green-500' : 'border-primary-400'}`} />
                            <View className={`absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 rounded-tr-3xl ${verificationState === 'COMPLETED' ? 'border-green-500' : 'border-primary-400'}`} />
                            <View className={`absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 rounded-bl-3xl ${verificationState === 'COMPLETED' ? 'border-green-500' : 'border-primary-400'}`} />
                            <View className={`absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 rounded-br-3xl ${verificationState === 'COMPLETED' ? 'border-green-500' : 'border-primary-400'}`} />
                        </View>
                    </View>
                )}

                {/* Feedback / Error Message */}
                <View className="absolute bottom-10 left-0 right-0 items-center px-4">
                    <View className="bg-black/60 px-6 py-3 rounded-full">
                        <Text className={`text-center font-medium text-lg ${verificationState === 'COMPLETED' ? 'text-green-400' : 'text-white'
                            }`}>
                            {instruction}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Bottom Actions */}
            <View className="px-4 pb-8 h-24 justify-center">
                {verificationState === 'COMPLETED' && capturedImage ? (
                    <View className="flex-row justify-between space-x-4">
                        <TouchableOpacity onPress={resetFlow} className="flex-1 bg-gray-700 rounded-full p-4 items-center">
                            <Text className="text-white font-semibold text-lg">Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleConfirm} className="flex-1 bg-primary-600 rounded-full p-4 items-center">
                            <Text className="text-white font-semibold text-lg">Confirm</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="items-center">
                        {verificationState === 'IDLE' && (
                            <TouchableOpacity onPress={startVerification} className="bg-primary-600 rounded-full p-4 px-8 w-full">
                                <Text className="text-white font-semibold text-lg text-center">Blink your eyes to capture</Text>
                            </TouchableOpacity>
                        )}
                        {verificationState !== 'IDLE' && verificationState !== 'COMPLETED' && (
                            <Text className="text-gray-400 text-center text-sm">
                                Follow the instructions...
                            </Text>
                        )}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
