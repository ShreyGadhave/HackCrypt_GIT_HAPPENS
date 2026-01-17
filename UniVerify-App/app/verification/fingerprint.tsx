import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for user PIN
const PIN_STORAGE_KEY = '@attendx_user_pin';

// Screen states
type ScreenState = 'FINGERPRINT' | 'PIN_REGISTER' | 'PIN_VERIFY';

export default function FingerprintVerificationScreen() {
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(false);
    const [screenState, setScreenState] = useState<ScreenState>('FINGERPRINT');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [storedPin, setStoredPin] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    
    const pulseAnim = new Animated.Value(1);

    // Check biometric availability and PIN registration status on mount
    useEffect(() => {
        checkBiometricAndPin();
    }, []);

    const checkBiometricAndPin = async () => {
        try {
            // Check if biometric authentication is available
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            setBiometricAvailable(compatible && enrolled);

            // Check if user has registered a PIN
            const savedPin = await AsyncStorage.getItem(PIN_STORAGE_KEY);
            setStoredPin(savedPin);
        } catch (error) {
            console.error('Failed to check biometric/PIN status:', error);
            setBiometricAvailable(false);
        }
    };

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

    const handleAddFingerprint = async () => {
        setIsScanning(true);
        startPulseAnimation();
        setError('');

        try {
            if (!biometricAvailable) {
                // If biometric not available, show error but allow PIN-only flow
                Alert.alert(
                    'Biometric Unavailable',
                    'Fingerprint sensor not available. You can still use PIN verification.',
                    [
                        {
                            text: 'Continue',
                            onPress: () => {
                                setIsScanning(false);
                                proceedToPinScreen();
                            }
                        },
                        {
                            text: 'Cancel',
                            onPress: () => {
                                setIsScanning(false);
                            },
                            style: 'cancel'
                        }
                    ]
                );
                return;
            }

            // Attempt biometric authentication
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Verify your identity',
                cancelLabel: 'Cancel',
                disableDeviceFallback: true,
            });

            setIsScanning(false);

            if (result.success) {
                // Fingerprint success - proceed to PIN screen
                proceedToPinScreen();
            } else {
                // Fingerprint failed
                setError('Fingerprint verification failed. Please try again.');
            }
        } catch (error) {
            console.error('Fingerprint error:', error);
            setIsScanning(false);
            setError('An error occurred during fingerprint scan.');
        }
    };

    const proceedToPinScreen = () => {
        // Determine if user needs to register or verify PIN
        if (storedPin) {
            setScreenState('PIN_VERIFY');
        } else {
            setScreenState('PIN_REGISTER');
        }
    };

    const handlePinInput = (value: string) => {
        // Allow only digits and max 4 characters
        if (/^\d*$/.test(value) && value.length <= 4) {
            if (screenState === 'PIN_REGISTER') {
                setPin(value);
            } else {
                setPin(value);
                // Auto-verify when 4 digits entered
                if (value.length === 4) {
                    setTimeout(() => verifyPin(value), 100);
                }
            }
            setError('');
        }
    };

    const handleConfirmPinInput = (value: string) => {
        // Allow only digits and max 4 characters
        if (/^\d*$/.test(value) && value.length <= 4) {
            setConfirmPin(value);
            setError('');
        }
    };

    const handleRegisterPin = async () => {
        setError('');

        // Validation
        if (pin.length !== 4) {
            setError('PIN must be exactly 4 digits');
            return;
        }

        if (pin !== confirmPin) {
            setError('PINs do not match');
            return;
        }

        try {
            // Save PIN to AsyncStorage
            await AsyncStorage.setItem(PIN_STORAGE_KEY, pin);
            
            // PIN registered successfully - proceed to success
            router.push('/verification/success');
        } catch (error) {
            console.error('Failed to save PIN:', error);
            setError('Failed to save PIN. Please try again.');
        }
    };

    const verifyPin = async (enteredPin: string) => {
        setError('');

        if (enteredPin.length !== 4) {
            setError('PIN must be exactly 4 digits');
            return;
        }

        // Validate against stored PIN
        if (enteredPin === storedPin) {
            // PIN matches - verification success
            router.push('/verification/success');
        } else {
            // PIN mismatch
            setError('Incorrect PIN. Please try again.');
            setPin('');
        }
    };

    // Render Fingerprint Screen
    if (screenState === 'FINGERPRINT') {
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
                            {isScanning ? 'Scanning...' : 'Verify Your Identity'}
                        </Text>
                        <Text className="text-gray-500 text-center text-base">
                            {isScanning
                                ? 'Keep your finger on the sensor'
                                : 'Place your finger on the sensor to proceed with verification'}
                        </Text>
                        
                        {error && (
                            <Text className="text-red-500 text-center text-sm mt-4">
                                {error}
                            </Text>
                        )}
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
                                <Text className="text-white font-semibold text-lg ml-2">
                                    Scan Fingerprint
                                </Text>
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

    // Render PIN Registration Screen
    if (screenState === 'PIN_REGISTER') {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar style="dark" />

                {/* Header */}
                <View className="px-4 pt-4 pb-6 flex-row items-center">
                    <TouchableOpacity onPress={() => setScreenState('FINGERPRINT')} className="mr-4">
                        <Ionicons name="arrow-back" size={28} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-gray-900 text-xl font-semibold">Register PIN</Text>
                </View>

                {/* PIN Icon */}
                <View className="flex-1 items-center justify-center px-8">
                    <View className="bg-purple-100 rounded-full p-12 mb-8">
                        <Ionicons name="keypad" size={100} color="#8B5CF6" />
                    </View>

                    <Text className="text-gray-900 text-center text-2xl font-bold mb-3">
                        Create Your PIN
                    </Text>
                    <Text className="text-gray-500 text-center text-base mb-8">
                        Set up a 4-digit PIN for attendance verification
                    </Text>

                    {/* PIN Input */}
                    <View className="w-full mb-6">
                        <Text className="text-gray-700 font-semibold mb-2">Enter PIN</Text>
                        <TextInput
                            value={pin}
                            onChangeText={handlePinInput}
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry
                            placeholder="••••"
                            className="bg-white border border-gray-300 rounded-lg p-4 text-center text-2xl tracking-widest"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Confirm PIN Input */}
                    <View className="w-full mb-6">
                        <Text className="text-gray-700 font-semibold mb-2">Confirm PIN</Text>
                        <TextInput
                            value={confirmPin}
                            onChangeText={handleConfirmPinInput}
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry
                            placeholder="••••"
                            className="bg-white border border-gray-300 rounded-lg p-4 text-center text-2xl tracking-widest"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {error && (
                        <Text className="text-red-500 text-center text-sm mb-4">
                            {error}
                        </Text>
                    )}
                </View>

                {/* Bottom Actions */}
                <View className="px-4 pb-8">
                    <TouchableOpacity
                        onPress={handleRegisterPin}
                        disabled={pin.length !== 4 || confirmPin.length !== 4}
                        className={`rounded-card p-5 items-center shadow-card ${
                            pin.length === 4 && confirmPin.length === 4
                                ? 'bg-purple-600 active:opacity-80'
                                : 'bg-gray-300'
                        }`}
                    >
                        <Text className="text-white font-semibold text-lg">
                            Register PIN
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Render PIN Verification Screen
    if (screenState === 'PIN_VERIFY') {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar style="dark" />

                {/* Header */}
                <View className="px-4 pt-4 pb-6 flex-row items-center">
                    <TouchableOpacity onPress={() => setScreenState('FINGERPRINT')} className="mr-4">
                        <Ionicons name="arrow-back" size={28} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-gray-900 text-xl font-semibold">Enter PIN</Text>
                </View>

                {/* PIN Icon */}
                <View className="flex-1 items-center justify-center px-8">
                    <View className="bg-purple-100 rounded-full p-12 mb-8">
                        <Ionicons name="lock-closed" size={100} color="#8B5CF6" />
                    </View>

                    <Text className="text-gray-900 text-center text-2xl font-bold mb-3">
                        Verify Your PIN
                    </Text>
                    <Text className="text-gray-500 text-center text-base mb-8">
                        Enter your 4-digit PIN to confirm attendance
                    </Text>

                    {/* PIN Input */}
                    <View className="w-full mb-6">
                        <TextInput
                            value={pin}
                            onChangeText={handlePinInput}
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry
                            placeholder="••••"
                            autoFocus
                            className="bg-white border border-gray-300 rounded-lg p-4 text-center text-2xl tracking-widest"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {error && (
                        <Text className="text-red-500 text-center text-sm mb-4">
                            {error}
                        </Text>
                    )}
                </View>

                {/* Bottom Actions */}
                <View className="px-4 pb-8">
                    <TouchableOpacity
                        onPress={() => verifyPin(pin)}
                        disabled={pin.length !== 4}
                        className={`rounded-card p-5 items-center shadow-card ${
                            pin.length === 4
                                ? 'bg-purple-600 active:opacity-80'
                                : 'bg-gray-300'
                        }`}
                    >
                        <Text className="text-white font-semibold text-lg">
                            Verify PIN
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return null;
}
