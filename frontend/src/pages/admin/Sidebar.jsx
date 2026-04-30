import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  // Danh sách các menu điều hướng của Admin
  const menuItems = [
    { path: "/admin", icon: "📊", label: "Tổng quan" },
    { path: "/admin/lich-hen", icon: "🗓️", label: "Quản lý lịch hẹn" },
    { path: "/admin/khach-hang", icon: "👥", label: "Khách hàng" },
    { path: "/admin/dich-vu", icon: "🌸", label: "Dịch vụ & Gói" },
    { path: "/admin/doanh-thu", icon: "💰", label: "Doanh thu" },
    // 2 chức năng mới được bổ sung
    { path: "/admin/nhan-vien", icon: "👩‍⚕️", label: "Quản lý nhân viên" },
    { path: "/admin/luong", icon: "💳", label: "Quản lý lương" },
  ];

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
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Đăng xuất */}
      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center px-4 py-3 text-red-500 font-medium rounded-xl hover:bg-red-50 transition">
          <span className="text-xl mr-3">🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
