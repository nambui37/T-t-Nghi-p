import React, { useState, useEffect, useRef } from "react";
import { chatbotAPI } from "../services/apiClient";
import { useLocation } from "react-router-dom";

const AIChatbot = () => {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Chào bạn! Mình là Trợ lý AI của Mom&Baby 🌸. Mình có thể giúp gì cho bạn và bé hôm nay ạ?",
      isBot: true,
    },
  ]);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Bảng giá dịch vụ như thế nào?",
    "Hướng dẫn mình cách đặt lịch",
    "Có những gói chăm sóc bé nào?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  const handleSendMessage = async (e, suggestedText = null) => {
    if (e) e.preventDefault();
    const userText = suggestedText || inputMessage;
    if (!userText.trim()) return;

    const newMessages = [...messages, { text: userText, isBot: false }];
    setMessages(newMessages);

    if (!suggestedText) setInputMessage("");

    setMessages((prev) => [
      ...prev,
      { text: "...", isBot: true, isLoading: true },
    ]);

    try {
      const response = await chatbotAPI.chat(userText);
      let botReply = "Xin lỗi bạn, AI đang bận chút xíu. Bạn thử lại nhé!";
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
          text: "Xin lỗi bạn, không thể kết nối tới máy chủ AI lúc này.",
          isBot: true,
        },
      ]);
    }
  };

  // Ẩn chatbot AI nếu đang ở các trang quản trị (Admin)
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-24 z-50 flex flex-col items-end">
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
              ✕
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
                  {msg.isLoading ? "..." : msg.text}
                </div>
              </div>
            ))}

            {/* Hiển thị câu hỏi gợi ý nếu mới bắt đầu trò chuyện */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(null, q)}
                    className="text-xs bg-pink-100 text-pink-600 px-3 py-1.5 rounded-full hover:bg-pink-200 transition text-left font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
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
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm transition"
            />
            <button
              type="submit"
              className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition shadow-md shrink-0"
              disabled={!inputMessage.trim()}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Nút bật/tắt Chatbot */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`${isChatOpen ? "bg-gray-800" : "bg-linear-to-r from-pink-500 to-pink-600 animate-bounce"} text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:shadow-pink-500/50 transition-all hover:scale-110 z-50`}
      >
        {isChatOpen ? "✕" : "🤖"}
      </button>
    </div>
  );
};

export default AIChatbot;
