import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="location-permission" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="verification/face" />
        <Stack.Screen name="verification/id" />
        <Stack.Screen name="verification/fingerprint" />
        <Stack.Screen name="verification/qr-scanner" />
        <Stack.Screen name="verification/success" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}



