import React, { useState, useEffect } from "react";
import {
  appointmentAPI,
  serviceAPI,
  userAPI,
  employeeAPI,
} from "../../services/apiClient";
import toast from "react-hot-toast";
import AdminModal, { FormInput, FormSelect } from "../../components/AdminModal";
import { generateRoadmap } from "../../utils/roadmapUtils";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  let user = {};
  try {
    const userStr = localStorage.getItem("user");
    user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : {};
  } catch (e) {
    user = {};
  }
  const isAdmin = [1, 4].includes(Number(user?.role_id));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [assignData, setAssignData] = useState({ nhan_vien_id: "" });
  const [statusData, setStatusData] = useState({
    status: "",
    trang_thai_thanh_toan: "",
    ngay_bat_dau_thuc_te: "",
    ngay_ket_thuc_thuc_te: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [newAppointment, setNewAppointment] = useState({
    user_id: "",
    nhan_vien_id: "",
    goi_id: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    loai_lich: "linh_hoat",
    dia_diem: "tai_nha",
    guest_name: "",
    guest_phone: "",
  });

  // Lấy ngày hiện tại để làm min date (yyyy-mm-dd)
  const today = new Date().toISOString().split("T")[0];

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    // Nếu đang ở trang khác 1 mà đổi bộ lọc, reset về 1. Nếu đã ở 1 thì gọi fetchData luôn.
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchData();
    }
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    // Chỉ gọi fetchData khi currentPage thực sự thay đổi
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [aptRes, svcRes, userRes, empRes] = await Promise.all([
        appointmentAPI.getAll({
          page: currentPage,
          limit: itemsPerPage,
          status: filterStatus,
          search: searchTerm,
        }),
        serviceAPI.getAll(),
        userAPI.getCustomers(),
        employeeAPI.getAll(),
      ]);

      if (aptRes.data.success) {
        setAppointments(aptRes.data.rows || []);
        setTotalItems(aptRes.data.total || 0);
      }
      if (svcRes.data.success) setServices(svcRes.data.data || []);
      if (userRes.data.success) setCustomers(userRes.data.data || []);
      if (empRes.data.success) setEmployees(empRes.data.data || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu.");
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAppointment = async (e) => {
    if (e) e.preventDefault();
    if (
      !newAppointment.goi_id ||
      (!newAppointment.user_id && !newAppointment.guest_name)
    ) {
      return toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
    }

    try {
      const service = services.find(
        (s) => s.id === Number(newAppointment.goi_id),
      );
      const generatedLichTrinh = generateRoadmap(
        newAppointment.ngay_bat_dau,
        newAppointment.ngay_ket_thuc,
        service ? service.name : "",
      );

      const res = await appointmentAPI.create({
        ...newAppointment,
        lich_trinh: generatedLichTrinh,
      });
      if (res.data.success) {
        toast.success("Tạo lịch hẹn thành công!");
        setIsModalOpen(false);
        fetchData();
        setNewAppointment({
          user_id: "",
          nhan_vien_id: "",
          goi_id: "",
          ngay_bat_dau: "",
          ngay_ket_thuc: "",
          loai_lich: "linh_hoat",
          dia_diem: "tai_nha",
          guest_name: "",
          guest_phone: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo lịch hẹn.");
    }
  };

  const handleUpdateStatus = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await appointmentAPI.updateStatus(
        selectedApt.id,
        statusData.status,
        {
          trang_thai_thanh_toan: statusData.trang_thai_thanh_toan,
          ngay_bat_dau_thuc_te: statusData.ngay_bat_dau_thuc_te,
          ngay_ket_thuc_thuc_te: statusData.ngay_ket_thuc_thuc_te,
        },
      );
      if (res.data.success) {
        toast.success("Cập nhật trạng thái thành công!");
        setIsStatusModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái.",
      );
    }
  };

  const handleAssignStaff = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await appointmentAPI.assignEmployee(
        selectedApt.id,
        assignData.nhan_vien_id,
      );
      if (res.data.success) {
        toast.success("Đã phân công nhân viên thành công!");
        setIsAssignModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi phân công.");
    }
  };

  const openStatusModal = (apt) => {
    setSelectedApt(apt);
    setStatusData({
      status: apt.status,
      trang_thai_thanh_toan: apt.trang_thai_thanh_toan,
      ngay_bat_dau_thuc_te: apt.ngay_bat_dau_thuc_te
        ? apt.ngay_bat_dau_thuc_te.split("T")[0]
        : "",
      ngay_ket_thuc_thuc_te: apt.ngay_ket_thuc_thuc_te
        ? apt.ngay_ket_thuc_thuc_te.split("T")[0]
        : "",
    });
    setIsStatusModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) {
      try {
        await appointmentAPI.delete(id);
        toast.success(`Đã hủy lịch hẹn #${id}`);
        fetchData();
      } catch (error) {
        toast.error("Lỗi khi hủy lịch hẹn.");
      }
    }
  };

  const currentItems = appointments;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getStatusBadge = (status) => {
    const config = {
      cho_xac_nhan: {
        label: "Chờ xác nhận",
        class: "bg-yellow-100 text-yellow-700",
      },
      da_xac_nhan: { label: "Đã xác nhận", class: "bg-blue-100 text-blue-700" },
      dang_thuc_hien: {
        label: "Đang thực hiện",
        class: "bg-purple-100 text-purple-700",
      },
      hoan_thanh: { label: "Hoàn thành", class: "bg-green-100 text-green-700" },
      da_huy: { label: "Đã hủy", class: "bg-red-100 text-red-700" },
    };
    const s = config[status] || config.cho_xac_nhan;
    return (
      <span
        className={`px-2 py-1 rounded-full text-[10px] font-bold ${s.class}`}
      >
        {s.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status, method, deposit) => {
    const config = {
      chua_thanh_toan: {
        label: "Chưa thanh toán",
        class: "bg-gray-100 text-gray-600",
      },
      da_coc_15: {
        label: `Đã cọc 15% (${deposit?.toLocaleString()}đ)`,
        class: "bg-orange-100 text-orange-700",
      },
      da_thanh_toan_het: {
        label: "Đã tất toán",
        class: "bg-green-100 text-green-700",
      },
    };
    const s = config[status] || config.chua_thanh_toan;
    const methodLabel = method === "vnpay" ? "VNPay" : "Tiền mặt";

    return (
      <div className="flex flex-col space-y-1">
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold w-fit ${s.class}`}
        >
          {s.label}
        </span>
        <span className="text-[10px] text-gray-400 italic font-medium ml-1">
          HT: {methodLabel}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Lịch hẹn</h2>
          <p className="text-sm text-gray-500">
            Xem và quản lý các yêu cầu đặt lịch của khách hàng
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg hover:shadow-xl"
          >
            + Tạo lịch hẹn mới
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex space-x-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Tìm mã LH, tên, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
          />
          <input
            type="date"
            value={filterDate}
            min={today}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white transition"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="cho_xac_nhan">Chờ xác nhận</option>
          <option value="da_xac_nhan">Đã xác nhận</option>
          <option value="dang_thuc_hien">Đang thực hiện</option>
          <option value="hoan_thanh">Hoàn thành</option>
          <option value="da_huy">Đã hủy</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Mã LH</th>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Dịch vụ</th>
                <th className="px-6 py-4 font-semibold">Ngày dự kiến</th>
                <th className="px-6 py-4 font-semibold">Thanh toán</th>
                {isAdmin && (
                  <th className="px-6 py-4 font-semibold text-right">
                    Hành động
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-pink-500 font-bold"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : !currentItems || currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Không tìm thấy lịch hẹn nào.
                  </td>
                </tr>
              ) : (
                currentItems.map((apt) => (
                  <tr key={apt.id} className="hover:bg-pink-50/30 transition">
                    <td className="px-6 py-4 font-bold text-pink-500">
                      #{apt.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">
                        {apt.customer_name || apt.guest_name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {apt.phone || apt.guest_phone}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {apt.service_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-xs">
                      {new Date(apt.ngay_bat_dau).toLocaleDateString()} -{" "}
                      {new Date(apt.ngay_ket_thuc).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentStatusBadge(
                        apt.trang_thai_thanh_toan,
                        apt.hinh_thuc_thanh_toan,
                        apt.dat_coc,
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApt(apt);
                            setIsDetailModalOpen(true);
                          }}
                          className="text-pink-500 hover:underline font-medium"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => openStatusModal(apt)}
                          className="text-blue-500 hover:underline font-medium"
                        >
                          Cập nhật
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApt(apt);
                            setAssignData({
                              nhan_vien_id: apt.nhan_vien_id || "",
                            });
                            setIsAssignModalOpen(true);
                          }}
                          className="text-indigo-600 hover:underline font-medium"
                        >
                          Phân công
                        </button>
                        <button
                          onClick={() => handleDelete(apt.id)}
                          className="text-red-500 hover:underline font-medium"
                        >
                          Hủy
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} của {totalItems}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tạo lịch hẹn mới */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo lịch hẹn mới"
        onConfirm={handleAddAppointment}
        size="1xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Khách hàng hệ thống"
            value={newAppointment.user_id}
            onChange={(e) =>
              setNewAppointment({
                ...newAppointment,
                user_id: e.target.value,
                guest_name: "",
                guest_phone: "",
              })
            }
            options={[
              { value: "", label: "-- Chọn khách hàng --" },
              ...customers.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.phone})`,
              })),
            ]}
          />
          <FormInput
            label="Tên khách vãng lai"
            disabled={!!newAppointment.user_id}
            value={newAppointment.guest_name}
            onChange={(e) =>
              setNewAppointment({
                ...newAppointment,
                guest_name: e.target.value,
              })
            }
            placeholder="Nếu chưa có tài khoản"
          />
          <FormInput
            label="Số điện thoại khách"
            type="tel"
            disabled={!!newAppointment.user_id}
            value={newAppointment.guest_phone}
            onChange={(e) =>
              setNewAppointment({
                ...newAppointment,
                guest_phone: e.target.value,
              })
            }
          />
          <FormSelect
            label="Chuyên viên thực hiện"
            value={newAppointment.nhan_vien_id}
            onChange={(e) =>
              setNewAppointment({
                ...newAppointment,
                nhan_vien_id: e.target.value,
              })
            }
            options={[
              { value: "", label: "-- Chọn chuyên viên (Nếu có) --" },
              ...employees.map((e) => ({
                value: e.id,
                label: `${e.name} (${e.phone})`,
              })),
            ]}
          />
          <FormSelect
            label="Dịch vụ"
            required
            value={newAppointment.goi_id}
            onChange={(e) =>
              setNewAppointment({
                ...newAppointment,
                goi_id: e.target.value,
              })
            }
            options={[
              { value: "", label: "-- Chọn dịch vụ --" },
              ...services.map((s) => ({
                value: s.id,
                label: `${s.name} - ${Number(s.gia).toLocaleString()}đ`,
              })),
            ]}
          />
          <FormInput
            label="Ngày bắt đầu"
            type="date"
            required
            min={today}
            value={newAppointment.ngay_bat_dau}
            onChange={(e) =>
              setNewAppointment({
                ...newAppointment,
                ngay_bat_dau: e.target.value,
              })
            }
          />
          <FormInput
            label="Ngày kết thúc"
            type="date"
            required
            min={newAppointment.ngay_bat_dau || today}
            value={newAppointment.ngay_ket_thuc}
            onChange={(e) =>
              setNewAppointment({
                ...newAppointment,
                ngay_ket_thuc: e.target.value,
              })
            }
          />
          <FormSelect
            label="Địa điểm"
            value={newAppointment.dia_diem}
            onChange={(e) =>
              setNewAppointment({
                ...newAppointment,
                dia_diem: e.target.value,
              })
            }
            options={[
              { value: "tai_nha", label: "Tại nhà" },
              { value: "trung_tam", label: "Tại trung tâm" },
            ]}
          />
          <FormSelect
            label="Loại lịch"
            value={newAppointment.loai_lich}
            onChange={(e) =>
              setNewAppointment({
                ...newAppointment,
                loai_lich: e.target.value,
              })
            }
            options={[
              { value: "linh_hoat", label: "Linh hoạt" },
              { value: "co_dinh", label: "Cố định" },
            ]}
          />
        </div>
      </AdminModal>

      {/* Modal Cập nhật Trạng thái & Ngày thực tế */}
      <AdminModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Cập nhật trạng thái lịch hẹn"
        onConfirm={handleUpdateStatus}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Trạng thái lịch"
              required
              value={statusData.status}
              onChange={(e) =>
                setStatusData({ ...statusData, status: e.target.value })
              }
              options={[
                { value: "cho_xac_nhan", label: "Chờ xác nhận" },
                { value: "da_xac_nhan", label: "Đã xác nhận" },
                { value: "dang_thuc_hien", label: "Đang thực hiện" },
                { value: "hoan_thanh", label: "Hoàn thành" },
                { value: "da_huy", label: "Đã hủy" },
              ]}
            />
            <FormSelect
              label="Thanh toán"
              required
              value={statusData.trang_thai_thanh_toan}
              onChange={(e) =>
                setStatusData({
                  ...statusData,
                  trang_thai_thanh_toan: e.target.value,
                })
              }
              options={[
                { value: "chua_thanh_toan", label: "Chưa thanh toán" },
                { value: "da_coc_15", label: "Đã cọc 15%" },
                { value: "da_thanh_toan_het", label: "Đã tất toán" },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Bắt đầu thực tế"
              type="date"
              value={statusData.ngay_bat_dau_thuc_te}
              min={today}
              onChange={(e) => {
                const newStartDate = e.target.value;
                setStatusData((prev) => ({
                  ...prev,
                  ngay_bat_dau_thuc_te: newStartDate,
                  ngay_ket_thuc_thuc_te:
                    newStartDate &&
                    (!prev.ngay_ket_thuc_thuc_te ||
                      prev.ngay_ket_thuc_thuc_te < newStartDate)
                      ? newStartDate
                      : prev.ngay_ket_thuc_thuc_te,
                }));
              }}
            />
            <FormInput
              label="Kết thúc thực tế"
              type="date"
              value={statusData.ngay_ket_thuc_thuc_te}
              min={statusData.ngay_bat_dau_thuc_te || today}
              onChange={(e) =>
                setStatusData({
                  ...statusData,
                  ngay_ket_thuc_thuc_te: e.target.value,
                })
              }
            />
          </div>
          <p className="text-xs text-gray-500 italic">
            * Cập nhật khoảng ngày thực tế khi ca làm việc đã được thực hiện.
          </p>
        </div>
      </AdminModal>

      {/* Modal Xem chi tiết lịch hẹn */}
      <AdminModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Chi tiết lịch hẹn #${selectedApt?.id}`}
        showConfirm={false}
        cancelText="Đóng"
        size="3xl"
      >
        {selectedApt && (
          <div className="space-y-6 bg-gray-50/50 p-2 md:p-4 rounded-2xl">
            {/* Top Banner: Status & Payment */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-xl shadow-inner">
                  📊
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5">
                    Trạng thái lịch hẹn
                  </p>
                  {getStatusBadge(selectedApt.status)}
                </div>
              </div>
              <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-xl shadow-inner">
                  💳
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5">
                    Trạng thái thanh toán
                  </p>
                  {getPaymentStatusBadge(
                    selectedApt.trang_thai_thanh_toan,
                    selectedApt.hinh_thuc_thanh_toan,
                    selectedApt.dat_coc,
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột trái */}
              <div className="space-y-6">
                {/* Khách hàng */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                  <h4 className="font-bold text-gray-900 mb-5 flex items-center gap-3 relative z-10">
                    <span className="p-2 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                      👤
                    </span>
                    Thông tin khách hàng
                  </h4>
                  <div className="space-y-3 relative z-10 text-sm">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition">
                      <span className="text-gray-500 font-medium">Họ tên:</span>
                      <span className="font-bold text-gray-900">
                        {selectedApt.customer_name || selectedApt.guest_name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition">
                      <span className="text-gray-500 font-medium">
                        Số điện thoại:
                      </span>
                      <span className="font-bold text-gray-900">
                        {selectedApt.phone || selectedApt.guest_phone}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition">
                      <span className="text-gray-500 font-medium">
                        Địa điểm:
                      </span>
                      <span className="font-bold text-gray-900 uppercase bg-gray-100 px-2 py-0.5 rounded">
                        {selectedApt.dia_diem === "tai_nha"
                          ? "Tại nhà"
                          : "Tại trung tâm"}
                      </span>
                    </div>
                    {selectedApt.dia_diem === "tai_nha" && (
                      <div className="flex flex-col p-2 bg-blue-50/50 rounded-lg border border-blue-50/50">
                        <span className="text-gray-500 font-medium text-xs mb-1">
                          Địa chỉ cụ thể:
                        </span>
                        <span className="font-semibold text-blue-900 leading-relaxed">
                          {selectedApt.dia_chi_cu_the || "Chưa cập nhật"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thời gian & Nhân sự */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                  <h4 className="font-bold text-gray-900 mb-5 flex items-center gap-3 relative z-10">
                    <span className="p-2 bg-orange-100 text-orange-600 rounded-xl shadow-sm">
                      ⏰
                    </span>
                    Lịch trình & Nhân sự
                  </h4>
                  <div className="space-y-3 relative z-10 text-sm">
                    <div className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100 gap-1">
                      <span className="text-gray-500 font-medium text-xs">
                        Ngày dự kiến:
                      </span>
                      <span className="font-bold text-gray-900">
                        {new Date(
                          selectedApt.ngay_bat_dau,
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          selectedApt.ngay_ket_thuc,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col p-3 bg-orange-50/50 rounded-xl border border-orange-50 gap-1">
                      <span className="text-orange-600/70 font-medium text-xs">
                        Ngày thực tế:
                      </span>
                      <span className="font-bold text-orange-700">
                        {selectedApt.ngay_bat_dau_thuc_te
                          ? `${new Date(selectedApt.ngay_bat_dau_thuc_te).toLocaleDateString()} - ${selectedApt.ngay_ket_thuc_thuc_te ? new Date(selectedApt.ngay_ket_thuc_thuc_te).toLocaleDateString() : "..."}`
                          : "Chưa bắt đầu"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 mt-2 border-t border-gray-50">
                      <span className="text-gray-500 font-medium">
                        Loại lịch:
                      </span>
                      <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">
                        {selectedApt.loai_lich === "co_dinh"
                          ? "Cố định"
                          : "Linh hoạt"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2">
                      <span className="text-gray-500 font-medium">
                        Chuyên viên:
                      </span>
                      <span className="font-bold text-indigo-600">
                        {selectedApt.nhan_vien_name || "Chưa phân công"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải */}
              <div className="space-y-6">
                {/* Dịch vụ */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                  <h4 className="font-bold text-gray-900 mb-5 flex items-center gap-3 relative z-10">
                    <span className="p-2 bg-pink-100 text-pink-600 rounded-xl shadow-sm">
                      🌸
                    </span>
                    Dịch vụ đăng ký
                  </h4>
                  <div className="space-y-3 relative z-10 text-sm">
                    <div className="flex flex-col p-3 bg-pink-50/50 rounded-xl border border-pink-100 gap-1">
                      <span className="text-pink-600/70 font-medium text-xs">
                        Tên gói:
                      </span>
                      <span className="font-black text-pink-700 text-base">
                        {selectedApt.service_name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 mt-2">
                      <span className="text-gray-500 font-medium">
                        Đơn giá:
                      </span>
                      <span className="font-black text-gray-900">
                        {selectedApt.gia?.toLocaleString()}đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2">
                      <span className="text-gray-500 font-medium">
                        Đã đặt cọc:
                      </span>
                      <span className="font-bold text-green-600">
                        {selectedApt.dat_coc?.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mẹ & Bé */}
                <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100 shadow-sm relative overflow-hidden group">
                  <h4 className="font-bold text-pink-800 mb-5 flex items-center gap-3 relative z-10">
                    <span className="p-2 bg-white text-pink-500 rounded-xl shadow-sm">
                      👶
                    </span>
                    Thông tin Mẹ & Bé
                  </h4>
                  <div className="space-y-3 relative z-10 text-sm">
                    <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                      <span className="text-gray-600 font-medium">
                        Ngày sinh bé:
                      </span>
                      <span className="font-bold text-gray-900">
                        {selectedApt.ngay_sinh_be
                          ? new Date(
                              selectedApt.ngay_sinh_be,
                            ).toLocaleDateString()
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                      <span className="text-gray-600 font-medium">
                        Hình thức sinh:
                      </span>
                      <span className="font-bold text-gray-900 bg-pink-100 px-2 py-0.5 rounded text-xs">
                        {selectedApt.hinh_thuc_sinh === "sinh_thuong"
                          ? "Sinh thường"
                          : "Sinh mổ"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                      <span className="text-gray-600 font-medium">
                        Số lượng bé:
                      </span>
                      <span className="font-bold text-gray-900">
                        {selectedApt.so_luong_be || 1} bé
                      </span>
                    </div>
                    <div className="flex justify-between items-start p-2 bg-white/60 rounded-lg">
                      <span className="text-gray-600 font-medium">
                        Cân nặng bé:
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        {selectedApt.can_nang_be ? (
                          selectedApt.can_nang_be.split(",").map((w, i) => (
                            <span key={i} className="font-bold text-gray-900">
                              {selectedApt.so_luong_be > 1
                                ? `Bé ${i + 1}: `
                                : ""}
                              {w} kg
                            </span>
                          ))
                        ) : (
                          <span className="font-bold text-gray-900">
                            Chưa cập nhật
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-pink-100/50">
                      <span className="text-gray-500 font-medium text-xs block mb-1">
                        Tình trạng của mẹ:
                      </span>
                      <div className="bg-white p-3 rounded-xl border border-pink-100 italic text-gray-700 leading-relaxed shadow-sm">
                        {selectedApt.tinh_trang_me || "Không có ghi chú"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ghi chú chung */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <h4 className="font-bold text-gray-900 mb-5 flex items-center gap-3">
                <span className="p-2 bg-gray-100 text-gray-600 rounded-xl shadow-sm">
                  📝
                </span>
                Ghi chú & Thông tin bổ sung
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">
                    Ghi chú về bé
                  </p>
                  <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl italic border border-gray-100 min-h-24 shadow-inner">
                    {selectedApt.ghi_chu_be || "Không có ghi chú về bé."}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">
                    Ghi chú nhân viên
                  </p>
                  <div className="text-sm text-gray-700 bg-yellow-50/50 p-4 rounded-xl italic border border-yellow-100 min-h-24 shadow-inner">
                    {selectedApt.ghi_chu_nhan_vien || "Chưa có ghi chú nội bộ."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Modal Phân công nhân viên */}
      <AdminModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Phân công nhân viên cho LH #${selectedApt?.id}`}
        onConfirm={handleAssignStaff}
      >
        <div className="space-y-4">
          <FormSelect
            label="Chọn chuyên viên thực hiện"
            required
            value={assignData.nhan_vien_id}
            onChange={(e) =>
              setAssignData({ ...assignData, nhan_vien_id: e.target.value })
            }
            options={[
              { value: "", label: "-- Chọn chuyên viên --" },
              ...employees.map((e) => ({
                value: e.id,
                label: `${e.name} (${e.phone}) - ${e.role_name || "NV"}`,
              })),
            ]}
          />
          <p className="text-sm text-gray-500 italic">
            * Sau khi phân công, nhân viên sẽ nhận được thông báo về ca làm việc
            mới.
          </p>
        </div>
      </AdminModal>
    </div>
  );
};

export default Appointments;
