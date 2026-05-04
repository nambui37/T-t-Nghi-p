import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { chatAPI, appointmentAPI } from "../services/apiClient";
import { useLocation } from "react-router-dom";

const socket = io(
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001",
  {
    path: "/socket.io",
    withCredentials: true,
  },
);

const ChatWindow = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [hasAppointment, setHasAppointment] = useState(false);
  const scrollRef = useRef();

  const room = user ? `room_${user.id}` : "guest_room";

  // Kiểm tra điều kiện hiển thị: Trang Hồ sơ & Có lịch hẹn & Không phải admin/staff
  useEffect(() => {
    const checkAppointment = async () => {
      if (user && location.pathname === "/ho-so") {
        // Chỉ khách hàng (role_id = 3 hoặc không role/staff) mới thấy chat
        const isStaff = [1, 2, 4, 5, 6, 7, 8].includes(Number(user.role_id));
        if (isStaff) {
          setHasAppointment(false);
          return;
        }

        try {
          const res = await appointmentAPI.getAll();
          if (res.data.success && res.data.data?.length > 0) {
            setHasAppointment(true);
          } else {
            setHasAppointment(false);
          }
        } catch (error) {
          console.error("Lỗi kiểm tra lịch hẹn:", error);
          setHasAppointment(false);
        }
      } else {
        setHasAppointment(false);
      }
    };
    checkAppointment();
  }, [user, location.pathname]);

  useEffect(() => {
    if (isOpen && user && hasAppointment) {
      // Join room
      socket.emit("join_room", room);

      // Fetch history
      const fetchHistory = async () => {
        try {
          const res = await chatAPI.getHistory(room);
          if (res.data.success) {
            setChatHistory(res.data.data);
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      };
      fetchHistory();
    }
  }, [isOpen, user, room, hasAppointment]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChatHistory((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const messageData = {
      room: room,
      sender_id: user.id,
      sender_name: user.name,
      message: message,
      timestamp: new Date(),
    };

    socket.emit("send_message", messageData);
    setMessage("");
  };

  const shouldShow = user && hasAppointment && location.pathname === "/ho-so";
  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform active:scale-95"
      >
        {isOpen ? "✖" : "💬"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-pink-100 flex flex-col overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="bg-pink-500 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl backdrop-blur-sm">
                👩‍⚕️
              </div>
              <div>
                <h3 className="font-bold text-sm">Hỗ trợ Mom&Baby</h3>
                <p className="text-[10px] opacity-80">
                  Chúng tôi luôn sẵn sàng hỗ trợ bạn
                </p>
              </div>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 h-96 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {chatHistory.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm italic">
                  Bắt đầu trò chuyện với chúng tôi...
                </p>
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender_id === user.id
                      ? "bg-pink-500 text-white rounded-br-none"
                      : "bg-white text-gray-700 rounded-bl-none border border-gray-100"
                  }`}
                >
                  <p>{msg.message}</p>
                  <span
                    className={`text-[9px] block mt-1 opacity-70 ${msg.sender_id === user.id ? "text-right" : "text-left"}`}
                  >
                    {new Date(
                      msg.created_at || msg.timestamp,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-pink-300 transition-all outline-none"
            />
            <button
              type="submit"
              className="w-10 h-10 bg-pink-500 text-white rounded-xl flex items-center justify-center hover:bg-pink-600 transition-colors"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
