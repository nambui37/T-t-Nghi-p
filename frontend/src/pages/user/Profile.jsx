import React from "react";
import { Link } from "react-router-dom";

const Profile = () => {
  // Dữ liệu mẫu (Mock data) người dùng
  const user = {
    name: "Nguyễn Thị Mai",
    phone: "0901234567",
    email: "mai.nguyen@example.com",
    address: "123 Đường Lê Lợi, Phường 4, Quận Gò Vấp, TP. HCM",
    joinDate: "15/08/2023",
  };

  // Dữ liệu mẫu lịch sử lịch hẹn (bám sát bảng lich_hen)
  const appointments = [
    {
      id: "LH1023",
      service: "Gói Vip Toàn Diện (Tắm bé & Phục hồi mẹ)",
      date: "25/10/2023 - 08:30",
      location: "Tại nhà",
      status: "cho_xac_nhan",
      price: "8.900.000đ",
    },
    {
      id: "LH0984",
      service: "Tắm Bé Sơ Sinh (Lẻ)",
      date: "20/10/2023 - 09:00",
      location: "Tại nhà",
      status: "hoan_thanh",
      price: "350.000đ",
    },
    {
      id: "LH0855",
      service: "Massage bầu thư giãn",
      date: "10/09/2023 - 14:00",
      location: "Tại trung tâm",
      status: "da_huy",
      price: "400.000đ",
    },
  ];

  // Hàm render badge trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "cho_xac_nhan":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            Chờ xác nhận
          </span>
        );
      case "da_xac_nhan":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Đã xác nhận
          </span>
        );
      case "dang_thuc_hien":
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            Đang thực hiện
          </span>
        );
      case "hoan_thanh":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Hoàn thành
          </span>
        );
      case "da_huy":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            Không rõ
          </span>
        );
    }
  };

  return (
    <div className="bg-gray-50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cột trái: Thông tin cá nhân */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 sticky top-28">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                  {user.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Thành viên từ {user.joinDate}
                </p>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                    Số điện thoại
                  </p>
                  <p className="text-gray-800 font-medium">{user.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                    Email
                  </p>
                  <p className="text-gray-800 font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                    Địa chỉ mặc định
                  </p>
                  <p className="text-gray-800 font-medium">{user.address}</p>
                </div>
              </div>

              <button className="w-full mt-8 bg-pink-50 text-pink-600 hover:bg-pink-100 py-2.5 rounded-xl font-semibold transition">
                Cập nhật thông tin
              </button>
              <button className="w-full mt-3 bg-white border border-gray-200 text-red-500 hover:bg-red-50 py-2.5 rounded-xl font-semibold transition">
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Cột phải: Lịch sử lịch hẹn */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Lịch Sử Lịch Hẹn
                </h3>
                <Link
                  to="/dat-lich"
                  className="text-pink-500 font-semibold hover:text-pink-600"
                >
                  + Đặt lịch mới
                </Link>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">
                    Bạn chưa có lịch hẹn nào.
                  </p>
                  <Link
                    to="/dat-lich"
                    className="bg-pink-500 text-white px-6 py-2 rounded-full font-semibold"
                  >
                    Đặt lịch ngay
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition bg-gray-50/50"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <div>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                            Mã LH: {apt.id}
                          </span>
                          <h4 className="text-lg font-bold text-gray-900">
                            {apt.service}
                          </h4>
                        </div>
                        <div>{getStatusBadge(apt.status)}</div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
                        <div>
                          <p className="text-gray-500 mb-1">Thời gian</p>
                          <p className="font-semibold text-gray-800">
                            {apt.date}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Thực hiện</p>
                          <p className="font-semibold text-gray-800">
                            {apt.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Tổng tiền</p>
                          <p className="font-semibold text-pink-500 text-base">
                            {apt.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
