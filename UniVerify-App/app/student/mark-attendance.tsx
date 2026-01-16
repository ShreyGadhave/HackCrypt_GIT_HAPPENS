import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import Card from '@/components/Card';

export default function MarkAttendance() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            setIsSuccess(true);
        }
    };

    if (isSuccess) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <Header title="Mark Attendance" showBack />
                <View className="flex-1 items-center justify-center px-6">
                    <View className="bg-green-100 w-24 h-24 rounded-full items-center justify-center mb-6">
                        <Text className="text-green-600 text-5xl">✓</Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 mb-2">Success!</Text>
                    <Text className="text-gray-600 text-center mb-8">
                        Your attendance has been marked successfully
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-blue-600 py-4 px-8 rounded-xl"
                    >
                        <Text className="text-white font-bold text-lg">Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Header title="Mark Attendance" showBack />
            <ScrollView className="flex-1 px-6 py-4">
                {/* Step Indicators */}
                <View className="flex-row justify-between mb-8">
                    {[1, 2, 3, 4].map((s) => (
                        <View key={s} className="flex-1 items-center">
                            <View
                                className={`w-10 h-10 rounded-full items-center justify-center ${s <= step ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <Text className={`font-bold ${s <= step ? 'text-white' : 'text-gray-600'}`}>
                                    {s}
                                </Text>
                            </View>
                            {s < 4 && (
                                <View
                                    className={`h-1 flex-1 ${s < step ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    style={{ position: 'absolute', top: 20, left: '50%', width: '100%' }}
                                />
                            )}
                        </View>
                    ))}
                </View>

                {/* GPS Status */}
                {step === 1 && (
                    <Card className="mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-4">GPS Verification</Text>
                        <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <View className="flex-row items-center">
                                <View className="bg-green-500 w-3 h-3 rounded-full mr-3" />
                                <Text className="text-green-700 font-semibold">Inside Classroom</Text>
                            </View>
                            <Text className="text-green-600 text-sm mt-2">
                                Location: Room 301, Building A
                            </Text>
                        </View>
                        <Text className="text-gray-600 text-sm">
                            Your location has been verified. You are within the classroom boundary.
                        </Text>
                    </Card>
                )}

                {/* Face Scan */}
                {step === 2 && (
                    <Card className="mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Face Verification</Text>
                        <View className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-12 items-center mb-4">
                            <Text className="text-6xl mb-4">📸</Text>
                            <Text className="text-blue-600 font-semibold">Position your face</Text>
                            <Text className="text-gray-600 text-sm mt-2">
                                Look at the camera and stay still
                            </Text>
                        </View>
                    </Card>
                )}

                {/* ID Verification */}
                {step === 3 && (
                    <Card className="mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-4">ID Verification</Text>
                        <View className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-12 items-center mb-4">
                            <Text className="text-6xl mb-4">🪪</Text>
                            <Text className="text-blue-600 font-semibold">Scan your ID card</Text>
                            <Text className="text-gray-600 text-sm mt-2">
                                Place your student ID within the frame
                            </Text>
                        </View>
                    </Card>
                )}

                {/* Fingerprint */}
                {step === 4 && (
                    <Card className="mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-4">
                            Fingerprint Verification
                        </Text>
                        <View className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-12 items-center mb-4">
                            <Text className="text-6xl mb-4">👆</Text>
                            <Text className="text-blue-600 font-semibold">Place your finger</Text>
                            <Text className="text-gray-600 text-sm mt-2">
                                Touch the fingerprint sensor
                            </Text>
                        </View>
                    </Card>
                )}

                {/* Next Button */}
                <TouchableOpacity
                    onPress={handleNext}
                    className="bg-blue-600 py-4 rounded-xl"
                >
                    <Text className="text-white text-center font-bold text-lg">
                        {step === 4 ? 'Submit' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
