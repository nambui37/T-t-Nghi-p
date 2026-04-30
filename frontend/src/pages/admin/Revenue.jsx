import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Revenue = () => {
  // Dữ liệu mẫu cho biểu đồ
  const data = [
    { name: "T1", revenue: 30000000 },
    { name: "T2", revenue: 45000000 },
    { name: "T3", revenue: 32000000 },
    { name: "T4", revenue: 50000000 },
    { name: "T5", revenue: 48000000 },
    { name: "T6", revenue: 60000000 },
    { name: "T7", revenue: 55000000 },
    { name: "T8", revenue: 65000000 },
    { name: "T9", revenue: 70000000 },
    { name: "T10", revenue: 45500000 }, // Tháng hiện tại
  ];

  // Tùy chỉnh hiển thị Tooltip khi hover vào cột
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-600 font-medium mb-1">{`Tháng ${label.replace("T", "")}`}</p>
          <p className="text-pink-500 font-bold">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800">Báo cáo Doanh thu</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Tổng doanh thu (Tháng này)
          </p>
          <p className="text-3xl font-extrabold text-gray-900">45.500.000đ</p>
          <p className="text-xs text-green-500 mt-2 font-medium">
            ↑ Tăng 12% so với tháng trước
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-pink-500">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Doanh thu hôm nay
          </p>
          <p className="text-3xl font-extrabold text-gray-900">3.200.000đ</p>
          <p className="text-xs text-gray-400 mt-2">
            Từ 5 đơn hàng đã thanh toán
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Chờ thanh toán
          </p>
          <p className="text-3xl font-extrabold text-gray-900">8.900.000đ</p>
          <p className="text-xs text-gray-400 mt-2">
            2 Lịch hẹn gói đang thực hiện
          </p>
        </div>
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Biểu đồ doanh thu năm nay
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(value) => `${value / 1000000}Tr`}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#fdf2f8" }}
              />
              <Bar
                dataKey="revenue"
                fill="#ec4899"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bảng giao dịch gần đây */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">
            Giao dịch thanh toán gần đây
          </h3>
          <input
            type="month"
            className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Mã Hóa Đơn</th>
                <th className="px-6 py-4 font-semibold">Mã Lịch Hẹn</th>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Phương thức</th>
                <th className="px-6 py-4 font-semibold">Ngày thanh toán</th>
                <th className="px-6 py-4 font-semibold text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-500">
                  #HD-8201
                </td>
                <td className="px-6 py-4 font-bold text-pink-500">#LH1020</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  Lê Thị C
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">
                    Chuyển khoản
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">25/10/2023 - 15:30</td>
                <td className="px-6 py-4 font-bold text-gray-900 text-right">
                  + 8.900.000đ
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-500">
                  #HD-8200
                </td>
                <td className="px-6 py-4 font-bold text-pink-500">#LH1018</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  Trần Bích D
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-bold">
                    Tiền mặt
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">24/10/2023 - 10:15</td>
                <td className="px-6 py-4 font-bold text-gray-900 text-right">
                  + 350.000đ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 text-center">
          <button className="text-pink-500 font-semibold hover:text-pink-600">
            Xem tất cả hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
