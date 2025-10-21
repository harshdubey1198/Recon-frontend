import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin } from "../../server"; // 🔥 rename API call

export default function SignIn() {
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError("Please fill all fields");
      setIsLoading(false);
      return;
    }

    try {
      // 🔥 Call API
      const response = await apiLogin({ username, password });

      // ✅ Extract correct data structure
      const {
        access,
        refresh,
        user_id,
        username: apiUsername,
        role,
      } = response.data.data;

      // Save tokens in sessionStorage
      // sessionStorage.setItem("accessToken", access);
      // sessionStorage.setItem("refreshToken", refresh);
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // Update AuthContext with all user details
      login({
        id: user_id,
        username: apiUsername,
        role,
        token: access,
        refreshToken: refresh,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err?.detail || "Invalid username or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-5xl flex bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Left Side - Form */}
        <div className="flex-1 p-12 lg:p-16">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-gray-900 rounded-lg mr-3 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
              <span className="text-xl font-semibold text-gray-900">Recon</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome back
            </h1>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                UserName
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setusername(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button className="text-sm text-gray-900 hover:text-gray-700 font-medium">
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="relative w-full h-12 bg-gray-900 text-white rounded-xl font-medium overflow-hidden group transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>

            {/* Divider */}
            {/* <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div> */}

            {/* Social Buttons */}
            {/* <div className="grid grid-cols-2 gap-4">
              <button className="h-12 border border-gray-300 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors duration-200 group">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Google</span>
              </button>
              <button className="h-12 border border-gray-300 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors duration-200 group">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C8.396 0 8.025.174 8.025 3.26c0 2.698 1.773 4.948 4.116 4.948.1 0 .177-.012.279-.024-.004-.104-.012-.207-.012-.315 0-2.698 1.773-4.948 4.116-4.948.279 0 .544.024.798.074C16.717.593 14.731 0 12.017 0z"/>
                  <path d="M13.043 3.986c-.004.024-.004.044-.004.074C13.043 6.762 14.816 9.012 17.159 9.012c.279 0 .544-.024.798-.074-.595.593-1.773 1.993-3.798 1.993-1.773 0-3.116-.798-3.798-1.993-.279.05-.544.074-.798.074C7.32 9.012 5.547 6.762 5.547 4.06c0-.03 0-.05.004-.074C5.951 2.662 7.32 1.986 9.043 1.986c1.023 0 1.973.315 2.798.798.825-.483 1.775-.798 2.798-.798z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Apple</span>
              </button>
            </div> */}
          </div>

          {/* Sign Up Link */}
          {/* <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-gray-900 hover:text-gray-700 underline underline-offset-2"
            >
              Create account
            </Link>
          </p> */}
        </div>

        {/* Right Side - Image/Branding */}
        <div className="hidden lg:flex lg:w-2/5 bg-gray-900 relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white rounded-full"></div>
            <div className="absolute top-40 right-16 w-24 h-24 border border-white rounded-full"></div>
            <div className="absolute bottom-32 left-12 w-40 h-40 border border-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-16 h-16 bg-white rounded-full"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl mb-6 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">Start your journey</h2>
              <p className="text-gray-300 leading-relaxed">
                Join thousands of users who trust Recon for the latest news
                across multiple domains.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 w-full max-w-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm text-gray-400">Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
