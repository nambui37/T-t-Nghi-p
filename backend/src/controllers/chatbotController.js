// File: backend/src/controllers/chatbotController.js

const axios = require("axios");
const db = require("../configs/db");

async function loadServicePackages() {
  try {
    const [rows] = await db.query(
      "SELECT id, name, gia FROM goi_dich_vu ORDER BY id ASC",
    );
    return rows || [];
  } catch (e) {
    console.error("chatbot loadServicePackages:", e.message);
    return [];
  }
}

function formatServicesAsText(rows) {
  if (!rows.length) {
    return "Dịch vụ đang cập nhật — mẹ vui lòng xem trang Dịch vụ trên website hoặc gọi trung tâm ạ.";
  }
  return rows
    .map(
      (s) => `${s.name} (${Number(s.gia).toLocaleString("vi-VN")}đ)`,
    )
    .join(", ");
}

/** Trả lời khi không gọi được Gemini — vẫn đúng bảng giá trong DB */
function buildOfflineReply(rows) {
  if (!rows?.length) {
    return (
      "Mẹ xem bảng giá tại trang Dịch vụ trên website hoặc liên hệ trung tâm ạ. (Chưa tải được dữ liệu gói từ hệ thống.)"
    );
  }
  const lines = rows
    .map(
      (s) => `• ${s.name}: ${Number(s.gia).toLocaleString("vi-VN")}đ`,
    )
    .join("\n");
  const header = "Chào mẹ! Dưới đây là bảng giá dịch vụ Mom&Baby trong hệ thống:\n\n";
  const footer =
    "\n\n💳 Thanh toán: VNPay hoặc tiền mặt.\n📅 Đặt lịch: vui lòng vào mục Đặt lịch trên website.\n(Thông tin lấy từ hệ thống — trợ lý AI tạm không kết nối được.)";
  return `${header}${lines}${footer}`;
}

const chatbotController = {
  chat: async (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp nội dung tin nhắn.",
      });
    }

    const packages = await loadServicePackages();
    const servicesText = formatServicesAsText(packages);

    let apiKey = process.env.GEMINI_API_KEY?.trim();
    if (apiKey && apiKey.startsWith('"') && apiKey.endsWith('"')) {
      apiKey = apiKey.substring(1, apiKey.length - 1).trim();
    }

    const contextPrompt = `Bạn là trợ lý ảo AI của trung tâm chăm sóc mẹ và bé "Mom&Baby". 
Bạn có tính cách thân thiện, chu đáo, xưng hô là "Mình/Trợ lý Mom&Baby" và gọi khách hàng là "Mẹ" hoặc "Ba".
Đây là danh sách các dịch vụ kèm giá đang có trong hệ thống hiện tại: ${servicesText}.
Thanh toán qua VNPay, Tiền mặt. Để đặt lịch, hướng dẫn khách truy cập vào trang Đặt Lịch Hẹn. Chỉ trả lời văn bản thuần tự nhiên, ngắn gọn (dưới 120 chữ).
Câu hỏi của khách hàng: "${message}"`;

    // Không có key → vẫn trả bảng giá để khách không bị “chết” chức năng
    if (!apiKey) {
      console.warn("GEMINI_API_KEY chưa có — dùng phản hồi offline (DB)");
      return res.status(200).json({
        success: true,
        reply: buildOfflineReply(packages),
        fallback: true,
      });
    }

    const defaultModels =
      "gemini-2.5-flash-preview-05-20,gemini-2.0-flash,gemini-2.0-flash-001,gemini-1.5-flash-latest,gemini-1.5-flash,gemini-1.5-pro";
    const modelsToTry = (process.env.GEMINI_MODEL || defaultModels)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const apiVersions = ["v1beta", "v1"];

    let lastError = null;

    for (const ver of apiVersions) {
      for (const model of modelsToTry) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const response = await axios.post(
            geminiUrl,
            { contents: [{ parts: [{ text: contextPrompt }] }] },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 25000,
              validateStatus: () => true,
            },
          );

          if (response.status === 429) {
            console.warn(`Gemini ${ver}/${model}: 429 — thử model/API khác hoặc fallback DB`);
            continue;
          }

          if (response.status >= 400) {
            lastError = Object.assign(new Error(response.data?.error?.message || `HTTP ${response.status}`), {
              response,
            });
            console.error(
              `Gemini ${ver}/${model}:`,
              response.status,
              response.data?.error || response.data,
            );
            continue;
          }

          const part =
            response.data?.candidates?.[0]?.content?.parts?.[0];
          if (part?.text) {
            return res
              .status(200)
              .json({ success: true, reply: part.text.trim() });
          }

          console.warn(
            `Gemini ${ver}/${model}: không có text (candidates an toàn/blocked?)`,
            JSON.stringify(response.data?.promptFeedback || ""),
          );
        } catch (err) {
          lastError = err;
          console.error(
            `Gemini ${ver}/${model}:`,
            err.response?.data?.error || err.message,
          );
        }
      }
    }

    // Mọi model đều lỗi → không để khách thấy lỗi kết nối chung chung; luôn có bảng giá DB
    console.error(
      "Gemini không khả dụng, trả offline reply. Last error:",
      lastError?.response?.data || lastError?.message,
    );

    const offline = buildOfflineReply(packages);
    return res.status(200).json({
      success: true,
      reply: offline,
      fallback: true,
    });
  },
};

module.exports = chatbotController;
