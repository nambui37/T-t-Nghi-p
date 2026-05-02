import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../../services/apiClient";

// Hàm tiện ích làm mờ email (VD: nambui37x11@gmail.com -> namb***@gmail.com)
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return email;
  const [name, domain] = email.split("@");
  const maskedName =
    name.length > 4
      ? name.substring(0, 4) + "***"
      : name.substring(0, 1) + "***";
  return `${maskedName}@${domain}`;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60); // Tự động đếm 60s khi vừa vào trang

  useEffect(() => {
    if (error || Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setError("");
        setErrors({});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, errors]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // Lấy email được truyền từ trang ForgotPassword
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      toast.error("Truy cập không hợp lệ. Vui lòng thử lại từ đầu.");
      navigate("/forgot-password");
    }
  }, [location, navigate]);

  const handleResendOTP = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      // Tái sử dụng API forgotPassword để tạo và gửi lại OTP mới
      const response = await authAPI.forgotPassword({ email });
      if (response.data.success) {
        toast.success("Đã gửi lại mã OTP mới!");
        setCountdown(60); // Bắt đầu đếm lại 60s
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi lại mã OTP.");
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.otp.trim()) newErrors.otp = "Vui lòng nhập mã OTP.";

    if (!formData.newPassword)
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới.";
    else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải từ 6 ký tự.";
    }

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setError("");
    setIsLoading(true);
    try {
      const response = await authAPI.resetPassword({
        email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      if (response.data.success) {
        toast.success("Mật khẩu đã được đổi thành công!");
        navigate("/login");
      }
    } catch (error) {
      setError(error.response?.data?.message || "OTP không hợp lệ.");
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
            Đặt lại mật khẩu
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600">
            Mã OTP đã được gửi đến: <br />
            <strong className="text-pink-600">{maskEmail(email)}</strong>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã OTP (6 chữ số)
              </label>
              <input
                name="otp"
                type="text"
                maxLength="6"
                required
                value={formData.otp}
                onChange={handleChange}
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 text-center tracking-widest text-xl font-bold transition ${errors.otp ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-pink-500"}`}
                placeholder="------"
              />
              {errors.otp && (
                <p className="text-red-500 text-xs mt-1 font-medium text-center">
                  {errors.otp}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu mới
              </label>
              <input
                name="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={handleChange}
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 transition ${errors.newPassword ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-pink-500"}`}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.newPassword}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 transition ${errors.confirmPassword ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-pink-500"}`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.confirmPassword}
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
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition shadow-lg disabled:bg-pink-300"
            >
              {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Chưa nhận được mã?{" "}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResending || countdown > 0}
              className="text-pink-500 font-semibold hover:underline disabled:text-pink-300"
            >
              {isResending
                ? "Đang gửi..."
                : countdown > 0
                  ? `Gửi lại sau (${countdown}s)`
                  : "Gửi lại ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ResetPassword;
