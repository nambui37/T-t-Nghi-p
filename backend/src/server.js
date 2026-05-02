require('dotenv').config(); // Tải các biến môi trường từ file .env
const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const serviceRoutes = require("./routes/serviceRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const cmsRoutes = require("./routes/cmsRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const { authRouter, userRouter } = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const healthRecordRoutes = require("./routes/healthRecordRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const db = require("./configs/db");
const initDatabase = require("./utils/dbInit");


const app = express();
const PORT = process.env.PORT || 5001;

// Khởi tạo database
initDatabase();

// Middlewares
// Cấu hình CORS tường minh cho phép React gọi API
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Chỉ định chính xác domain của Frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Các phương thức cho phép
  credentials: true // Bắt buộc nếu bạn có dùng cookie/session/token
}));
app.use(express.json({ limit: '50mb' })); // Tăng giới hạn cho body JSON
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Tăng giới hạn cho urlencoded
app.use(cookieParser()); // Middleware hỗ trợ đọc Cookie

// Phục vụ các file tĩnh (ảnh đại diện, v.v.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRouter);
app.use("/api/employees", employeeRoutes);
app.use("/api/users", userRouter);
app.use("/api/shifts", shiftRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Simple health check for reviews
app.get("/api/test-reviews", (req, res) => {
  res.json({ success: true, message: "Review API is reachable" });
});

// API kiểm tra kết nối CSDL
app.get("/api/db-check", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({ success: true, message: "Kết nối Cơ sở dữ liệu MySQL thành công! 🚀" });
  } catch (error) {
    console.error("Lỗi kiểm tra CSDL:", error);
    res.status(500).json({ success: false, message: "Lỗi kết nối Cơ sở dữ liệu!", error: error.message });
  }
});

// Middleware xử lý lỗi toàn cục (Global Error Handler)
app.use((err, req, res, next) => {
  console.error("🔥 Lỗi Backend:", err.stack);
  
  // Xử lý lỗi từ Multer (ví dụ: file quá lớn)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: "File quá lớn! Giới hạn tối đa là 50MB." });
  }
  
  if (err instanceof require('multer').MulterError) {
    return res.status(400).json({ success: false, message: `Lỗi upload: ${err.message}` });
  }

  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || "Đã xảy ra lỗi trên server!", 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server backend đang chạy tại http://localhost:${PORT}`);
});