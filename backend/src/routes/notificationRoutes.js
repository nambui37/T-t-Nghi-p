const express = require("express");
const router = express.Router();
const NotificationModel = require("../models/notificationModel");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware.verifyToken, async (req, res) => {
  try {
    const notifications = await NotificationModel.getByUserId(req.user.id);
    const unreadCount = await NotificationModel.getUnreadCount(req.user.id);
    res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/read", authMiddleware.verifyToken, async (req, res) => {
  try {
    await NotificationModel.markAsRead(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
