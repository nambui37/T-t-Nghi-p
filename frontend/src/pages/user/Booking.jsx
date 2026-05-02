import React, { useState, useEffect } from "react";
import { serviceAPI, appointmentAPI } from "../../services/apiClient";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { generateRoadmap } from "../../utils/roadmapUtils";

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isAtHome, setIsAtHome] = useState(true);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_phone: "",
    goi_id: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    loai_lich: "linh_hoat",
    dia_diem: "tai_nha",
    loai_phong: "thuong",
    payment_method: "momo",
    ghi_chu: "",
    ngay_sinh_be: "",
    hinh_thuc_sinh: "sinh_thuong",
    tinh_trang_me: "",
    can_nang_be: "",
    ghi_chu_be: "",
    dia_chi_cu_the: "",
    toa_do: "",
    agreeTerms: false,
    online_method: "momo", // Mặc định là momo nếu chọn thanh toán online
  });

  const [selectedService, setSelectedService] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    // Lấy danh sách dịch vụ (chỉ lấy 1 lần)
    const fetchServices = async () => {
      try {
        const res = await serviceAPI.getAll();
        if (res.data.success) {
          setServices(res.data.data);

          // Ưu tiên lấy goi_id từ location.state (nếu bấm Đăng ký từ trang Gói/Dịch vụ)
          const passedGoiId = location.state?.goi_id;
          const savedFormData = sessionStorage.getItem("bookingFormData");
          let initialData = savedFormData ? JSON.parse(savedFormData) : {};

          if (passedGoiId) {
            initialData.goi_id = passedGoiId;
          }

          if (Object.keys(initialData).length > 0) {
            setFormData((prev) => ({ ...prev, ...initialData }));
            if (initialData.goi_id) {
              const service = res.data.data.find(
                (s) => s.id === parseInt(initialData.goi_id),
              );
              setSelectedService(service);
            }
          }
        }
      } catch (err) {
        console.error("Lỗi tải dịch vụ:", err);
      }
    };
    fetchServices();
  }, [location.state]);

  // Tự động tính "Ngày kết thúc" khi chọn "Ngày bắt đầu" hoặc đổi Gói dịch vụ
  useEffect(() => {
    if (formData.ngay_bat_dau && selectedService) {
      // Tìm số ngày/buổi trong tên hoặc mô tả gói (VD: "30 ngày", "15 buổi")
      const match =
        selectedService.name?.match(/(\d+)\s*(ngày|buổi)/i) ||
        selectedService.mo_ta?.match(/(\d+)\s*(ngày|buổi)/i);

      let daysToAdd = 0;
      if (match) {
        daysToAdd = parseInt(match[1]) - 1; // -1 vì tính luôn ngày bắt đầu
      } else if (
        selectedService.loai_id === 1 ||
        selectedService.gia >= 1000000
      ) {
        // Mặc định: Gói Chăm bé (loai_id=1) hoặc gói trên 1 triệu thường kéo dài 30 ngày (cộng 29 ngày)
        daysToAdd = 29;
      }

      if (daysToAdd >= 0) {
        const startDate = new Date(formData.ngay_bat_dau);
        startDate.setDate(startDate.getDate() + daysToAdd);

        // Format lại yyyy-mm-dd theo chuẩn Local Time
        const yyyy = startDate.getFullYear();
        const mm = String(startDate.getMonth() + 1).padStart(2, "0");
        const dd = String(startDate.getDate()).padStart(2, "0");
        const endDateStr = `${yyyy}-${mm}-${dd}`;

        setFormData((prev) => ({
          ...prev,
          ngay_ket_thuc: endDateStr,
        }));
      }
    }
  }, [formData.ngay_bat_dau, selectedService]);

  useEffect(() => {
    // Điền sẵn thông tin user nếu chưa có thông tin khôi phục từ trước
    const savedFormData = sessionStorage.getItem("bookingFormData");
    if (user && !savedFormData) {
      setFormData((prev) => ({
        ...prev,
        guest_name: user.name || "",
        guest_phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    const service = services.find((s) => s.id === parseInt(serviceId));
    setSelectedService(service);
    setFormData((prev) => ({ ...prev, goi_id: serviceId }));
  };

  const calculateDeposit = () => {
    if (!selectedService) return 0;
    return Math.round(selectedService.gia * 0.3);
  };

  // Lấy ngày hiện tại để làm min date
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.guest_name.trim())
      return setError("Họ và tên không được để trống.");
    if (!formData.guest_phone.trim())
      return setError("Số điện thoại không được để trống.");
    if (!formData.ngay_sinh_be)
      return setError("Vui lòng nhập ngày sinh của bé.");
    if (!formData.goi_id) return setError("Vui lòng chọn gói dịch vụ.");
    if (!formData.ngay_bat_dau) return setError("Vui lòng chọn ngày bắt đầu.");
    if (!formData.ngay_ket_thuc)
      return setError("Vui lòng chọn ngày kết thúc.");

    if (formData.dia_diem === "tai_nha" && !formData.dia_chi_cu_the.trim()) {
      return setError("Vui lòng nhập địa chỉ cụ thể để chúng tôi đến tận nhà.");
    }

    if (!formData.agreeTerms) {
      return setError("Vui lòng đồng ý với Điều khoản dịch vụ.");
    }

    if (new Date(formData.ngay_bat_dau) > new Date(formData.ngay_ket_thuc)) {
      return setError("Ngày kết thúc không thể trước ngày bắt đầu.");
    }

    if (new Date(formData.ngay_bat_dau) < new Date().setHours(0, 0, 0, 0)) {
      return setError("Ngày bắt đầu không thể ở quá khứ.");
    }

    if (formData.can_nang_be && parseFloat(formData.can_nang_be) < 0) {
      return setError("Cân nặng của bé không thể là số âm.");
    }

    if (!user) {
      sessionStorage.setItem("bookingFormData", JSON.stringify(formData));
      navigate("/login?redirect=/dat-lich");
      return;
    }

    if (formData.payment_method === "cash") {
      handleProcessPayment("tien_mat");
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleProcessPayment = async (paymentMethod) => {
    setIsPaying(true);
    try {
      if (paymentMethod !== "tien_mat") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const generatedLichTrinh = generateRoadmap(
        formData.ngay_bat_dau,
        formData.ngay_ket_thuc,
        selectedService?.name || "",
      );

      const res = await appointmentAPI.create({
        ...formData,
        userId: user?.id,
        lich_trinh: generatedLichTrinh,
        dat_coc: paymentMethod === "tien_mat" ? 0 : calculateDeposit(),
        trang_thai_thanh_toan:
          paymentMethod === "tien_mat" ? "chua_thanh_toan" : "da_coc_30",
        hinh_thuc_thanh_toan: paymentMethod,
      });

      if (res.data.success) {
        sessionStorage.removeItem("bookingFormData");
        if (paymentMethod === "tien_mat") {
          toast.success("Đặt lịch thành công!");
          navigate("/ho-so");
        } else {
          toast.success("Đặt lịch thành công! Đang chuyển hướng thanh toán...");
          navigate(`/payment/${res.data.data.id}`, {
            state: {
              amount: calculateDeposit(),
              serviceName: selectedService.name,
              type: "deposit",
              method: paymentMethod,
            },
          });
        }
      }
    } catch (err) {
      setError("Lỗi khi xử lý đặt lịch.");
    } finally {
      setIsPaying(false);
      setShowPaymentModal(false);
    }
  };

  const isVip = selectedService?.name?.toLowerCase().includes("vip");

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Trình duyệt của bạn không hỗ trợ định vị.");
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          toa_do: `${latitude},${longitude}`,
        }));

        try {
          // Sử dụng Nominatim API (miễn phí) để lấy địa chỉ từ tọa độ
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "vi", // Ưu tiên tiếng Việt
              },
            },
          );
          const data = await response.json();
          if (data && data.display_name) {
            setFormData((prev) => ({
              ...prev,
              dia_chi_cu_the: data.display_name,
            }));
            toast.success("Đã lấy vị trí và địa chỉ hiện tại!");
          } else {
            toast.success("Đã lấy được tọa độ GPS!");
          }
        } catch (err) {
          console.error("Lỗi lấy địa chỉ:", err);
          toast.success("Đã lấy được tọa độ GPS!");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        console.error("Lỗi định vị:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Vui lòng cho phép quyền truy cập vị trí.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Không thể xác định vị trí hiện tại.");
            break;
          case error.TIMEOUT:
            toast.error("Yêu cầu lấy vị trí hết thời gian.");
            break;
          default:
            toast.error("Đã xảy ra lỗi khi lấy vị trí.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="bg-pink-50/50 py-12 md:py-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-pink-100">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-3">
            Đặt Lịch Hẹn <span className="text-pink-500">Chăm Sóc</span>
          </h2>
          <p className="text-center text-gray-600 mb-10 text-lg">
            {!user && "Bạn đang đặt lịch với tư cách Khách. "}
            Vui lòng điền thông tin để chúng tôi hỗ trợ tốt nhất.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Thông tin cá nhân */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="guest_name"
                  value={formData.guest_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="guest_phone"
                  value={formData.guest_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
            </div>

            {/* Thông tin Mẹ và Bé */}
            <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100 space-y-6">
              <h3 className="text-lg font-bold text-pink-700 flex items-center gap-2">
                👶 Thông tin Mẹ và Bé
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh của bé <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="ngay_sinh_be"
                    max={today}
                    value={formData.ngay_sinh_be}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình thức sinh <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="hinh_thuc_sinh"
                    value={formData.hinh_thuc_sinh}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                  >
                    <option value="sinh_thuong">Sinh thường</option>
                    <option value="sinh_mo">Sinh mổ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cân nặng lúc sinh (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="can_nang_be"
                    value={formData.can_nang_be}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                    placeholder="Vd: 3.2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tình trạng của mẹ hiện tại
                  </label>
                  <input
                    type="text"
                    name="tinh_trang_me"
                    value={formData.tinh_trang_me}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                    placeholder="Vd: Đau lưng, ít sữa, stress..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú về bé (nếu có)
                </label>
                <textarea
                  name="ghi_chu_be"
                  value={formData.ghi_chu_be}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition resize-none bg-white"
                  placeholder="Vd: Bé hay quấy khóc ban đêm, da nhạy cảm..."
                ></textarea>
              </div>
            </div>

            {/* Dịch vụ & Loại lịch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Chọn Dịch Vụ 🌸
                </label>
                <select
                  name="goi_id"
                  value={formData.goi_id}
                  onChange={handleServiceChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                  required
                >
                  <option value="">-- Chọn dịch vụ mẹ quan tâm --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {new Intl.NumberFormat("vi-VN").format(s.gia)}đ
                    </option>
                  ))}
                </select>
                {isVip && (
                  <p className="mt-2 text-xs text-pink-600 font-bold">
                    ✨ Gói VIP: Bao gồm chuyên viên cao cấp & quà tặng!
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình thức lịch
                </label>
                <select
                  name="loai_lich"
                  value={formData.loai_lich}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                >
                  <option value="linh_hoat">Lịch linh hoạt (Theo buổi)</option>
                  <option value="co_dinh">Lịch cố định (Hàng ngày/tuần)</option>
                </select>
              </div>
            </div>

            {/* Khoảng thời gian */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày dự kiến bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="ngay_bat_dau"
                  min={today}
                  value={formData.ngay_bat_dau}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày dự kiến kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="ngay_ket_thuc"
                  min={formData.ngay_bat_dau || today}
                  value={formData.ngay_ket_thuc}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Hình thức & Địa điểm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm thực hiện
                </label>
                <div className="flex items-center space-x-8">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="dia_diem"
                      value="tai_nha"
                      checked={isAtHome}
                      onChange={() => {
                        setIsAtHome(true);
                        setFormData((prev) => ({
                          ...prev,
                          dia_diem: "tai_nha",
                        }));
                      }}
                      className="w-5 h-5 text-pink-500 focus:ring-pink-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700 group-hover:text-pink-500 transition">
                      Tại nhà
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="dia_diem"
                      value="trung_tam"
                      checked={!isAtHome}
                      onChange={() => {
                        setIsAtHome(false);
                        setFormData((prev) => ({
                          ...prev,
                          dia_diem: "trung_tam",
                        }));
                      }}
                      className="w-5 h-5 text-pink-500 focus:ring-pink-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700 group-hover:text-pink-500 transition">
                      Tại trung tâm
                    </span>
                  </label>
                </div>
              </div>

              {!isAtHome && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại phòng mong muốn
                  </label>
                  <select
                    name="loai_phong"
                    value={formData.loai_phong}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                  >
                    <option value="thuong">Phòng thường (Cơ bản)</option>
                    <option value="vip">Phòng VIP (Cao cấp + Tiện nghi)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Địa chỉ cụ thể (Hiển thị khi chọn Tại nhà) */}
            {isAtHome && (
              <div className="animate-fade-in space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ cụ thể <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="dia_chi_cu_the"
                    value={formData.dia_chi_cu_the}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    className="w-full pl-4 pr-32 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className={`absolute right-2 top-1.5 bottom-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1 border ${
                      isLocating
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100"
                    }`}
                  >
                    {isLocating ? (
                      <>
                        <div className="w-3 h-3 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        Đang lấy...
                      </>
                    ) : (
                      <>📍 Vị trí hiện tại</>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 italic">
                  * Bạn có thể nhập tay hoặc nhấn "Chọn trên bản đồ" để lấy vị
                  trí chính xác nhất.
                </p>

                {/* Preview Map (Google Maps Iframe) */}
                {formData.dia_chi_cu_the && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 h-48 animate-fade-in shadow-inner relative group">
                    <iframe
                      title="Google Maps Preview"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(formData.dia_chi_cu_the)}&output=embed`}
                      allowFullScreen
                    ></iframe>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition pointer-events-none"></div>
                  </div>
                )}
              </div>
            )}

            {/* Hình thức thanh toán */}
            <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100">
              <label className="block text-sm font-bold text-pink-700 mb-4 uppercase tracking-wider">
                Hình thức thanh toán
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition ${
                    formData.payment_method === "momo" ||
                    formData.payment_method === "online"
                      ? "border-pink-500 bg-white shadow-md"
                      : "border-gray-200 bg-gray-50 hover:border-pink-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="online"
                    checked={
                      formData.payment_method === "online" ||
                      formData.payment_method === "momo"
                    }
                    onChange={handleChange}
                    className="w-5 h-5 text-pink-500 focus:ring-pink-500 border-gray-300"
                  />
                  <div className="ml-3 flex-1">
                    <span className="block font-bold text-gray-900">
                      Thanh toán Online
                    </span>
                    <span className="block text-xs text-gray-500">
                      Thanh toán cọc 30% qua Momo/VNPay
                    </span>

                    {(formData.payment_method === "online" ||
                      formData.payment_method === "momo") && (
                      <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-in">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              online_method: "momo",
                              payment_method: "online",
                            }))
                          }
                          className={`flex items-center justify-center p-2 rounded-lg border ${formData.online_method === "momo" ? "border-pink-500 bg-pink-50" : "border-gray-200"}`}
                        >
                          <img
                            src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                            alt="Momo"
                            className="h-6"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              online_method: "vnpay",
                              payment_method: "online",
                            }))
                          }
                          className={`flex items-center justify-center p-2 rounded-lg border ${formData.online_method === "vnpay" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                        >
                          <img
                            src="https://vnpay.vn/wp-content/uploads/2020/07/Logo-VNPAY-QR.png"
                            alt="VNPay"
                            className="h-4"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition ${
                    formData.payment_method === "cash"
                      ? "border-pink-500 bg-white shadow-md"
                      : "border-gray-200 bg-gray-50 hover:border-pink-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash"
                    checked={formData.payment_method === "cash"}
                    onChange={handleChange}
                    className="w-5 h-5 text-pink-500 focus:ring-pink-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="block font-bold text-gray-900">
                      Tiền mặt
                    </span>
                    <span className="block text-xs text-gray-500">
                      Thanh toán tại quầy
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú của bạn
              </label>
              <textarea
                name="ghi_chu"
                value={formData.ghi_chu}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition resize-none"
                placeholder="Vd: Tình trạng sức khỏe, yêu cầu đặc biệt..."
              ></textarea>
            </div>

            {/* Điều khoản dịch vụ */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-pink-500 rounded focus:ring-pink-500 border-gray-300"
                  required
                />
                <label
                  htmlFor="agreeTerms"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  Tôi đã đọc và đồng ý với các{" "}
                  <button
                    type="button"
                    className="text-pink-500 font-semibold hover:underline"
                    onClick={() =>
                      alert(
                        "ĐIỀU KHOẢN DỊCH VỤ MOM&BABY:\n1. Phí đặt cọc sẽ không được hoàn trả nếu hủy lịch sau 24h.\n2. Khách hàng cam kết cung cấp đúng tình trạng sức khỏe của mẹ và bé.\n3. Trung tâm có quyền từ chối dịch vụ nếu môi trường làm việc không đảm bảo an toàn.",
                      )
                    }
                  >
                    Điều khoản & Chính sách của Mom&Baby
                  </button>
                  . Tôi cam kết thông tin cung cấp là hoàn toàn chính xác.
                </label>
              </div>
            </div>

            {/* Hiển thị tiền cọc (Chỉ khi chọn Online) */}
            {selectedService &&
              (formData.payment_method === "momo" ||
                formData.payment_method === "online") && (
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center justify-between animate-fade-in">
                  <div>
                    <p className="text-indigo-900 font-bold text-lg">
                      Tiền cọc cần thanh toán (30%)
                    </p>
                    <p className="text-sm text-indigo-600">
                      * Bạn có thể chọn cổng thanh toán Momo hoặc VNPay ở bước
                      tiếp theo để thanh toán cọc.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-indigo-700">
                      {calculateDeposit().toLocaleString()}đ
                    </p>
                    <p className="text-xs text-gray-500 line-through">
                      Tổng: {selectedService.gia.toLocaleString()}đ
                    </p>
                  </div>
                </div>
              )}

            {/* Hiển thị tổng tiền (Nếu chọn Tiền mặt) */}
            {selectedService && formData.payment_method === "cash" && (
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center justify-between animate-fade-in">
                <div>
                  <p className="text-green-900 font-bold text-lg">
                    Tổng số tiền thanh toán
                  </p>
                  <p className="text-sm text-green-600">
                    * Thanh toán trực tiếp khi thực hiện dịch vụ.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-700">
                    {selectedService.gia.toLocaleString()}đ
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center font-bold animate-pulse">
                {error}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-bold py-4 rounded-full shadow-lg transition transform text-lg ${
                  formData.agreeTerms && formData.goi_id
                    ? "bg-pink-500 hover:bg-pink-600 text-white hover:-translate-y-0.5"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isLoading
                  ? "Đang xử lý..."
                  : formData.payment_method === "momo" ||
                      formData.payment_method === "online"
                    ? "Thanh Toán Cọc & Đặt Lịch"
                    : "Xác Nhận Đặt Lịch"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Thanh toán đặt cọc */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-linear-to-r from-indigo-600 to-blue-500 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 backdrop-blur-md">
                💳
              </div>
              <h3 className="text-2xl font-bold">Thanh toán đặt cọc</h3>
              <p className="opacity-90 text-sm mt-1">
                Vui lòng chọn phương thức thanh toán 30% để hoàn tất
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dịch vụ:</span>
                  <span className="font-bold text-gray-900">
                    {selectedService?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tổng chi phí:</span>
                  <span className="font-bold text-gray-900">
                    {Number(selectedService?.gia).toLocaleString()}đ
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-gray-900 font-bold">
                    Tiền cọc (30%)
                  </span>
                  <span className="text-2xl font-black text-indigo-600">
                    {calculateDeposit().toLocaleString()}đ
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleProcessPayment("momo")}
                  disabled={isPaying}
                  className="w-full bg-[#A50064] text-white py-4 rounded-2xl font-bold hover:bg-[#8A0053] transition shadow-lg flex items-center justify-center gap-2"
                >
                  {isPaying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang kết nối...
                    </>
                  ) : (
                    "Thanh toán qua Momo"
                  )}
                </button>
                <button
                  onClick={() => handleProcessPayment("vnpay")}
                  disabled={isPaying}
                  className="w-full bg-[#005BAA] text-white py-4 rounded-2xl font-bold hover:bg-[#004A8B] transition shadow-lg flex items-center justify-center gap-2"
                >
                  {isPaying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang kết nối...
                    </>
                  ) : (
                    "Thanh toán qua VNPay"
                  )}
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isPaying}
                  className="w-full bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-100 transition"
                >
                  Quay lại
                </button>
              </div>

              <p className="text-[10px] text-gray-400 text-center px-4 italic">
                Bằng cách nhấn thanh toán, bạn đồng ý với chính sách hoàn trả
                tiền cọc của Mom&Baby trong trường hợp hủy lịch trước 24h.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
