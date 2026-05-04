import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { serviceAPI } from "../../services/apiClient";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const response = await serviceAPI.getAll();
      if (response?.data?.success) {
        // Lọc lấy các dịch vụ là Gói (loai_id = 1)
        const allServices = response.data.data;
        const pkgs = allServices.filter((s) => s.loai_id === 1);
        setPackages(pkgs);
      }
    } catch (error) {
      console.error("Lỗi khi tải gói dịch vụ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Gói Dịch Vụ <span className="text-pink-500">Toàn Diện</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Đặt cọc chỉ 15% để giữ chỗ. Lộ trình chuẩn y khoa giúp mẹ phục hồi và
            bé phát triển vượt trội.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-4xl shadow-xl border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:-translate-y-2 group"
              >
                {/* Header Gói */}
                <div className="p-8 pb-0">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      🌸
                    </div>
                    {pkg.gia > 10000000 && (
                      <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        Phổ biến nhất
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-black text-pink-500">
                      {new Intl.NumberFormat("vi-VN").format(pkg.gia)}đ
                    </span>
                    <span className="text-gray-400 text-sm font-medium">
                      / trọn gói
                    </span>
                  </div>
                </div>

                {/* Nội dung chi tiết */}
                <div className="px-8 pb-8 flex-1 flex flex-col">
                  <div className="bg-pink-50/50 rounded-2xl p-5 mb-8 grow">
                    <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-3">
                      Lộ trình chi tiết:
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed italic whitespace-pre-wrap">
                      {pkg.mo_ta || "Liên hệ để biết thêm chi tiết lộ trình."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link
                      to={`/dich-vu/${pkg.id}`}
                      className="block text-center w-full bg-pink-50 text-pink-600 py-3 rounded-2xl font-bold hover:bg-pink-100 transition"
                    >
                      Xem chi tiết
                    </Link>
                    <Link
                      to="/dat-lich"
                      state={{ goi_id: pkg.id }}
                      className="block text-center w-full bg-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-pink-600 transition shadow-lg shadow-pink-100"
                    >
                      Đăng Ký Ngay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 bg-indigo-900 rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              Cần Tư Vấn Gói Chăm Sóc Riêng?
            </h2>
            <p className="text-indigo-100 mb-10 max-w-xl mx-auto opacity-80">
              Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng thiết kế lộ trình
              cá nhân hóa phù hợp nhất với thể trạng của mẹ và bé.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="tel:0973714055"
                className="bg-white text-indigo-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition"
              >
                Gọi Ngay: 0973.714.055
              </a>
              <Link
                to="/dat-lich"
                className="bg-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-600 transition"
              >
                Yêu Cầu Gọi Lại
              </Link>
            </div>
          </div>
          {/* Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        </div>
      </div>
    </div>
  );
};

export default Packages;
