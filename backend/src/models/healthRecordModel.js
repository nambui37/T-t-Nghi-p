const db = require("../configs/db");

const HealthRecordModel = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT hs.*, u.name as customer_name, u.phone
      FROM ho_so_suc_khoe hs
      JOIN khach_hang kh ON hs.khach_hang_id = kh.id
      JOIN users u ON kh.user_id = u.id
      ORDER BY hs.id DESC
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(`
      SELECT hs.*, u.name as customer_name, u.phone, kh.dia_chi, kh.ghi_chu as kh_ghi_chu
      FROM ho_so_suc_khoe hs
      JOIN khach_hang kh ON hs.khach_hang_id = kh.id
      JOIN users u ON kh.user_id = u.id
      WHERE hs.id = ?
    `, [id]);
    
    if (rows.length === 0) return null;
    const record = rows[0];

    // Bảng em_be đã bị xóa, tạm thời gán mảng rỗng để tránh lỗi phía Frontend
    record.babies = [];

    // Lấy danh sách lịch hẹn và lộ trình
    const [appointments] = await db.query(`
      SELECT lh.*, gdv.name as service_name
      FROM lich_hen lh
      JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
      WHERE lh.khach_hang_id = ?
      ORDER BY lh.created_at DESC
    `, [record.khach_hang_id]);
    
    // Với mỗi lịch hẹn, lấy chi tiết ca làm (ai làm, ngày nào)
    for (let apt of appointments) {
      const [shifts] = await db.query(`
        SELECT ct.*, u.name as nhan_vien_name
        FROM chi_tiet_ca_lam ct
        LEFT JOIN nhan_vien nv ON nv.id = ct.nhan_vien_id
        LEFT JOIN users u ON u.id = nv.user_id
        WHERE ct.lich_hen_id = ?
        ORDER BY ct.ngay_lam ASC
      `, [apt.id]);
      apt.shifts = shifts;

      const [payments] = await db.query("SELECT * FROM thanh_toan WHERE lich_hen_id = ?", [apt.id]);
      apt.payments = payments;
    }
    
    record.appointments = appointments;
    return record;
  },

  getByCustomerId: async (customerId) => {
    const [rows] = await db.query(`
      SELECT hs.*, u.name as customer_name, u.phone
      FROM ho_so_suc_khoe hs
      JOIN khach_hang kh ON hs.khach_hang_id = kh.id
      JOIN users u ON kh.user_id = u.id
      WHERE hs.khach_hang_id = ?
    `, [customerId]);
    return rows[0];
  },

  create: async (data) => {
    const { khach_hang_id, thong_tin } = data;
    const [result] = await db.query(
      "INSERT INTO ho_so_suc_khoe (khach_hang_id, thong_tin) VALUES (?, ?)",
      [khach_hang_id, thong_tin]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { thong_tin } = data;
    const [result] = await db.query(
      "UPDATE ho_so_suc_khoe SET thong_tin = ? WHERE id = ?",
      [thong_tin, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM ho_so_suc_khoe WHERE id = ?", [id]);
    return result.affectedRows;
  }
};

module.exports = HealthRecordModel;
