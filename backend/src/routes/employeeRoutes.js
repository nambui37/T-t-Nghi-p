const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
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

// Tất cả các route nhân viên đều cần quyền Admin
router.get("/", authMiddleware.verifyAdmin, employeeController.getAll);
router.get("/salaries", authMiddleware.verifyAdmin, employeeController.getSalaries);
router.get("/:id", authMiddleware.verifyAdmin, employeeController.getById);
router.post(
  "/",
  authMiddleware.verifyAdmin,
  [
    body("user_id").notEmpty().withMessage("Vui lòng chọn người dùng"),
    body("chuc_vu").notEmpty().withMessage("Chức vụ không được để trống"),
  ],
  validate,
  employeeController.create
);
router.put(
  "/:id",
  authMiddleware.verifyAdmin,
  [
    body("chuc_vu").notEmpty().withMessage("Chức vụ không được để trống"),
  ],
  validate,
  employeeController.update
);
router.delete("/:id", authMiddleware.verifyAdmin, employeeController.delete);

module.exports = router;
