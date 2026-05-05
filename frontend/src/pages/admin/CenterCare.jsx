import React, { useState, useEffect, useMemo } from "react";
import { appointmentAPI } from "../../services/apiClient";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const PIPELINE_STATUSES = ["cho_xac_nhan", "da_xac_nhan", "dang_thuc_hien"];

const CenterCare = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 350);
  const [filterStatus, setFilterStatus] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await appointmentAPI.getAll({
        dia_diem: "trung_tam",
        limit: 200,
        status: filterStatus || undefined,
        search: debouncedSearch || undefined,
      });
      if (res.data.success) {
        const rows = res.data.rows || [];
        const active = rows.filter((apt) =>
          PIPELINE_STATUSES.includes(apt.status),
        );
        setAppointments(active);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.role_id && ![1, 4].includes(Number(user.role_id))) {
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [debouncedSearch, filterStatus]);

  const filteredBySearch = useMemo(() => {
    if (!searchTerm.trim()) return appointments;
    const q = searchTerm.toLowerCase().trim();
    return appointments.filter(
      (apt) =>
        String(apt.id).includes(q) ||
        (apt.customer_name || apt.guest_name || "")
          .toLowerCase()
          .includes(q) ||
        (apt.phone || apt.guest_phone || "").includes(q),
    );
  }, [appointments, searchTerm]);

  if (user.role_id && ![1, 4].includes(Number(user.role_id))) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Chăm sóc tại trung tâm
          </h2>
          <p className="text-gray-500 text-sm">
            Lịch tại cơ sở từ chờ xác nhận đến đang sử dụng dịch vụ (theo địa điểm
            &quot;Trung tâm&quot; trong lịch hẹn).
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition border border-indigo-100"
        >
          Làm mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 md:items-center">
        <input
          type="text"
          placeholder="Tìm mã lịch, tên, SĐT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl w-full md:max-w-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 bg-white"
        >
          <option value="">Mọi giai đoạn</option>
          <option value="cho_xac_nhan">Chờ xác nhận</option>
          <option value="da_xac_nhan">Đã xác nhận</option>
          <option value="dang_thuc_hien">Đang thực hiện</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto" />
        </div>
      ) : filteredBySearch.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500">
            Không có lịch trung tâm trong giai đoạn này hoặc không khớp bộ lọc.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBySearch.map((apt) => (
            <div
              key={apt.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100 hover:shadow-md transition flex flex-col"
            >
              <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    {(apt.customer_name || apt.guest_name || "K").charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">
                      Mã lịch {apt.id}
                    </p>
                    <h3 className="font-bold text-gray-900">
                      {apt.customer_name || apt.guest_name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {apt.phone || apt.guest_phone}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-bold ${apt.status === "dang_thuc_hien" ? "bg-purple-100 text-purple-700" : apt.status === "da_xac_nhan" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {apt.status === "dang_thuc_hien"
                    ? "Đang sử dụng DV"
                    : apt.status === "da_xac_nhan"
                      ? "Đã xác nhận"
                      : "Chờ xác nhận"}
                </span>
              </div>
              <div className="space-y-3 text-sm text-gray-600 mb-6 flex-1">
                <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <span className="mt-0.5">🏢</span>
                  <span className="font-bold text-blue-800 leading-tight">
                    Phòng:{" "}
                    <span className="uppercase">
                      {apt.loai_phong === "vip"
                        ? "VIP cao cấp"
                        : "Thường"}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🌸</span>
                  <span className="font-medium text-indigo-600">
                    {apt.service_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👩‍⚕️</span>
                  <span className="font-bold text-indigo-600">
                    {apt.nhan_vien_name || "Chưa phân công"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏰</span>
                  <span>
                    {new Date(apt.ngay_bat_dau).toLocaleDateString()} -{" "}
                    {new Date(apt.ngay_ket_thuc).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CenterCare;
