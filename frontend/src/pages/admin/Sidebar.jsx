import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { notificationAPI } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationAPI.getAll();
        if (res.data.success) {
          setUnreadCount(res.data.unreadCount);
        }
      } catch (err) {
        console.error("Lỗi tải thông báo:", err);
      }
    };
    fetchUnread();
    // Refresh mỗi 30s
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Danh sách các menu điều hướng của Admin
  const allMenuItems = [
    { path: "/admin", icon: "📊", label: "Tổng quan", roles: [1, 4] },
    {
      path: "/admin/lich-hen",
      icon: "📅",
      label: "Quản lý lịch hẹn",
      roles: [1, 2, 4, 5, 6, 7, 8],
    },
    {
      path: "/admin/ca-lam",
      icon: "⏰",
      label: "Lịch làm việc",
      roles: [2, 4, 5, 6, 7, 8],
    },
    {
      path: "/admin/bai-viet",
      icon: "✍️",
      label: "Quản lý bài viết",
      roles: [1, 4],
    },
    {
      path: "/admin/danh-gia",
      icon: "⭐",
      label: "Quản lý đánh giá",
      roles: [1, 4],
    },
    {
      path: "/admin/khach-hang",
      icon: "👥",
      label: "Khách hàng",
      roles: [1, 4],
    },
    {
      path: "/admin/dich-vu",
      icon: "🌸",
      label: "Quản lý dịch vụ",
      roles: [1, 2, 4, 5, 6, 7, 8],
    },
    { path: "/admin/doanh-thu", icon: "💰", label: "Doanh thu", roles: [1, 4] },
    {
      path: "/admin/nhan-vien",
      icon: "👩‍⚕️",
      label: "Quản lý nhân viên",
      roles: [1, 4],
    },
    {
      path: "/admin/tai-khoan",
      icon: "🔑",
      label: "Quản lý tài khoản",
      roles: [1, 4],
    },
    {
      path: "/admin/ho-so-cham-soc",
      icon: "📋",
      label: "Hồ sơ chăm sóc",
      roles: [1, 2, 4, 5, 6, 7, 8],
    },
  ];

  // Lọc menu theo role (1: Admin, 2: Nhân viên, 4: Chuyên gia)
  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(Number(user?.role_id)),
  );

  const handleLogout = async () => {
    await logout();
    toast.success("Đăng xuất thành công");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm">
      {/* Logo & Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100">
        <div className="text-2xl mr-2">🌸</div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            Mom&Baby
          </h1>
          <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition font-medium ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <span className="text-xl mr-3">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.path === "/admin/lich-hen" && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Điều hướng thêm */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <NavLink
          to="/"
          className="w-full flex items-center px-4 py-3 text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition"
        >
          <span className="text-xl mr-3">🏠</span>
          <span>Về trang chủ</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-red-500 font-medium rounded-xl hover:bg-red-50 transition"
        >
          <span className="text-xl mr-3">🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
