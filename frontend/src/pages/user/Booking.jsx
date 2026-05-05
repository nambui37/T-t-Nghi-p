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
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
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
    payment_method: "online",
    ghi_chu: "",
    ngay_sinh_be: "",
    hinh_thuc_sinh: "sinh_thuong",
    tinh_trang_me: "",
    so_luong_be: 1,
    can_nang_be: "",
    dia_chi_cu_the: "",
    province: "",
    district: "",
    ward: "",
    address_detail: "",
    address_note: "",
    toa_do: "",
    agreeTerms: false,
    online_method: "vnpay", // Mặc định là vnpay nếu chọn thanh toán online
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
    fetchProvinces();
  }, [location.state]);

  const fetchProvinces = async () => {
    try {
      const res = await fetch("https://provinces.open-api.vn/api/p/");
      const data = await res.json();
      setProvinces(data);
    } catch (err) {
      console.error("Lỗi tải tỉnh thành:", err);
    }
  };

  const fetchDistricts = async (provinceCode) => {
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
      );
      const data = await res.json();
      setDistricts(data.districts);
      setWards([]);
    } catch (err) {
      console.error("Lỗi tải quận huyện:", err);
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`,
      );
      const data = await res.json();
      setWards(data.wards);
    } catch (err) {
      console.error("Lỗi tải xã phường:", err);
    }
  };

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    const provinceName =
      provinces.find((p) => p.code == provinceCode)?.name || "";
    setFormData((prev) => ({
      ...prev,
      province: provinceName,
      district: "",
      ward: "",
    }));
    if (provinceCode) fetchDistricts(provinceCode);
    else setDistricts([]);
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    const districtName =
      districts.find((d) => d.code == districtCode)?.name || "";
    setFormData((prev) => ({ ...prev, district: districtName, ward: "" }));
    if (districtCode) fetchWards(districtCode);
    else setWards([]);
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wardName = wards.find((w) => w.code == wardCode)?.name || "";
    setFormData((prev) => ({ ...prev, ward: wardName }));
  };

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
    return Math.round(selectedService.gia * 0.15); // Cọc 15%
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
    if (!formData.goi_id) return setError("Vui lòng chọn gói dịch vụ.");
    if (!formData.ngay_bat_dau) return setError("Vui lòng chọn ngày bắt đầu.");
    if (!formData.ngay_ket_thuc)
      return setError("Vui lòng chọn ngày kết thúc.");

    if (formData.dia_diem === "tai_nha" && !formData.address_detail.trim()) {
      return setError("Vui lòng nhập số nhà và tên đường.");
    }

    // Gộp địa chỉ
    const fullAddress =
      formData.dia_diem === "tai_nha"
        ? [
            formData.address_detail,
            formData.ward,
            formData.district,
            formData.province,
            formData.address_note,
          ]
            .filter(Boolean)
            .join(", ")
        : "Tại trung tâm";

    if (!formData.agreeTerms) {
      return setError("Vui lòng đồng ý với Điều khoản dịch vụ.");
    }

    if (new Date(formData.ngay_bat_dau) > new Date(formData.ngay_ket_thuc)) {
      return setError("Ngày kết thúc không thể trước ngày bắt đầu.");
    }

    if (new Date(formData.ngay_bat_dau) < new Date().setHours(0, 0, 0, 0)) {
      return setError("Ngày bắt đầu không thể ở quá khứ.");
    }

    if (formData.can_nang_be) {
      const weights = formData.can_nang_be.split(",");
      for (const w of weights) {
        if (w && parseFloat(w) < 0) {
          return setError("Cân nặng của bé không thể là số âm.");
        }
      }
    }

    if (!user) {
      sessionStorage.setItem("bookingFormData", JSON.stringify(formData));
      navigate("/login?redirect=/dat-lich");
      return;
    }

    const finalData = {
      ...formData,
      dia_chi_cu_the: fullAddress,
      userId: user?.id,
    };

    if (formData.payment_method === "cash") {
      handleProcessPayment("tien_mat", finalData);
    } else {
      // Trước khi mở modal thanh toán, kiểm tra xem có lấy được userId không (nếu vừa login)
      if (!user) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        return;
      }
      setShowPaymentModal(true);
    }
  };

  const handleProcessPayment = async (paymentMethod, customData = null) => {
    setIsPaying(true);
    try {
      if (paymentMethod !== "tien_mat") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const bookingData = customData || {
        ...formData,
        dia_chi_cu_the:
          formData.dia_diem === "tai_nha"
            ? [
                formData.address_detail,
                formData.ward,
                formData.district,
                formData.province,
                formData.address_note,
              ]
                .filter(Boolean)
                .join(", ")
            : "Tại trung tâm",
        userId: user?.id,
      };

      const generatedLichTrinh = generateRoadmap(
        bookingData.ngay_bat_dau,
        bookingData.ngay_ket_thuc,
        selectedService?.name || "",
      );

      const res = await appointmentAPI.create({
        ...bookingData,
        lich_trinh: generatedLichTrinh,
        dat_coc: calculateDeposit(),
        trang_thai_thanh_toan: "chua_thanh_toan", // Ban đầu luôn là chưa thanh toán cho cả 2 phương thức
        hinh_thuc_thanh_toan: paymentMethod,
      });

      if (res.data.success) {
        sessionStorage.removeItem("bookingFormData");
        if (paymentMethod === "tien_mat") {
          toast.success("Đặt lịch thành công!");
          navigate("/ho-so");
        } else {
          toast.success("Đang khởi tạo cổng thanh toán...");
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
      console.error("Booking error:", err);
      const msg = err.response?.data?.message || "Lỗi khi xử lý đặt lịch.";
      setError(msg);
      toast.error(msg);
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
            // Cố gắng trích xuất địa chỉ chi tiết hơn nếu có thể
            const address = data.address;

            // Cập nhật các trường cấu trúc
            const pName = address.city || address.state || "";
            const dName =
              address.city_district || address.district || address.town || "";
            const wName =
              address.suburb || address.quarter || address.village || "";
            const street = [address.house_number, address.road]
              .filter(Boolean)
              .join(" ");

            setFormData((prev) => ({
              ...prev,
              province: pName,
              district: dName,
              ward: wName,
              address_detail: street || data.display_name,
            }));

            // Fetch lại danh sách district và ward dựa trên tên (nếu tìm thấy code)
            if (pName) {
              const p = provinces.find(
                (p) => p.name.includes(pName) || pName.includes(p.name),
              );
              if (p) {
                fetchDistricts(p.code);
                // Đợi một chút rồi tìm district và ward (tuy nhiên fetch async nên chỉ gán text trước)
              }
            }

            toast.success("Đã lấy vị trí và cập nhật địa chỉ!");
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
                    Ngày sinh của bé (nếu đã sinh)
                  </label>
                  <input
                    type="date"
                    name="ngay_sinh_be"
                    max={today}
                    value={formData.ngay_sinh_be}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình thức sinh
                  </label>
                  <select
                    name="hinh_thuc_sinh"
                    value={formData.hinh_thuc_sinh}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                  >
                    <option value="sinh_thuong">Sinh thường</option>
                    <option value="sinh_mo">Sinh mổ</option>
                    <option value="chua_sinh">Chưa sinh (Đang bầu)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng bé
                  </label>
                  <input
                    type="number"
                    name="so_luong_be"
                    min="1"
                    max="10"
                    value={formData.so_luong_be}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        so_luong_be: isNaN(val) ? "" : val,
                        can_nang_be: "",
                      }));
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                    placeholder="Nhập số lượng bé"
                  />
                </div>

                {/* Hiển thị các ô nhập cân nặng dựa trên số lượng bé */}
                {formData.ngay_sinh_be &&
                  formData.so_luong_be > 0 &&
                  [...Array(parseInt(formData.so_luong_be))].map((_, index) => (
                    <div key={index} className="animate-fade-in">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cân nặng bé {index + 1} lúc sinh (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder={`Vd: 3.${index + 2}`}
                        value={formData.can_nang_be.split(",")[index] || ""}
                        onChange={(e) => {
                          const weights = formData.can_nang_be.split(",");
                          // Đảm bảo mảng có đủ độ dài
                          while (weights.length < formData.so_luong_be)
                            weights.push("");
                          weights[index] = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            can_nang_be: weights.join(","),
                          }));
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                      />
                    </div>
                  ))}

                <div
                  className={
                    formData.so_luong_be % 2 === 0 ? "md:col-span-2" : ""
                  }
                >
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
            </div>

            {/* Địa chỉ cụ thể (Hiển thị khi chọn Tại nhà) */}
            {isAtHome && (
              <div className="animate-fade-in space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    📍 Địa chỉ của bạn
                  </h3>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border bg-white text-pink-600 border-pink-200 hover:bg-pink-50 shadow-sm"
                  >
                    {isLocating ? (
                      <>
                        <div className="w-3 h-3 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        Đang định vị...
                      </>
                    ) : (
                      <>🛰️ Lấy vị trí GPS</>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                      Tỉnh / Thành phố
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none bg-white text-sm"
                      onChange={handleProvinceChange}
                      value={
                        provinces.find((p) => p.name === formData.province)
                          ?.code || ""
                      }
                    >
                      <option value="">-- Chọn Tỉnh --</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                      Quận / Huyện
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none bg-white text-sm"
                      onChange={handleDistrictChange}
                      disabled={!formData.province}
                      value={
                        districts.find((d) => d.name === formData.district)
                          ?.code || ""
                      }
                    >
                      <option value="">-- Chọn Huyện --</option>
                      {districts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                      Xã / Phường
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none bg-white text-sm"
                      onChange={handleWardChange}
                      disabled={!formData.district}
                      value={
                        wards.find((w) => w.name === formData.ward)?.code || ""
                      }
                    >
                      <option value="">-- Chọn Xã --</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    🏠 Số nhà, tên đường
                  </label>
                  <input
                    type="text"
                    name="address_detail"
                    value={formData.address_detail}
                    onChange={handleChange}
                    placeholder="Ví dụ: 123 Nguyễn Văn Cừ, Tòa nhà ABC, Căn hộ 405..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none bg-white text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    📝 Ghi chú địa chỉ (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    name="address_note"
                    value={formData.address_note}
                    onChange={handleChange}
                    placeholder="Ví dụ: Nhà màu xanh, đối diện cây xăng, hẻm cạnh quán cafe..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none bg-white text-sm"
                  />
                </div>

                {/* Preview Map (Google Maps Iframe) */}
                {(formData.address_detail || formData.ward) && (
                  <div className="rounded-2xl overflow-hidden border border-gray-200 h-40 animate-fade-in shadow-inner relative group">
                    <iframe
                      title="Google Maps Preview"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        [
                          formData.address_detail,
                          formData.ward,
                          formData.district,
                          formData.province,
                        ]
                          .filter(Boolean)
                          .join(", "),
                      )}&output=embed`}
                      allowFullScreen
                    ></iframe>
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
                    checked={formData.payment_method === "online"}
                    onChange={handleChange}
                    className="w-5 h-5 text-pink-500 focus:ring-pink-500 border-gray-300"
                  />
                  <div className="ml-3 flex-1">
                    <span className="block font-bold text-gray-900">
                      Thanh toán Online
                    </span>
                    <span className="block text-xs text-gray-500">
                      Thanh toán cọc 15% qua VNPay
                    </span>
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
            {selectedService && formData.payment_method === "online" && (
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center justify-between animate-fade-in">
                <div>
                  <p className="text-indigo-900 font-bold text-lg">
                    Tiền cọc cần thanh toán (15%)
                  </p>
                  <p className="text-sm text-indigo-600">
                    * Bạn có thể chọn cổng thanh toán VNPay ở bước tiếp theo để
                    thanh toán cọc.
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
                    Tiền cọc cần thanh toán (15%)
                  </p>
                  <p className="text-sm text-green-600">
                    * Vui lòng thanh toán cọc bằng tiền mặt tại quầy.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-700">
                    {calculateDeposit().toLocaleString()}đ
                  </p>
                  <p className="text-xs text-gray-500 line-through">
                    Tổng: {selectedService.gia.toLocaleString()}đ
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
                  : formData.payment_method === "online"
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
                Vui lòng chọn phương thức thanh toán 15% để hoàn tất
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
                    Tiền cọc (15%)
                  </span>
                  <span className="text-2xl font-black text-indigo-600">
                    {calculateDeposit().toLocaleString()}đ
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
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
