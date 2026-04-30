import React, { useState } from "react";

const Booking = () => {
  // State để chuyển đổi giữa hiển thị input địa chỉ (nếu làm tại nhà)
  const [isAtHome, setIsAtHome] = useState(true);

  return (
    <div className="bg-pink-50/50 py-12 md:py-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-pink-100">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-3">
            Đặt Lịch Hẹn <span className="text-pink-500">Chăm Sóc</span>
          </h2>
          <p className="text-center text-gray-600 mb-10 text-lg">
            Vui lòng điền thông tin dưới đây, chúng tôi sẽ liên hệ lại để xác
            nhận lịch hẹn với bạn trong thời gian sớm nhất.
          </p>

          <form className="space-y-6">
            {/* Thông tin cá nhân */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
            </div>

            {/* Dịch vụ & Thời gian */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dịch vụ quan tâm
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition bg-white"
                  required
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  <option value="tam_be">Tắm bé sơ sinh</option>
                  <option value="cham_me_bau">Chăm sóc mẹ bầu</option>
                  <option value="phuc_hoi_sau_sinh">Phục hồi sau sinh</option>
                  <option value="thong_tac_tia_sua">Thông tắc tia sữa</option>
                  <option value="khac">Khác (Ghi chú thêm)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày giờ dự kiến
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Hình thức & Địa chỉ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Hình thức chăm sóc
              </label>
              <div className="flex items-center space-x-8">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="location"
                    value="home"
                    checked={isAtHome}
                    onChange={() => setIsAtHome(true)}
                    className="w-5 h-5 text-pink-500 focus:ring-pink-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700 group-hover:text-pink-500 transition">
                    Tại nhà
                  </span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="location"
                    value="center"
                    checked={!isAtHome}
                    onChange={() => setIsAtHome(false)}
                    className="w-5 h-5 text-pink-500 focus:ring-pink-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700 group-hover:text-pink-500 transition">
                    Tại trung tâm
                  </span>
                </label>
              </div>
            </div>

            {/* Chỉ hiển thị input địa chỉ nếu chọn "Tại nhà" */}
            {isAtHome && (
              <div className="animate-fade-in-up">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ của bạn
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                  placeholder="Nhập chi tiết: Số nhà, Đường, Phường/Xã, Quận/Huyện..."
                  required
                />
              </div>
            )}

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú thêm
              </label>
              <textarea
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition resize-none"
                placeholder="Vd: Tình trạng sức khỏe của mẹ/bé, yêu cầu chuyên viên..."
              ></textarea>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 text-lg"
              >
                Xác Nhận Đặt Lịch
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
