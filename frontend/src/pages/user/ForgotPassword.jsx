import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../../services/apiClient";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (error || Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setError("");
        setErrors({});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, errors]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({ ...errors, email: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = "Vui lòng nhập email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email không hợp lệ.";

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setError("");
    setIsLoading(true);
    try {
      const response = await authAPI.forgotPassword({ email });
      if (response.data.success) {
        toast.success(
          response.data.message || "Mã OTP đã được gửi đến email của bạn.",
        );
        // Chuyển hướng và truyền email sang trang reset-password
        navigate("/reset-password", { state: { email } });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Không thể gửi mã OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center relative min-h-screen"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Quên mật khẩu
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600">
            Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã xác thực
            (OTP) để giúp bạn đặt lại mật khẩu.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleEmailChange}
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition ${errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-pink-500 focus:border-pink-500"}`}
                placeholder="Nhập địa chỉ email của bạn"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center font-semibold animate-pulse">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition shadow-lg hover:shadow-xl disabled:bg-pink-300"
            >
              {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            <Link
              to="/login"
              className="text-pink-500 hover:underline font-medium"
            >
              ← Quay lại Đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
