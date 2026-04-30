import React from "react";
import { Link } from "react-router-dom";

const VerifyAccount = () => {
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
            Xác nhận mã OTP
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600">
            Chúng tôi vừa gửi mã gồm 6 chữ số đến tài khoản của bạn. Vui lòng
            kiểm tra và nhập vào ô bên dưới.
          </p>
        </div>
        <form className="mt-8 space-y-6" action="#" method="POST">
          {/* Khu vực nhập mã OTP (6 ô) */}
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
              />
            ))}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition shadow-lg hover:shadow-xl"
            >
              Xác thực tài khoản
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Chưa nhận được mã?{" "}
            <button
              type="button"
              className="text-pink-500 font-semibold hover:underline"
            >
              Gửi lại ngay
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
