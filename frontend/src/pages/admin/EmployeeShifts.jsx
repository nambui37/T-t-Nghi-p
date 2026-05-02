import React, { useState, useEffect } from "react";
import { shiftAPI } from "../../services/apiClient";
import toast from "react-hot-toast";

const EmployeeShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [currentCheckOut, setCurrentCheckOut] = useState(null);
  const [workNote, setWorkNote] = useState("");

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setIsLoading(true);
      const response = await shiftAPI.getAvailable();
      if (response.data.success) {
        setShifts(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi tải danh sách ca làm việc.",
      );
      setShifts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (lichHenId) => {
    try {
      const response = await shiftAPI.accept(lichHenId);
      if (response.data.success) {
        toast.success("Nhận ca thành công!");
        fetchShifts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi nhận ca.");
    }
  };

  const handleCheckIn = async (shift) => {
    try {
      let toaDo = "Trung tâm Mom&Baby"; // Mặc định nếu làm tại trung tâm

      if (shift.dia_diem === "tai_nha") {
        toast.loading("Đang lấy tọa độ GPS...");
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          });
          toaDo = `${position.coords.latitude}, ${position.coords.longitude}`;
        } catch (gpsError) {
          console.error("Lỗi GPS:", gpsError);
          toast.error("Không thể lấy tọa độ GPS. Vui lòng bật vị trí.");
          return;
        }
      }

      const response = await shiftAPI.checkIn({
        lichHenId: shift.id,
        toaDo,
      });

      if (response.data.success) {
        toast.dismiss();
        toast.success(
          shift.dia_diem === "tai_nha"
            ? "Đã xác nhận vị trí và bắt đầu ca làm!"
            : "Đã bắt đầu ca làm tại trung tâm.",
        );
        fetchShifts();
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Lỗi khi bắt đầu ca.");
    }
  };

  const handleCheckOut = async () => {
    if (!workNote.trim()) {
      return toast.error("Vui lòng nhập ghi chú công việc trước khi kết thúc.");
    }

    try {
      const response = await shiftAPI.checkOut({
        caLamId: currentCheckOut.caLamId,
        ghiChu: workNote,
      });

      if (response.data.success) {
        toast.success(
          currentCheckOut.diaDiem === "tai_nha"
            ? "Đã kết thúc ca làm. Cảm ơn bạn!"
            : "Ca làm tại trung tâm đã hoàn thành.",
        );
        setIsCheckOutModalOpen(false);
        setWorkNote("");
        setCurrentCheckOut(null);
        fetchShifts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi kết thúc ca.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Công việc cá nhân
          </h2>
          <p className="text-gray-500 text-sm">
            Mỗi ca làm việc sẽ có 2 nhân viên cùng thực hiện
          </p>
        </div>
        <button
          onClick={fetchShifts}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          title="Làm mới"
        >
          🔄 Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        ) : shifts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-400">
              Hiện không có ca làm việc nào dành cho bạn.
            </p>
          </div>
        ) : (
          shifts.map((shift) => (
            <div
              key={shift.id}
              className={`bg-white p-6 rounded-3xl shadow-sm border transition flex flex-col ${
                shift.ca_lam_status === "dang_lam"
                  ? "border-indigo-500 ring-2 ring-indigo-50"
                  : "border-gray-100 hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                    shift.ca_lam_status === "dang_lam"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-pink-50 text-pink-500"
                  }`}
                >
                  {shift.ca_lam_status === "dang_lam" ? "⚡" : "🗓️"}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      shift.ca_lam_status === "dang_lam"
                        ? "bg-indigo-100 text-indigo-700"
                        : shift.is_accepted_by_me
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {shift.ca_lam_status === "dang_lam"
                      ? "Đang thực hiện"
                      : shift.is_accepted_by_me
                        ? "Đã nhận ca"
                        : "Sẵn sàng"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    👥 {shift.current_staff_count}/2 nhân viên
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {shift.service_name}
              </h3>
              <p className="text-gray-500 text-xs mb-4">
                Khách hàng:{" "}
                <span className="font-bold text-gray-700">
                  {shift.customer_name || shift.guest_name}
                </span>
              </p>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                      shift.dia_diem === "tai_nha"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {shift.dia_diem === "tai_nha" ? "🏠" : "🏢"}
                  </span>
                  <span className="font-bold">
                    {shift.dia_diem === "tai_nha" ? "Tại nhà" : "Tại trung tâm"}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <span>📍</span>
                  <span className="truncate">
                    {shift.customer_address || "Tại trung tâm Mom&Baby"}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <span>📅</span>
                  <span>
                    {new Date(shift.ngay_bat_dau).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <span>📞</span>
                  <a
                    href={`tel:${shift.customer_phone || shift.guest_phone}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {shift.customer_phone || shift.guest_phone}
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex gap-2">
                {!shift.is_accepted_by_me ? (
                  <button
                    onClick={() => handleAccept(shift.id)}
                    disabled={shift.current_staff_count >= 2}
                    className={`flex-1 py-2.5 rounded-xl font-bold transition ${
                      shift.current_staff_count >= 2
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {shift.current_staff_count >= 2
                      ? "Đã đủ nhân viên"
                      : "Nhận ca này"}
                  </button>
                ) : shift.ca_lam_status !== "dang_lam" ? (
                  <button
                    onClick={() => handleCheckIn(shift)}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 transition"
                  >
                    {shift.dia_diem === "tai_nha"
                      ? "Bắt đầu (Check-in GPS)"
                      : "Bắt đầu làm việc"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCurrentCheckOut({
                        caLamId: shift.ca_lam_id,
                        diaDiem: shift.dia_diem,
                      });
                      setIsCheckOutModalOpen(true);
                    }}
                    className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold hover:bg-red-600 transition"
                  >
                    Kết thúc ca làm
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal ghi chú khi check-out */}
      {isCheckOutModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-scale-up shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                📝
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Ghi chú công việc
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Vui lòng báo cáo tình trạng của bé và mẹ sau ca làm
              </p>
            </div>

            <textarea
              rows="5"
              placeholder="Ví dụ: Bé ngoan, ăn tốt, vết thương của mẹ đang lành tốt..."
              value={workNote}
              onChange={(e) => setWorkNote(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none mb-6"
            ></textarea>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsCheckOutModalOpen(false);
                  setWorkNote("");
                }}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleCheckOut}
                className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-200"
              >
                Xác nhận kết thúc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeShifts;
