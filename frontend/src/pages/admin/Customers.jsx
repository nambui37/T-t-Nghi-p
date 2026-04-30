import React from "react";

const Customers = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Danh sách Khách hàng
        </h2>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, số điện thoại, email..."
          className="px-4 py-2 border border-gray-200 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
          Xuất Excel
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Liên hệ</th>
                <th className="px-6 py-4 font-semibold">Địa chỉ mặc định</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Tổng lịch hẹn
                </th>
                <th className="px-6 py-4 font-semibold">Ngày tham gia</th>
                <th className="px-6 py-4 font-semibold text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              <tr className="hover:bg-pink-50/30 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold">
                      M
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Nguyễn Thị Mai</p>
                      <p className="text-gray-500 text-xs">Mẹ bầu</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900 font-medium">0901234567</p>
                  <p className="text-gray-500 text-xs">mai.nguyen@email.com</p>
                </td>
                <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                  123 Đường Lê Lợi, Phường 4, Gò Vấp...
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full font-bold">
                    5
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">15/08/2023</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-pink-500 hover:text-pink-700 font-medium">
                    Xem chi tiết
                  </button>
                </td>
              </tr>
              {/* Các row khác có thể map từ API */}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Hiển thị 1 - 10 của 128 khách hàng</span>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">
              Trước
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
