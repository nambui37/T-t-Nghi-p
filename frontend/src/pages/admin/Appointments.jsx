import React, { useState, useEffect } from "react";

const Appointments = () => {
  // State lưu danh sách lịch hẹn
  const [appointments, setAppointments] = useState([
    {
      id: "#LH1024",
      customerName: "Nguyễn Thị A",
      phone: "0901234567",
      service: "Tắm bé sơ sinh",
      time: "26/10/2023 - 09:00",
      total: "350.000đ",
      status: "Chờ xác nhận",
    },
    {
      id: "#LH1025",
      customerName: "Trần Văn B",
      phone: "0912345678",
      service: "Chăm sóc mẹ bầu",
      time: "27/10/2023 - 14:00",
      total: "400.000đ",
      status: "Đã xác nhận",
    },
    {
      id: "#LH1026",
      customerName: "Lê Thị C",
      phone: "0987654321",
      service: "Phục hồi sau sinh",
      time: "28/10/2023 - 10:00",
      total: "450.000đ",
      status: "Hoàn thành",
    },
  ]);

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [newAppointment, setNewAppointment] = useState({
    customerName: "",
    phone: "",
    service: "Tắm bé sơ sinh",
    time: "",
    total: "",
    status: "Chờ xác nhận",
  });

  // VIP: State cho Toast Notification
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // VIP: State cho Confirm Dialog (Hộp thoại xác nhận Hủy/Xóa)
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    appointmentId: null,
  });

  // State cho Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số lượng lịch hẹn trên mỗi trang

  // Hàm xử lý thêm lịch hẹn mới
  const handleAddAppointment = (e) => {
    e.preventDefault();
    // Tạo ID giả lập
    const newId = `#LH${1024 + appointments.length}`;
    // Thêm lịch hẹn mới lên đầu mảng
    setAppointments([{ ...newAppointment, id: newId }, ...appointments]);
    // Đóng Modal & Reset form
    setIsModalOpen(false);
    setNewAppointment({
      customerName: "",
      phone: "",
      service: "Tắm bé sơ sinh",
      time: "",
      total: "",
      status: "Chờ xác nhận",
    });

    // Hiển thị Toast thông báo thành công
    showToast("Tạo lịch hẹn thành công!", "success");
  };

  // VIP: Hàm hiển thị Toast và tự động ẩn sau 3 giây
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // VIP: Hàm xử lý Hủy lịch hẹn
  const handleCancelAppointment = () => {
    const updatedAppointments = appointments.filter(
      (apt) => apt.id !== confirmDialog.appointmentId,
    );
    setAppointments(updatedAppointments);
    setConfirmDialog({ show: false, appointmentId: null });
    showToast(`Đã hủy lịch hẹn ${confirmDialog.appointmentId}`, "error");
  };

  // Reset về trang 1 nếu người dùng thay đổi bộ lọc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate, filterStatus]);

  // Lọc danh sách lịch hẹn dựa trên các state filter
  const filteredAppointments = appointments.filter((apt) => {
    const matchSearch =
      apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone.includes(searchTerm);

    let matchDate = true;
    if (filterDate) {
      const [year, month, day] = filterDate.split("-");
      matchDate = apt.time.includes(`${day}/${month}/${year}`);
    }

    let matchStatus = true;
    if (filterStatus === "cho_xac_nhan")
      matchStatus = apt.status === "Chờ xác nhận";
    else if (filterStatus === "da_xac_nhan")
      matchStatus = apt.status === "Đã xác nhận";
    else if (filterStatus === "hoan_thanh")
      matchStatus = apt.status === "Hoàn thành";

    return matchSearch && matchDate && matchStatus;
  });

  // Tính toán dữ liệu cho Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  return (
    <>
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Lịch hẹn</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-xl font-semibold transition shadow-sm"
          >
            + Tạo lịch hẹn mới
          </button>
        </div>

        {/* Thanh công cụ / Filter */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex space-x-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Tìm mã LH, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="cho_xac_nhan">Chờ xác nhận</option>
              <option value="da_xac_nhan">Đã xác nhận</option>
              <option value="hoan_thanh">Hoàn thành</option>
            </select>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold">Mã LH</th>
                  <th className="px-6 py-4 font-semibold">Khách hàng</th>
                  <th className="px-6 py-4 font-semibold">Dịch vụ</th>
                  <th className="px-6 py-4 font-semibold">Thời gian</th>
                  <th className="px-6 py-4 font-semibold">Tổng tiền</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-16 text-center text-gray-500"
                    >
                      {/* VIP: Empty State đẹp mắt */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                          <span className="text-2xl">🔍</span>
                        </div>
                        <p className="text-gray-500 font-medium">
                          Không tìm thấy lịch hẹn nào
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Vui lòng thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((apt, idx) => (
                    <tr key={idx} className="hover:bg-pink-50/30 transition">
                      <td className="px-6 py-4 font-bold text-pink-500">
                        {apt.id}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">
                          {apt.customerName}
                        </p>
                        <p className="text-gray-500 text-xs">{apt.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{apt.service}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {apt.time.replace("T", " ")}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {apt.total}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            apt.status === "Chờ xác nhận"
                              ? "bg-yellow-100 text-yellow-700"
                              : apt.status === "Đã xác nhận"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button className="text-blue-500 hover:text-blue-700 font-medium">
                          Sửa
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              show: true,
                              appointmentId: apt.id,
                            })
                          }
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Hủy
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Hiển thị{" "}
              {filteredAppointments.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredAppointments.length)} của{" "}
              {appointments.length})
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded transition ${currentPage === 1 ? "border-gray-100 text-gray-400 bg-gray-50 cursor-not-allowed" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1 border rounded transition ${currentPage === totalPages || totalPages === 0 ? "border-gray-100 text-gray-400 bg-gray-50 cursor-not-allowed" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tạo Lịch Hẹn */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                Tạo Lịch Hẹn Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body / Form */}
            <form onSubmit={handleAddAppointment}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên khách hàng
                    </label>
                    <input
                      type="text"
                      required
                      value={newAppointment.customerName}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          customerName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                      placeholder="VD: Nguyễn Thị A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAppointment.phone}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                      placeholder="Nhập số ĐT"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dịch vụ
                  </label>
                  <select
                    value={newAppointment.service}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        service: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                  >
                    <option value="Tắm bé sơ sinh">Tắm bé sơ sinh</option>
                    <option value="Chăm sóc mẹ bầu">Chăm sóc mẹ bầu</option>
                    <option value="Phục hồi sau sinh">Phục hồi sau sinh</option>
                    <option value="Gói Vip Toàn Diện">Gói Vip Toàn Diện</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newAppointment.time}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          time: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tổng tiền (VNĐ)
                    </label>
                    <input
                      type="text"
                      required
                      value={newAppointment.total}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          total: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                      placeholder="VD: 350.000đ"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium shadow-sm transition"
                >
                  Lưu Lịch Hẹn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIP: Confirm Dialog Hủy Lịch Hẹn */}
      {confirmDialog.show && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center transform transition-all scale-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Xác nhận hủy
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Bạn có chắc chắn muốn hủy lịch hẹn{" "}
              <strong className="text-gray-800">
                {confirmDialog.appointmentId}
              </strong>
              ? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setConfirmDialog({ show: false, appointmentId: null })
                }
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
              >
                Đóng
              </button>
              <button
                onClick={handleCancelAppointment}
                className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition"
              >
                Hủy Lịch Hẹn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIP: Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-70 transition-all duration-300 transform ${toast.show ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0 pointer-events-none"}`}
      >
        <div
          className={`bg-white border-l-4 rounded-xl shadow-2xl p-4 pr-8 flex items-start max-w-sm ${toast.type === "success" ? "border-green-500" : "border-red-500"}`}
        >
          <div
            className={`text-xl mr-3 ${toast.type === "success" ? "text-green-500" : "text-red-500"}`}
          >
            {toast.type === "success" ? "✅" : "🗑️"}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              {toast.type === "success" ? "Thành công" : "Đã xóa"}
            </h4>
            <p className="text-sm text-gray-500 mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() =>
              setToast({ show: false, message: "", type: "success" })
            }
            className="absolute top-4 right-3 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};
export default Appointments;
