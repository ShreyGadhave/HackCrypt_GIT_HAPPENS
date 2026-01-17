import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../features/auth/authSlice";
import api from "../lib/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("teacher");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    dispatch(loginStart());
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.success) {
        dispatch(
          loginSuccess({
            user: response.data,
            role: response.data.role,
            token: response.token,
          })
        );
        navigate("/dashboard");
      }
    } catch (err) {
      const message = err?.message || "Login failed. Please try again.";
      setError(message);
      dispatch(loginFailure(message));
    } finally {
      setLoading(false);
    }
  };

  // Quick login buttons for demo
  const handleQuickLogin = async (role) => {
    const credentials = {
      admin: { email: "admin@school.edu", password: "admin123" },
      teacher: { email: "teacher@school.edu", password: "teacher123" },
    };

    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Side - Brand Section */}
          <div className="lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
              <div className="absolute bottom-20 right-10 w-40 h-40 border-4 border-white rounded-lg rotate-45"></div>
            </div>

            {/* Logo */}
            <div className="relative mb-8">
              <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform">
                <svg
                  className="w-24 h-24 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>

            {/* Brand Text */}
            <div className="relative text-center">
              <h1 className="text-5xl font-bold mb-4 tracking-tight">
                UniVerify
              </h1>
              <h2 className="text-3xl font-semibold mb-6">
                Smart Student Verification System
              </h2>
              <p className="text-lg text-gray-300 max-w-md leading-relaxed">
                The comprehensive platform for educational institutions to manage student verification, attendance tracking, and secure authentication seamlessly.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 p-12 flex flex-col justify-center">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back!
              </h2>
              <p className="text-gray-500">Log in to your UniVerify account</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter a password"
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="flex items-center gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="teacher"
                    checked={selectedRole === "teacher"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Teacher</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="admin"
                    checked={selectedRole === "admin"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Admin</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3 text-center">
                Quick Login (Demo):
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("teacher")}
                  className="flex-1 px-4 py-2 border-2 border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 text-xs font-medium transition-all"
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin")}
                  className="flex-1 px-4 py-2 border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 text-xs font-medium transition-all"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 mt-8">
              By logging in, you agree to our{" "}
              <span className="text-gray-700 hover:underline cursor-pointer">
                Privacy Policy
              </span>{" "}
              and{" "}
              <span className="text-gray-700 hover:underline cursor-pointer">
                Terms & Conditions
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
