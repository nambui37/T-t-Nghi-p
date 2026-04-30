import React, { useState } from "react";

const Services = () => {
  const [activeTab, setActiveTab] = useState("le"); // 'le' (Dịch vụ lẻ) hoặc 'goi' (Gói dịch vụ)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dịch vụ & Gói</h2>
        <button className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-xl font-semibold transition shadow-sm">
          + Thêm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("le")}
          className={`pb-3 px-2 font-medium text-lg ${activeTab === "le" ? "border-b-2 border-pink-500 text-pink-500" : "text-gray-500 hover:text-gray-700"}`}
        >
          Dịch vụ lẻ
        </button>
        <button
          onClick={() => setActiveTab("goi")}
          className={`pb-3 px-2 font-medium text-lg ${activeTab === "goi" ? "border-b-2 border-pink-500 text-pink-500" : "text-gray-500 hover:text-gray-700"}`}
        >
          Gói Combo
        </button>
      </div>

      {/* Bảng Dịch Vụ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Mã</th>
                <th className="px-6 py-4 font-semibold">
                  Tên {activeTab === "le" ? "dịch vụ" : "gói"}
                </th>
                <th className="px-6 py-4 font-semibold">Danh mục</th>
                <th className="px-6 py-4 font-semibold text-right">
                  Giá tiền (VNĐ)
                </th>
                <th className="px-6 py-4 font-semibold text-center">
                  Thời gian / Số buổi
                </th>
                <th className="px-6 py-4 font-semibold text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              <tr className="hover:bg-pink-50/30 transition">
                <td className="px-6 py-4 font-medium text-gray-500">DV01</td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  {activeTab === "le"
                    ? "Tắm bé sơ sinh chuẩn Y khoa"
                    : "Gói Vip Toàn Diện 1 Tháng"}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {activeTab === "le" ? "Chăm sóc bé" : "Gói Mẹ & Bé"}
                </td>
                <td className="px-6 py-4 text-right font-bold text-pink-500">
                  {activeTab === "le" ? "350.000" : "8.900.000"}
                </td>
                <td className="px-6 py-4 text-center text-gray-600">
                  {activeTab === "le" ? "60 Phút" : "30 Buổi"}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button className="text-blue-500 hover:text-blue-700 font-medium">
                    Sửa
                  </button>
                  <button className="text-red-500 hover:text-red-700 font-medium">
                    Xóa
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
export default Services;
