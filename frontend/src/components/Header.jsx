import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="shrink-0 flex items-center gap-2">
            {/* DÁN LINK ẢNH TỪ GOOGLE VÀO THUỘC TÍNH SRC BÊN DƯỚI */}
            <img
              src="https://png.pngtree.com/png-clipart/20240406/original/pngtree-mother-hugging-her-son-png-image_14768495.png"
              alt="Mom&Baby Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-3xl font-bold text-pink-500">Mom&Baby</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-pink-500 font-medium border-b-2 border-pink-500"
            >
              Trang chủ
            </Link>
            <Link
              to="/dich-vu"
              className="text-gray-600 hover:text-pink-500 transition font-medium"
            >
              Dịch vụ
            </Link>
            <Link
              to="/goi-dich-vu"
              className="text-gray-600 hover:text-pink-500 transition font-medium"
            >
              Gói dịch vụ
            </Link>
            <Link
              to="/doi-ngu"
              className="text-gray-600 hover:text-pink-500 transition font-medium"
            >
              Đội ngũ
            </Link>
            <Link
              to="/cam-nang"
              className="text-gray-600 hover:text-pink-500 transition font-medium"
            >
              Cẩm nang
            </Link>
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-pink-500 font-semibold hover:text-pink-600 transition"
            >
              Đăng nhập
            </Link>
            <Link
              to="/ho-so"
              className="text-gray-600 font-semibold hover:text-pink-600 transition"
            >
              Hồ sơ
            </Link>
            <Link
              to="/dat-lich"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-semibold transition shadow-md hover:shadow-lg block"
            >
              Đặt Lịch Hẹn
            </Link>
          </div>

          {/* Hamburger Button for Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-pink-500 focus:outline-none p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"} bg-white border-t border-gray-100 shadow-lg absolute w-full`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-3 text-base font-medium text-pink-500 bg-pink-50 rounded-xl"
          >
            Trang chủ
          </Link>
          <Link
            to="/dich-vu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition"
          >
            Dịch vụ
          </Link>
          <Link
            to="/goi-dich-vu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition"
          >
            Gói dịch vụ
          </Link>
          <Link
            to="/doi-ngu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition"
          >
            Đội ngũ
          </Link>
          <Link
            to="/cam-nang"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition"
          >
            Cẩm nang
          </Link>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-center px-3 py-3 text-base font-semibold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100"
            >
              Đăng nhập / Đăng ký
            </Link>
            <Link
              to="/ho-so"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-center px-3 py-3 text-base font-semibold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100"
            >
              Hồ sơ của tôi
            </Link>
            <Link
              to="/dat-lich"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-center px-3 py-3 text-base font-semibold text-white bg-pink-500 rounded-xl hover:bg-pink-600 shadow-md"
            >
              Đặt Lịch Hẹn
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
