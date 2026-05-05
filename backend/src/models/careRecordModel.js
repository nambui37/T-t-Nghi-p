const db = require("../configs/db");
const { ensureNhanVienForUser } = require("../utils/nhanVienRef");

const CareRecordModel = {
  create: async (data) => {
    const { lich_hen_id, nhan_vien_id, ca_lam_id, noi_dung_cham_soc, tinh_trang_me, tinh_trang_be, ghi_chu, hinh_anh } = data;
    const nvPk = nhan_vien_id ? await ensureNhanVienForUser(db, nhan_vien_id) : null;
    const [result] = await db.query(
      "INSERT INTO care_records (lich_hen_id, nhan_vien_id, ca_lam_id, noi_dung_cham_soc, tinh_trang_me, tinh_trang_be, ghi_chu, hinh_anh) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [lich_hen_id, nvPk, ca_lam_id, noi_dung_cham_soc, tinh_trang_me, tinh_trang_be, ghi_chu, hinh_anh]
    );
    return result.insertId;
  },

  getByAppointmentId: async (appointmentId) => {
    const [rows] = await db.query(
      `SELECT cr.*, u.name as nhan_vien_name
       FROM care_records cr
       LEFT JOIN nhan_vien nv ON nv.id = cr.nhan_vien_id
       LEFT JOIN users u ON u.id = nv.user_id
       WHERE cr.lich_hen_id = ?
       ORDER BY cr.ngay_thuc_hien DESC`,
      [appointmentId]
    );
    return rows;
  },

  update: async (id, data) => {
    const { noi_dung_cham_soc, tinh_trang_me, tinh_trang_be, ghi_chu, hinh_anh } = data;
    const [result] = await db.query(
      "UPDATE care_records SET noi_dung_cham_soc = ?, tinh_trang_me = ?, tinh_trang_be = ?, ghi_chu = ?, hinh_anh = ? WHERE id = ?",
      [noi_dung_cham_soc, tinh_trang_me, tinh_trang_be, ghi_chu, hinh_anh, id]
    );
    return result.affectedRows;
  }
};

module.exports = CareRecordModel;
