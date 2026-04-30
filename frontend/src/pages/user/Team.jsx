import React from "react";

const Team = () => {
  return (
    <div className="bg-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">
          Đội Ngũ <span className="text-pink-500">Chuyên Viên</span>
        </h1>
        <p className="text-lg text-center text-gray-600 mb-12">
          100% chuyên viên y tế có bằng cấp, chứng chỉ hành nghề và đầy tâm
          huyết.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Team Member */}
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl shadow p-6 text-center"
            >
              <img
                src={`https://i.pravatar.cc/150?img=${item + 10}`}
                alt="Chuyên viên"
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-pink-100 object-cover"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Nguyễn Thị {String.fromCharCode(64 + item)}
              </h3>
              <p className="text-pink-500 font-medium mb-3">Điều dưỡng viên</p>
              <p className="text-gray-500 text-sm">
                5 năm kinh nghiệm làm việc tại khoa sản bệnh viện Phụ Sản.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;
