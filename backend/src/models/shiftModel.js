const db = require("../configs/db");
const NotificationModel = require("./notificationModel");
const { ensureNhanVienForUser } = require("../utils/nhanVienRef");
const { findOverlappingAppointmentForNhanVien } = require("../utils/scheduleConflict");

const STAFF_ROLE_IDS = [2, 4, 5, 6, 7, 8];

const ShiftModel = {
  // Lấy danh sách các lịch hẹn chưa đủ 2 nhân viên nhận hoặc lịch hẹn mình đã nhận
  getAvailableShifts: async (nhanVienId) => {
    const nvPk = await ensureNhanVienForUser(db, nhanVienId);
    // Một lịch nhiều ngày → chỉ join đúng MỘT dòng chi_tiet_ca_lam cần xử lý (ưu tiên ca đang làm / hôm nay / ngày gần nhất)
    const query = `
      SELECT lh.*, gdv.name as service_name, gdv.gia,
             u.name as customer_name, u.phone as customer_phone,
             kh.dia_chi as customer_address,
             ct.id as ca_lam_id, ct.status as ca_lam_status, ct.ngay_lam as ca_ngay_lam,
             (SELECT COUNT(*)
              FROM lich_hen_nhan_vien lhnv
              JOIN nhan_vien nvj ON nvj.id = lhnv.nhan_vien_id
              JOIN users us ON us.id = nvj.user_id
              WHERE lhnv.lich_hen_id = lh.id AND us.role_id IN (${STAFF_ROLE_IDS.join(",")})
             ) as current_staff_count,
             EXISTS(
               SELECT 1
               FROM lich_hen_nhan_vien lhnv
               JOIN nhan_vien nvj ON nvj.id = lhnv.nhan_vien_id
               JOIN users us ON us.id = nvj.user_id
               WHERE lhnv.lich_hen_id = lh.id
                 AND lhnv.nhan_vien_id = ?
                 AND us.role_id IN (${STAFF_ROLE_IDS.join(",")})
             ) as is_accepted_by_me
      FROM lich_hen lh
      JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
      LEFT JOIN khach_hang kh ON lh.khach_hang_id = kh.id
      LEFT JOIN users u ON kh.user_id = u.id
      LEFT JOIN chi_tiet_ca_lam ct ON ct.id = (
        SELECT c2.id FROM chi_tiet_ca_lam c2
        WHERE c2.lich_hen_id = lh.id AND c2.nhan_vien_id = ?
        ORDER BY
          (c2.status IN ('check_in', 'dang_thuc_hien')) DESC,
          (DATE(c2.ngay_lam) = CURDATE()) DESC,
          (c2.ngay_lam >= CURDATE() AND c2.status NOT IN ('hoan_thanh')) DESC,
          c2.ngay_lam ASC
        LIMIT 1
      )
      WHERE lh.status IN ('da_xac_nhan', 'dang_thuc_hien')
      HAVING (
        is_accepted_by_me = 1
        OR (
          current_staff_count < 2
          AND NOT EXISTS (
            SELECT 1 FROM lich_hen_nhan_vien lxo
            JOIN lich_hen lho ON lho.id = lxo.lich_hen_id
            WHERE lxo.nhan_vien_id = ?
              AND lho.id <> lh.id
              AND lho.status IN ('da_xac_nhan', 'dang_thuc_hien')
              AND DATE(lh.ngay_bat_dau) <= DATE(lho.ngay_ket_thuc)
              AND DATE(lho.ngay_bat_dau) <= DATE(lh.ngay_ket_thuc)
          )
        )
      )
      ORDER BY lh.ngay_bat_dau ASC
    `;
    const [rows] = await db.query(query, [nvPk, nvPk, nvPk]);
    return rows;
  },

  // Nhân viên nhận lịch hẹn
  acceptShift: async (nhanVienId, lichHenId) => {
    const nvPk = await ensureNhanVienForUser(db, nhanVienId);

    const [aptRows] = await db.query(
      "SELECT ngay_bat_dau, ngay_ket_thuc FROM lich_hen WHERE id = ?",
      [lichHenId],
    );
    if (!aptRows.length) return 0;

    const overlap = await findOverlappingAppointmentForNhanVien(
      db,
      nvPk,
      lichHenId,
      aptRows[0].ngay_bat_dau,
      aptRows[0].ngay_ket_thuc,
    );
    if (overlap) {
      throw new Error(
        "TRÙNG_LỊCH: Bạn đã có ca khác trùng khoảng thời gian này. Không thể nhận thêm.",
      );
    }

    // 1. Kiểm tra xem đã nhận chưa
    const [existing] = await db.query(
      `SELECT 1
       FROM lich_hen_nhan_vien lhnv
       JOIN nhan_vien nv ON nv.id = lhnv.nhan_vien_id
       JOIN users u ON u.id = nv.user_id
       WHERE lhnv.lich_hen_id = ? AND lhnv.nhan_vien_id = ? AND u.role_id IN (${STAFF_ROLE_IDS.join(",")})`,
      [lichHenId, nvPk],
    );
    if (existing.length > 0) return 0;

    // 2. Kiểm tra số lượng nhân viên hiện tại (Tối đa 2)
    const [countRes] = await db.query(
      `SELECT COUNT(*) as count
       FROM lich_hen_nhan_vien lhnv
       JOIN nhan_vien nv ON nv.id = lhnv.nhan_vien_id
       JOIN users u ON u.id = nv.user_id
       WHERE lhnv.lich_hen_id = ? AND u.role_id IN (${STAFF_ROLE_IDS.join(",")})`,
      [lichHenId],
    );
    if (countRes[0].count >= 2) return 0;

    // 3. Thêm vào bảng junction
    const [result] = await db.query(
      "INSERT INTO lich_hen_nhan_vien (lich_hen_id, nhan_vien_id) VALUES (?, ?)",
      [lichHenId, nvPk],
    );

    // 4. Cập nhật hoặc tạo bản ghi trong chi_tiet_ca_lam với status 'da_nhan'
    const [ctRows] = await db.query(
      "SELECT id FROM chi_tiet_ca_lam WHERE lich_hen_id = ? AND nhan_vien_id = ?",
      [lichHenId, nvPk]
    );

    if (ctRows.length > 0) {
      await db.query(
        "UPDATE chi_tiet_ca_lam SET status = 'da_nhan' WHERE id = ?",
        [ctRows[0].id]
      );
    } else {
      await db.query(
        "INSERT INTO chi_tiet_ca_lam (lich_hen_id, nhan_vien_id, ngay_lam, status) VALUES (?, ?, CURDATE(), 'da_nhan')",
        [lichHenId, nvPk]
      );
    }

    return result.affectedRows;
  },

  // Check-in ca làm việc
  checkIn: async (nhanVienId, lichHenId, toaDo) => {
    const nvPk = await ensureNhanVienForUser(db, nhanVienId);
    // Chỉ một ca/ngày: đã check-in cho đúng ngày làm hiện tại thì không check-in lại
    const [existing] = await db.query(
      "SELECT id FROM chi_tiet_ca_lam WHERE lich_hen_id = ? AND nhan_vien_id = ? AND status = 'check_in' AND DATE(ngay_lam) = CURDATE()",
      [lichHenId, nvPk],
    );
    if (existing.length > 0) return existing[0].id;

    // Chỉ cập nhật đúng dòng ngày làm = hôm nay (tránh gán cùng giờ vào mọi ngày trong gói nhiều ngày)
    const [result] = await db.query(
      `UPDATE chi_tiet_ca_lam 
       SET check_in = NOW(), toa_do_check_in = ?, status = 'check_in' 
       WHERE lich_hen_id = ? AND nhan_vien_id = ? AND (status = 'da_nhan' OR status = 'cho_nhan')
       AND DATE(ngay_lam) = CURDATE()`,
      [toaDo, lichHenId, nvPk],
    );

    if (result.affectedRows === 0) {
      throw new Error(
        "Không có ca làm cho ngày hôm nay trong lịch này (hoặc ca đã xử lý). Kiểm tra phân công và ngày trên máy chủ.",
      );
    }

    // Cập nhật trạng thái lịch hẹn
    await db.query(
      "UPDATE lich_hen SET status = 'dang_thuc_hien' WHERE id = ?",
      [lichHenId],
    );

    // THÔNG BÁO CHO ĐỒNG NGHIỆP CÙNG CA
    try {
      const [colleagueRows] = await db.query(
        `SELECT nv.user_id as user_id, u.name
         FROM lich_hen_nhan_vien lhnv
         JOIN nhan_vien nv ON nv.id = lhnv.nhan_vien_id
         JOIN users u ON u.id = nv.user_id
         WHERE lhnv.lich_hen_id = ? AND lhnv.nhan_vien_id != ?`,
        [lichHenId, nvPk]
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

    const [afterRow] = await db.query(
      "SELECT id FROM chi_tiet_ca_lam WHERE lich_hen_id = ? AND nhan_vien_id = ? AND status = 'check_in' AND DATE(ngay_lam) = CURDATE() LIMIT 1",
      [lichHenId, nvPk]
    );
    return afterRow[0]?.id ?? 0;
  },

  // Bắt đầu thực hiện dịch vụ
  startService: async (nhanVienId, caLamId) => {
    const nvPk = await ensureNhanVienForUser(db, nhanVienId);
    const [result] = await db.query(
      "UPDATE chi_tiet_ca_lam SET status = 'dang_thuc_hien' WHERE id = ? AND nhan_vien_id = ?",
      [caLamId, nvPk]
    );
    return result.affectedRows;
  },

  // Check-out ca làm việc
  checkOut: async (nhanVienId, caLamId, ghiChu) => {
    const nvPk = await ensureNhanVienForUser(db, nhanVienId);
    const numericCaLamId = parseInt(caLamId);

    // 1. Cập nhật bảng chi_tiet_ca_lam
    const [result] = await db.query(
      "UPDATE chi_tiet_ca_lam SET check_out = NOW(), status = 'hoan_thanh', ghi_chu = ? WHERE id = ? AND nhan_vien_id = ?",
      [ghiChu, numericCaLamId, nvPk],
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
        // Gói nhiều ngày: phải hoàn thành hết tất cả dòng ca (mỗi ngày × mỗi NV), không chỉ đếm NV đã có ít nhất 1 ca xong
        const [totalCaRows] = await db.query(
          `SELECT COUNT(*) as count FROM chi_tiet_ca_lam WHERE lich_hen_id = ? AND nhan_vien_id IS NOT NULL`,
          [lichHenId],
        );
        const [completedCaRows] = await db.query(
          `SELECT COUNT(*) as count FROM chi_tiet_ca_lam WHERE lich_hen_id = ? AND nhan_vien_id IS NOT NULL AND status = 'hoan_thanh'`,
          [lichHenId],
        );

        if (
          totalCaRows[0].count > 0 &&
          completedCaRows[0].count >= totalCaRows[0].count
        ) {
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

  // Lịch ca đã gán theo ngày (sắp tới) — NV xem trước các ngày còn phải làm
  getUpcomingSchedule: async (nhanVienId, daysAhead = 60) => {
    const nvPk = await ensureNhanVienForUser(db, nhanVienId);
    const [rows] = await db.query(
      `SELECT ct.id as ca_lam_id, ct.ngay_lam, ct.status, ct.check_in, ct.check_out,
              lh.id as lich_hen_id, lh.ngay_bat_dau, lh.ngay_ket_thuc, lh.dia_diem, lh.guest_name, lh.guest_phone,
              gdv.name as service_name,
              u.name as customer_name, u.phone as customer_phone,
              kh.dia_chi as customer_address
       FROM chi_tiet_ca_lam ct
       JOIN lich_hen lh ON lh.id = ct.lich_hen_id
       JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
       LEFT JOIN khach_hang kh ON lh.khach_hang_id = kh.id
       LEFT JOIN users u ON kh.user_id = u.id
       WHERE ct.nhan_vien_id = ?
         AND ct.ngay_lam >= CURDATE()
         AND ct.ngay_lam <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
         AND lh.status IN ('da_xac_nhan', 'dang_thuc_hien')
       ORDER BY ct.ngay_lam ASC, lh.id ASC`,
      [nvPk, daysAhead],
    );
    return rows;
  },

  // Lấy lịch sử ca làm của nhân viên
  getEmployeeHistory: async (nhanVienId) => {
    const nvPk = await ensureNhanVienForUser(db, nhanVienId);
    const query = `
      SELECT ct.*, lh.guest_name, gdv.name as service_name
      FROM chi_tiet_ca_lam ct
      JOIN lich_hen lh ON ct.lich_hen_id = lh.id
      JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
      WHERE ct.nhan_vien_id = ?
      ORDER BY ct.ngay_lam DESC
    `;
    const [rows] = await db.query(query, [nvPk]);
    return rows;
  }
};

module.exports = ShiftModel;
