const AuthModel = require("../models/authModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/emailHelper");
const crypto = require("crypto");

const authController = {
  // --- AUTHENTICATION ---
  register: async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đủ họ tên, email và mật khẩu." });
      }
      const existingUser = await AuthModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ success: false, message: "Email này đã được sử dụng." });
      }
      const verificationToken = crypto.randomInt(100000, 999999).toString();
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const { userId } = await AuthModel.createUser({ ...req.body, verificationToken, otpExpiresAt });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h2 style="color: #ec4899; text-align: center;">Chào mừng bạn đến với Mom & Baby! 🌸</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất, vui lòng sử dụng mã OTP gồm 6 chữ số dưới đây để xác thực:</p>
          <div style="text-align: center; margin: 40px 0;">
            <span style="background-color: #fce7f3; color: #db2777; padding: 15px 30px; font-size: 28px; font-weight: bold; letter-spacing: 8px; border-radius: 10px; border: 2px dashed #fbcfe8;">${verificationToken}</span>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">Đây là email tự động, vui lòng không trả lời email này.</p>
        </div>
      `;
      await sendEmail(email, "Xác thực tài khoản Mom & Baby", emailHtml);
      res.status(201).json({ success: true, message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.", data: { userId } });
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { email, otp } = req.body; 
      if (!email || !otp) return res.status(400).json({ success: false, message: "Vui lòng cung cấp email và mã OTP." });
      const isVerified = await AuthModel.verifyEmail(email, otp);
      if (isVerified) {
        return res.status(200).json({ success: true, message: "Xác thực tài khoản thành công!" });
      } else {
        return res.status(400).json({ success: false, message: "Mã OTP không hợp lệ hoặc đã hết hạn." });
      }
    } catch (error) {
      console.error("Lỗi xác thực email:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ success: false, message: "Vui lòng nhập đủ email và mật khẩu." });
      const user = await AuthModel.findUserByEmail(email);
      if (!user) return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không chính xác." });
      if (!user.is_verified) return res.status(403).json({ success: false, message: "Vui lòng xác thực email trước khi đăng nhập." });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không chính xác." });
      if (user.status === 'bi_khoa') return res.status(403).json({ success: false, message: "Tài khoản của bạn đã bị khóa." });

      const payload = { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role_id: user.role_id,
        khach_hang_id: user.khach_hang_id // Thêm khach_hang_id vào payload
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 24 * 60 * 60 * 1000
      });
      res.status(200).json({ success: true, message: "Đăng nhập thành công!", user: payload, token });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
    }
  },

  logout: async (req, res) => {
    res.clearCookie("token", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax" 
    });
    res.status(200).json({ success: true, message: "Đăng xuất thành công!" });
  },

  getProfile: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: "Không tìm thấy thông tin phiên đăng nhập." });
      }

      console.log("Fetching profile for userId:", req.user?.id);
      const profile = await AuthModel.getUserProfile(req.user.id);
      
      if (!profile) {
        console.warn("Profile not found for userId:", req.user?.id);
        // Trả về 401 thay vì 404 để Frontend biết là session không còn hợp lệ và yêu cầu login lại
        return res.status(401).json({ success: false, message: "Phiên đăng nhập không hợp lệ hoặc người dùng đã bị xóa." });
      }

      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      console.error("Lỗi lấy hồ sơ:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, message: "Vui lòng nhập email." });
      const user = await AuthModel.findUserByEmail(email);
      if (!user) return res.status(404).json({ success: false, message: "Email không tồn tại trong hệ thống." });
      const resetToken = crypto.randomInt(100000, 999999).toString();
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await AuthModel.savePasswordResetToken(email, resetToken, otpExpiresAt);
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h2 style="color: #ec4899; text-align: center;">Khôi phục mật khẩu Mom & Baby 🌸</h2>
          <p>Bạn vừa yêu cầu khôi phục mật khẩu. Vui lòng sử dụng mã OTP dưới đây để đặt lại mật khẩu của bạn:</p>
          <div style="text-align: center; margin: 40px 0;">
            <span style="background-color: #fce7f3; color: #db2777; padding: 15px 30px; font-size: 28px; font-weight: bold; letter-spacing: 8px; border-radius: 10px; border: 2px dashed #fbcfe8;">${resetToken}</span>
          </div>
          <p style="color: red; text-align: center; font-size: 14px;">Lưu ý: Mã OTP này có giá trị sử dụng 1 lần. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        </div>
      `;
      await sendEmail(email, "Khôi phục mật khẩu tài khoản", emailHtml);
      res.status(200).json({ success: true, message: "Mã OTP đã được gửi đến email của bạn." });
    } catch (error) {
      console.error("Lỗi quên mật khẩu:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: "Vui lòng nhập đủ thông tin." });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      const isUpdated = await AuthModel.updatePasswordWithToken(email, otp, hashedPassword);
      if (isUpdated) {
        res.status(200).json({ success: true, message: "Mật khẩu đã được đặt lại thành công!" });
      } else {
        res.status(400).json({ success: false, message: "Mã OTP không hợp lệ hoặc sai email." });
      }
    } catch (error) {
      console.error("Lỗi đặt lại mật khẩu:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
    }
  },

  resendOTP: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, message: "Vui lòng cung cấp email." });
      const user = await AuthModel.findUserByEmail(email);
      if (!user) return res.status(404).json({ success: false, message: "Email không tồn tại." });
      if (user.is_verified) return res.status(400).json({ success: false, message: "Tài khoản này đã được xác thực." });
      const newOTP = crypto.randomInt(100000, 999999).toString();
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await AuthModel.updateVerificationToken(email, newOTP, otpExpiresAt);
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h2 style="color: #ec4899; text-align: center;">Mã xác thực mới Mom & Baby! 🌸</h2>
          <p>Bạn vừa yêu cầu gửi lại mã xác thực. Vui lòng sử dụng mã OTP dưới đây để hoàn tất xác thực tài khoản:</p>
          <div style="text-align: center; margin: 40px 0;">
            <span style="background-color: #fce7f3; color: #db2777; padding: 15px 30px; font-size: 28px; font-weight: bold; letter-spacing: 8px; border-radius: 10px; border: 2px dashed #fbcfe8;">${newOTP}</span>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        </div>
      `;
      await sendEmail(email, "Mã xác thực mới từ Mom & Baby", emailHtml);
      res.status(200).json({ success: true, message: "Mã OTP mới đã được gửi đến email của bạn." });
    } catch (error) {
      console.error("Lỗi gửi lại OTP:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
    }
  },

  // --- USER MANAGEMENT (ADMIN) ---
  getRoles: async (req, res) => {
    try {
      const [roles] = await require("../configs/db").query("SELECT id, name FROM roles ORDER BY id ASC");
      res.status(200).json({ success: true, data: roles });
    } catch (error) {
      console.error("Lỗi lấy danh sách vai trò:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  getCustomers: async (req, res) => {
    try {
      const customers = await AuthModel.getAllCustomers();
      res.status(200).json({ success: true, data: customers });
    } catch (error) {
      console.error("Lỗi lấy danh sách khách hàng:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await AuthModel.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error("Lỗi lấy danh sách người dùng:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  createUser: async (req, res) => {
    try {
      const newId = await AuthModel.adminCreateUser(req.body);
      res.status(201).json({ success: true, message: "Tạo tài khoản thành công", data: { id: newId } });
    } catch (error) {
      console.error("Lỗi tạo tài khoản:", error);
      res.status(500).json({ success: false, message: "Lỗi tạo tài khoản" });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const requesterRole = req.user.role_id;

      // Nếu là quản lý (role_id = 4), không được sửa tài khoản admin (role_id = 1)
      if (requesterRole === 4) {
        const targetUser = await AuthModel.getUserProfile(id);
        if (targetUser && targetUser.role_id === 1) {
          return res.status(403).json({ success: false, message: "Quản lý không có quyền chỉnh sửa tài khoản Admin." });
        }
      }

      const affectedRows = await AuthModel.updateUser(id, req.body);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      res.status(200).json({ success: true, message: "Cập nhật tài khoản thành công" });
    } catch (error) {
      console.error("Lỗi cập nhật tài khoản:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id;

      const userPassword = await AuthModel.getPassword(userId);
      const isMatch = await bcrypt.compare(oldPassword, userPassword);

      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Mật khẩu cũ không chính xác." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await AuthModel.updatePassword(userId, hashedPassword);
      res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  updateAvatar: async (req, res) => {
    try {
      console.log("Request file:", req.file);
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Vui lòng chọn một file ảnh." });
      }

      const userId = req.user.id;
      console.log("Updating avatar for user:", userId);
      
      // Trả về đường dẫn tương đối để Frontend tự ghép host, hoặc dùng full URL linh hoạt
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      const fullUrl = `${req.protocol}://${req.get('host')}${avatarPath}`;
      console.log("Avatar URL:", fullUrl);

      await AuthModel.updateAvatar(userId, fullUrl);
      res.status(200).json({ 
        success: true, 
        message: "Cập nhật ảnh đại diện thành công!",
        avatarUrl: fullUrl
      });
    } catch (error) {
      console.error("Lỗi cập nhật ảnh đại diện:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ: " + error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, phone } = req.body;
      
      const affectedRows = await AuthModel.updateUser(userId, { name, phone });
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      
      res.status(200).json({ success: true, message: "Cập nhật thông tin thành công" });
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const requesterRole = req.user.role_id;

      // Nếu là quản lý (role_id = 4), không được xóa tài khoản admin (role_id = 1)
      if (requesterRole === 4) {
        const targetUser = await AuthModel.getUserProfile(id);
        if (targetUser && targetUser.role_id === 1) {
          return res.status(403).json({ success: false, message: "Quản lý không có quyền xóa tài khoản Admin." });
        }
      }

      const affectedRows = await AuthModel.deleteUser(id);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      res.status(200).json({ success: true, message: "Xóa tài khoản thành công" });
    } catch (error) {
      console.error("Lỗi xóa tài khoản:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  updateUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const affectedRows = await AuthModel.updateStatus(id, status);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công" });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái người dùng:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  }
};

module.exports = authController;