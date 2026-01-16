import { View, Text, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        // Fade and scale animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Navigate after animation
        const timer = setTimeout(() => {
            if (!isLoading) {
                if (user) {
                    router.replace('/(tabs)/home');
                } else {
                    router.replace('/login');
                }
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [user, isLoading]);

    return (
        <View className="flex-1 bg-primary-600 items-center justify-center">
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }}
                className="items-center"
            >
                <Text className="text-6xl mb-4">📱</Text>
                <Text className="text-5xl font-bold text-white mb-3">AttendX</Text>
                <Text className="text-white text-lg opacity-90">Student Attendance System</Text>
            </Animated.View>
        </View>
    );
}


