import React from "react";

const Handbook = () => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-center text-pink-500 mb-6">
          Cẩm Nang Mẹ & Bé
        </h1>
        <p className="text-lg text-center text-gray-600 mb-12">
          Kiến thức hữu ích đồng hành cùng mẹ trong hành trình nuôi con.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Article 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition">
            <div className="h-48 sm:h-auto sm:w-48 bg-pink-200 shrink-0"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-pink-500 cursor-pointer transition">
                Cách tắm bé sơ sinh chưa rụng rốn an toàn
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Hướng dẫn chi tiết từng bước giúp mẹ tự tin tắm cho bé mà không
                lo nhiễm trùng rốn...
              </p>
              <span className="text-pink-500 text-sm font-semibold cursor-pointer">
                Đọc tiếp →
              </span>
            </div>
          </div>
          {/* Article 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition">
            <div className="h-48 sm:h-auto sm:w-48 bg-teal-200 shrink-0"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-pink-500 cursor-pointer transition">
                Dấu hiệu tắc tia sữa và cách khắc phục
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Tắc tia sữa là nỗi ám ảnh của nhiều mẹ sau sinh. Nhận biết sớm
                và xử lý kịp thời giúp...
              </p>
              <span className="text-pink-500 text-sm font-semibold cursor-pointer">
                Đọc tiếp →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Handbook;
