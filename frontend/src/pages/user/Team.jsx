import React, { useState, useEffect } from "react";
import { cmsAPI } from "../../services/apiClient";

const Team = () => {
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await cmsAPI.getTeam();
      if (res.data.success) {
        setTeam(res.data.data);
      } else {
        // Fallback data if API returns empty
        setTeam([
          {
            id: 1,
            name: "BS. Nguyễn Thị Minh",
            role: "Cố vấn chuyên môn",
            experience: "20 năm kinh nghiệm tại BV Phụ sản TW",
            image_url:
              "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop",
            bio: "Chuyên gia đầu ngành về chăm sóc sức khỏe mẹ và bé sau sinh.",
          },
          {
            id: 2,
            name: "ThS. Lê Thu Trang",
            role: "Trưởng nhóm Điều dưỡng",
            experience: "12 năm kinh nghiệm",
            image_url:
              "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&h=200&auto=format&fit=crop",
            bio: "Chuyên gia tư vấn nuôi con bằng sữa mẹ và massage bé sơ sinh.",
          },
          {
            id: 3,
            name: "ĐD. Phạm Hải Yến",
            role: "Chuyên viên Tắm bé",
            experience: "8 năm kinh nghiệm",
            image_url:
              "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop",
            bio: "Tận tâm, yêu trẻ và có kỹ năng xử lý tình huống sơ sinh chuyên nghiệp.",
          },
          {
            id: 4,
            name: "CV. Trần Thu Hương",
            role: "Chuyên viên Phục hồi",
            experience: "10 năm kinh nghiệm",
            image_url:
              "https://images.unsplash.com/photo-1590615365405-d4a2104550ee?q=80&w=200&h=200&auto=format&fit=crop",
            bio: "Chuyên gia về các liệu trình massage phục hồi và thon gọn vóc dáng sau sinh.",
          },
        ]);
      }
    } catch (error) {
      console.error("Lỗi tải đội ngũ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-pink-50 py-20 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-sm font-bold tracking-wider uppercase mb-4 animate-fade-in">
              Đội ngũ chuyên gia
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Tận tâm như <span className="text-pink-500">Người thân</span>,{" "}
              <br />
              Chuyên nghiệp như <span className="text-indigo-600">Bác sĩ</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Mom&Baby tự hào sở hữu đội ngũ 100% chuyên viên y tế (Bác sĩ, Điều
              dưỡng, Nữ hộ sinh) có bằng cấp chính quy và được đào tạo chuyên
              sâu về tâm lý mẹ bầu & trẻ sơ sinh.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-white rounded-3xl shadow-xl shadow-pink-100/50 p-8 border border-pink-50">
            {[
              { label: "Chuyên viên", value: "50+" },
              { label: "Năm kinh nghiệm", value: "10+" },
              { label: "Khách hàng hài lòng", value: "5000+" },
              { label: "Chứng chỉ Y khoa", value: "100%" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl md:text-4xl font-black text-pink-500 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Gặp gỡ những người đồng hành
              </h2>
              <p className="text-gray-600">
                Chúng tôi không chỉ cung cấp dịch vụ, chúng tôi trao gửi sự an
                tâm và tình yêu thương trong từng thao tác chăm sóc.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-2.5 bg-pink-50 text-pink-600 font-bold rounded-xl hover:bg-pink-100 transition">
                Tất cả
              </button>
              <button className="px-6 py-2.5 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition">
                Bác sĩ
              </button>
              <button className="px-6 py-2.5 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition">
                Điều dưỡng
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              <div className="col-span-full py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
              </div>
            ) : (
              team.map((member) => (
                <div
                  key={member.id}
                  className="group bg-white rounded-4xl border border-gray-100 p-4 hover:border-pink-200 hover:shadow-2xl hover:shadow-pink-100/50 transition-all duration-500"
                >
                  <div className="relative mb-6 overflow-hidden rounded-3xl aspect-square">
                    <img
                      src={
                        member.image_url ||
                        `https://i.pravatar.cc/300?u=${member.id}`
                      }
                      alt={member.name}
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-pink-500/80 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end justify-center pb-6">
                      <div className="flex gap-3">
                        <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-pink-500 transition">
                          📞
                        </button>
                        <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-pink-500 transition">
                          📧
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="px-2 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-pink-500 transition">
                      {member.name}
                    </h3>
                    <p className="text-indigo-600 text-sm font-bold uppercase tracking-wider mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-500 text-xs font-medium mb-4 line-clamp-2">
                      {member.bio || member.experience}
                    </p>
                    <div className="inline-flex items-center px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition">
                      ⭐ 5.0 Rating • {member.experience}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-10 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Bạn cần sự hỗ trợ từ các chuyên gia?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Đội ngũ của chúng tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn
            24/7 trong hành trình làm mẹ thiêng liêng.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-10 py-4 bg-pink-500 text-white font-bold rounded-2xl hover:bg-pink-600 shadow-xl shadow-pink-500/20 transition-all transform hover:-translate-y-1">
              Đặt lịch tư vấn ngay
            </button>
            <button className="px-10 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 backdrop-blur-md transition-all">
              Tìm hiểu thêm về quy trình
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;
