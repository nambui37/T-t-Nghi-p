import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Tìm kiếm tức thì: Nếu ở trang dịch vụ thì cập nhật URL ngay
    if (location.pathname === "/dich-vu") {
      navigate(`/dich-vu?search=${encodeURIComponent(value.trim())}`, {
        replace: true,
      });
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      if (location.pathname !== "/dich-vu") {
        navigate(`/dich-vu?search=${encodeURIComponent(searchTerm.trim())}`);
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <img
              src="https://png.pngtree.com/png-clipart/20240406/original/pngtree-mother-hugging-her-son-png-image_14768495.png"
              alt="Mom&Baby Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl lg:text-2xl font-bold text-pink-500 truncate">
              Mom&Baby
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8 flex-1 justify-center">
            <Link
              to="/"
              className={`${isActive("/") ? "text-pink-500 border-b-2 border-pink-500" : "text-gray-600 hover:text-pink-500"} font-medium transition text-sm lg:text-base whitespace-nowrap`}
            >
              Trang chủ
            </Link>
            <Link
              to="/dich-vu"
              className={`${isActive("/dich-vu") ? "text-pink-500 border-b-2 border-pink-500" : "text-gray-600 hover:text-pink-500"} font-medium transition text-sm lg:text-base whitespace-nowrap`}
            >
              Dịch vụ
            </Link>
            <Link
              to="/doi-ngu"
              className={`${isActive("/doi-ngu") ? "text-pink-500 border-b-2 border-pink-500" : "text-gray-600 hover:text-pink-500"} font-medium transition text-sm lg:text-base whitespace-nowrap`}
            >
              Đội ngũ
            </Link>
            <Link
              to="/cam-nang"
              className={`${isActive("/cam-nang") ? "text-pink-500 border-b-2 border-pink-500" : "text-gray-600 hover:text-pink-500"} font-medium transition text-sm lg:text-base whitespace-nowrap`}
            >
              Cẩm nang
            </Link>

            {/* Search Bar */}
            <div className="hidden lg:flex items-center relative group">
              <div className="relative w-48 xl:w-64">
                <input
                  type="text"
                  placeholder="Tìm theo tên, mô tả..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={handleSearchSubmit}
                  className="w-full bg-gray-100 border border-transparent rounded-full py-1.5 pl-10 pr-4 focus:ring-2 focus:ring-pink-300 focus:bg-white focus:border-pink-200 transition-all text-sm outline-none"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </nav>

          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 shrink-0">
            {!isLoggedIn ? (
              <Link
                to="/login"
                className="text-pink-500 font-semibold hover:text-pink-600 transition"
              >
                Đăng nhập
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                {[1, 2, 4, 5, 6, 7, 8].includes(user?.role_id) && (
                  <Link
                    to="/admin"
                    className="text-indigo-600 font-bold hover:text-indigo-700 transition text-sm bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1"
                  >
                    <span>⚙️</span>
                  </Link>
                )}
                <Link
                  to="/ho-so"
                  className={`${isActive("/ho-so") ? "text-pink-500" : "text-gray-600"} font-semibold hover:text-pink-600 transition flex items-center gap-2`}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-pink-100"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <span>Chào, {user?.name?.split(" ").pop()}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-500 font-medium transition text-sm"
                >
                  Đăng xuất
                </button>
              </div>
            )}
            <Link
              to="/dat-lich"
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 lg:px-6 py-2 rounded-full font-semibold transition shadow-md hover:shadow-lg block text-sm lg:text-base whitespace-nowrap"
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
            {[1, 2, 4].includes(user?.role_id) && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center px-3 py-3 text-base font-semibold text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 border border-indigo-100"
              >
                ⚙️ Trang Quản Trị
              </Link>
            )}
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
