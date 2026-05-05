import React, { useState, useEffect, useMemo } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { reviewAPI } from "../../services/apiClient";
import toast from "react-hot-toast";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 350);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      console.log("Admin: Đang gọi API lấy danh sách đánh giá...");
      const response = await reviewAPI.getAll();
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

  const filteredReviews = useMemo(() => {
    if (!debouncedSearch.trim()) return reviews;
    const q = debouncedSearch.toLowerCase().trim();
    return reviews.filter((r) => {
      const name = (
        r.customer_name ||
        r.user_name ||
        r.name ||
        ""
      ).toLowerCase();
      const svc = (r.service_name || "").toLowerCase();
      const cmt = (r.comment || "").toLowerCase();
      return (
        name.includes(q) ||
        svc.includes(q) ||
        cmt.includes(q) ||
        String(r.id).includes(q)
      );
    });
  }, [reviews, debouncedSearch]);

  if (isLoading) {
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

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Tìm khách, dịch vụ, bình luận, mã..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                  Đánh giá
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                  Bình luận
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                  Ngày gửi
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr
                    key={review.id}
                    className="hover:bg-gray-50/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center text-indigo-500 text-xs font-bold">
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
                      <div className="text-gray-600">
                        {review.service_name || "Dịch vụ đã xóa"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-gray-600 max-w-xs truncate"
                        title={review.comment}
                      >
                        {review.comment}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
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
                    className="px-6 py-12 text-center text-gray-500 italic"
                  >
                    {reviews.length === 0
                      ? "Chưa có đánh giá nào để hiển thị."
                      : "Không có đánh giá khớp bộ lọc."}
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
