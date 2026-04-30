import React, { useState } from "react";
import { Link } from "react-router-dom";

const Services = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  // Mock data mô phỏng bảng dich_vu kết hợp loai_dich_vu
  const services = [
    {
      id: 1,
      category: "cham_be",
      title: "Tắm Bé Sơ Sinh",
      price: "350.000đ",
      duration: "60 Phút",
      desc: "Massage, tắm gội và vệ sinh rốn, mắt, mũi cho bé yêu theo chuẩn y khoa ngay tại nhà.",
      icon: "🛁",
      color: "bg-pink-50 text-pink-500",
    },
    {
      id: 2,
      category: "cham_me",
      title: "Chăm Sóc Mẹ Bầu",
      price: "400.000đ",
      duration: "90 Phút",
      desc: "Massage bầu giúp giảm đau lưng, chuột rút, giảm phù nề và mang lại giấc ngủ ngon.",
      icon: "🤰",
      color: "bg-teal-50 text-teal-500",
    },
    {
      id: 3,
      category: "cham_me",
      title: "Phục Hồi Sau Sinh",
      price: "450.000đ",
      duration: "120 Phút",
      desc: "Xông hơ, massage tống sản dịch, chăm sóc vết khâu và lấy lại vóc dáng.",
      icon: "🌸",
      color: "bg-purple-50 text-purple-500",
    },
  ];

  const filteredServices =
    activeCategory === "all"
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-6">
          Dịch Vụ Của Chúng Tôi
        </h1>
        <p className="text-lg text-center text-gray-600 mb-12">
          Trải nghiệm các dịch vụ chăm sóc mẹ và bé chuyên nghiệp, an toàn và
          chuẩn y khoa.
        </p>

        {/* Bộ lọc danh mục */}
        <div className="flex justify-center space-x-4 mb-12">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-6 py-2 rounded-full font-semibold transition ${activeCategory === "all" ? "bg-pink-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Tất cả dịch vụ
          </button>
          <button
            onClick={() => setActiveCategory("cham_be")}
            className={`px-6 py-2 rounded-full font-semibold transition ${activeCategory === "cham_be" ? "bg-pink-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Chăm sóc Bé
          </button>
          <button
            onClick={() => setActiveCategory("cham_me")}
            className={`px-6 py-2 rounded-full font-semibold transition ${activeCategory === "cham_me" ? "bg-pink-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Chăm sóc Mẹ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 hover:shadow-xl transition flex flex-col h-full group"
            >
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform ${service.color}`}
              >
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {service.title}
              </h3>
              <div className="flex items-center text-sm font-bold text-gray-500 mb-4 space-x-4">
                <span className="flex items-center">⏱️ {service.duration}</span>
                <span className="flex items-center text-pink-500">
                  💰 {service.price}
                </span>
              </div>
              <p className="text-gray-600 mb-8 grow leading-relaxed">
                {service.desc}
              </p>
              <Link
                to="/dat-lich"
                className="text-center w-full bg-pink-50 text-pink-600 hover:bg-pink-500 hover:text-white py-3 rounded-xl font-bold transition"
              >
                Đặt lịch ngay
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
