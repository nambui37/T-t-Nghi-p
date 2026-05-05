import React, { useState, useEffect, useMemo } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { userAPI } from "../../services/apiClient";
import { AdminModal } from "../../components/AdminModal";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 350);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await userAPI.getCustomers();
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách khách hàng:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openDetailModal = (customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          c.phone?.includes(debouncedSearch) ||
          c.email?.toLowerCase().includes(debouncedSearch.toLowerCase()),
      ),
    [customers, debouncedSearch],
  );

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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((c, idx) => (
                  <tr
                    key={c.id || `guest-${idx}`}
                    className="hover:bg-pink-50/30 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold">
                          {c.name?.charAt(0) || "K"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{c.name}</p>
                          <p className="text-gray-500 text-xs">
                            {c.hang_thanh_vien || "Mẹ bầu"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{c.phone}</p>
                      <p className="text-gray-500 text-xs">{c.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                      {c.dia_chi || "Chưa cập nhật"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full font-bold">
                        {c.total_appointments || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetailModal(c)}
                        className="text-pink-500 hover:text-pink-700 font-medium"
                      >
                        Xem chi tiết
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
                    Không tìm thấy khách hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Hiển thị {filteredCustomers.length} khách hàng</span>
        </div>
      </div>

      {/* Modal Chi tiết khách hàng */}
      <AdminModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết khách hàng"
        showConfirm={false}
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-2xl font-bold">
                {selectedCustomer.name?.charAt(0) || "K"}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedCustomer.name}
                </h3>
                <p className="text-pink-500 font-medium">
                  {selectedCustomer.hang_thanh_vien || "Khách hàng"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                  Số điện thoại
                </p>
                <p className="text-gray-900">
                  {selectedCustomer.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                  Email
                </p>
                <p className="text-gray-900">
                  {selectedCustomer.email || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                  Địa chỉ
                </p>
                <p className="text-gray-900">
                  {selectedCustomer.dia_chi || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                  Điểm tích lũy
                </p>
                <p className="text-pink-600 font-bold">
                  {selectedCustomer.diem_tich_luy || 0} điểm
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                  Tổng lịch hẹn
                </p>
                <p className="text-gray-900">
                  {selectedCustomer.total_appointments || 0} lần
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 italic">
                * Đây là thông tin tổng quát của khách hàng. Bạn có thể xem lịch
                sử chi tiết các buổi chăm sóc trong phần "Hồ sơ chăm sóc".
              </p>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default Customers;
