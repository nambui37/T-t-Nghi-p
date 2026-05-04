const db = require("../configs/db");
const NotificationModel = require("./notificationModel");

const ShiftModel = {
  // Lấy danh sách các lịch hẹn chưa đủ 2 nhân viên nhận hoặc lịch hẹn mình đã nhận
  getAvailableShifts: async (nhanVienId) => {
    const query = `
      SELECT lh.*, gdv.name as service_name, gdv.gia,
             u.name as customer_name, u.phone as customer_phone,
             kh.dia_chi as customer_address,
             ct.id as ca_lam_id, ct.status as ca_lam_status,
             (SELECT COUNT(*) FROM lich_hen_nhan_vien WHERE lich_hen_id = lh.id) as current_staff_count,
             EXISTS(SELECT 1 FROM lich_hen_nhan_vien WHERE lich_hen_id = lh.id AND nhan_vien_id = ?) as is_accepted_by_me
      FROM lich_hen lh
      JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
      LEFT JOIN khach_hang kh ON lh.khach_hang_id = kh.id
      LEFT JOIN users u ON kh.user_id = u.id
      LEFT JOIN chi_tiet_ca_lam ct ON lh.id = ct.lich_hen_id AND ct.nhan_vien_id = ?
      WHERE lh.status IN ('da_xac_nhan', 'dang_thuc_hien')
      HAVING (current_staff_count < 2 OR is_accepted_by_me = 1)
      ORDER BY lh.ngay_bat_dau ASC
    `;
    const [rows] = await db.query(query, [nhanVienId, nhanVienId]);
    return rows;
  },

  // Nhân viên nhận lịch hẹn
  acceptShift: async (nhanVienId, lichHenId) => {
    // 1. Kiểm tra xem đã nhận chưa
    const [existing] = await db.query(
      "SELECT 1 FROM lich_hen_nhan_vien WHERE lich_hen_id = ? AND nhan_vien_id = ?",
      [lichHenId, nhanVienId],
    );
    if (existing.length > 0) return 0;

    // 2. Kiểm tra số lượng nhân viên hiện tại (Tối đa 2)
    const [countRes] = await db.query(
      "SELECT COUNT(*) as count FROM lich_hen_nhan_vien WHERE lich_hen_id = ?",
      [lichHenId],
    );
    if (countRes[0].count >= 2) return 0;

    // 3. Thêm vào bảng junction
    const [result] = await db.query(
      "INSERT INTO lich_hen_nhan_vien (lich_hen_id, nhan_vien_id) VALUES (?, ?)",
      [lichHenId, nhanVienId],
    );

    // 4. Cập nhật hoặc tạo bản ghi trong chi_tiet_ca_lam với status 'da_nhan'
    const [ctRows] = await db.query(
      "SELECT id FROM chi_tiet_ca_lam WHERE lich_hen_id = ? AND nhan_vien_id = ?",
      [lichHenId, nhanVienId]
    );

    if (ctRows.length > 0) {
      await db.query(
        "UPDATE chi_tiet_ca_lam SET status = 'da_nhan' WHERE id = ?",
        [ctRows[0].id]
      );
    } else {
      await db.query(
        "INSERT INTO chi_tiet_ca_lam (lich_hen_id, nhan_vien_id, ngay_lam, status) VALUES (?, ?, CURDATE(), 'da_nhan')",
        [lichHenId, nhanVienId]
      );
    }

    return result.affectedRows;
  },

  // Check-in ca làm việc
  checkIn: async (nhanVienId, lichHenId, toaDo) => {
    // Kiểm tra xem đã check-in chưa
    const [existing] = await db.query(
      "SELECT id FROM chi_tiet_ca_lam WHERE lich_hen_id = ? AND nhan_vien_id = ? AND status = 'check_in'",
      [lichHenId, nhanVienId],
    );
    if (existing.length > 0) return existing[0].id;

    // Cập nhật bản ghi trong chi_tiet_ca_lam
    const [result] = await db.query(
      `UPDATE chi_tiet_ca_lam 
       SET check_in = NOW(), toa_do_check_in = ?, status = 'check_in' 
       WHERE lich_hen_id = ? AND nhan_vien_id = ? AND (status = 'da_nhan' OR status = 'cho_nhan')`,
      [toaDo, lichHenId, nhanVienId],
    );

    // Cập nhật trạng thái lịch hẹn
    await db.query(
      "UPDATE lich_hen SET status = 'dang_thuc_hien' WHERE id = ?",
      [lichHenId],
    );

    // THÔNG BÁO CHO ĐỒNG NGHIỆP CÙNG CA
    try {
      const [colleagueRows] = await db.query(
        "SELECT lhnv.nhan_vien_id as user_id, u.name FROM lich_hen_nhan_vien lhnv JOIN users u ON lhnv.nhan_vien_id = u.id WHERE lhnv.lich_hen_id = ? AND lhnv.nhan_vien_id != ?",
        [lichHenId, nhanVienId]
      );
      
      if (colleagueRows.length > 0) {
        const [me] = await db.query("SELECT name FROM users WHERE id = ?", [nhanVienId]);
        for (let col of colleagueRows) {
          await NotificationModel.create({
            user_id: col.user_id,
            title: "Đồng nghiệp đã bắt đầu",
            message: `${me[0]?.name || 'Đồng nghiệp'} đã check-in bắt đầu ca làm việc tại lịch hẹn #${lichHenId}.`,
            type: "check_in"
          });
        }
      }
    } catch (err) {
      console.error("Lỗi gửi thông báo check-in:", err);
    }

    return result.insertId;
  },

  // Bắt đầu thực hiện dịch vụ
  startService: async (nhanVienId, caLamId) => {
    const [result] = await db.query(
      "UPDATE chi_tiet_ca_lam SET status = 'dang_thuc_hien' WHERE id = ? AND nhan_vien_id = ?",
      [caLamId, nhanVienId]
    );
    return result.affectedRows;
  },

  // Check-out ca làm việc
  checkOut: async (nhanVienId, caLamId, ghiChu) => {
    const numericNhanVienId = parseInt(nhanVienId);
    const numericCaLamId = parseInt(caLamId);

    // 1. Cập nhật bảng chi_tiet_ca_lam
    const [result] = await db.query(
      "UPDATE chi_tiet_ca_lam SET check_out = NOW(), status = 'hoan_thanh', ghi_chu = ? WHERE id = ? AND nhan_vien_id = ?",
      [ghiChu, numericCaLamId, numericNhanVienId],
    );

    if (result.affectedRows > 0) {
      // 2. Tìm lịch hẹn tương ứng
      const [shiftRows] = await db.query(
        "SELECT lich_hen_id FROM chi_tiet_ca_lam WHERE id = ?",
        [numericCaLamId],
      );
      if (shiftRows.length > 0) {
        const lichHenId = shiftRows[0].lich_hen_id;

        // 3. Kiểm tra xem tất cả nhân viên đã hoàn thành chưa (nếu có gán nhiều người)
        const [totalStaff] = await db.query(
          "SELECT COUNT(*) as count FROM lich_hen_nhan_vien WHERE lich_hen_id = ?",
          [lichHenId],
        );
        const [completedStaff] = await db.query(
          "SELECT COUNT(DISTINCT nhan_vien_id) as count FROM chi_tiet_ca_lam WHERE lich_hen_id = ? AND status = 'hoan_thanh'",
          [lichHenId],
        );

        // Nếu tất cả nhân viên đã hoàn thành ca của mình
        if (completedStaff[0].count >= totalStaff[0].count && totalStaff[0].count > 0) {
          await db.query(
            "UPDATE lich_hen SET status = 'hoan_thanh', ngay_ket_thuc_thuc_te = CURDATE() WHERE id = ?",
            [lichHenId],
          );

          // KÍCH HOẠT LOGIC TỰ ĐỘNG (Doanh thu & Hồ sơ sức khỏe)
          const [aptRows] = await db.query(
            "SELECT lh.*, kh.id as kh_id, gdv.gia FROM lich_hen lh LEFT JOIN khach_hang kh ON lh.khach_hang_id = kh.id LEFT JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id WHERE lh.id = ?",
            [lichHenId]
          );
          if (aptRows.length > 0) {
            const apt = aptRows[0];
            if (apt.kh_id) {
              const [recordRows] = await db.query("SELECT id FROM ho_so_suc_khoe WHERE khach_hang_id = ?", [apt.kh_id]);
              if (recordRows.length === 0) {
                await db.query("INSERT INTO ho_so_suc_khoe (khach_hang_id, thong_tin) VALUES (?, ?)", [apt.kh_id, "Hồ sơ được tạo tự động khi hoàn thành lịch hẹn"]);
              }
            }
            if (apt.trang_thai_thanh_toan === 'da_thanh_toan_het') {
              const [payRows] = await db.query("SELECT id FROM thanh_toan WHERE lich_hen_id = ?", [lichHenId]);
              if (payRows.length === 0) {
                await db.query("INSERT INTO thanh_toan (lich_hen_id, so_tien, ngay_thanh_toan) VALUES (?, ?, NOW())", [lichHenId, apt.gia]);
              }
            }
          }
        }
      }
    }

    return result.affectedRows;
  },

  // Lấy lịch sử ca làm của nhân viên
  getEmployeeHistory: async (nhanVienId) => {
    const query = `
      SELECT ct.*, lh.guest_name, gdv.name as service_name
      FROM chi_tiet_ca_lam ct
      JOIN lich_hen lh ON ct.lich_hen_id = lh.id
      JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
      WHERE ct.nhan_vien_id = ?
      ORDER BY ct.ngay_lam DESC
    `;
    const [rows] = await db.query(query, [nhanVienId]);
    return rows;
  }
};

module.exports = ShiftModel;
