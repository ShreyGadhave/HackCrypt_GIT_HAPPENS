import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAuth } from "@/contexts/AuthContext";
import { API_CONFIG } from "@/constants/config";
import api from "@/lib/api";
import * as FileSystem from 'expo-file-system/legacy';

// Timings for the guided flow
const STEP_DURATION_OPEN_1 = 2000;
const STEP_DURATION_CLOSE = 2000;
const STEP_DURATION_OPEN_2 = 1000;

type VerificationState =
  | "IDLE" // Waiting to start
  | "GUIDE_OPEN_1" // "Keep eyes open"
  | "GUIDE_CLOSE" // "Close eyes briefly"
  | "GUIDE_OPEN_2" // "Open eyes again"
  | "CAPTURING" // Taking photo
  | "COMPLETED"; // Photo taken, review

export default function FaceVerificationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // State
  const [verificationState, setVerificationState] =
    useState<VerificationState>("IDLE");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [instruction, setInstruction] = useState(
    "Position your face within the frame"
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

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
    setVerificationState("GUIDE_OPEN_1");
    setInstruction("Keep your eyes open...");

    clearTimer();
    timerRef.current = setTimeout(() => {
      setVerificationState("GUIDE_CLOSE");
      setInstruction("Now close your eyes briefly...");

      timerRef.current = setTimeout(() => {
        setVerificationState("GUIDE_OPEN_2");
        setInstruction("Open your eyes again!");

        timerRef.current = setTimeout(() => {
          capturePhoto();
        }, STEP_DURATION_OPEN_2);
      }, STEP_DURATION_CLOSE);
    }, STEP_DURATION_OPEN_1);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    setVerificationState("CAPTURING");
    setInstruction("Capturing...");

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: false,
      });

      if (photo) {
        setCapturedImage(photo.uri);
        setVerificationState("COMPLETED");
        setInstruction("Verification Complete");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to capture photo");
      resetFlow();
    }
  };

  const resetFlow = () => {
    clearTimer();
    setCapturedImage(null);
    setVerificationState("IDLE");
    setInstruction("Position your face within the frame");
    setVerificationError(null);
  };

  // Convert URI to Blob
  const uriToBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  // Fetch user profile image and convert to Blob
  const getUserProfileImageBlob = async (): Promise<Blob | null> => {
    try {
      console.log("User object:", JSON.stringify(user, null, 2));

      if (!user?.id) {
        throw new Error("User ID not found");
      }

      // Use the API client which already handles authentication
      const response = await api.getStudent(user.id);

      if (!response.success || !response.data) {
        throw new Error("Failed to fetch student profile");
      }

      console.log("Student data:", JSON.stringify(response.data, null, 2));

      const profilePhotoPath = response.data.profilePhoto;

      if (!profilePhotoPath) {
        throw new Error("Profile photo not found in student data");
      }

      // Normalize path: replace backslashes with forward slashes
      const normalizedPath = profilePhotoPath.replace(/\\/g, "/");

      // Construct full URL - remove /api from base URL for static files
      const baseUrl = API_CONFIG.BASE_URL.replace("/api", "");
      const imageUrl = normalizedPath.startsWith("http")
        ? normalizedPath
        : `${baseUrl}/${normalizedPath}`;

      console.log("Fetching profile image from:", imageUrl);

      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(
          `Failed to fetch profile image: ${imageResponse.status} ${imageResponse.statusText}`
        );
      }
      const blob = await imageResponse.blob();
      console.log("Profile image blob loaded successfully, size:", blob.size);
      return blob;
    } catch (error) {
      console.error("Error fetching profile image:", error);
      return null;
    }
  };

  const handleConfirm = async () => {
    if (!capturedImage) {
      Alert.alert("Error", "No image captured");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    setInstruction("Verifying your identity...");

    let profileImageUri: string | null = null;
    let selfieUri: string | null = null;

    try {
      // Convert captured selfie to proper file
      // The camera might return a URI that needs to be copied to a stable location
      selfieUri = `${FileSystem.cacheDirectory}selfie_temp.jpg`;
      await FileSystem.copyAsync({
        from: capturedImage,
        to: selfieUri,
      });
      console.log("Selfie saved to:", selfieUri);

      // Fetch user profile image
      const profileImageBlob = await getUserProfileImageBlob();
      if (!profileImageBlob) {
        throw new Error("Failed to load your profile image");
      }

      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data URI prefix to get just the base64 data
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(profileImageBlob);
      });
      
      const base64Data = await base64Promise;
      
      // Save to temporary file using expo-file-system
      profileImageUri = `${FileSystem.cacheDirectory}profile_temp.jpg`;
      await FileSystem.writeAsStringAsync(profileImageUri, base64Data, {
        encoding: 'base64',
      });
      
      console.log("Profile image saved to:", profileImageUri);

      // Prepare FormData with both images as file URIs
      const formData = new FormData();
      
      formData.append("selfie", {
        uri: selfieUri,
        type: "image/jpeg",
        name: "selfie.jpg",
      } as any);

      formData.append("id_card", {
        uri: profileImageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);
      
      formData.append("preprocess", "false");

      // Call verification API - face/verify endpoint is on the ML service (port 8000)
      const verifyUrl = `${API_CONFIG.ML_SERVICE_URL}/face/verify`;

      console.log("Sending verification request to:", verifyUrl);

      const response = await fetch(verifyUrl, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - let browser/RN set it with boundary
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Verification result:", JSON.stringify(result, null, 2));

      if (result.success && result.verified) {
        // Verification successful
        setInstruction("Verification Successful!");

        // Show success feedback briefly before navigating
        setTimeout(() => {
          router.push("/verification/success");
        }, 1000);
      } else {
        // Verification failed
        const errorMsg =
          result.message || result.error || "Face verification failed. Please try again.";
        setVerificationError(errorMsg);
        setInstruction("Verification Failed");

        Alert.alert(
          "Verification Failed",
          `${errorMsg}\n\nMatch Quality: ${
            result.match_quality || "N/A"
          }\nConfidence: ${result.confidence || "N/A"}%\nModel: ${
            result.model || "N/A"
          }`,
          [
            {
              text: "Retry",
              onPress: resetFlow,
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      const errorMsg = error.message || "An error occurred during verification";
      setVerificationError(errorMsg);
      setInstruction("Verification Error");

      Alert.alert("Error", errorMsg, [
        {
          text: "Retry",
          onPress: resetFlow,
        },
      ]);
    } finally {
      setIsVerifying(false);
      
      // Cleanup temporary files
      if (profileImageUri) {
        try {
          await FileSystem.deleteAsync(profileImageUri, { idempotent: true });
        } catch (e) {
          console.log("Failed to cleanup profile temp file:", e);
        }
      }
      if (selfieUri) {
        try {
          await FileSystem.deleteAsync(selfieUri, { idempotent: true });
        } catch (e) {
          console.log("Failed to cleanup selfie temp file:", e);
        }
      }
    }
  };

  if (!permission) {
    return <View className="flex-1 bg-gray-900" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center p-4">
        <Text className="text-white text-center text-lg mb-4">
          Camera permission is required.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-primary-600 px-6 py-3 rounded-full"
        >
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
        <Text className="text-white text-xl font-semibold">
          Face Verification
        </Text>
      </View>

      <View className="flex-1 overflow-hidden m-4 rounded-3xl relative bg-black">
        {capturedImage ? (
          <Image
            source={{ uri: capturedImage }}
            className="flex-1"
            resizeMode="cover"
          />
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
            <View
              className={`w-64 h-80 border-4 rounded-3xl opacity-80 ${
                verificationState === "COMPLETED"
                  ? "border-green-500"
                  : verificationState !== "IDLE"
                  ? "border-primary-400"
                  : "border-gray-500"
              }`}
            >
              {/* Corners */}
              <View
                className={`absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 rounded-tl-3xl ${
                  verificationState === "COMPLETED"
                    ? "border-green-500"
                    : "border-primary-400"
                }`}
              />
              <View
                className={`absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 rounded-tr-3xl ${
                  verificationState === "COMPLETED"
                    ? "border-green-500"
                    : "border-primary-400"
                }`}
              />
              <View
                className={`absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 rounded-bl-3xl ${
                  verificationState === "COMPLETED"
                    ? "border-green-500"
                    : "border-primary-400"
                }`}
              />
              <View
                className={`absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 rounded-br-3xl ${
                  verificationState === "COMPLETED"
                    ? "border-green-500"
                    : "border-primary-400"
                }`}
              />
            </View>
          </View>
        )}

        {/* Feedback / Error Message */}
        <View className="absolute bottom-10 left-0 right-0 items-center px-4">
          <View className="bg-black/60 px-6 py-3 rounded-full">
            <Text
              className={`text-center font-medium text-lg ${
                verificationState === "COMPLETED"
                  ? "text-green-400"
                  : "text-white"
              }`}
            >
              {instruction}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Actions */}
      <View className="px-4 pb-8 h-24 justify-center">
        {verificationState === "COMPLETED" && capturedImage ? (
          <View className="flex-row justify-between space-x-4">
            <TouchableOpacity
              onPress={resetFlow}
              className="flex-1 bg-gray-700 rounded-full p-4 items-center"
              disabled={isVerifying}
            >
              <Text className="text-white font-semibold text-lg">Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              className="flex-1 bg-primary-600 rounded-full p-4 items-center"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Confirm
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center">
            {verificationState === "IDLE" && (
              <TouchableOpacity
                onPress={startVerification}
                className="bg-primary-600 rounded-full p-4 px-8 w-full"
              >
                <Text className="text-white font-semibold text-lg text-center">
                  Blink your eyes to capture
                </Text>
              </TouchableOpacity>
            )}
            {verificationState !== "IDLE" &&
              verificationState !== "COMPLETED" && (
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
