import React, { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../../services/apiClient";

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return email;
  const [name, domain] = email.split("@");
  const maskedName =
    name.length > 4
      ? name.substring(0, 4) + "***"
      : name.substring(0, 1) + "***";
  return `${maskedName}@${domain}`;
};

const VerifyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(0);

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

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (errors.otp) {
      setErrors({ ...errors, otp: null });
    }

    // Chuyển sang ô tiếp theo
    if (element.value !== "" && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({ ...errors, email: null });
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email để nhận mã OTP.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email không hợp lệ.");
      return;
    }

    setIsResending(true);
    try {
      const response = await authAPI.resendOTP(email);
      if (response.data.success) {
        toast.success(response.data.message || "Đã gửi lại mã OTP mới!");
        setCountdown(60);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi lại mã OTP.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = "Không tìm thấy email để xác thực.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email không hợp lệ.";

    const otpCode = otp.join("");
    if (otpCode.length < 6) newErrors.otp = "Vui lòng nhập đầy đủ mã OTP.";

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setError("");
    setIsLoading(true);
    try {
      // Gửi cả email và otp xuống backend
      const response = await authAPI.verifyOTP({ email, otp: otpCode });
      if (response.data.success) {
        toast.success(response.data.message || "Xác thực thành công!");
        navigate("/login");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.",
      );
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
            Xác nhận mã OTP
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600">
            {email ? (
              <>
                Chúng tôi vừa gửi mã gồm 6 chữ số đến email{" "}
                <strong className="text-pink-600">{maskEmail(email)}</strong>.
                Vui lòng kiểm tra và nhập vào ô bên dưới.
              </>
            ) : (
              "Vui lòng nhập email của bạn và mã OTP 6 chữ số đã được gửi."
            )}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {!location.state?.email && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email của bạn
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Nhập email để nhận mã"
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition ${errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-pink-500 focus:border-pink-500"}`}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between gap-2">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border focus:outline-none focus:ring-2 transition bg-white/50 ${errors.otp ? "border-red-500 focus:ring-red-500 focus:border-red-500 text-red-500" : "border-gray-300 focus:ring-pink-500 focus:border-pink-500"}`}
              />
            ))}
          </div>
          {errors.otp && (
            <p className="text-red-500 text-xs mt-1 font-medium text-center">
              {errors.otp}
            </p>
          )}

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
              {isLoading ? "Đang xác thực..." : "Xác thực tài khoản"}
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

          <div className="mt-2 text-center text-sm text-gray-500">
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

export default VerifyAccount;
