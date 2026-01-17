import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useAuth } from "@/contexts/AuthContext";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  // Multiple animated circles
  const circles = useRef(
    Array.from({ length: 8 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      scale: new Animated.Value(1),
      rotate: new Animated.Value(0),
    }))
  ).current;

  const cardSlide = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Entrance animations sequence
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Animate each circle with different patterns
    circles.forEach((circle, index) => {
      const duration = 3000 + index * 500;
      const yRange = 30 + index * 10;
      const xRange = 20 + index * 5;

      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(circle.translateY, {
              toValue: yRange,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(circle.translateY, {
              toValue: -yRange,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(circle.translateY, {
              toValue: 0,
              duration: duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(circle.translateX, {
              toValue: xRange,
              duration: duration * 0.8,
              useNativeDriver: true,
            }),
            Animated.timing(circle.translateX, {
              toValue: -xRange,
              duration: duration * 0.8,
              useNativeDriver: true,
            }),
            Animated.timing(circle.translateX, {
              toValue: 0,
              duration: duration * 0.8,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(circle.scale, {
              toValue: 1.2,
              duration: duration * 0.5,
              useNativeDriver: true,
            }),
            Animated.timing(circle.scale, {
              toValue: 0.9,
              duration: duration * 0.5,
              useNativeDriver: true,
            }),
            Animated.timing(circle.scale, {
              toValue: 1,
              duration: duration * 0.5,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(circle.rotate, {
            toValue: 1,
            duration: duration * 2,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push("/location-permission");
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      let errorMessage = "An error occurred. Please try again.";

      if (error.message) {
        if (error.message.includes("Invalid credentials")) {
          errorMessage = "Invalid email or password.";
        } else if (error.message.includes("Cannot connect")) {
          errorMessage = "Cannot connect to server. Please check your connection.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Connection timeout. Please try again.";
        } else {
          errorMessage = error.message.split("\n")[0];
        }
      }

      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Forgot Password",
      "Password reset link will be sent to your registered email address.",
      [{ text: "OK" }]
    );
  };

  const toggleRememberMe = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRememberMe(value);
  };

  const toggleShowPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(!showPassword);
  };

  // Circle configurations
  const circleConfigs = [
    { size: 250, top: -50, left: -80, opacity: 0.08, color: '#4C1D95' },
    { size: 200, top: 100, right: -60, opacity: 0.06, color: '#3B0764' },
    { size: 180, top: 300, left: -40, opacity: 0.05, color: '#4C1D95' },
    { size: 220, top: 450, right: -70, opacity: 0.07, color: '#2E1065' },
    { size: 150, bottom: 200, left: width / 2 - 75, opacity: 0.06, color: '#3B0764' },
    { size: 190, bottom: 350, right: -50, opacity: 0.08, color: '#4C1D95' },
    { size: 160, bottom: 100, left: -30, opacity: 0.06, color: '#2E1065' },
    { size: 140, top: 200, left: width / 2 - 70, opacity: 0.05, color: '#3B0764' },
  ];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1">
        <StatusBar style="light" />

        {/* Animated Gradient Background */}
        <LinearGradient
          colors={['#6B21A8', '#7C3AED', '#9333EA', '#A855F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
        />

        {/* Animated Circles */}
        {circles.map((circle, index) => {
          const config = circleConfigs[index];
          const rotation = circle.rotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          });

          return (
            <Animated.View
              key={index}
              style={{
                position: 'absolute',
                width: config.size,
                height: config.size,
                borderRadius: config.size / 2,
                backgroundColor: config.color,
                opacity: config.opacity,
                top: config.top,
                bottom: config.bottom,
                left: config.left,
                right: config.right,
                transform: [
                  { translateY: circle.translateY },
                  { translateX: circle.translateX },
                  { scale: circle.scale },
                  { rotate: rotation },
                ],
              }}
            />
          );
        })}

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => {
          const particleAnim = useRef(new Animated.Value(0)).current;

          useEffect(() => {
            Animated.loop(
              Animated.sequence([
                Animated.timing(particleAnim, {
                  toValue: 1,
                  duration: 2000 + i * 100,
                  useNativeDriver: true,
                }),
                Animated.timing(particleAnim, {
                  toValue: 0,
                  duration: 2000 + i * 100,
                  useNativeDriver: true,
                }),
              ])
            ).start();
          }, []);

          const particleY = particleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -50],
          });

          const particleOpacity = particleAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 0],
          });

          return (
            <Animated.View
              key={`particle-${i}`}
              style={{
                position: 'absolute',
                top: Math.random() * height,
                left: Math.random() * width,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: '#FFFFFF',
                opacity: particleOpacity,
                transform: [{ translateY: particleY }],
              }}
            />
          );
        })}

        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View className="px-6 pt-8 pb-6">
                <View className="items-center mb-6">
                  {/* Animated Logo */}
                  <Animated.View
                    style={{
                      transform: [{ scale: logoScale }],
                    }}
                  >
                    <LinearGradient
                      colors={['#FFFFFF', '#F3E5F5']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="rounded-3xl w-28 h-28 items-center justify-center mb-6"
                      style={{
                        shadowColor: '#9333EA',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 10,
                      }}
                    >
                      <Text className="text-6xl font-bold" style={{ color: '#9333EA' }}>
                        UV
                      </Text>
                    </LinearGradient>
                  </Animated.View>

                  <Animated.View
                    style={{
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    }}
                  >
                    <Text className="text-5xl font-bold text-white mb-3 text-center">
                      UniVerify
                    </Text>
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="sparkles" size={16} color="#E9D5FF" />
                      <Text className="text-purple-100 text-base text-center mx-2">
                        Smart Attendance
                      </Text>
                      <Ionicons name="sparkles" size={16} color="#E9D5FF" />
                    </View>
                  </Animated.View>
                </View>
              </View>

              {/* Login Card */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: cardSlide }],
                }}
                className="px-6 flex-1"
              >
                <LinearGradient
                  colors={['#FFFFFF', '#FEFEFE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  className="rounded-3xl p-6"
                  style={{
                    shadowColor: '#9333EA',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                    elevation: 15,
                  }}
                >
                  <View className="flex-row items-center mb-6">
                    <View className="bg-purple-100 rounded-full p-2 mr-3">
                      <Ionicons name="log-in" size={24} color="#9333EA" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800">
                      Welcome Back
                    </Text>
                  </View>

                  <Input
                    label="Email or Student ID"
                    placeholder="Enter your email or ID"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon={<Ionicons name="mail" size={20} color="#9333EA" />}
                  />

                  <View className="mb-4">
                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      icon={<Ionicons name="lock-closed" size={20} color="#9333EA" />}
                    />
                    <TouchableOpacity
                      onPress={toggleShowPassword}
                      className="absolute right-4 top-11"
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Remember Me & Forgot Password */}
                  <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                      <Switch
                        value={rememberMe}
                        onValueChange={toggleRememberMe}
                        trackColor={{ false: '#D1D5DB', true: '#C084FC' }}
                        thumbColor={rememberMe ? '#9333EA' : '#F3F4F6'}
                        ios_backgroundColor="#D1D5DB"
                      />
                      <Text className="ml-2 text-gray-700 text-sm font-medium">
                        Remember Me
                      </Text>
                    </View>
                    <TouchableOpacity onPress={handleForgotPassword}>
                      <Text className="text-purple-600 text-sm font-semibold">
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="mt-2">
                    <Button
                      title="Login"
                      onPress={handleLogin}
                      loading={loading}
                      icon={<Ionicons name="arrow-forward" size={24} color="white" />}
                    />
                  </View>

                  {/* Info Footer */}
                  <View className="mt-6 pt-6 border-t border-gray-100">
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
                      <Text className="text-gray-500 text-xs ml-2">
                        Use your student credentials to login
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Footer */}
                <Animated.View
                  style={{ opacity: fadeAnim }}
                  className="mt-6"
                >
                  <Text className="text-center text-white/90 text-sm font-medium">
                    © 2026 UniVerify
                  </Text>
                  <Text className="text-center text-white/70 text-xs mt-1">
                    Secure Attendance System
                  </Text>
                </Animated.View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}
