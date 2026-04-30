import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            {/* DÁN LINK ẢNH TỪ GOOGLE VÀO THUỘC TÍNH SRC BÊN DƯỚI */}
            <img
              src="https://png.pngtree.com/png-clipart/20240406/original/pngtree-mother-hugging-her-son-png-image_14768495.png"
              alt="Mom&Baby Logo"
              className="w-8 h-8 object-contain opacity-90"
            />
            <span className="text-2xl font-bold text-pink-400">Mom&Baby</span>
          </div>
          <p className="text-sm text-gray-400">
            Đồng hành cùng mẹ trên chặng đường mang thai và đón bé yêu chào đời
            với sự chăm sóc chuẩn y khoa.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Dịch Vụ</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-pink-400 transition">
                Tắm bé sơ sinh
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-pink-400 transition">
                Chăm sóc mẹ bầu
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-pink-400 transition">
                Phục hồi sau sinh
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-pink-400 transition">
                Thông tắc tia sữa
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Liên Hệ</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Hotline: 1900 1234</li>
            <li>Email: contact@mombaby.com</li>
            <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Giờ Làm Việc</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Thứ 2 - Thứ 6: 08:00 - 20:00</li>
            <li>Thứ 7 - CN: 08:00 - 17:00</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center text-gray-500">
        © {new Date().getFullYear()} Mom&Baby Care Center. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
