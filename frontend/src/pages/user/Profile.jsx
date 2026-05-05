import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import {
  authAPI,
  appointmentAPI,
  userAPI,
  reviewAPI,
} from "../../services/apiClient";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

// Helper function to create the cropped image
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  image.crossOrigin = "anonymous"; // Tránh lỗi CORS nếu ảnh từ nguồn khác
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Không thể tạo context cho canvas");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas trống"));
        return;
      }
      resolve(blob);
    }, "image/jpeg");
  });
};

const Profile = () => {
  const navigate = useNavigate();
  const { logout, user: authUser, updateUser: updateAuthUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [staffReviews, setStaffReviews] = useState([]); // [{nhan_vien_id, name, rating, comment}]
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: authUser?.name || "",
    phone: authUser?.phone || "",
    email: authUser?.email || "",
  });
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarUrl, setAvatarUrl] = useState(authUser?.avatar || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (!authUser) {
      toast.error("Vui lòng đăng nhập để xem hồ sơ.");
      navigate("/login");
    }
  }, [authUser, navigate]);

  const hasFetchedProfile = useRef(false);

  useEffect(() => {
    if (!authUser || hasFetchedProfile.current) return;
    hasFetchedProfile.current = true;

    // Kiểm tra query string để hiển thị thông báo thanh toán thành công
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
      toast.success(
        "Thanh toán thành công! Lịch hẹn của bạn đã được ghi nhận.",
        {
          id: "payment-success-toast",
          duration: 5000,
        },
      );
      // Xóa query param để không hiện lại khi reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, appointmentsRes] = await Promise.all([
          authAPI.getProfile(),
          appointmentAPI.getAll(), // Cần filter theo userId ở backend hoặc frontend
        ]);

        if (profileRes.data.success) {
          const u = profileRes.data.data;
          setUser(u);
          setFormData({
            name: u.name,
            phone: u.phone || "",
            email: u.email,
          });

          // Cập nhật lại localStorage để tránh mất dữ liệu khi F5
          localStorage.setItem("user", JSON.stringify(u));
          if (typeof updateAuthUser === "function") {
            updateAuthUser(u);
          }
        }

        if (appointmentsRes.data.success) {
          setAppointments(appointmentsRes.data.rows || []);
        }
      } catch (error) {
        console.error("Lỗi fetch profile:", error);
        if (error.response && error.response.status === 401) {
          logout();
          navigate("/login");
        }
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [authUser, navigate, logout, updateAuthUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ và tên.";
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
    } else {
      const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone =
          "Số điện thoại không đúng định dạng (VD: 0912345678).";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      return setErrors(newErrors);
    }

    try {
      await authAPI.updateProfile(formData);
      toast.success("Cập nhật thông tin thành công!");
      setIsModalOpen(false);
      // Refresh data
      const profileRes = await authAPI.getProfile();
      if (profileRes.data.success) {
        const updatedData = profileRes.data.data;
        setUser(updatedData);
        if (typeof updateAuthUser === "function") {
          updateAuthUser(updatedData);
        }
        localStorage.setItem("user", JSON.stringify(updatedData));
      }
    } catch (error) {
      setError("Lỗi khi cập nhật thông tin.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!passwordFormData.oldPassword)
      newErrors.oldPassword = "Vui lòng nhập mật khẩu cũ.";
    if (passwordFormData.newPassword.length < 6)
      newErrors.newPassword = "Mật khẩu mới phải ít nhất 6 ký tự.";
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await authAPI.changePassword({
        oldPassword: passwordFormData.oldPassword,
        newPassword: passwordFormData.newPassword,
      });

      if (res.data.success) {
        toast.success("Đổi mật khẩu thành công!");
        setIsPasswordModalOpen(false);
        setPasswordFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi đổi mật khẩu.");
    }
  };

  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    if (!selectedFile && !previewUrl) {
      toast.error("Vui lòng chọn một file ảnh.");
      return;
    }

    try {
      let fileToUpload = selectedFile;

      // Nếu đang trong chế độ cắt ảnh, thực hiện cắt trước khi upload
      if (previewUrl && croppedAreaPixels) {
        const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
        fileToUpload = new File([croppedBlob], "avatar.jpg", {
          type: "image/jpeg",
        });
      }

      if (!fileToUpload) return;

      const formData = new FormData();
      formData.append("avatar", fileToUpload);

      const res = await authAPI.updateAvatar(formData);
      if (res.data.success) {
        toast.success("Cập nhật ảnh đại diện thành công!");
        setIsAvatarModalOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsCropping(false);
        // Refresh data
        const profileRes = await authAPI.getProfile();
        if (profileRes.data.success) {
          const updatedData = profileRes.data.data;
          setUser(updatedData);
          if (typeof updateAuthUser === "function") {
            updateAuthUser(updatedData);
          }
          localStorage.setItem("user", JSON.stringify(updatedData));
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật ảnh đại diện.",
      );
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File quá lớn (tối đa 50MB).");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file hình ảnh.");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setIsCropping(true); // Mở chế độ cắt ảnh ngay khi chọn file
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingReview) {
        // Bạn nhớ thêm hàm update vào reviewAPI trong apiClient.js nhé
        await reviewAPI.update(selectedApt.review_id, {
          rating: staffReviews[0]?.rating || 5,
          comment: staffReviews[0]?.comment || "",
        });
        toast.success("Đã cập nhật đánh giá thành công!");
      } else {
        await reviewAPI.create({
          goi_id: selectedApt.goi_id,
          rating: staffReviews[0]?.rating || 5,
          comment: staffReviews[0]?.comment || "",
        });
        toast.success("Cảm ơn bạn đã đánh giá dịch vụ!");
      }

      setIsReviewModalOpen(false);
      setStaffReviews([]);

      // Gọi lại API để load dữ liệu (lấy ID và Data mới nhất)
      const appointmentsRes = await appointmentAPI.getAll();
      if (appointmentsRes.data.success) {
        setAppointments(appointmentsRes.data.rows || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi đánh giá.");
    }
  };

  const openEditReviewModal = (apt) => {
    setSelectedApt(apt);
    setIsEditingReview(true);
    setStaffReviews([
      {
        rating: apt.review_rating || 5,
        comment: apt.review_comment || "",
      },
    ]);
    setIsReviewModalOpen(true);
  };

  const openReviewModal = (apt) => {
    setSelectedApt(apt);
    setIsEditingReview(false);
    // Chỉ cần 1 form đánh giá cho gói dịch vụ
    setStaffReviews([
      {
        rating: 5,
        comment: "",
      },
    ]);
    setIsReviewModalOpen(true);
  };

  const handleCancelAppointment = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn hủy lịch hẹn này? Lưu ý: Tiền cọc (15%) sẽ không được hoàn lại theo quy định của trung tâm.",
      )
    ) {
      try {
        const res = await appointmentAPI.cancel(id);
        if (res.data.success) {
          toast.success("Đã hủy lịch hẹn thành công.");
          // Refresh data
          const appointmentsRes = await appointmentAPI.getAll();
          if (appointmentsRes.data.success) {
            setAppointments(appointmentsRes.data.rows || []);
          }
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi hủy lịch hẹn.");
      }
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-pink-500 font-bold">
        Đang tải hồ sơ...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        Không tìm thấy thông tin người dùng.
      </div>
    );
  }

  // Hàm render badge trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "cho_xac_nhan":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            Chờ xác nhận
          </span>
        );
      case "da_xac_nhan":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Đã xác nhận
          </span>
        );
      case "dang_thuc_hien":
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            Đang thực hiện
          </span>
        );
      case "hoan_thanh":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Hoàn thành
          </span>
        );
      case "da_huy":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            Không rõ
          </span>
        );
    }
  };

  return (
    <div className="bg-gray-50 py-10 min-h-screen">
      {/* Modal Cập Nhật Thông Tin */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-xl animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Cập nhật thông tin
            </h2>
            <form
              onSubmit={handleUpdateProfile}
              className="space-y-4"
              noValidate
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 transition ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-pink-500"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: null });
                  }}
                  className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 transition ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-pink-500"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-gray-500"
                />
                <p className="text-[10px] text-gray-400 mt-1 italic">
                  * Không thể thay đổi email đăng nhập.
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center font-bold animate-pulse">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-gray-500 font-semibold hover:text-gray-700 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-pink-500 text-white rounded-xl font-bold shadow-lg hover:bg-pink-600 transition"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đổi Mật Khẩu */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-xl animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Đổi mật khẩu
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu cũ
                </label>
                <input
                  type="password"
                  required
                  value={passwordFormData.oldPassword}
                  onChange={(e) => {
                    setPasswordFormData({
                      ...passwordFormData,
                      oldPassword: e.target.value,
                    });
                    if (errors.oldPassword)
                      setErrors({ ...errors, oldPassword: null });
                  }}
                  className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 transition ${
                    errors.oldPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-pink-500"
                  }`}
                />
                {errors.oldPassword && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.oldPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={passwordFormData.newPassword}
                  onChange={(e) => {
                    setPasswordFormData({
                      ...passwordFormData,
                      newPassword: e.target.value,
                    });
                    if (errors.newPassword)
                      setErrors({ ...errors, newPassword: null });
                  }}
                  className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 transition ${
                    errors.newPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-pink-500"
                  }`}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.newPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={passwordFormData.confirmPassword}
                  onChange={(e) => {
                    setPasswordFormData({
                      ...passwordFormData,
                      confirmPassword: e.target.value,
                    });
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: null });
                  }}
                  className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 transition ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-pink-500"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-6 py-2.5 text-gray-500 font-semibold hover:text-gray-700 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-pink-500 text-white rounded-xl font-bold shadow-lg hover:bg-pink-600 transition"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cập Nhật Ảnh Đại Diện */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Cập nhật ảnh đại diện
              </h2>
              <button
                onClick={() => {
                  setIsAvatarModalOpen(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateAvatar} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                {isCropping && previewUrl ? (
                  <div className="relative w-full h-64 bg-gray-900 rounded-2xl overflow-hidden">
                    <Cropper
                      image={previewUrl}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative group cursor-pointer w-full border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center p-8 ${
                      isDragging
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-pink-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-50 shadow-inner bg-gray-100 flex items-center justify-center mb-4">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Current"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl text-gray-300">👤</span>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-700">
                        Kéo thả ảnh vào đây
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        hoặc click để chọn từ máy
                      </p>
                    </div>
                    <label className="absolute inset-0 cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                )}

                {isCropping && (
                  <div className="w-full px-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-gray-500">
                        Phóng to:
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(e.target.value)}
                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                  Hỗ trợ JPG, PNG, WebP • Tối đa 50MB
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarModalOpen(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setIsCropping(false);
                  }}
                  className="px-6 py-2.5 text-gray-500 font-semibold hover:text-gray-700 transition"
                >
                  Hủy
                </button>
                {isCropping && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCropping(false);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="px-6 py-2.5 text-pink-500 font-semibold hover:text-pink-600 transition"
                  >
                    Chọn lại
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!previewUrl}
                  className={`px-8 py-2.5 rounded-xl font-bold shadow-lg transition ${
                    previewUrl
                      ? "bg-pink-500 text-white hover:bg-pink-600 shadow-pink-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isCropping ? "Cắt & Cập nhật" : "Cập nhật ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đánh Giá */}
      {isReviewModalOpen && selectedApt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-scale-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {isEditingReview ? "Chỉnh sửa đánh giá" : "Đánh giá dịch vụ"}
            </h3>
            <p className="text-gray-500 mb-6 italic">
              Chia sẻ cảm nhận của bạn về gói: {selectedApt.service_name}
            </p>

            <form onSubmit={handleReviewSubmit}>
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex flex-col items-center gap-4">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Mức độ hài lòng
                    </label>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            const newReviews = [...staffReviews];
                            newReviews[0].rating = star;
                            setStaffReviews(newReviews);
                          }}
                          className={`text-3xl transition-all duration-200 transform hover:scale-125 ${
                            star <= (staffReviews[0]?.rating || 0)
                              ? "text-yellow-400 drop-shadow-sm"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-400">
                      {staffReviews[0]?.rating === 5
                        ? "Rất tuyệt vời!"
                        : staffReviews[0]?.rating === 4
                          ? "Hài lòng"
                          : staffReviews[0]?.rating === 3
                            ? "Bình thường"
                            : staffReviews[0]?.rating === 2
                              ? "Chưa tốt"
                              : "Rất tệ"}
                    </span>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                      Bình luận chi tiết
                    </label>
                    <textarea
                      required
                      placeholder="Hãy chia sẻ trải nghiệm của bạn về dịch vụ này..."
                      className="w-full border-gray-200 border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 transition min-h-30 text-gray-700"
                      value={staffReviews[0]?.comment || ""}
                      onChange={(e) => {
                        const newReviews = [...staffReviews];
                        newReviews[0].comment = e.target.value;
                        setStaffReviews(newReviews);
                      }}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition shadow-lg shadow-pink-200"
                >
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cột trái: Thông tin cá nhân */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 sticky top-28">
              <div className="text-center mb-6">
                <div className="relative inline-block group">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-pink-50 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-4xl font-bold mx-auto border-4 border-pink-50 shadow-lg">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <button
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Đổi ảnh đại diện"
                  >
                    📷
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-4">
                  {user.name}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {user.role_name || "Khách hàng"}
                </p>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                    Số điện thoại
                  </p>
                  <p className="text-gray-800 font-medium">
                    {user.phone || "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                    Email
                  </p>
                  <p className="text-gray-800 font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                    Ngày tham gia
                  </p>
                  <p className="text-gray-800 font-medium">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-8 bg-pink-50 text-pink-600 hover:bg-pink-100 py-2.5 rounded-xl font-semibold transition"
              >
                Cập nhật thông tin
              </button>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full mt-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-2.5 rounded-xl font-semibold transition"
              >
                Đổi mật khẩu
              </button>
              <button
                onClick={handleLogout}
                className="w-full mt-3 bg-white border border-gray-200 text-red-500 hover:bg-red-50 py-2.5 rounded-xl font-semibold transition"
              >
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Cột phải: Lịch sử lịch hẹn */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Lịch Sử Lịch Hẹn
                </h3>
                <Link
                  to="/dat-lich"
                  className="text-pink-500 font-semibold hover:text-pink-600"
                >
                  + Đặt lịch mới
                </Link>
              </div>

              {!appointments || appointments.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">
                    Bạn chưa có lịch hẹn nào.
                  </p>
                  <Link
                    to="/dat-lich"
                    className="bg-pink-500 text-white px-6 py-2 rounded-full font-semibold"
                  >
                    Đặt lịch ngay
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {appointments?.map((apt) => (
                    <div
                      key={apt.id}
                      className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition bg-gray-50/50"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <div>
                          <span className="text-sm font-bold text-pink-500 block mb-1">
                            #{apt.id}
                          </span>
                          <h4 className="text-lg font-bold text-gray-900">
                            {apt.service_name}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(apt.status)}
                          {apt.status === "hoan_thanh" &&
                            (apt.is_reviewed ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-bold text-gray-400">
                                  Đã đánh giá ✓
                                </span>
                                {apt.review_date &&
                                  new Date().getTime() -
                                    new Date(apt.review_date).getTime() <=
                                    24 * 60 * 60 * 1000 && (
                                    <button
                                      onClick={() => openEditReviewModal(apt)}
                                      className="text-xs font-bold text-blue-500 hover:text-blue-600 underline"
                                    >
                                      Sửa đánh giá
                                    </button>
                                  )}
                              </div>
                            ) : (
                              <button
                                onClick={() => openReviewModal(apt)}
                                className="text-xs font-bold text-pink-500 hover:text-pink-600 underline"
                              >
                                Đánh giá ngay
                              </button>
                            ))}
                          {["cho_xac_nhan", "da_xac_nhan"].includes(
                            apt.status,
                          ) && (
                            <button
                              onClick={() => handleCancelAppointment(apt.id)}
                              className="text-xs font-bold text-red-500 hover:text-red-600 underline"
                            >
                              Hủy lịch
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                        <div>
                          <p className="text-gray-500 mb-1">Thời gian</p>
                          <p className="font-semibold text-gray-800">
                            {apt.ngay_bat_dau
                              ? `${new Date(apt.ngay_bat_dau).toLocaleDateString()} - ${new Date(apt.ngay_ket_thuc).toLocaleDateString()}`
                              : "Chưa cập nhật"}
                          </p>
                          <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-500 uppercase">
                            {apt.loai_lich === "co_dinh"
                              ? "Lịch cố định"
                              : "Lịch linh hoạt"}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Địa điểm</p>
                          <p className="font-semibold text-gray-800 uppercase">
                            {apt.dia_diem === "tai_nha"
                              ? "Tại nhà"
                              : "Tại trung tâm"}
                          </p>
                          {apt.menu_chon && (
                            <span className="text-[10px] text-pink-500 font-medium italic block">
                              🍴 {apt.menu_chon}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Tổng tiền</p>
                          <p className="font-semibold text-pink-500 text-base">
                            {apt.gia?.toLocaleString()}đ
                          </p>
                          <span className="text-[10px] text-green-600">
                            Cọc: {apt.dat_coc?.toLocaleString()}đ
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Nhân viên</p>
                          <p className="font-semibold text-gray-800">
                            {apt.nhan_vien_name || "Đang sắp xếp..."}
                          </p>
                        </div>
                      </div>

                      {/* Thông tin mẹ và bé (Mới thêm) */}
                      {(apt.ngay_sinh_be || apt.tinh_trang_me) && (
                        <div className="mt-4 p-4 bg-pink-50/30 rounded-xl border border-pink-100/50 text-xs">
                          <p className="font-bold text-pink-600 mb-2 uppercase">
                            Thông tin Mẹ & Bé:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {apt.ngay_sinh_be && (
                              <p>
                                <span className="text-gray-500">
                                  Bé sinh ngày:
                                </span>{" "}
                                <span className="font-semibold">
                                  {new Date(
                                    apt.ngay_sinh_be,
                                  ).toLocaleDateString()}
                                </span>
                              </p>
                            )}
                            {apt.hinh_thuc_sinh && (
                              <p>
                                <span className="text-gray-500">
                                  Hình thức sinh:
                                </span>{" "}
                                <span className="font-semibold">
                                  {apt.hinh_thuc_sinh === "sinh_thuong"
                                    ? "Sinh thường"
                                    : "Sinh mổ"}
                                </span>
                              </p>
                            )}
                            {apt.can_nang_be && (
                              <p>
                                <span className="text-gray-500">Cân nặng:</span>{" "}
                                <span className="font-semibold">
                                  {apt.can_nang_be}kg
                                </span>
                              </p>
                            )}
                            {apt.tinh_trang_me && (
                              <p>
                                <span className="text-gray-500">
                                  Tình trạng mẹ:
                                </span>{" "}
                                <span className="font-semibold">
                                  {apt.tinh_trang_me}
                                </span>
                              </p>
                            )}
                          </div>
                          {apt.ghi_chu_be && (
                            <p className="mt-2">
                              <span className="text-gray-500">
                                Ghi chú về bé:
                              </span>{" "}
                              <span className="italic">"{apt.ghi_chu_be}"</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Ghi chú & Lịch trình */}
                      {(apt.ghi_chu_nhan_vien || apt.lich_trinh) && (
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                          {apt.ghi_chu_nhan_vien && (
                            <div className="mb-3">
                              <p className="text-xs font-bold text-gray-600 uppercase mb-1">
                                Ghi chú từ nhân viên:
                              </p>
                              <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded-lg italic">
                                "{apt.ghi_chu_nhan_vien}"
                              </p>
                            </div>
                          )}

                          {apt.lich_trinh && (
                            <div>
                              <p className="text-xs font-bold text-gray-600 uppercase mb-2">
                                Lịch trình chi tiết:
                              </p>
                              <div className="space-y-2">
                                {JSON.parse(
                                  typeof apt.lich_trinh === "string"
                                    ? apt.lich_trinh
                                    : JSON.stringify(apt.lich_trinh),
                                ).map((step, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <span className="bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded font-bold min-w-11.25 text-center">
                                      Ngày {step.day}
                                    </span>
                                    <span className="text-gray-600">
                                      {step.activity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
