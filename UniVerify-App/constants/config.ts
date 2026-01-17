// API Configuration
// Update this with your actual backend server URL
// For local development:
// - Android Emulator: use 10.0.2.2
// - iOS Simulator: use localhost or 127.0.0.1
// - Physical Device: use your computer's local IP address (e.g., 192.168.1.100)

export const API_CONFIG = {
  // ⚠️ IMPORTANT: Change this to your backend URL before testing!
  //
  // Examples:
  // Android Emulator: 'http://10.0.2.2:5000/api'
  // iOS Simulator: 'http://localhost:5000/api'
  // Physical Device: 'http://192.168.1.100:5000/api' (use your computer's IP)
  //
  // To find your IP:
  // - Windows: Run 'ipconfig' in Command Prompt
  // - Mac/Linux: Run 'ifconfig' or 'ip addr' in Terminal

  BASE_URL: "http://192.168.0.32:5000/api", // ← CHANGE THIS!
  ML_API_URL: "http://192.168.0.32:8000", // Python Microservice

  // ML Service URL (runs on different port - default 8000)
  ML_SERVICE_URL: "http://192.168.0.32:8000", // ← ML service for face verification, OCR, GPS

  // Timeout in milliseconds (30 seconds for slower connections)
  TIMEOUT: 30000,
};

// Helper to get the correct API URL based on platform
export const getApiUrl = () => {
  return API_CONFIG.BASE_URL;
};
