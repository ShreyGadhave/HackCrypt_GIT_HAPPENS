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
      const message =
        err?.message || "Login failed. Please try again.";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-4">
            <span className="text-3xl font-bold text-white">GF</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gyanjyoti Foundation
          </h1>
          <p className="text-gray-600 mt-2">Student Verification System</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login As
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="teacher"
                    checked={selectedRole === "teacher"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Teacher</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="admin"
                    checked={selectedRole === "admin"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Admin</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Quick Login (Demo):</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("teacher")}
                className="flex-1 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-sm"
              >
                Login as Teacher
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                className="flex-1 px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 text-sm"
              >
                Login as Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          &copy; 2026 Gyanjyoti Foundation. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
