import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { serviceAPI, chatbotAPI } from "../../services/apiClient";

const HomePage = () => {
  // Danh sách các ảnh hiển thị ở Slider (bạn có thể thay link ảnh thực tế vào đây)
  const images = [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544126592-807ade215a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://png.pngtree.com/thumb_back/fh260/background/20240803/pngtree-cartoon-illustration-mother-and-son-hugging-white-jasmine-garland-thai-mothers-image_16125694.jpg",
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // State cho AI Chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Chào mẹ! Mình là Trợ lý AI của Mom&Baby 🌸. Mình có thể giúp gì cho mẹ và bé hôm nay ạ?",
      isBot: true,
    },
  ]);

  // State lưu danh sách 3 dịch vụ nổi bật
  const [featuredServices, setFeaturedServices] = useState([]);

  const messagesEndRef = useRef(null);

  // Kích hoạt animation khi trang vừa render xong
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Tự động chuyển ảnh sau mỗi 3 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer); // Xóa timer khi component bị unmount
  }, [images.length]);

  // Lấy dữ liệu dịch vụ từ Backend API khi trang vừa tải
  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        const response = await serviceAPI.getAll();
        let data = [];
        if (response?.data?.success) {
          data = response.data.data;
        } else if (Array.isArray(response?.data)) {
          data = response.data;
        }

        // Nếu DB chưa có dữ liệu, dùng dữ liệu mẫu để giao diện đẹp hơn
        if (data.length === 0) {
          data = [
            {
              id: 1,
              name: "MASSAGE MẸ",
              gia: 450000,
              mo_ta:
                "Massage thư giãn giúp mẹ giảm căng thẳng, mệt mỏi và cải thiện tuần hoàn máu.",
              icon: "🤰",
            },
            {
              id: 2,
              name: "CHĂM SÓC MẸ VÀ BÉ TẠI TRUNG TÂM",
              gia: 800000,
              mo_ta:
                "Chăm sóc toàn diện cho mẹ và bé tại trung tâm với trang thiết bị hiện đại.",
              icon: "🏢",
            },
            {
              id: 3,
              name: "CHĂM SÓC MẸ VÀ BÉ TẠI NHÀ",
              gia: 1000000,
              mo_ta:
                "Dịch vụ chăm sóc tận nơi, tiện lợi và an tâm cho cả gia đình.",
              icon: "🏠",
            },
            {
              id: 4,
              name: "DƯỠNG SINH GIA ĐÌNH",
              gia: 600000,
              mo_ta:
                "Các liệu trình dưỡng sinh giúp cân bằng cơ thể và tăng cường sức khỏe cho cả gia đình.",
              icon: "👨‍👩‍👧‍👦",
            },
            {
              id: 5,
              name: "ĐẢ THÔNG KINH LẠC",
              gia: 500000,
              mo_ta:
                "Giúp lưu thông khí huyết, giảm đau nhức và cải thiện sức khỏe tổng thể.",
              icon: "✨",
            },
            {
              id: 6,
              name: "ĐAU MỎI VAI GÁY, TÊ BÌ TAY",
              gia: 400000,
              mo_ta:
                "Chuyên sâu giảm đau mỏi vai gáy và tê bì chân tay hiệu quả.",
              icon: "💆",
            },
            {
              id: 7,
              name: "ĐAU MỎI NHỨC, TÊ BÌ CHÂN",
              gia: 400000,
              mo_ta:
                "Liệu pháp đặc trị đau nhức và tê bì chân giúp đi lại nhẹ nhàng.",
              icon: "🦶",
            },
          ];
        }

        // Lấy 6 dịch vụ đầu tiên để làm dịch vụ nổi bật
        setFeaturedServices(data.slice(0, 7));
      } catch (err) {
        console.error("Lỗi tải dịch vụ nổi bật:", err);
        // Fallback data khi lỗi API
        setFeaturedServices([
          {
            id: 1,
            name: "MASSAGE MẸ",
            gia: 450000,
            mo_ta: "Massage thư giãn giúp mẹ giảm căng thẳng, mệt mỏi.",
            icon: "🤰",
          },
          {
            id: 2,
            name: "CHĂM SÓC MẸ VÀ BÉ TẠI TRUNG TÂM",
            gia: 800000,
            mo_ta: "Chăm sóc toàn diện tại trung tâm.",
            icon: "🏢",
          },
          {
            id: 3,
            name: "CHĂM SÓC MẸ VÀ BÉ TẠI NHÀ",
            gia: 1000000,
            mo_ta: "Dịch vụ chăm sóc tận nơi tiện lợi.",
            icon: "🏠",
          },
          {
            id: 4,
            name: "DƯỠNG SINH GIA ĐÌNH",
            gia: 600000,
            mo_ta: "Liệu trình dưỡng sinh cho cả gia đình.",
            icon: "👨‍👩‍👧‍👦",
          },
          {
            id: 5,
            name: "ĐẢ THÔNG KINH LẠC",
            gia: 500000,
            mo_ta: "Giúp lưu thông khí huyết.",
            icon: "✨",
          },
          {
            id: 6,
            name: "ĐAU MỎI VAI GÁY, TÊ BÌ TAY",
            gia: 400000,
            mo_ta: "Giảm đau mỏi vai gáy hiệu quả.",
            icon: "💆",
          },
        ]);
      }
    };
    fetchFeaturedServices();
  }, []);

  // Tự động cuộn xuống tin nhắn mới nhất trong Chatbot
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  // Hàm xử lý gửi tin nhắn của Chatbot
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const newMessages = [...messages, { text: userText, isBot: false }];
    setMessages(newMessages);
    setInputMessage("");

    // Hiển thị trạng thái đang gõ
    setMessages((prev) => [
      ...prev,
      { text: "...", isBot: true, isLoading: true },
    ]);

    try {
      // Gọi API chatbot từ backend để giấu API Key
      const response = await chatbotAPI.chat(userText);

      let botReply = "Xin lỗi mẹ, AI đang bận chút xíu. Mẹ thử lại nhé!";
      if (response.data.success) {
        botReply = response.data.reply;
      }

      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        { text: botReply, isBot: true },
      ]);
    } catch (error) {
      console.error("Lỗi gọi API Chatbot:", error);
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        {
          text: "Xin lỗi mẹ, không thể kết nối tới máy chủ AI lúc này.",
          isBot: true,
        },
      ]);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-pink-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left pr-0 md:pr-10">
            <h1
              className={`text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6 transform transition-all duration-1000 ease-out ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              Chăm Sóc Tận Tâm, <br />
              <span className="text-pink-500">Mẹ Khỏe Bé Ngoan</span>
            </h1>
            <p
              className={`text-lg text-gray-600 mb-8 transform transition-all duration-1000 delay-300 ease-out ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              Chúng tôi cung cấp các dịch vụ chăm sóc mẹ và bé chuẩn y khoa,
              mang lại sự phục hồi hoàn hảo cho mẹ và khởi đầu vững chắc cho bé
              yêu.
            </p>
            <div
              className={`flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4 transform transition-all duration-1000 delay-500 ease-out ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <Link
                to="/dich-vu"
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg text-lg"
              >
                Khám Phá Dịch Vụ
              </Link>
              <a
                href="tel:19001234"
                className="bg-white hover:bg-gray-50 text-pink-500 border border-pink-200 px-8 py-3 rounded-full font-semibold transition shadow text-lg inline-block"
              >
                Tư Vấn Miễn Phí
              </a>
            </div>
          </div>

          {/* Image Slider */}
          <div
            className={`md:w-1/2 mt-12 md:mt-0 relative h-96 w-full rounded-2xl shadow-2xl overflow-hidden bg-pink-100 transform transition-all duration-1000 delay-700 ease-out ${isLoaded ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
          >
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Mẹ và bé ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  index === currentImage ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              />
            ))}
            {/* Chấm tròn điều hướng (Indicators) */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentImage
                      ? "bg-white scale-125 shadow"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Highlight Stats */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-pink-100">
            <div>
              <p className="text-4xl font-bold text-pink-500 mb-2">5+</p>
              <p className="text-gray-500 font-medium">Năm Kinh Nghiệm</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-pink-500 mb-2">10k+</p>
              <p className="text-gray-500 font-medium">Mẹ & Bé Hài Lòng</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-pink-500 mb-2">50+</p>
              <p className="text-gray-500 font-medium">Chuyên Viên Y Tế</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-pink-500 mb-2">100%</p>
              <p className="text-gray-500 font-medium">Sản Phẩm Hữu Cơ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-pink-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Dịch Vụ Nổi Bật
            </h2>
            <p className="text-gray-600 text-lg">
              Đội ngũ điều dưỡng viên giàu kinh nghiệm luôn sẵn sàng mang đến
              cho bạn những trải nghiệm tuyệt vời nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.length > 0 ? (
              featuredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 p-8 border border-pink-50 flex flex-col h-full group"
                >
                  <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-500 transition-colors duration-300">
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                      {service.icon || "🌸"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-6 grow line-clamp-3">
                    {service.mo_ta}
                  </p>
                  <div className="mt-auto border-t border-pink-50 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-500 text-sm">Giá từ:</span>
                      <span className="text-pink-500 font-extrabold text-xl">
                        {service.gia?.toLocaleString()}đ
                      </span>
                    </div>
                    <Link
                      to="/dat-lich"
                      className="block w-full text-center bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-pink-200 transition-all active:scale-95"
                    >
                      Đặt Lịch Ngay
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-10">
                Đang tải danh sách dịch vụ nổi bật...
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/dich-vu"
              className="inline-block bg-white border-2 border-pink-500 text-pink-500 hover:bg-pink-50 px-8 py-3 rounded-full font-semibold transition"
            >
              Xem Tất Cả Dịch Vụ
            </Link>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="bg-pink-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Bạn cần tư vấn chi tiết về các dịch vụ?
          </h2>
          <p className="mb-8 text-pink-100 text-lg">
            Để lại thông tin, đội ngũ y tế của chúng tôi sẽ liên hệ lại với bạn
            trong thời gian sớm nhất.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="tel:19001234"
              className="bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 rounded-full font-bold transition shadow-xl flex items-center justify-center gap-2"
            >
              <span>📞</span> Gọi Ngay: 1900 1234
            </a>
          </div>
        </div>
      </section>

      {/* AI Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Khung Chat */}
        {isChatOpen && (
          <div className="bg-white w-80 sm:w-96 h-125 rounded-2xl shadow-2xl border border-pink-100 flex flex-col mb-4 overflow-hidden transform transition-all animate-fade-in-up origin-bottom-right">
            <div className="bg-linear-to-r from-pink-500 to-pink-400 p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-bold text-sm">Trợ lý AI Mom&Baby</h3>
                  <p className="text-xs text-pink-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Đang hoạt động
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 text-sm rounded-2xl shadow-sm ${msg.isBot ? "bg-white text-gray-800 rounded-tl-none border border-gray-100" : "bg-pink-500 text-white rounded-tr-none"} ${msg.isLoading ? "animate-pulse" : ""}`}
                  >
                    {msg.isLoading ? (
                      <span className="flex space-x-1 items-center h-5">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></span>
                      </span>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập câu hỏi của mẹ..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm transition"
              />
              <button
                type="submit"
                className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition shadow-md shrink-0 disabled:opacity-50"
                disabled={!inputMessage.trim()}
              >
                <svg
                  className="w-4 h-4 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Nút bật/tắt Chatbot */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`${isChatOpen ? "bg-gray-800" : "bg-linear-to-r from-pink-500 to-pink-600 animate-bounce"} text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:shadow-pink-500/50 transition-all hover:scale-110 z-50`}
        >
          {isChatOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <span className="text-3xl">🤖</span>
          )}
        </button>
      </div>
    </>
  );
};

export default HomePage;

// Thêm CSS tùy chỉnh cho thanh cuộn khung chat
const style = document.createElement("style");
style.innerHTML = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #fbcfe8;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #f9a8d4;
  }
`;
document.head.appendChild(style);
