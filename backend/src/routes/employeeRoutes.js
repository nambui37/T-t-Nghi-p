const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middlewares/authMiddleware");

// Lấy danh sách nhân viên và bảng lương (cần quyền Admin/Quản lý)
router.get("/", authMiddleware.verifyAdmin, employeeController.getAll);
router.get("/salaries", authMiddleware.verifyAdmin, employeeController.getSalaries);

module.exports = router;
