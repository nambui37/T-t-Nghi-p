import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { serviceAPI } from "../../services/apiClient";

const Services = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchKeyword = searchParams.get("search") || "";

  const [activeCategory, setActiveCategory] = useState("all");
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tự động gọi API khi component vừa được render lần đầu
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await serviceAPI.getAll();

        let data = [];
        if (response?.data?.success) {
          data = response.data.data;
        } else if (Array.isArray(response?.data)) {
          data = response.data;
        }

        // Fallback data nếu DB trống
        if (data.length === 0) {
          data = [
            {
              id: 1,
              name: "MASSAGE MẸ",
              gia: 450000,
              mo_ta:
                "Massage thư giãn giúp mẹ giảm căng thẳng, mệt mỏi và cải thiện tuần hoàn máu.",
              loai_id: 2,
              icon: "🤰",
            },
            {
              id: 2,
              name: "CHĂM SÓC MẸ VÀ BÉ TẠI TRUNG TÂM",
              gia: 800000,
              mo_ta:
                "Chăm sóc toàn diện cho mẹ và bé tại trung tâm với trang thiết bị hiện đại.",
              loai_id: 2,
              icon: "🏢",
            },
            {
              id: 3,
              name: "CHĂM SÓC MẸ VÀ BÉ TẠI NHÀ",
              gia: 1000000,
              mo_ta:
                "Dịch vụ chăm sóc tận nơi, tiện lợi và an tâm cho cả gia đình.",
              loai_id: 2,
              icon: "🏠",
            },
            {
              id: 4,
              name: "DƯỠNG SINH GIA ĐÌNH",
              gia: 600000,
              mo_ta:
                "Các liệu trình dưỡng sinh giúp cân bằng cơ thể và tăng cường sức khỏe cho cả gia đình.",
              loai_id: 2,
              icon: "👨‍👩‍👧‍👦",
            },
            {
              id: 5,
              name: "ĐẢ THÔNG KINH LẠC",
              gia: 500000,
              mo_ta:
                "Giúp lưu thông khí huyết, giảm đau nhức và cải thiện sức khỏe tổng thể.",
              loai_id: 2,
              icon: "✨",
            },
            {
              id: 6,
              name: "ĐAU MỎI VAI GÁY, TÊ BÌ TAY",
              gia: 400000,
              mo_ta:
                "Chuyên sâu giảm đau mỏi vai gáy và tê bì chân tay hiệu quả.",
              loai_id: 2,
              icon: "💆",
            },
            {
              id: 7,
              name: "ĐAU MỎI NHỨC, TÊ BÌ CHÂN",
              gia: 400000,
              mo_ta:
                "Liệu pháp đặc trị đau nhức và tê bì chân giúp đi lại nhẹ nhàng.",
              loai_id: 2,
              icon: "🦶",
            },
          ];
        }
        setServices(data);
      } catch (err) {
        console.error("Lỗi fetch dịch vụ:", err);
        setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter((s) => {
    // Lọc theo từ khóa tìm kiếm (nếu có)
    const matchesSearch =
      !searchKeyword ||
      s.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      s.mo_ta?.toLowerCase().includes(searchKeyword.toLowerCase());

    // Lọc theo danh mục
    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "cham_be" && s.loai_id === 1) ||
      (activeCategory === "cham_me" && s.loai_id === 2) ||
      (activeCategory === "duong_sinh" && s.loai_id === 3);

    return matchesSearch && matchesCategory;
  });

  // Hiển thị giao diện Loading hoặc Lỗi nếu quá trình fetch đang diễn ra / thất bại
  if (isLoading) {
    return (
      <div className="text-center py-20 text-pink-500 font-bold text-xl">
        Đang tải danh sách dịch vụ...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-20 text-red-500 text-xl">{error}</div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-6">
          {searchKeyword ? "Dịch Vụ Tìm Thấy" : "Dịch Vụ Của Chúng Tôi"}
        </h1>
        <p className="text-lg text-center text-gray-600 mb-12">
          {searchKeyword
            ? `Đang hiển thị các kết quả phù hợp với từ khóa: "${searchKeyword}"`
            : "Trải nghiệm các dịch vụ chăm sóc mẹ và bé chuyên nghiệp, an toàn và chuẩn y khoa."}
        </p>

        {/* Bộ lọc danh mục */}
        <div className="flex justify-center space-x-4 mb-12 flex-wrap gap-y-4">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-6 py-2 rounded-full font-semibold transition ${activeCategory === "all" ? "bg-pink-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Tất cả dịch vụ
          </button>
          <button
            onClick={() => setActiveCategory("cham_me")}
            className={`px-6 py-2 rounded-full font-semibold transition ${activeCategory === "cham_me" ? "bg-pink-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Chăm sóc Mẹ
          </button>
          <button
            onClick={() => setActiveCategory("cham_be")}
            className={`px-6 py-2 rounded-full font-semibold transition ${activeCategory === "cham_be" ? "bg-pink-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Bé và Mẹ
          </button>
          <button
            onClick={() => setActiveCategory("duong_sinh")}
            className={`px-6 py-2 rounded-full font-semibold transition ${activeCategory === "duong_sinh" ? "bg-pink-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Dưỡng sinh & Trị liệu
          </button>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-xl">
              Không tìm thấy dịch vụ nào phù hợp.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 hover:shadow-xl transition flex flex-col h-full group"
              >
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform ${service.color || "bg-pink-50 text-pink-500"}`}
                >
                  {service.icon || "✨"}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {service.title || service.name}
                </h3>
                <div className="flex items-center text-sm font-bold text-gray-500 mb-4 space-x-4">
                  <span className="flex items-center">
                    ⏱️ {service.duration || "60 Phút"}
                  </span>
                  <span className="flex items-center text-pink-500">
                    💰{" "}
                    {service.price ||
                      `${Number(service.gia).toLocaleString("vi-VN")}đ`}
                  </span>
                  <span className="flex items-center text-yellow-500">
                    ★ {service.rating || "4.8"}
                  </span>
                </div>
                <p className="text-gray-600 mb-8 grow leading-relaxed line-clamp-3">
                  {service.desc || service.mo_ta}
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    to={`/dich-vu/${service.id}`}
                    className="text-center w-full bg-pink-50 text-pink-600 hover:bg-pink-100 py-3 rounded-xl font-bold transition"
                  >
                    Xem chi tiết
                  </Link>
                  <Link
                    to="/dat-lich"
                    state={{ goi_id: service.id }}
                    className="text-center w-full bg-pink-500 text-white hover:bg-pink-600 py-3 rounded-xl font-bold transition shadow-lg shadow-pink-100"
                  >
                    Đặt lịch ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
