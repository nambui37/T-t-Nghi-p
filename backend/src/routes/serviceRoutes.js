const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");

// Middleware xử lý lỗi validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// GET /api/services
router.get("/", serviceController.getAll);
router.get("/:id", serviceController.getById);

// Các thao tác thay đổi dữ liệu cần quyền Admin
router.post(
  "/",
  authMiddleware.verifyAdmin,
  [
    body("name").notEmpty().withMessage("Tên dịch vụ không được để trống"),
    body("loai_id").isInt().withMessage("Loại dịch vụ không hợp lệ"),
    body("gia").isDecimal().withMessage("Giá dịch vụ phải là số"),
  ],
  validate,
  serviceController.create
);

router.put(
  "/:id",
  authMiddleware.verifyAdmin,
  [
    body("name").optional().notEmpty().withMessage("Tên dịch vụ không được để trống"),
    body("loai_id").optional().isInt().withMessage("Loại dịch vụ không hợp lệ"),
    body("gia").optional().isDecimal().withMessage("Giá dịch vụ phải là số"),
  ],
  validate,
  serviceController.update
);

router.delete("/:id", authMiddleware.verifyAdmin, serviceController.delete);

// --- STATS ROUTES ---
router.get("/dashboard/stats", authMiddleware.verifyAdmin, serviceController.getDashboardStats);
router.get("/revenue/stats", authMiddleware.verifyAdmin, serviceController.getRevenueStats);

module.exports = router;