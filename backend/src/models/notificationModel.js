const db = require("../configs/db");

const NotificationModel = {
  create: async (data) => {
    const { user_id, title, message, type } = data;
    const [result] = await db.query(
      "INSERT INTO thong_bao (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [user_id, title, message, type || 'system']
    );
    return result.insertId;
  },
  getByUserId: async (userId) => {
    const [rows] = await db.query(
      "SELECT * FROM thong_bao WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [userId]
    );
    return rows;
  },
  markAsRead: async (id) => {
    await db.query("UPDATE thong_bao SET is_read = TRUE WHERE id = ?", [id]);
  },
  getUnreadCount: async (userId) => {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM thong_bao WHERE user_id = ? AND is_read = FALSE",
      [userId]
    );
    return rows[0].count;
  }
};

module.exports = NotificationModel;
