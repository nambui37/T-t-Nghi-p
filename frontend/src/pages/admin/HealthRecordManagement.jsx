import React, { useState, useEffect } from "react";
import { healthRecordAPI, userAPI } from "../../services/apiClient";
import toast from "react-hot-toast";
import AdminModal, { FormInput, FormSelect } from "../../components/AdminModal";
import HealthChart from "../../components/HealthChart";

function shiftExecutionLabel(status) {
  const map = {
    cho_nhan: "Chờ phân công",
    da_nhan: "Chưa check-in",
    check_in: "Đã vào ca",
    dang_thuc_hien: "Đang thực hiện",
    hoan_thanh: "Hoàn thành",
    bao_loi: "Sự cố",
  };
  return map[status] || status || "—";
}

const HealthRecordManagement = () => {
  const [records, setRecords] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = [1, 4].includes(Number(user?.role_id));

  const [formData, setFormData] = useState({
    khach_hang_id: "",
    thong_tin: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [recordsRes, customersRes] = await Promise.all([
        healthRecordAPI.getAll(),
        userAPI.getCustomers(),
      ]);
      if (recordsRes.data.success) {
        let allRecords = recordsRes.data.data || [];

        // Lọc hồ sơ: Nếu không phải Admin/Quản lý, chỉ hiển thị hồ sơ khách hàng mình có tham gia chăm sóc
        if (!isAdmin) {
          allRecords = allRecords.filter((record) =>
            record.appointments?.some(
              (apt) =>
                Number(apt.nhan_vien_id) === Number(user.id) ||
                apt.shifts?.some(
                  (s) => Number(s.nhan_vien_id) === Number(user.id),
                ),
            ),
          );
        }
        setRecords(allRecords);
      }

      if (customersRes.data.success) {
        // Chỉ lấy khách hàng đã có user_id (không phải vãng lai) để gán hồ sơ
        setCustomers(customersRes.data.data.filter((c) => c.id !== null));
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        khach_hang_id: record.khach_hang_id,
        thong_tin: record.thong_tin,
      });
    } else {
      setEditingRecord(null);
      setFormData({
        khach_hang_id: "",
        thong_tin: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await healthRecordAPI.getById(id);
      if (res.data.success) {
        setSelectedRecordDetail(res.data.data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Không thể tải chi tiết hồ sơ.";
      toast.error(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.thong_tin) {
      return toast.error("Vui lòng nhập thông tin chi tiết.");
    }

    try {
      if (editingRecord) {
        await healthRecordAPI.update(editingRecord.id, formData);
        toast.success("Cập nhật hồ sơ thành công!");
      } else {
        if (!formData.khach_hang_id) {
          return toast.error("Vui lòng chọn khách hàng.");
        }
        await healthRecordAPI.create(formData);
        toast.success("Tạo hồ sơ thành công!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? err.response.data.errors[0].msg
          : "Đã có lỗi xảy ra.");
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ này?")) {
      try {
        await healthRecordAPI.delete(id);
        toast.success("Xóa hồ sơ thành công!");
        fetchData();
      } catch (err) {
        toast.error("Lỗi khi xóa hồ sơ.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hồ sơ chăm sóc</h2>
          <p className="text-gray-500 text-sm">
            Theo dõi tình trạng sức khỏe của mẹ và bé
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <span className="text-xl">+</span> Tạo hồ sơ mới
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : records.length > 0 ? (
          records.map((record) => (
            <div
              key={record.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                    {record.customer_name?.charAt(0) || "K"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {record.customer_name}
                    </h3>
                    <p className="text-xs text-gray-500">{record.phone}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleViewDetail(record.id)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Xem chi tiết"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => handleOpenModal(record)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Sửa"
                  >
                    ✏️
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-gray-600 text-sm whitespace-pre-wrap min-h-25 line-clamp-4 border border-gray-100">
                {record.thong_tin || "Chưa có thông tin chi tiết."}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-400">
              Chưa có hồ sơ chăm sóc nào được tạo.
            </p>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-scale-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingRecord ? "Cập nhật hồ sơ" : "Tạo hồ sơ chăm sóc mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!editingRecord && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Chọn khách hàng <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.khach_hang_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        khach_hang_id: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition outline-none"
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customers
                      .filter((c) => c.id !== null)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                  </select>
                </div>
              )}
              {editingRecord && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-sm text-indigo-700">
                    Khách hàng:{" "}
                    <span className="font-bold">
                      {editingRecord.customer_name}
                    </span>
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Thông tin chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows="8"
                  value={formData.thong_tin}
                  onChange={(e) =>
                    setFormData({ ...formData, thong_tin: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition outline-none resize-none"
                  placeholder="Nhập thông tin sức khỏe của mẹ và bé, các lưu ý đặc biệt..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
                >
                  Lưu hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi tiết Hồ sơ đầy đủ */}
      {isDetailModalOpen && selectedRecordDetail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-bold">Chi tiết Hồ sơ Chăm sóc</h2>
                <p className="text-indigo-100 text-sm">
                  Mã hồ sơ: {selectedRecordDetail.id}
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
              >
                ✕
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* 1. Thông tin khách hàng & Em bé */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="p-2 bg-indigo-100 rounded-lg">👤</span>{" "}
                    Thông tin mẹ
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                    <p className="text-sm">
                      <b>Họ tên:</b> {selectedRecordDetail.customer_name}
                    </p>
                    <p className="text-sm">
                      <b>SĐT:</b> {selectedRecordDetail.phone}
                    </p>
                    <p className="text-sm">
                      <b>Địa chỉ:</b>{" "}
                      {selectedRecordDetail.dia_chi || "Chưa cập nhật"}
                    </p>
                    <p className="text-sm italic">
                      <b>Ghi chú KH:</b>{" "}
                      {selectedRecordDetail.kh_ghi_chu || "Không có"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="p-2 bg-pink-100 rounded-lg">👶</span> Thông
                    tin em bé
                  </h3>
                  <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-3">
                    {selectedRecordDetail.babies?.length > 0 ? (
                      selectedRecordDetail.babies.map((baby, idx) => (
                        <div
                          key={idx}
                          className="border-b border-pink-100 last:border-0 pb-2 last:pb-0"
                        >
                          <p className="text-sm font-bold text-pink-700">
                            {baby.ten}
                          </p>
                          <p className="text-xs text-gray-600">
                            Ngày sinh:{" "}
                            {new Date(baby.ngay_sinh).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 italic">
                            Ghi chú: {baby.ghi_chu || "Không có"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        Chưa có thông tin em bé.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Lộ trình chăm sóc mẫu */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="p-2 bg-indigo-100 rounded-lg">📋</span> Lộ
                  trình chăm sóc mẫu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                      <span>📅</span> Thứ 2 - 4 - 6 (Cố định)
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2">
                        <span className="font-bold text-indigo-500">
                          06:30:
                        </span>
                        <span>Rửa mặt, thay tã, vệ sinh cho bé</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-indigo-500">
                          07:00:
                        </span>
                        <span>Ăn sáng (Theo thực đơn dinh dưỡng)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-indigo-500">
                          08:30:
                        </span>
                        <span>Massage & Tắm nắng</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-indigo-500">...</span>
                        <span>Các hoạt động chăm sóc cố định khác</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                    <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                      <span>🎲</span> Thứ 3 - 5 - 7 (Linh hoạt)
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2">
                        <span className="font-bold text-purple-500">Sáng:</span>
                        <span>Kiểm tra sức khỏe, vận động nhẹ</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-purple-500">Trưa:</span>
                        <span>Nghỉ ngơi, theo dõi giấc ngủ</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-purple-500">
                          Chiều:
                        </span>
                        <span>Vui chơi, tương tác phát triển trí tuệ</span>
                      </li>
                      <li className="flex gap-2 italic text-gray-500">
                        * Lộ trình thay đổi linh hoạt theo tình trạng của bé
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 2. Biểu đồ sức khỏe */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="p-2 bg-blue-100 rounded-lg">📈</span> Biểu đồ
                  Tăng trưởng & Sức khỏe
                </h3>
                <HealthChart
                  shifts={selectedRecordDetail.appointments?.flatMap(
                    (apt) => apt.shifts || [],
                  )}
                />
              </div>

              {/* 3. Lịch sử Lộ trình & Nhân viên thực hiện */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="p-2 bg-green-100 rounded-lg">📅</span> Lịch
                  sử Lộ trình & Nhân viên
                </h3>
                <div className="space-y-4">
                  {selectedRecordDetail.appointments?.length > 0 ? (
                    selectedRecordDetail.appointments.map((apt, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                      >
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                          <span className="font-bold text-indigo-600">
                            {apt.service_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            Đặt ngày:{" "}
                            {new Date(apt.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-indigo-500 uppercase mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                              Lộ trình dự kiến chi tiết
                            </p>
                            <div className="space-y-3 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
                              {apt.lich_trinh?.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex gap-3 p-3 bg-indigo-50/30 rounded-xl border border-indigo-100/50 hover:bg-indigo-50 transition"
                                >
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase">
                                      Ngày
                                    </span>
                                    <span className="text-lg font-black text-indigo-600 leading-none">
                                      {item.day}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-[10px] text-gray-400 font-medium">
                                      {new Date(item.date).toLocaleDateString(
                                        "vi-VN",
                                        {
                                          weekday: "long",
                                          day: "2-digit",
                                          month: "2-digit",
                                        },
                                      )}
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {item.activity}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                              Nhật ký thực hiện
                            </p>
                            <div className="space-y-2">
                              {apt.shifts?.length > 0 ? (
                                apt.shifts.map((shift, i) => (
                                  <div
                                    key={i}
                                    className="flex flex-col p-2 bg-indigo-50/50 rounded-lg text-xs"
                                  >
                                    <div className="flex justify-between">
                                      <span className="font-bold text-indigo-700">
                                        Chuyên viên: {shift.nhan_vien_name}
                                      </span>
                                      <span className="text-gray-500">
                                        {new Date(
                                          shift.ngay_lam,
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                      <span className="text-green-600 font-medium">
                                        ✓ {shiftExecutionLabel(shift.status)}
                                      </span>
                                      {shift.check_in && (
                                        <span className="text-gray-400">
                                          Vào:{" "}
                                          {new Date(
                                            shift.check_in,
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      )}
                                      {shift.check_out && (
                                        <span className="text-gray-400">
                                          Ra:{" "}
                                          {new Date(
                                            shift.check_out,
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      )}
                                    </div>
                                    {shift.ghi_chu && (
                                      <div className="mt-2 p-2 bg-white border border-indigo-100 rounded-lg text-indigo-800 italic relative">
                                        <span className="absolute -top-2 left-2 bg-indigo-500 text-[8px] text-white px-1 rounded uppercase font-bold">
                                          Ghi chú
                                        </span>
                                        "{shift.ghi_chu}"
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-400 italic">
                                  Chưa có nhân viên thực hiện.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Thanh toán */}
                        <div className="px-4 py-2 bg-yellow-50/50 border-t border-gray-100 flex justify-between items-center text-xs">
                          <span className="text-gray-600 italic">
                            Hỗ trợ:{" "}
                            {apt.ghi_chu_nhan_vien ||
                              "Không có yêu cầu đặc biệt"}
                          </span>
                          <span className="font-bold text-yellow-700">
                            {apt.payments?.length > 0
                              ? `Đã thanh toán lúc: ${new Date(apt.payments[0].ngay_thanh_toan).toLocaleString()}`
                              : "Trạng thái: Đang chờ thanh toán"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Chưa có dữ liệu lịch hẹn.
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Ghi chú chung */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="p-2 bg-yellow-100 rounded-lg">📝</span> Tổng
                  kết tình trạng sức khỏe
                </h3>
                <div className="bg-yellow-50/30 p-6 rounded-2xl border border-yellow-100 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedRecordDetail.thong_tin ||
                    "Chưa có thông tin tổng kết."}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition shadow-lg"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecordManagement;
