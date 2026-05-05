import React, { useState, useEffect } from "react";
import { statsAPI } from "../../services/apiClient";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu không phải Admin (role 1) hoặc Quản lý (role 4), điều hướng đến trang công việc
    // Chấp nhận thêm các vai trò nhân viên khác để xem Dashboard cơ bản
    const allowedRoles = [1, 2, 4, 5, 6, 7, 8];
    if (user.role_id && !allowedRoles.includes(Number(user.role_id))) {
      navigate("/");
      return;
    }
    fetchStats();
  }, [user.role_id]);

  const fetchStats = async () => {
    try {
      const res = await statsAPI.getDashboard();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi tải thống kê dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Các thẻ thống kê (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-pink-500 hover:shadow-md transition">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Lịch hẹn hôm nay
            </p>
            <p className="text-3xl font-extrabold text-gray-900">
              {stats?.todayAppointments || 0}
            </p>
          </div>
          <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            🗓️
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-green-500 hover:shadow-md transition">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Doanh thu tháng
            </p>
            <p className="text-3xl font-extrabold text-gray-900">
              {(stats?.monthlyRevenue / 1000000).toFixed(1)}
              <span className="text-lg text-gray-500">Tr</span>
            </p>
          </div>
          <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            💰
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-500 hover:shadow-md transition">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Khách hàng mới
            </p>
            <p className="text-3xl font-extrabold text-gray-900">
              {stats?.newCustomers || 0}
            </p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            👥
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-purple-500 hover:shadow-md transition">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Nhân viên hoạt động
            </p>
            <p className="text-3xl font-extrabold text-gray-900">
              {stats?.activeEmployees || 0}
            </p>
          </div>
          <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            👩‍⚕️
          </div>
        </div>
      </div>

      {/* Bảng Danh sách lịch hẹn mới nhất */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">
            Lịch hẹn cần xử lý
          </h3>
          <button className="text-sm text-pink-500 font-semibold hover:text-pink-600 transition hover:underline">
            Xem tất cả
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Mã LH</th>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Dịch vụ</th>
                <th className="px-6 py-4 font-semibold">Thời gian</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats?.recentAppointments?.length > 0 ? (
                stats.recentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-pink-50/30 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {apt.id}
                    </td>
                    <td className="px-6 py-4">
                      {apt.guest_name || "Khách hàng"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {apt.service_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(apt.ngay_bat_dau).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                        {apt.status === "cho_xac_nhan"
                          ? "Chờ xác nhận"
                          : apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-pink-500 hover:text-white border border-pink-500 hover:bg-pink-500 px-3 py-1 rounded-full font-medium text-xs transition">
                        Xử lý
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Không có lịch hẹn nào cần xử lý.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
