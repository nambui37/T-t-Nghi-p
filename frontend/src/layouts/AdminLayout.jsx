import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/admin/Sidebar";

const AdminLayout = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
      {/* Cột trái: Sidebar điều hướng cố định */}
      <Sidebar />

      {/* Cột phải: Nội dung chính */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar / Header (Chứa tìm kiếm, chuông thông báo, tài khoản) */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="text-xl font-bold text-gray-800 hidden md:block">
            {/* Bạn có thể đặt Title động dựa theo route ở đây */}
          </div>
          <div className="flex items-center gap-5 ml-auto">
            <button className="relative p-2 text-gray-500 hover:text-indigo-600 transition">
              <span className="text-2xl">🔔</span>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center">
                {user.name?.charAt(0) || "U"}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-bold text-gray-900">{user.name || "Người dùng"}</p>
                <p className="text-xs text-gray-500">{user.role_name || "Thành viên"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Nội dung thay đổi theo từng Route (Tự động cuộn khi nội dung dài) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
