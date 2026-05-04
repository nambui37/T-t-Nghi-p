const express = require("express");
const authRouter = express.Router();
const userRouter = express.Router();
const authController = require("../controllers/authController");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Middleware xử lý lỗi validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ==========================================
// 1. CÁC ROUTE XÁC THỰC (PUBLIC) - Prefix: /api/auth
// ==========================================

// POST /api/auth/register
authRouter.post(
  "/register",
  [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("password").isLength({ min: 6 }).withMessage("Mật khẩu phải từ 6 ký tự"),
    body("name").notEmpty().withMessage("Họ tên không được để trống"),
  ],
  validate,
  authController.register
);

// POST /api/auth/verify-otp (Đổi sang POST để nhận JSON từ Frontend)
authRouter.post("/verify-otp", authController.verifyEmail);

// POST /api/auth/login
authRouter.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("password").notEmpty().withMessage("Mật khẩu không được để trống"),
  ],
  validate,
  authController.login
);

// GET /api/auth/profile
authRouter.get("/profile", authMiddleware.verifyToken, authController.getProfile);

// POST /api/auth/forgot-password
authRouter.post("/forgot-password", authController.forgotPassword);

// POST /api/auth/reset-password
authRouter.post("/reset-password", authController.resetPassword);

// POST /api/auth/resend-otp
authRouter.post("/resend-otp", authController.resendOTP);

// POST /api/auth/logout
authRouter.post("/logout", authController.logout);

// POST /api/auth/change-password
authRouter.post(
  "/change-password",
  authMiddleware.verifyToken,
  [
    body("oldPassword").notEmpty().withMessage("Mật khẩu cũ không được để trống"),
    body("newPassword").isLength({ min: 6 }).withMessage("Mật khẩu mới phải từ 6 ký tự"),
  ],
  validate,
  authController.changePassword
);

// POST /api/auth/update-avatar
authRouter.post(
  "/update-avatar",
  authMiddleware.verifyToken,
  upload.single("avatar"),
  authController.updateAvatar
);

// PUT /api/auth/profile
authRouter.put(
  "/profile",
  authMiddleware.verifyToken,
  [
    body("name").notEmpty().withMessage("Họ tên không được để trống"),
    body("phone").notEmpty().withMessage("Số điện thoại không được để trống"),
  ],
  validate,
  authController.updateProfile
);

// ==========================================
// 2. CÁC ROUTE QUẢN LÝ TÀI KHOẢN (ADMIN) - Prefix: /api/users
// ==========================================

// Sử dụng verifyToken thay vì verifyAdmin để tài khoản Quản lý (role_id = 4) cũng tải được danh sách vai trò
userRouter.get("/roles", authMiddleware.verifyToken, authController.getRoles);
userRouter.get("/customers", authMiddleware.verifyAdmin, authController.getCustomers);
userRouter.get("/", authMiddleware.verifyAdmin, authController.getAllUsers);
userRouter.post(
  "/",
  authMiddleware.verifyAdmin,
  [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("password").isLength({ min: 6 }).withMessage("Mật khẩu phải từ 6 ký tự"),
    body("name").notEmpty().withMessage("Họ tên không được để trống"),
    body("phone").notEmpty().withMessage("Số điện thoại không được để trống"),
  ],
  validate,
  authController.createUser
);
userRouter.put(
  "/:id",
  authMiddleware.verifyAdmin,
  [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("name").notEmpty().withMessage("Họ tên không được để trống"),
  ],
  validate,
  authController.updateUser
);
userRouter.delete("/:id", authMiddleware.verifyAdmin, authController.deleteUser);
userRouter.put("/:id/status", authMiddleware.verifyAdmin, authController.updateUserStatus);

module.exports = { authRouter, userRouter };
