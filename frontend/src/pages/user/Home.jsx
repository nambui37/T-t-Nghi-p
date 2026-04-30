import React, { useState, useEffect, useRef } from "react";

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

  // Tự động cuộn xuống tin nhắn mới nhất trong Chatbot
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  // Hàm xử lý gửi tin nhắn của Chatbot
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessages = [...messages, { text: inputMessage, isBot: false }];
    setMessages(newMessages);
    setInputMessage("");

    // Giả lập AI suy nghĩ và trả lời sau 1 giây
    setTimeout(() => {
      let botReply =
        "Dạ, hiện tại AI của mình đang trong quá trình học hỏi. Mẹ có thể để lại số điện thoại hoặc nhấn 'Tư Vấn Miễn Phí' để chuyên viên hỗ trợ chi tiết hơn nhé!";
      const lowerInput = inputMessage.toLowerCase();

      // Các kịch bản giả lập (Keyword matching)
      if (
        lowerInput.includes("giá") ||
        lowerInput.includes("bao nhiêu") ||
        lowerInput.includes("chi phí")
      ) {
        botReply =
          "Dạ, bên mình có các gói chăm sóc đa dạng. Gói lẻ từ 350.000đ/buổi, gói tháng cơ bản từ 3.500.000đ, và gói VIP là 8.900.000đ. Mẹ muốn tham khảo dịch vụ chăm bé hay phục hồi cho mẹ ạ?";
      } else if (
        lowerInput.includes("địa chỉ") ||
        lowerInput.includes("ở đâu")
      ) {
        botReply =
          "Trung tâm Mom&Baby có địa chỉ tại 123 Đường ABC, Quận XYZ, TP. HCM mẹ nhé. Bên mình có hỗ trợ dịch vụ chăm sóc tận nhà nữa ạ!";
      } else if (
        lowerInput.includes("đặt lịch") ||
        lowerInput.includes("đăng ký")
      ) {
        botReply =
          "Tuyệt vời! Mẹ có thể bấm vào nút 'Đặt Lịch Hẹn' ở góc trên cùng hoặc để lại Số điện thoại tại đây để bên mình gọi lại chốt lịch ngay ạ.";
      } else if (lowerInput.includes("tắm bé") || lowerInput.includes("rốn")) {
        botReply =
          "Dịch vụ tắm bé chuẩn Y khoa bên mình bao gồm: Massage, tắm gội, vệ sinh rốn, mắt, mũi. Điều dưỡng viên 100% có chứng chỉ Y tế sẽ đến tận nhà phục vụ mẹ và bé ạ.";
      } else if (lowerInput.includes("tắc tia sữa")) {
        botReply =
          "Tắc tia sữa rất khó chịu, mẹ đừng lo! Bên mình có máy siêu âm đa tần kết hợp massage bằng tay giúp thông tia sữa nhẹ nhàng, không đau. Mẹ cần hỗ trợ ngay không ạ?";
      }

      setMessages((prev) => [...prev, { text: botReply, isBot: true }]);
    }, 1000);
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
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg text-lg">
                Khám Phá Dịch Vụ
              </button>
              <button className="bg-white hover:bg-gray-50 text-pink-500 border border-pink-200 px-8 py-3 rounded-full font-semibold transition shadow text-lg">
                Tư Vấn Miễn Phí
              </button>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition p-8 border border-pink-50">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl text-pink-500">🛁</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Tắm Bé Sơ Sinh
              </h3>
              <p className="text-gray-600 mb-6">
                Massage, tắm gội và vệ sinh rốn, mắt, mũi cho bé yêu theo chuẩn
                y khoa ngay tại nhà.
              </p>
              <a
                href="#"
                className="text-pink-500 font-semibold hover:text-pink-600 inline-flex items-center"
              >
                Xem chi tiết <span className="ml-2">→</span>
              </a>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition p-8 border border-pink-50">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl text-teal-500">🤰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Chăm Sóc Mẹ Bầu
              </h3>
              <p className="text-gray-600 mb-6">
                Massage bầu giúp giảm đau lưng, chuột rút, giảm phù nề và mang
                lại giấc ngủ ngon.
              </p>
              <a
                href="#"
                className="text-teal-500 font-semibold hover:text-teal-600 inline-flex items-center"
              >
                Xem chi tiết <span className="ml-2">→</span>
              </a>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition p-8 border border-pink-50">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl text-purple-500">🌸</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Phục Hồi Sau Sinh
              </h3>
              <p className="text-gray-600 mb-6">
                Chăm sóc vết khâu/mổ, xông hơ vùng kín, massage tống sản dịch và
                lấy lại vóc dáng.
              </p>
              <a
                href="#"
                className="text-purple-500 font-semibold hover:text-purple-600 inline-flex items-center"
              >
                Xem chi tiết <span className="ml-2">→</span>
              </a>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="bg-white border-2 border-pink-500 text-pink-500 hover:bg-pink-50 px-8 py-3 rounded-full font-semibold transition">
              Xem Tất Cả Dịch Vụ
            </button>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="bg-pink-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Bạn cần tư vấn chi tiết về các gói dịch vụ?
          </h2>
          <p className="mb-8 text-pink-100 text-lg">
            Để lại thông tin, đội ngũ y tế của chúng tôi sẽ liên hệ lại với bạn
            trong thời gian sớm nhất.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              placeholder="Số điện thoại của bạn"
              className="px-6 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 w-full sm:w-64"
            />
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-semibold transition">
              Nhận Tư Vấn
            </button>
          </div>
        </div>
      </section>

      {/* AI Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Khung Chat */}
        {isChatOpen && (
          <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-pink-100 flex flex-col mb-4 overflow-hidden transform transition-all animate-fade-in-up origin-bottom-right">
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

            <div className="flex-1 h-80 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 text-sm rounded-2xl shadow-sm ${msg.isBot ? "bg-white text-gray-800 rounded-tl-none border border-gray-100" : "bg-pink-500 text-white rounded-tr-none"}`}
                  >
                    {msg.text}
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
