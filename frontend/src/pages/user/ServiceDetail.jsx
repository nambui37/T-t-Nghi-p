import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  serviceAPI,
  reviewAPI,
  appointmentAPI,
} from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ServiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUsedService, setHasUsedService] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Danh sách ảnh mẫu cho slider (2-4 ảnh)
  const serviceImages = [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1555252333-9f8e92e65ee9?auto=format&fit=crop&q=80&w=800",
  ];

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : service?.rating || "0.0";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [serviceRes, reviewsRes] = await Promise.all([
          serviceAPI.getById(id),
          reviewAPI.getByService(id),
        ]);

        if (serviceRes.data.success) {
          setService(serviceRes.data.data);
        }
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data);
        }

        // Kiểm tra xem người dùng đã sử dụng dịch vụ này chưa
        if (user) {
          const appointmentsRes = await appointmentAPI.getAll();
          if (appointmentsRes.data.success) {
            const used = appointmentsRes.data.rows.some(
              (app) =>
                app.goi_id === parseInt(id) && app.status === "hoan_thanh",
            );
            setHasUsedService(used);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        toast.error("Không thể tải thông tin dịch vụ");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % serviceImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) {
      toast.error("Vui lòng nhập bình luận");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await reviewAPI.create({
        khach_hang_id: user.khach_hang_id, // Bổ sung mã khách hàng từ thông tin user đăng nhập
        user_id: user.id, // Dự phòng gửi thêm user_id
        goi_id: parseInt(id),
        rating: newReview.rating,
        comment: newReview.comment,
      });

      if (response.data.success) {
        toast.success("Cảm ơn bạn đã đánh giá!");
        setSubmitted(true);
        setNewReview({ rating: 5, comment: "" });
        // Tải lại danh sách đánh giá
        const reviewsRes = await reviewAPI.getByService(id);
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data);
        }
      }
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      toast.error("Gửi đánh giá thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">
          Không tìm thấy dịch vụ
        </h2>
        <Link
          to="/dich-vu"
          className="text-pink-500 mt-4 inline-block hover:underline"
        >
          Quay lại danh sách dịch vụ
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image Slider */}
            <div className="relative group rounded-3xl overflow-hidden shadow-2xl h-100 bg-gray-100">
              {serviceImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${service.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>
                </div>
              ))}

              {/* Slider Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {serviceImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-pink-500 w-8"
                        : "bg-white/50 hover:bg-white"
                    }`}
                  />
                ))}
              </div>

              {/* VIP Badge */}
              {service.name?.toLowerCase().includes("vip") && (
                <div className="absolute top-6 left-6 bg-linear-to-r from-amber-400 to-yellow-600 text-white px-6 py-2 rounded-full font-black text-sm shadow-lg z-10 animate-bounce">
                  👑 GÓI VIP CAO CẤP
                </div>
              )}

              {/* Service Icon overlay */}
              <div className="absolute top-6 right-6 w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl z-10 border border-white/30">
                {service.icon || "✨"}
              </div>
            </div>

            <div>
              <nav className="flex mb-4 text-sm text-gray-500">
                <Link to="/dich-vu" className="hover:text-pink-500">
                  Dịch vụ
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">
                  {service.name}
                </span>
              </nav>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                {service.name}
              </h1>
              <div className="flex items-center gap-6 mb-6">
                <span className="text-3xl font-bold text-pink-500">
                  {Number(service.gia).toLocaleString("vi-VN")}đ
                </span>
                <div className="flex items-center text-yellow-500 text-lg">
                  ★{" "}
                  <span className="ml-1 text-gray-900 font-bold">
                    {averageRating}
                  </span>
                  <span className="ml-2 text-gray-500 text-sm font-normal">
                    ({reviews.length} đánh giá)
                  </span>
                </div>
              </div>

              {/* VIP Room Info */}
              {service.name?.toLowerCase().includes("vip") && (
                <div className="mb-8 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <h4 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                    <span>✨</span> Đặc quyền Phòng VIP
                  </h4>
                  <ul className="text-amber-700 text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      Phòng riêng tư, yên tĩnh với trang thiết bị hiện đại bậc
                      nhất.
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      Chuyên viên cao cấp trực tiếp chăm sóc 1:1.
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      Sử dụng thảo dược organic nhập khẩu cao cấp.
                    </li>
                  </ul>
                </div>
              )}

              <p className="text-gray-600 text-lg leading-relaxed mb-8 whitespace-pre-line">
                {service.mo_ta}
              </p>
              <div className="flex gap-4">
                <Link
                  to="/dat-lich"
                  state={{ goi_id: service.id }}
                  className="bg-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-pink-600 transition shadow-lg shadow-pink-200"
                >
                  Đặt lịch ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Reviews */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Info Details */}
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Chi tiết dịch vụ
              </h2>
              <div className="prose prose-pink max-w-none text-gray-600 whitespace-pre-line">
                {service.mo_ta}
                {/* Ở đây có thể thêm các thông tin chi tiết khác nếu DB có */}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Đánh giá từ khách hàng
                </h2>
                <div className="text-pink-500 font-bold">
                  {reviews.length} nhận xét
                </div>
              </div>

              {/* Review Form */}
              {user && hasUsedService && !submitted && (
                <div className="mb-12 p-6 bg-pink-50 rounded-2xl border border-pink-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Viết đánh giá của bạn
                  </h3>
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xếp hạng
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setNewReview({ ...newReview, rating: star })
                            }
                            className={`text-3xl transition-transform hover:scale-110 ${newReview.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bình luận
                      </label>
                      <textarea
                        rows="4"
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            comment: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition bg-white"
                        placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..."
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-600 transition disabled:opacity-50 shadow-md shadow-pink-100"
                    >
                      {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </form>
                </div>
              )}

              {submitted && (
                <div className="mb-12 p-8 bg-green-50 rounded-3xl border border-green-100 text-center animate-fade-in">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    Cảm ơn bạn đã đánh giá!
                  </h3>
                  <p className="text-green-600">
                    Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-sm text-green-700 font-bold hover:underline"
                  >
                    Viết thêm đánh giá khác
                  </button>
                </div>
              )}

              {user && !hasUsedService && (
                <div className="mb-12 p-6 bg-gray-50 rounded-2xl text-center text-gray-500 italic">
                  Bạn cần hoàn thành sử dụng dịch vụ này để có thể đánh giá.
                </div>
              )}

              {!user && (
                <div className="mb-12 p-6 bg-gray-50 rounded-2xl text-center">
                  <p className="text-gray-500 mb-2">
                    Vui lòng đăng nhập để đánh giá dịch vụ.
                  </p>
                  <Link
                    to="/login"
                    className="text-pink-500 font-bold hover:underline"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-8">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex gap-4 ml-12 pb-8 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm relative">
                          {/* Avatar tròn nổi bên góc trái */}
                          <div className="absolute -left-12 top-0">
                            <div className="w-10 h-10 rounded-full bg-pink-100 overflow-hidden flex items-center justify-center text-pink-500 font-bold border-2 border-white shadow-md">
                              {review.customer_avatar ? (
                                <img
                                  src={
                                    review.customer_avatar.startsWith("http")
                                      ? review.customer_avatar
                                      : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001"}/${review.customer_avatar}`
                                  }
                                  alt={review.customer_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "";
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : null}
                              <span className="avatar-fallback">
                                {review.customer_name?.charAt(0) || "K"}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-gray-900 ml-2">
                                {review.customer_name}
                              </h4>
                              <div className="text-xs text-gray-500 ml-2">
                                {new Date(review.created_at).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </div>
                            </div>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={
                                    i < review.rating
                                      ? "text-yellow-400"
                                      : "text-gray-200"
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 leading-relaxed ml-2">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="text-5xl mb-4 text-gray-300">💬</div>
                    <p className="text-gray-500 font-medium">
                      Chưa có đánh giá nào cho dịch vụ này.
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Hãy là người đầu tiên chia sẻ cảm nhận của bạn!
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Thông tin gói
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between py-3 border-b border-gray-50">
                  <span className="text-gray-500">Thời gian</span>
                  <span className="font-bold text-gray-900">
                    {service.thoi_gian || service.duration || "Đang cập nhật"}
                  </span>
                </li>
                <li className="flex justify-between py-3 border-b border-gray-50">
                  <span className="text-gray-500">Loại dịch vụ</span>
                  <span className="font-bold text-gray-900">
                    {service.loai_name ||
                      (service.loai_id === 1
                        ? "Chăm sóc Bé"
                        : service.loai_id === 2
                          ? "Chăm sóc Mẹ"
                          : "Dưỡng sinh")}
                  </span>
                </li>
                <li className="flex justify-between py-3">
                  <span className="text-gray-500">Đánh giá</span>
                  <span className="font-bold text-gray-900">
                    {averageRating} ★
                  </span>
                </li>
              </ul>
              <div className="mt-8">
                <div className="text-gray-500 mb-2">Giá trọn gói:</div>
                <div className="text-3xl font-extrabold text-pink-500 mb-6">
                  {Number(service.gia).toLocaleString("vi-VN")}đ
                </div>
                <Link
                  to="/dat-lich"
                  state={{ goi_id: service.id }}
                  className="block text-center w-full bg-pink-500 text-white py-4 rounded-2xl font-bold hover:bg-pink-600 transition shadow-lg shadow-pink-100"
                >
                  Đặt lịch ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
