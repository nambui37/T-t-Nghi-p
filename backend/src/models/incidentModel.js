const db = require("../configs/db");
const NotificationModel = require("./notificationModel");

const IncidentModel = {
  create: async (data) => {
    const { lich_hen_id, nhan_vien_id, ca_lam_id, noi_dung, muc_do } = data;
    const [result] = await db.query(
      "INSERT INTO su_co (lich_hen_id, nhan_vien_id, ca_lam_id, noi_dung, muc_do, trang_thai) VALUES (?, ?, ?, ?, ?, 'cho_xu_ly')",
      [lich_hen_id, nhan_vien_id, ca_lam_id, noi_dung, muc_do]
    );

    // Cập nhật trạng thái ca làm việc
    if (ca_lam_id) {
      await db.query("UPDATE chi_tiet_ca_lam SET status = 'bao_loi' WHERE id = ?", [ca_lam_id]);
    }

    // Thông báo cho Admin
    try {
      const [admins] = await db.query("SELECT id FROM users WHERE role_id = 1");
      for (let admin of admins) {
        await NotificationModel.create({
          user_id: admin.id,
          title: "🚨 BÁO CÁO SỰ CỐ MỚI",
          message: `Nhân viên báo cáo sự cố tại lịch hẹn #${lich_hen_id}: ${noi_dung}`,
          type: "su_co"
        });
      }
    } catch (err) {
      console.error("Lỗi gửi thông báo sự cố:", err);
    }

    return result.insertId;
  },

  getAll: async () => {
    const [rows] = await db.query(`
      SELECT sc.*, u.name as nhan_vien_name, lh.guest_name, lh.guest_phone 
      FROM su_co sc
      LEFT JOIN users u ON sc.nhan_vien_id = u.id
      LEFT JOIN lich_hen lh ON sc.lich_hen_id = lh.id
      ORDER BY sc.created_at DESC
    `);
    return rows;
  },

  updateStatus: async (id, status, admin_ghi_chu) => {
    const [result] = await db.query(
      "UPDATE su_co SET trang_thai = ?, admin_ghi_chu = ? WHERE id = ?",
      [status, admin_ghi_chu, id]
    );
    return result.affectedRows;
  }
};

module.exports = IncidentModel;
