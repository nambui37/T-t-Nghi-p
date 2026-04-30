import React from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <div
      className="flex items-center justify-center py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      {/* Lớp phủ (overlay) tối nhẹ giúp ảnh nền rõ nét hơn */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Form với hiệu ứng kính mờ (Glassmorphism) hòa hợp với nền */}
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
        <form className="mt-8 space-y-6" action="#" method="POST">
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
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm transition"
                placeholder="Nhập địa chỉ email của bạn"
              />
            </div>
          </div>

          <div>
            {/* Tạm thời dùng Link để chuyển thẳng tới trang Xác thực khi ấn gửi */}
            <Link
              to="/verify-account"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition shadow-lg hover:shadow-xl"
            >
              Gửi mã xác nhận
            </Link>
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
