const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middlewares/authMiddleware");

const { body, validationResult } = require("express-validator");

// Middleware xử lý lỗi validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// GET yêu cầu đăng nhập (để xem lịch của mình hoặc admin xem hết)
router.get("/", authMiddleware.verifyToken, appointmentController.getAll);

// POST tạo lịch hẹn: Không bắt buộc đăng nhập
router.post(
  "/",
  (req, res, next) => {
    // Nếu có header Authorization thì mới verify token, nếu không thì đi tiếp như khách vãng lai
    if (req.headers.authorization) {
      return authMiddleware.verifyToken(req, res, next);
    }
    next();
  },
  [
    body("guest_name").custom((value, { req }) => {
      if (!req.body.user_id && !value) {
        throw new Error("Tên khách vãng lai không được để trống");
      }
      return true;
    }),
    body("guest_phone").custom((value, { req }) => {
      if (!req.body.user_id && !value) {
        throw new Error("Số điện thoại không được để trống");
      }
      return true;
    }),
    body("goi_id").notEmpty().withMessage("Vui lòng chọn gói dịch vụ"),
    body("ngay_bat_dau").isDate().withMessage("Ngày bắt đầu không hợp lệ"),
    body("ngay_ket_thuc").isDate().withMessage("Ngày kết thúc không hợp lệ"),
  ],
  validate,
  appointmentController.create
);

router.delete("/:id", authMiddleware.verifyToken, appointmentController.delete);

// Hủy lịch hẹn (dành cho khách hàng)
router.put("/:id/cancel", authMiddleware.verifyToken, appointmentController.cancel);

// Cập nhật trạng thái lịch hẹn
router.put(
  "/:id/status",
  authMiddleware.verifyToken,
  [
    body("status").notEmpty().withMessage("Trạng thái không được để trống"),
  ],
  validate,
  appointmentController.updateStatus
);

// Route cho nhân viên ghi chú
router.put(
  "/:id/note",
  authMiddleware.verifyToken,
  [
    body("ghi_chu").notEmpty().withMessage("Nội dung ghi chú không được để trống"),
  ],
  validate,
  appointmentController.addNote
);

// Route phân việc cho nhân viên (Admin/Quản lý)
router.put(
  "/:id/assign",
  authMiddleware.verifyToken,
  appointmentController.assignEmployee
);

module.exports = router;