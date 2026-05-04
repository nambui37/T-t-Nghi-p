const express = require("express");
const router = express.Router();
const db = require("../configs/db");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/history/:room", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { room } = req.params;
    const [rows] = await db.query(
      `SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.room = ?
       ORDER BY m.created_at ASC`,
      [room]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ success: false, message: "Lỗi lấy lịch sử chat" });
  }
});

module.exports = router;
