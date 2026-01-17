import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";
import { API_CONFIG } from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// OCR response interface
interface OCRResponse {
  document_type: string;
  name: string;
  branch: string;
  success: boolean;
}

// Validation result interface
interface ValidationResult {
  isValid: boolean;
  ocrName: string;
  ocrBranch: string;
  userName: string;
  userBranch: string;
  message: string;
}

export default function IDVerificationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  // Normalize string for comparison (trim and lowercase)
  const normalizeString = (str: string): string => {
    return str.trim().toLowerCase();
  };

  // Validate OCR data against user profile
  const validateIDCard = (ocrData: OCRResponse): ValidationResult => {
    if (!user) {
      return {
        isValid: false,
        ocrName: "",
        ocrBranch: "",
        userName: "",
        userBranch: "",
        message: "User not logged in",
      };
    }

    // Normalize OCR data
    const ocrName = normalizeString(ocrData.name);
    const ocrBranch = normalizeString(ocrData.branch);

    // Normalize user profile data (use 'class' field as branch equivalent)
    const userName = normalizeString(user.name);
    const userBranch = normalizeString(user.class || "");

    // Validate: both name and branch must match
    const nameMatch = ocrName === userName;
    const branchMatch = ocrBranch === userBranch;

    return {
      isValid: nameMatch && branchMatch,
      ocrName: ocrData.name,
      ocrBranch: ocrData.branch,
      userName: user.name,
      userBranch: user.class || "",
      message:
        nameMatch && branchMatch ? "ID Card Verified" : "ID Card Mismatch",
    };
  };

  // Handle OCR API call
  const performOCR = async (imageUri: string): Promise<OCRResponse> => {
    const token = await AsyncStorage.getItem("@attendx_token");

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append("id_card", {
      uri: imageUri,
      type: "image/jpeg",
      name: "id_card.jpg",
    } as any);

    // Use the ML service URL (running on Docker port 8000)
    const response = await fetch("http://192.168.0.32:8000/ocr/extract", {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    console.log("Response status:", response.status);
    console.log("Response URL:", response.url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`OCR request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("OCR Response data:", JSON.stringify(data, null, 2));

    if (!data.success) {
      const errorMessage =
        data.error || data.message || "OCR extraction failed";
      console.error("OCR extraction failed:", errorMessage);
      throw new Error(errorMessage);
    }

    return data;
  };

  // Handle image capture and verification
  const handleCapture = async () => {
    try {
      console.log("hello");
      setIsProcessing(true);
      setValidationResult(null);

      // Request camera permissions
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to scan ID card"
        );
        setIsProcessing(false);
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 1,
      });

      console.log("res", result);

      if (result.canceled) {
        setIsProcessing(false);
        return;
      }

      // Perform OCR
      const ocrData = await performOCR(result.assets[0].uri);
      console.log("ocrDta: ", ocrData);
      // Validate against user profile
      const validation = validateIDCard(ocrData);
      setValidationResult(validation);

      // Navigate to success or show error based on validation
      if (validation.isValid) {
        setTimeout(() => {
          router.push("/verification/success");
        }, 2000);
      }
    } catch (error: any) {
      console.error("ID Verification Error:", error);
      Alert.alert(
        "Verification Failed",
        error.message || "Failed to process ID card. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-4 pt-4 pb-6 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold">
          ID Verification
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Camera View with ID Card Frame */}
        <View className="items-center justify-center py-8">
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
                <Ionicons
                  name="card-outline"
                  size={64}
                  color="rgba(255,255,255,0.5)"
                />
              </View>
            </View>
          </View>

          {/* Instruction Text */}
          <View className="mt-8 px-8">
            <Text className="text-white text-center text-lg font-medium">
              {isProcessing
                ? "Processing..."
                : "Place your ID card within the frame"}
            </Text>
            <Text className="text-gray-400 text-center text-sm mt-2">
              {isProcessing
                ? "Please wait"
                : "Ensure all details are clearly visible"}
            </Text>
          </View>
        </View>

        {/* Validation Result Display */}
        {validationResult && (
          <View className="px-4 mb-4">
            <View
              className={`rounded-xl p-4 ${
                validationResult.isValid
                  ? "bg-green-900/50 border-2 border-green-500"
                  : "bg-red-900/50 border-2 border-red-500"
              }`}
            >
              {/* Status Header */}
              <View className="flex-row items-center mb-4">
                <Ionicons
                  name={
                    validationResult.isValid
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={32}
                  color={validationResult.isValid ? "#22c55e" : "#ef4444"}
                />
                <Text
                  className={`ml-3 text-xl font-bold ${
                    validationResult.isValid ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {validationResult.message}
                </Text>
              </View>

              {/* Extracted Data */}
              <View className="mb-3">
                <Text className="text-gray-400 text-xs font-semibold uppercase mb-2">
                  Extracted from ID Card
                </Text>
                <View className="bg-gray-800 rounded-lg p-3">
                  <Text className="text-white text-sm">
                    <Text className="font-semibold">Name: </Text>
                    {validationResult.ocrName}
                  </Text>
                  <Text className="text-white text-sm mt-1">
                    <Text className="font-semibold">Branch: </Text>
                    {validationResult.ocrBranch}
                  </Text>
                </View>
              </View>

              {/* User Profile Data */}
              <View>
                <Text className="text-gray-400 text-xs font-semibold uppercase mb-2">
                  Your Profile
                </Text>
                <View className="bg-gray-800 rounded-lg p-3">
                  <Text className="text-white text-sm">
                    <Text className="font-semibold">Name: </Text>
                    {validationResult.userName}
                  </Text>
                  <Text className="text-white text-sm mt-1">
                    <Text className="font-semibold">Class: </Text>
                    {validationResult.userBranch}
                  </Text>
                </View>
              </View>

              {/* Error Message */}
              {!validationResult.isValid && (
                <View className="mt-3 bg-red-950/50 rounded-lg p-3">
                  <Text className="text-red-300 text-sm">
                    The ID card details do not match your profile. Please ensure
                    you scanning your own ID card.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-4 pb-8">
        {!isProcessing && (
          <TouchableOpacity
            onPress={handleCapture}
            className="bg-green-600 rounded-full p-5 items-center active:opacity-80"
          >
            <View className="flex-row items-center">
              <Ionicons name="camera" size={24} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                Scan ID Card
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {isProcessing && (
          <View className="bg-green-600 rounded-full p-5 items-center opacity-50">
            <View className="flex-row items-center">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white font-semibold text-lg ml-3">
                Processing...
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
