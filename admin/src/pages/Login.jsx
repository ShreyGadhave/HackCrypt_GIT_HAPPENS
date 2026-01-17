import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../features/auth/authSlice";
import api from "../lib/api";
import { LogIn, Mail, Lock, User as UserIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background - Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Circles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${i % 3 === 0 ? 'rgba(147, 51, 234, 0.1)' :
                  i % 3 === 1 ? 'rgba(168, 85, 247, 0.1)' :
                    'rgba(192, 132, 252, 0.1)'
                }, transparent)`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Floating Squares */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`square-${i}`}
            className="absolute"
            style={{
              width: Math.random() * 60 + 40,
              height: Math.random() * 60 + 40,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(168, 85, 247, 0.15))',
              borderRadius: '20%',
            }}
            animate={{
              x: [0, Math.random() * 50 - 25, 0],
              y: [0, Math.random() * 50 - 25, 0],
              rotate: [0, 90, 180, 270, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Wavy Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {[...Array(5)].map((_, i) => (
            <motion.path
              key={`wave-${i}`}
              d={`M0,${100 + i * 100} Q250,${50 + i * 100} 500,${100 + i * 100} T1000,${100 + i * 100}`}
              stroke="url(#waveGradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: [0.3, 0.6, 0.3],
                x: [-100, 100, -100],
              }}
              transition={{
                pathLength: { duration: 2, delay: i * 0.2 },
                opacity: { duration: 3, repeat: Infinity, delay: i * 0.3 },
                x: { duration: 10, repeat: Infinity, ease: "linear" },
              }}
            />
          ))}
        </svg>

        {/* Glowing Dots */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute w-3 h-3 rounded-full bg-purple-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)',
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="max-w-md w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo and Title */}
        <motion.div
          className="text-center mb-8"
          variants={itemVariants}
        >
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl mb-4"
            style={{
              boxShadow: '0 20px 40px rgba(147, 51, 234, 0.4), 0 10px 20px rgba(147, 51, 234, 0.3)',
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 20px 40px rgba(147, 51, 234, 0.4), 0 10px 20px rgba(147, 51, 234, 0.3)',
                '0 25px 50px rgba(147, 51, 234, 0.5), 0 15px 30px rgba(147, 51, 234, 0.4)',
                '0 20px 40px rgba(147, 51, 234, 0.4), 0 10px 20px rgba(147, 51, 234, 0.3)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <motion.span
              className="text-4xl font-bold text-white"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              UV
            </motion.span>
          </motion.div>
          <motion.h1
            className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2"
            variants={itemVariants}
          >
            UniVerify
          </motion.h1>
          <motion.div
            className="flex items-center justify-center gap-2 text-purple-600"
            variants={itemVariants}
          >
            <Sparkles size={16} />
            <p className="font-medium">Smart Attendance Verification</p>
            <Sparkles size={16} />
          </motion.div>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="bg-white rounded-3xl p-8 border border-purple-100"
          style={{
            boxShadow: '0 20px 60px rgba(147, 51, 234, 0.25), 0 10px 30px rgba(147, 51, 234, 0.15)',
          }}
          variants={itemVariants}
          whileHover={{
            y: -5,
            boxShadow: '0 25px 70px rgba(147, 51, 234, 0.3), 0 15px 40px rgba(147, 51, 234, 0.2)',
          }}
        >
          <motion.div
            className="flex items-center gap-2 mb-6"
            variants={itemVariants}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <LogIn className="text-purple-600" size={28} />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Welcome Back
            </h2>
          </motion.div>

          {error && (
            <motion.div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4"
              style={{
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <motion.div
              className="space-y-2"
              variants={itemVariants}
            >
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <motion.input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                  style={{
                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.08)',
                  }}
                  placeholder="Enter your email"
                  required
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: '0 6px 16px rgba(147, 51, 234, 0.15)',
                  }}
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              className="space-y-2"
              variants={itemVariants}
            >
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <motion.input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                  style={{
                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.08)',
                  }}
                  placeholder="Enter your password"
                  required
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: '0 6px 16px rgba(147, 51, 234, 0.15)',
                  }}
                />
              </div>
            </motion.div>

            {/* Role Selection */}
            <motion.div
              className="space-y-2"
              variants={itemVariants}
            >
              <label className="block text-sm font-semibold text-gray-700">
                Login As
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.label
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedRole === "teacher"
                      ? "border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700"
                      : "border-purple-200 hover:border-purple-300 text-gray-700 bg-white"
                    }`}
                  style={{
                    boxShadow: selectedRole === "teacher"
                      ? '0 8px 20px rgba(147, 51, 234, 0.2)'
                      : '0 4px 12px rgba(147, 51, 234, 0.08)',
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 10px 25px rgba(147, 51, 234, 0.25)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <input
                    type="radio"
                    value="teacher"
                    checked={selectedRole === "teacher"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="sr-only"
                  />
                  <UserIcon size={18} />
                  <span className="text-sm font-medium">Teacher</span>
                </motion.label>
                <motion.label
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedRole === "admin"
                      ? "border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700"
                      : "border-purple-200 hover:border-purple-300 text-gray-700 bg-white"
                    }`}
                  style={{
                    boxShadow: selectedRole === "admin"
                      ? '0 8px 20px rgba(147, 51, 234, 0.2)'
                      : '0 4px 12px rgba(147, 51, 234, 0.08)',
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 10px 25px rgba(147, 51, 234, 0.25)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <input
                    type="radio"
                    value="admin"
                    checked={selectedRole === "admin"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="sr-only"
                  />
                  <UserIcon size={18} />
                  <span className="text-sm font-medium">Admin</span>
                </motion.label>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3), 0 5px 15px rgba(147, 51, 234, 0.2)',
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 15px 40px rgba(147, 51, 234, 0.4), 0 8px 20px rgba(147, 51, 234, 0.3)',
              }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn size={18} />
                  Login to Dashboard
                </span>
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <motion.div
            className="mt-6 pt-6 border-t border-purple-100"
            variants={itemVariants}
          >
            <p className="text-sm text-gray-600 mb-3 font-medium text-center">
              Quick Login (Demo):
            </p>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                onClick={() => handleQuickLogin("teacher")}
                className="px-4 py-2.5 border-2 border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 hover:border-purple-300 text-sm font-medium transition-all duration-200 bg-white"
                style={{
                  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.08)',
                }}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  boxShadow: '0 8px 20px rgba(147, 51, 234, 0.15)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                Login as Teacher
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                className="px-4 py-2.5 border-2 border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 hover:border-purple-300 text-sm font-medium transition-all duration-200 bg-white"
                style={{
                  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.08)',
                }}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  boxShadow: '0 8px 20px rgba(147, 51, 234, 0.15)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                Login as Admin
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-purple-600 text-sm mt-6 font-medium"
          variants={itemVariants}
        >
          &copy; 2026 UniVerify. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
