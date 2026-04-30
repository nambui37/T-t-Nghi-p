import React from "react";

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Các thẻ thống kê (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-pink-500 hover:shadow-md transition">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Lịch hẹn hôm nay
            </p>
            <p className="text-3xl font-extrabold text-gray-900">12</p>
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
              45.5<span className="text-lg text-gray-500">Tr</span>
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
            <p className="text-3xl font-extrabold text-gray-900">128</p>
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
            <p className="text-3xl font-extrabold text-gray-900">24</p>
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
              <tr className="hover:bg-pink-50/30 transition">
                <td className="px-6 py-4 font-bold text-gray-900">#LH1024</td>
                <td className="px-6 py-4">Nguyễn Thị A</td>
                <td className="px-6 py-4 text-gray-600">Tắm bé sơ sinh</td>
                <td className="px-6 py-4 text-gray-600">26/10/2023 09:00</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                    Chờ xác nhận
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-pink-500 hover:text-white border border-pink-500 hover:bg-pink-500 px-3 py-1 rounded-full font-medium text-xs transition">
                    Xử lý
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-pink-50/30 transition">
                <td className="px-6 py-4 font-bold text-gray-900">#LH1023</td>
                <td className="px-6 py-4">Trần Thị B</td>
                <td className="px-6 py-4 text-gray-600">Gói Vip Toàn Diện</td>
                <td className="px-6 py-4 text-gray-600">25/10/2023 14:30</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                    Chờ xác nhận
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-pink-500 hover:text-white border border-pink-500 hover:bg-pink-500 px-3 py-1 rounded-full font-medium text-xs transition">
                    Xử lý
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
