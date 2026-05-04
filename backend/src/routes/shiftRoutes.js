const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shiftController");
const authMiddleware = require("../middlewares/authMiddleware");

// Các route dành cho nhân viên (đã đăng nhập)
router.get("/available", authMiddleware.verifyToken, shiftController.getAvailable);
router.post("/accept", authMiddleware.verifyToken, shiftController.accept);
router.post("/check-in", authMiddleware.verifyToken, shiftController.checkIn);
router.post("/start-service", authMiddleware.verifyToken, shiftController.startService);
router.post("/check-out", authMiddleware.verifyToken, shiftController.checkOut);

module.exports = router;
