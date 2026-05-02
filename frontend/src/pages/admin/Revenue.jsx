import React, { useState, useEffect } from "react";
import { statsAPI } from "../../services/apiClient";
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
  const [revenueData, setRevenueData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    monthly: 0,
    daily: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Chỉ Admin (1) và Quản lý (4) mới có quyền xem doanh thu
    if (user.role_id && ![1, 4].includes(Number(user.role_id))) {
      return;
    }
    const fetchRevenue = async () => {
      try {
        const res = await statsAPI.getRevenue();
        if (res.data.success) {
          const { revenueByMonth, recentTransactions } = res.data.data;

          // Format data for Recharts
          const chartData = Array.from({ length: 12 }, (_, i) => ({
            name: `T${i + 1}`,
            revenue: 0,
          }));

          revenueByMonth.forEach((item) => {
            chartData[item.month - 1].revenue = parseFloat(item.revenue);
          });

          setRevenueData(chartData);
          setTransactions(recentTransactions);

          // Mock summary calculation based on transactions or separate API
          const totalMonthly =
            revenueByMonth.find((m) => m.month === new Date().getMonth() + 1)
              ?.revenue || 0;
          setSummary({
            monthly: totalMonthly,
            daily: recentTransactions
              .filter(
                (t) =>
                  new Date(t.ngay_thanh_toan).toDateString() ===
                  new Date().toDateString(),
              )
              .reduce((sum, t) => sum + parseFloat(t.so_tien), 0),
            pending: 0, // This would need another query
          });
        }
      } catch (err) {
        console.error("Lỗi tải báo cáo doanh thu:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRevenue();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (user.role_id && ![1, 4].includes(Number(user.role_id))) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800">Báo cáo Doanh thu</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Tổng doanh thu (Tháng này)
          </p>
          <p className="text-3xl font-extrabold text-gray-900">
            {new Intl.NumberFormat("vi-VN").format(summary.monthly)}đ
          </p>
          <p className="text-xs text-green-500 mt-2 font-medium">
            ↑ Dữ liệu thực tế từ hệ thống
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-pink-500">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Doanh thu hôm nay
          </p>
          <p className="text-3xl font-extrabold text-gray-900">
            {new Intl.NumberFormat("vi-VN").format(summary.daily)}đ
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Từ các giao dịch trong ngày
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Chờ thanh toán
          </p>
          <p className="text-3xl font-extrabold text-gray-900">0đ</p>
          <p className="text-xs text-gray-400 mt-2">Đang cập nhật...</p>
        </div>
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Biểu đồ doanh thu năm {new Date().getFullYear()}
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueData}
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
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Mã Hóa Đơn</th>
                <th className="px-6 py-4 font-semibold">Mã Lịch Hẹn</th>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Ngày thanh toán</th>
                <th className="px-6 py-4 font-semibold text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-500">
                      #HD-{t.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-pink-500">
                      #LH{t.lich_hen_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {t.customer_name || t.guest_name || "Khách hàng"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(t.ngay_thanh_toan).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-right">
                      + {new Intl.NumberFormat("vi-VN").format(t.so_tien)}đ
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Chưa có giao dịch nào.
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

export default Revenue;
