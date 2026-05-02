import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../services/apiClient";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get("redirect");

    if (user) {
      navigate(redirectPath || "/", { replace: true });
    }

    // Hiển thị thông báo yêu cầu đăng nhập nếu chuyển hướng từ đặt lịch
    if (redirectPath === "/dat-lich") {
      // Dùng toast.loading hoặc toast() với ID để tránh duplicate
      toast.error("Vui lòng đăng nhập để sử dụng dịch vụ đặt lịch.", {
        id: "login-required-toast",
      });
    }
  }, [user, navigate, location.search]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error || Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setError("");
        setErrors({});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, errors]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ.";
    }

    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu.";

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setIsLoading(true);
    try {
      const response = await authAPI.login(formData);
      if (response.data.success) {
        toast.success("Đăng nhập thành công!");

        // LƯU USER VÀO LOCALSTORAGE ĐỂ GIỮ PHIÊN ĐĂNG NHẬP KHI F5 (RELOAD)
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Sử dụng hàm login từ AuthContext (Bỏ phần token vì đã dùng HttpOnly Cookie)
        login(response.data.user);

        // Chuyển hướng dựa trên role
        if (response.data.user.role_id === 1) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Email hoặc mật khẩu không chính xác.";
      setError(msg);

      // Nếu tài khoản chưa xác thực, hỏi xem có muốn chuyển hướng sang trang xác thực không
      if (err.response?.status === 403 && msg.includes("xác thực")) {
        setTimeout(() => {
          if (
            window.confirm("Bạn có muốn chuyển đến trang xác thực ngay không?")
          ) {
            navigate("/verify-account", { state: { email: formData.email } });
          }
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center relative min-h-screen"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1555252333-9f8e92e65df9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập tài khoản
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-pink-500 hover:text-pink-600 transition"
            >
              Đăng ký ngay
            </Link>
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
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded-xl relative block w-full px-4 py-3 border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition ${errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-pink-500 focus:border-pink-500"}`}
                placeholder="Nhập địa chỉ email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none rounded-xl relative block w-full px-4 py-3 pr-12 border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm transition ${errors.password ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-pink-500 focus:border-pink-500"}`}
                  placeholder="Nhập mật khẩu"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.password}
                  </p>
                )}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-pink-500 transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-pink-500 hover:text-pink-600"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="text-sm">
              <Link
                to="/verify-account"
                className="font-medium text-pink-500 hover:text-pink-600"
              >
                Xác minh tài khoản
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition shadow-lg hover:shadow-xl disabled:bg-pink-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </div>
          <div className="mt-2 text-center text-sm text-gray-500">
            <Link to="/" className="text-pink-500 hover:underline">
              ← Quay lại trang chủ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
