import React from "react";
import { Link } from "react-router-dom";

const Packages = () => {
  // Mock data mô phỏng bảng goi_dich_vu kết hợp chi_tiet_goi
  const packages = [
    {
      id: 1,
      title: "Gói Cơ Bản Phục Hồi",
      price: "3.500.000đ",
      totalSessions: 15,
      isHot: false,
      features: [
        { name: "Tắm bé & Vệ sinh rốn", count: 10 },
        { name: "Massage thư giãn mẹ", count: 5 },
        { name: "Vệ sinh vết mổ/khâu", count: "Mỗi buổi" },
        { name: "Tư vấn kích sữa", count: "Miễn phí" },
      ],
      bgColor: "bg-white",
      textColor: "text-gray-900",
      btnColor: "bg-pink-100 text-pink-600 hover:bg-pink-500 hover:text-white",
    },
    {
      id: 2,
      title: "Gói Vip Toàn Diện 1 Tháng",
      price: "8.900.000đ",
      totalSessions: 45,
      isHot: true,
      features: [
        { name: "Tắm bé chuẩn Y khoa", count: 30 },
        { name: "Phục hồi mẹ sau sinh VIP", count: 15 },
        { name: "Xông hơi thảo dược toàn thân", count: 5 },
        { name: "Gội đầu dưỡng sinh thảo dược", count: 5 },
        { name: "Hỗ trợ thông tắc tia sữa", count: "Bất cứ lúc nào" },
      ],
      bgColor: "bg-pink-500",
      textColor: "text-white",
      btnColor: "bg-white text-pink-500 hover:bg-gray-50",
    },
  ];

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-6">
          Gói Dịch Vụ Nổi Bật
        </h1>
        <p className="text-lg text-center text-gray-600 mb-12">
          Tiết kiệm hơn với các gói combo chăm sóc toàn diện trong tháng ở cữ.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`${pkg.bgColor} ${pkg.textColor} rounded-3xl shadow-xl border border-gray-100 p-10 relative transition-transform hover:-translate-y-2`}
            >
              {pkg.isHot && (
                <div className="absolute -top-4 right-8 bg-yellow-400 text-yellow-900 text-sm font-black px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                  Được Mua Nhiều Nhất
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{pkg.title}</h3>
              <div className="flex items-baseline mb-6">
                <span
                  className={`text-4xl font-extrabold ${pkg.isHot ? "text-white" : "text-pink-500"}`}
                >
                  {pkg.price}
                </span>
              </div>
              <div
                className={`text-sm font-bold uppercase tracking-wider mb-6 ${pkg.isHot ? "text-pink-100" : "text-gray-400"}`}
              >
                Tổng số buổi: {pkg.totalSessions}
              </div>
              <ul className="space-y-4 mb-10">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-3 text-lg">✔️</span>
                    <span>
                      <strong className="font-semibold">{feature.count}</strong>{" "}
                      {typeof feature.count === "number" ? "buổi " : ""}
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/dat-lich"
                className={`block text-center w-full py-4 rounded-xl font-bold text-lg transition ${pkg.btnColor}`}
              >
                Mua Gói Này
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Packages;
