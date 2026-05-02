// File: backend/src/controllers/chatbotController.js

const axios = require('axios');

const chatbotController = {
  chat: async (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp nội dung tin nhắn." });
    }

    try {
      // Lấy API Key từ file .env để bảo mật
      let apiKey = process.env.GEMINI_API_KEY; 
      
      // Xử lý nếu API Key có dấu ngoặc kép (thường xảy ra khi copy-paste vào .env)
      if (apiKey && apiKey.startsWith('"') && apiKey.endsWith('"')) {
        apiKey = apiKey.substring(1, apiKey.length - 1);
      }

      if (!apiKey) {
        console.error("GEMINI_API_KEY chưa được thiết lập trong file .env");
        return res.status(500).json({ success: false, message: "Chưa cấu hình API Key cho AI Chatbot trên server." });
      }
      
      // Ép AI đóng vai trợ lý Mom&Baby (giống hệt prompt cũ)
      const contextPrompt = `Bạn là trợ lý ảo AI của trung tâm chăm sóc mẹ và bé "Mom&Baby". 
      Bạn có tính cách thân thiện, chu đáo, xưng hô là "Mình/Trợ lý Mom&Baby" và gọi khách hàng là "Mẹ" hoặc "Ba".
      Các dịch vụ: MASSAGE MẸ (450k), CHĂM SÓC MẸ VÀ BÉ TẠI TRUNG TÂM (800k), CHĂM SÓC MẸ VÀ BÉ TẠI NHÀ (1000k), DƯỠNG SINH GIA ĐÌNH (600k), ĐẢ THÔNG KINH LẠC (500k), ĐAU MỎI VAI GÁY (400k).
      Thanh toán qua VNPay, MoMo. Chỉ trả lời văn bản thuần túy, ngắn gọn (dưới 100 chữ).
      Câu hỏi của khách hàng: "${message}"`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const response = await axios.post(geminiUrl, {
        contents: [{ parts: [{ text: contextPrompt }] }],
      }, {
        timeout: 10000 // Thêm timeout 10 giây để tránh treo request
      });

      let botReply = "Xin lỗi mẹ, AI đang bận chút xíu. Mẹ thử lại nhé!";
      if (response.data.candidates && response.data.candidates.length > 0) {
        botReply = response.data.candidates[0].content.parts[0].text;
      }

      // Trả về câu trả lời cho Frontend
      res.status(200).json({ success: true, reply: botReply });

    } catch (error) {
      // Log chi tiết lỗi ra terminal để developer dễ dàng kiểm tra
      console.error("Lỗi gọi Gemini API từ Backend:", JSON.stringify(error.response?.data || error.message, null, 2));
      
      const statusCode = error.response?.status;

      // Bắt lỗi 429: Quá nhiều request (Spam hoặc hết hạn ngạch phút)
      if (statusCode === 429) {
        return res.status(200).json({ 
          success: true, 
          reply: "Mẹ ơi, hiện tại đang có quá nhiều mẹ hỏi AI cùng lúc. Mẹ đợi khoảng 1 phút rồi nhắn lại cho AI nhé! 🌸" 
        });
      }

      // Bắt lỗi 400 hoặc 403: Sai API Key, Key hết hạn, hoặc vi phạm Safety Settings
      if (statusCode === 400 || statusCode === 403) {
        return res.status(200).json({ 
          success: true, 
          reply: "Mẹ ơi, câu hỏi của mẹ AI chưa thể xử lý lúc này hoặc hệ thống đang bảo trì. Mẹ vui lòng liên hệ hotline 1900 1234 để được hỗ trợ nhé!" 
        });
      }

      res.status(500).json({ success: false, message: "Lỗi kết nối đến máy chủ AI." });
    }
  },
};

module.exports = chatbotController;
