import React, { useState, useEffect, useMemo } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { reviewAPI } from "../../services/apiClient";
import toast from "react-hot-toast";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 350);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [debouncedSearch, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (ratingFilter) params.rating = ratingFilter;

      const response = await reviewAPI.getAll(params);
      console.log("Admin: Phản hồi từ API:", response);
      if (response?.data?.success) {
        setReviews(response.data.data || []);
      } else if (Array.isArray(response?.data)) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error("Lỗi chi tiết khi tải đánh giá:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config?.url,
      });
      const errMsg =
        error.response?.data?.message || `Lỗi tải dữ liệu: ${error.message}`;
      toast.error(errMsg);
      setReviews([]); // Reset về mảng rỗng để tránh crash giao diện
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.",
      )
    ) {
      try {
        const response = await reviewAPI.delete(id);
        if (response.data.success) {
          toast.success("Đã xóa đánh giá");
          fetchReviews();
        }
      } catch (error) {
        toast.error("Xóa đánh giá thất bại");
      }
    }
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Quản lý Đánh giá & Bình luận
        </h2>
        <p className="text-gray-500 text-sm">
          Xem và quản lý phản hồi từ khách hàng về các dịch vụ
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 w-full max-w-lg">
          <span className="pl-3 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Tìm khách hàng, dịch vụ, nội dung bình luận..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-2 py-2 w-full outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-bold text-gray-500 whitespace-nowrap">Lọc theo sao:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
          >
            <option value="">Tất cả mức độ</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
            <option value="4">⭐⭐⭐⭐ (4 sao)</option>
            <option value="3">⭐⭐⭐ (3 sao)</option>
            <option value="2">⭐⭐ (2 sao)</option>
            <option value="1">⭐ (1 sao)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                  Khách hàng
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                  Dịch vụ
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">
                  Đánh giá
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                  Bình luận
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                  Ngày gửi
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <tr
                    key={review.id}
                    className="hover:bg-gray-50/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 overflow-hidden flex items-center justify-center text-indigo-500 text-sm font-bold border border-indigo-100 shadow-sm">
                          {review.customer_avatar ? (
                            <img
                              src={
                                review.customer_avatar.startsWith("http")
                                  ? review.customer_avatar
                                  : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001"}/${review.customer_avatar}`
                              }
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : null}
                          <span>
                            {
                              (review.customer_name ||
                                review.user_name ||
                                review.name ||
                                "K")[0]
                            }
                          </span>
                        </div>
                        <div className="font-bold text-gray-900">
                          {review.customer_name ||
                            review.user_name ||
                            review.name ||
                            "Khách hàng ẩn danh"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 font-medium">
                        {review.service_name || "Dịch vụ đã xóa"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center text-xs gap-0.5">
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
                      <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                        {review.rating} sao
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-gray-600 max-w-xs text-sm leading-relaxed"
                        title={review.comment}
                      >
                        {review.comment}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 shadow-sm border border-transparent hover:border-red-100"
                        title="Xóa đánh giá"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-20 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📄</span>
                      <p className="italic">
                        {searchTerm || ratingFilter
                          ? "Không tìm thấy đánh giá nào khớp với bộ lọc."
                          : "Hiện chưa có đánh giá nào từ khách hàng."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewManagement;
