import React, { useState, useEffect } from "react";
import { shiftAPI, careRecordAPI, incidentAPI } from "../../services/apiClient";
import toast from "react-hot-toast";

function formatWorkAddress(shift) {
  if (!shift) return "";
  if (shift.dia_diem === "tai_nha") {
    const a = shift.customer_address?.trim();
    return (
      a ||
      "Địa chỉ tại nhà — khách cung cấp khi đặt lịch (liên hệ SĐT phía dưới nếu thiếu)"
    );
  }
  return "Tại trung tâm Mom&Baby";
}

const EmployeeShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isCareRecordModalOpen, setIsCareRecordModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [detailShift, setDetailShift] = useState(null);

  // Care Record data
  const [careData, setCareData] = useState({
    noi_dung_cham_soc: "",
    tinh_trang_me: "",
    tinh_trang_be: "",
    ghi_chu: "",
  });

  // Incident data
  const [incidentData, setIncidentData] = useState({
    noi_dung: "",
    muc_do: "nhe",
  });

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
      try {
        const up = await shiftAPI.getUpcoming({ days: 60 });
        if (up.data.success) {
          setUpcomingSchedule(up.data.data || []);
        }
      } catch (e) {
        console.error("Error fetching upcoming schedule:", e);
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

  const pingNotifications = () => {
    window.dispatchEvent(new Event("admin-notifications-refresh"));
  };

  const handleAccept = async (lichHenId) => {
    try {
      const response = await shiftAPI.accept(lichHenId);
      if (response.data.success) {
        fetchShifts();
        pingNotifications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi nhận ca.");
    }
  };

  const handleCheckIn = async (shift) => {
    try {
      let toaDo = "Trung tâm Mom&Baby";
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
        fetchShifts();
        pingNotifications();
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Lỗi khi check-in.");
    }
  };

  const handleStartService = async (shift) => {
    try {
      const response = await shiftAPI.startService({
        caLamId: shift.ca_lam_id,
      });
      if (response.data.success) {
        setCurrentShift(shift);
        setIsCareRecordModalOpen(true);
        fetchShifts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi bắt đầu dịch vụ.");
    }
  };

  const handleSaveCareRecord = async () => {
    if (!careData.noi_dung_cham_soc.trim()) {
      return toast.error("Vui lòng nhập nội dung chăm sóc.");
    }

    try {
      const response = await careRecordAPI.create({
        lich_hen_id: currentShift.id,
        ca_lam_id: currentShift.ca_lam_id,
        ...careData,
      });

      if (response.data.success) {
        setIsCareRecordModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu nhật ký.");
    }
  };

  const handleReportIncident = async () => {
    if (!incidentData.noi_dung.trim()) {
      return toast.error("Vui lòng nhập nội dung sự cố.");
    }

    try {
      const response = await incidentAPI.report({
        lich_hen_id: currentShift.id,
        ca_lam_id: currentShift.ca_lam_id,
        ...incidentData,
      });

      if (response.data.success) {
        setIsIncidentModalOpen(false);
        setIncidentData({ noi_dung: "", muc_do: "nhe" });
        fetchShifts();
        pingNotifications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi báo cáo.");
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await shiftAPI.checkOut({
        caLamId: currentShift.ca_lam_id,
        ghiChu: careData.ghi_chu,
      });

      if (response.data.success) {
        setIsCheckOutModalOpen(false);
        setCareData({
          noi_dung_cham_soc: "",
          tinh_trang_me: "",
          tinh_trang_be: "",
          ghi_chu: "",
        });
        setCurrentShift(null);
        fetchShifts();
        pingNotifications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi kết thúc ca.");
    }
  };

  const getStatusLabel = (status) => {
    const config = {
      cho_nhan: { label: "Chờ nhận", class: "bg-yellow-100 text-yellow-700" },
      da_nhan: { label: "Đã nhận", class: "bg-blue-100 text-blue-700" },
      check_in: { label: "Đã Check-in", class: "bg-green-100 text-green-700" },
      dang_thuc_hien: {
        label: "Đang thực hiện",
        class: "bg-purple-100 text-purple-700",
      },
      hoan_thanh: { label: "Hoàn thành", class: "bg-gray-100 text-gray-700" },
      bao_loi: { label: "⚠️ Sự cố", class: "bg-red-100 text-red-700" },
    };
    return (
      config[status] || { label: status, class: "bg-gray-100 text-gray-700" }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Công việc cá nhân
          </h2>
          <p className="text-gray-500 text-sm">
            Quản lý quy trình chăm sóc khách hàng
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchShifts}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition border border-indigo-100"
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {upcomingSchedule.length > 0 && (
        <div className="bg-white rounded-3xl border border-indigo-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span>📆</span> Lịch ca của bạn (các ngày sắp tới)
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Mỗi ngày trong gói dài ngày là một ca riêng — check-in / check-out theo từng ngày.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <th className="px-4 py-3 font-semibold">Ngày làm</th>
                  <th className="px-4 py-3 font-semibold">Dịch vụ</th>
                  <th className="px-4 py-3 font-semibold">Địa điểm</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái ca</th>
                </tr>
              </thead>
              <tbody>
                {upcomingSchedule.slice(0, 40).map((row, idx) => {
                  const st = getStatusLabel(row.status);
                  return (
                    <tr key={`${row.ca_lam_id}-${idx}`} className="border-t border-gray-50">
                      <td className="px-4 py-2.5 whitespace-nowrap font-medium text-gray-800">
                        {new Date(row.ngay_lam).toLocaleDateString("vi-VN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">
                        {row.service_name}
                      </td>
                      <td className="px-4 py-2.5">
                        {row.dia_diem === "tai_nha" ? (
                          <span className="text-orange-600 font-medium">Tại nhà</span>
                        ) : (
                          <span className="text-indigo-600 font-medium">Trung tâm</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${st.class}`}
                        >
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {upcomingSchedule.length > 40 && (
            <p className="text-xs text-gray-400 mt-2">
              Đang hiển thị 40 dòng đầu trong tổng {upcomingSchedule.length} ca.
            </p>
          )}
        </div>
      )}

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
          shifts.map((shift) => {
            const status = getStatusLabel(shift.ca_lam_status);
            return (
              <div
                key={`${shift.id}-${shift.ca_lam_id ?? "open"}`}
                className={`bg-white p-6 rounded-3xl shadow-sm border transition flex flex-col ${shift.ca_lam_status === "dang_thuc_hien" ? "border-indigo-500 ring-2 ring-indigo-50" : "border-gray-100 hover:shadow-md"}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${shift.ca_lam_status === "dang_thuc_hien" ? "bg-indigo-100 text-indigo-600" : "bg-pink-50 text-pink-500"}`}
                  >
                    {shift.ca_lam_status === "dang_thuc_hien" ? "⚡" : "🗓️"}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.class}`}
                    >
                      {status.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      👥 {shift.current_staff_count}/2 nhân viên
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {shift.service_name}
                </h3>
                <p className="text-gray-500 text-xs mb-1">
                  Khách hàng:{" "}
                  <span className="font-bold text-gray-700">
                    {shift.customer_name || shift.guest_name}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setDetailShift(shift)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline mb-3"
                >
                  Xem chi tiết lịch
                </button>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${shift.dia_diem === "tai_nha" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}
                    >
                      {shift.dia_diem === "tai_nha" ? "🏠" : "🏢"}
                    </span>
                    <span className="font-bold">
                      {shift.dia_diem === "tai_nha"
                        ? "Tại nhà"
                        : "Tại trung tâm"}
                    </span>
                  </div>
                  <div className="flex items-start text-sm text-gray-600 gap-2">
                    <span className="shrink-0">📍</span>
                    <span className="leading-snug">
                      {formatWorkAddress(shift)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <span>📅</span>
                    <span className="font-medium text-indigo-600">
                      {new Date(shift.ngay_bat_dau).toLocaleDateString("vi-VN")}{" "}
                      -{" "}
                      {new Date(shift.ngay_ket_thuc).toLocaleDateString(
                        "vi-VN",
                      )}
                    </span>
                  </div>
                  {shift.ca_ngay_lam && (
                    <div className="text-xs text-amber-800 bg-amber-50 px-2 py-1.5 rounded-lg font-semibold">
                      Ca đang thao tác:{" "}
                      {new Date(shift.ca_ngay_lam).toLocaleDateString("vi-VN")}
                    </div>
                  )}
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

                <div className="pt-4 border-t border-gray-50 flex flex-wrap gap-2">
                  {!shift.is_accepted_by_me &&
                    shift.ca_lam_status === "cho_nhan" && (
                      <button
                        onClick={() => handleAccept(shift.id)}
                        className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition"
                      >
                        Nhận ca này
                      </button>
                    )}

                  {shift.is_accepted_by_me &&
                    shift.ca_lam_status === "da_nhan" && (
                      <button
                        onClick={() => handleCheckIn(shift)}
                        className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 transition"
                      >
                        Check-in
                      </button>
                    )}

                  {shift.is_accepted_by_me &&
                    shift.ca_lam_status === "check_in" && (
                      <button
                        onClick={() => handleStartService(shift)}
                        className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition"
                      >
                        Bắt đầu dịch vụ
                      </button>
                    )}

                  {shift.is_accepted_by_me &&
                    shift.ca_lam_status === "dang_thuc_hien" && (
                      <>
                        <button
                          onClick={() => {
                            setCurrentShift(shift);
                            setIsCareRecordModalOpen(true);
                          }}
                          className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl font-bold hover:bg-blue-600 transition"
                        >
                          Ghi nhật ký
                        </button>
                        <button
                          onClick={() => {
                            setCurrentShift(shift);
                            setIsCheckOutModalOpen(true);
                          }}
                          className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold hover:bg-red-600 transition"
                        >
                          Check-out
                        </button>
                      </>
                    )}

                  {shift.is_accepted_by_me &&
                    shift.ca_lam_status !== "hoan_thanh" &&
                    shift.ca_lam_status !== "cho_nhan" && (
                      <button
                        onClick={() => {
                          setCurrentShift(shift);
                          setIsIncidentModalOpen(true);
                        }}
                        className="w-full mt-2 text-red-500 text-xs font-bold hover:underline"
                      >
                        🚨 Báo cáo sự cố
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Care Record */}
      {isCareRecordModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 animate-scale-up shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Nhật ký chăm sóc
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nội dung chăm sóc
                </label>
                <textarea
                  rows="3"
                  value={careData.noi_dung_cham_soc}
                  onChange={(e) =>
                    setCareData({
                      ...careData,
                      noi_dung_cham_soc: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-xl"
                  placeholder="Mô tả các bước thực hiện..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Tình trạng mẹ
                  </label>
                  <textarea
                    rows="2"
                    value={careData.tinh_trang_me}
                    onChange={(e) =>
                      setCareData({
                        ...careData,
                        tinh_trang_me: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-xl"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Tình trạng bé
                  </label>
                  <textarea
                    rows="2"
                    value={careData.tinh_trang_be}
                    onChange={(e) =>
                      setCareData({
                        ...careData,
                        tinh_trang_be: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-xl"
                  ></textarea>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Ghi chú thêm
                </label>
                <textarea
                  rows="2"
                  value={careData.ghi_chu}
                  onChange={(e) =>
                    setCareData({ ...careData, ghi_chu: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl"
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsCareRecordModalOpen(false)}
                className="flex-1 bg-gray-100 py-3 rounded-2xl font-bold"
              >
                Đóng
              </button>
              <button
                onClick={handleSaveCareRecord}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold"
              >
                Lưu nhật ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Incident */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-scale-up shadow-2xl">
            <h3 className="text-2xl font-bold text-red-600 mb-6">
              Báo cáo sự cố
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Mức độ
                </label>
                <select
                  value={incidentData.muc_do}
                  onChange={(e) =>
                    setIncidentData({ ...incidentData, muc_do: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl"
                >
                  <option value="nhe">Nhẹ (Cần lưu ý)</option>
                  <option value="trung_binh">
                    Trung bình (Cần Admin hỗ trợ)
                  </option>
                  <option value="nghiem_trong">
                    Nghiêm trọng (Cần thay người ngay)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nội dung sự cố
                </label>
                <textarea
                  rows="4"
                  value={incidentData.noi_dung}
                  onChange={(e) =>
                    setIncidentData({
                      ...incidentData,
                      noi_dung: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-xl"
                  placeholder="Mô tả chi tiết sự cố..."
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsIncidentModalOpen(false)}
                className="flex-1 bg-gray-100 py-3 rounded-2xl font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleReportIncident}
                className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-bold"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Check-out */}
      {isCheckOutModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-scale-up shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Xác nhận Check-out
            </h3>
            <p className="text-gray-500 text-center mb-8">
              Bạn có chắc chắn muốn kết thúc ca làm việc này? Hãy đảm bảo đã lưu
              nhật ký chăm sóc đầy đủ.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsCheckOutModalOpen(false)}
                className="flex-1 bg-gray-100 py-3 rounded-2xl font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleCheckOut}
                className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold"
              >
                Kết thúc ca
              </button>
            </div>
          </div>
        </div>
      )}

      {detailShift && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Chi tiết lịch làm việc
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Lịch #{detailShift.id} ·{" "}
              {detailShift.dia_diem === "tai_nha" ? "Chăm sóc tại nhà" : "Tại trung tâm"}
            </p>
            <dl className="space-y-4 text-sm text-gray-800">
              <div>
                <dt className="text-gray-500 font-semibold text-xs uppercase">
                  Gói dịch vụ
                </dt>
                <dd className="font-bold text-base mt-0.5">
                  {detailShift.service_name}
                </dd>
                {detailShift.gia != null && (
                  <dd className="text-indigo-600 font-bold">
                    {Number(detailShift.gia).toLocaleString("vi-VN")}đ
                  </dd>
                )}
              </div>
              <div>
                <dt className="text-gray-500 font-semibold text-xs uppercase">
                  Khách hàng
                </dt>
                <dd className="mt-0.5">
                  {detailShift.customer_name || detailShift.guest_name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 font-semibold text-xs uppercase">
                  Điện thoại
                </dt>
                <dd className="mt-0.5">
                  {detailShift.customer_phone || detailShift.guest_phone || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 font-semibold text-xs uppercase">
                  Địa điểm thực hiện
                </dt>
                <dd className="mt-0.5 leading-relaxed">
                  {formatWorkAddress(detailShift)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 font-semibold text-xs uppercase">
                  Giai đoạn lịch
                </dt>
                <dd className="mt-0.5">
                  {new Date(detailShift.ngay_bat_dau).toLocaleDateString("vi-VN")} —{" "}
                  {new Date(detailShift.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                </dd>
              </div>
              {detailShift.ca_ngay_lam && (
                <div>
                  <dt className="text-gray-500 font-semibold text-xs uppercase">
                    Ca đang thao tác (ngày)
                  </dt>
                  <dd className="mt-0.5 font-medium text-amber-800">
                    {new Date(detailShift.ca_ngay_lam).toLocaleDateString("vi-VN")}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500 font-semibold text-xs uppercase">
                  Nhân sự
                </dt>
                <dd className="mt-0.5">
                  {detailShift.current_staff_count}/2 người đã gán
                </dd>
              </div>
              {detailShift.ghi_chu_nhan_vien && (
                <div>
                  <dt className="text-gray-500 font-semibold text-xs uppercase">
                    Ghi chú từ lịch
                  </dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-gray-700">
                    {detailShift.ghi_chu_nhan_vien}
                  </dd>
                </div>
              )}
            </dl>
            <button
              type="button"
              onClick={() => setDetailShift(null)}
              className="mt-8 w-full py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeShifts;
