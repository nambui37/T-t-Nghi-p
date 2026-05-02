const express = require("express");
const router = express.Router();
const healthRecordController = require("../controllers/healthRecordController");
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

// Tất cả các route hồ sơ sức khỏe đều cần quyền Admin hoặc Staff
router.get("/", authMiddleware.verifyAdminOrStaff, healthRecordController.getAll);
router.get("/:id", authMiddleware.verifyAdminOrStaff, healthRecordController.getById);
router.post(
  "/",
  authMiddleware.verifyAdminOrStaff,
  [
    body("khach_hang_id").notEmpty().withMessage("Khách hàng không được để trống"),
    body("thong_tin").notEmpty().withMessage("Thông tin hồ sơ không được để trống"),
  ],
  validate,
  healthRecordController.create
);
router.put(
  "/:id",
  authMiddleware.verifyAdminOrStaff,
  [
    body("thong_tin").notEmpty().withMessage("Thông tin hồ sơ không được để trống"),
  ],
  validate,
  healthRecordController.update
);
router.delete("/:id", authMiddleware.verifyAdminOrStaff, healthRecordController.delete);

module.exports = router;
