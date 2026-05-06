const db = require("../configs/db");
const NotificationModel = require("./notificationModel");
const { ensureNhanVienForUser, getUserIdByNhanVienPk, getNhanVienPkByUserId } = require("../utils/nhanVienRef");
const { findOverlappingAppointmentForNhanVien } = require("../utils/scheduleConflict");

const STAFF_ROLE_IDS = [2, 4, 5, 6, 7, 8];
let hasNhanVienIdColumnCache = null;

const normalizeEmployeeIds = (employeeId) => {
  const rawIds = Array.isArray(employeeId) ? employeeId : employeeId ? [employeeId] : [];
  return [...new Set(
    rawIds
      .map((id) => parseInt(id, 10))
      .filter((id) => Number.isInteger(id) && id > 0)
  )];
};

const getDateRange = (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();
  const from = start <= end ? start : end;
  const to = start <= end ? end : start;
  const dates = [];

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split("T")[0]);
  }

  return dates;
};

const hasNhanVienIdColumn = async () => {
  if (hasNhanVienIdColumnCache !== null) return hasNhanVienIdColumnCache;

  try {
    const [rows] = await db.query(
      `SELECT 1
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'lich_hen'
         AND COLUMN_NAME = 'nhan_vien_id'
       LIMIT 1`
    );
    hasNhanVienIdColumnCache = rows.length > 0;
  } catch (err) {
    // Nếu không truy cập được INFORMATION_SCHEMA thì fallback an toàn theo schema cũ.
    hasNhanVienIdColumnCache = false;
  }

  return hasNhanVienIdColumnCache;
};

const AppointmentModel = {
  getAllAppointments: async (userId = null, filters = {}) => {
    const { page, limit, status, search, dia_diem, ngay_trong_lich } = filters;
    const limitNum = parseInt(limit) || 10;
    const pageNum = parseInt(page) || 1;
    const offsetNum = (pageNum - 1) * limitNum;
    const supportPrimaryEmployee = await hasNhanVienIdColumn();

    let whereClause = " WHERE 1=1 ";
    const params = [];
    
    if (userId) {
      whereClause += ` AND (u.id = ? OR lh.khach_hang_id IN (SELECT id FROM khach_hang WHERE user_id = ?)) `;
      params.push(userId, userId);
    }

    if (status && status !== 'all') {
      whereClause += ` AND lh.status = ? `;
      params.push(status);
    }

    if (dia_diem) {
      whereClause += ` AND lh.dia_diem = ? `;
      params.push(dia_diem);
    }

    if (search) {
      whereClause += ` AND (CAST(lh.id AS CHAR) LIKE ? OR lh.guest_name LIKE ? OR u.name LIKE ? OR lh.guest_phone LIKE ? OR u.phone LIKE ?) `;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (ngay_trong_lich) {
      whereClause += ` AND DATE(?) BETWEEN DATE(lh.ngay_bat_dau) AND DATE(lh.ngay_ket_thuc) `;
      params.push(ngay_trong_lich);
    }

    const joinClause = `
      FROM lich_hen lh
      LEFT JOIN khach_hang kh ON lh.khach_hang_id = kh.id
      LEFT JOIN users u ON kh.user_id = u.id
      LEFT JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
      ${supportPrimaryEmployee ? "LEFT JOIN users unv ON lh.nhan_vien_id = unv.id" : ""}
    `;
    
    // 1. Đếm tổng số bản ghi
    const countQuery = `SELECT COUNT(*) as total ${joinClause} ${whereClause}`;
    let total = 0;
    try {
      const [countRows] = await db.query(countQuery, params);
      total = countRows[0].total;
    } catch (err) {
      console.error("Lỗi SQL Count:", err.message);
      console.error("Count Query:", countQuery);
      console.error("Params:", params);
      throw err;
    }

    // 2. Lấy dữ liệu trang hiện tại
    const baseSelectClause = `
      SELECT 
        lh.id, lh.khach_hang_id, ${supportPrimaryEmployee ? "lh.nhan_vien_id" : "NULL AS nhan_vien_id"}, lh.goi_id, 
        lh.ngay_bat_dau, lh.ngay_ket_thuc, lh.loai_lich, lh.dia_diem, lh.loai_phong,
        lh.status, lh.trang_thai_thanh_toan, lh.hinh_thuc_thanh_toan,
        lh.ngay_sinh_be, lh.hinh_thuc_sinh, lh.tinh_trang_me, lh.can_nang_be, lh.ghi_chu_be, lh.so_luong_be,
        lh.dia_chi_cu_the, lh.toa_do, lh.created_at, lh.ghi_chu_nhan_vien, lh.dat_coc,
        lh.ngay_bat_dau_thuc_te, lh.ngay_ket_thuc_thuc_te,
        lh.guest_name, lh.guest_phone,
        kh.dia_chi AS khach_hang_dia_chi, 
        COALESCE(lh.guest_name, u.name) AS customer_name, 
        COALESCE(lh.guest_phone, u.phone) AS phone, 
        gdv.name AS service_name, gdv.gia,
        ${
          supportPrimaryEmployee
            ? "unv.name AS nhan_vien_name"
            : `(SELECT u2.name FROM lich_hen_nhan_vien lhnv2
                JOIN nhan_vien nv2 ON nv2.id = lhnv2.nhan_vien_id
                JOIN users u2 ON u2.id = nv2.user_id
                WHERE lhnv2.lich_hen_id = lh.id LIMIT 1) AS nhan_vien_name`
        }
    `;

    const reviewSelectClause = `,
        (SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM danh_gia dg WHERE dg.user_id = u.id AND dg.goi_id = lh.goi_id) AS is_reviewed,
        (SELECT dg.id FROM danh_gia dg WHERE dg.user_id = u.id AND dg.goi_id = lh.goi_id LIMIT 1) AS review_id,
        (SELECT dg.rating FROM danh_gia dg WHERE dg.user_id = u.id AND dg.goi_id = lh.goi_id LIMIT 1) AS review_rating,
        (SELECT dg.comment FROM danh_gia dg WHERE dg.user_id = u.id AND dg.goi_id = lh.goi_id LIMIT 1) AS review_comment,
        (SELECT dg.created_at FROM danh_gia dg WHERE dg.user_id = u.id AND dg.goi_id = lh.goi_id LIMIT 1) AS review_date
    `;

    const mainParams = [...params, limitNum, offsetNum];

    const buildMainQuery = (includeReviewFields = true) => `
      ${includeReviewFields ? `${baseSelectClause}${reviewSelectClause}` : baseSelectClause}
      ${joinClause}
      ${whereClause}
      ORDER BY lh.created_at DESC
      LIMIT ? OFFSET ?
    `;

    try {
      let rows = [];
      let usedFallbackReview = false;
      const mainQuery = buildMainQuery(true);

      try {
        const [mainRows] = await db.query(mainQuery, mainParams);
        rows = mainRows;
      } catch (err) {
        // Tương thích ngược khi CSDL thực tế chưa có bảng/cột danh_gia như code mới kỳ vọng.
        const schemaMismatchErrors = ["ER_BAD_FIELD_ERROR", "ER_NO_SUCH_TABLE"];
        if (!schemaMismatchErrors.includes(err.code)) {
          throw err;
        }

        usedFallbackReview = true;
        const fallbackQuery = buildMainQuery(false);
        const [fallbackRows] = await db.query(fallbackQuery, mainParams);
        rows = fallbackRows.map((row) => ({
          ...row,
          is_reviewed: 0,
          review_id: null,
          review_rating: null,
          review_comment: null,
          review_date: null,
        }));
      }

      if (usedFallbackReview) {
        console.warn("Fallback query without review fields was used for appointments.");
      }

      // Lấy thêm danh sách nhân viên cho mỗi lịch hẹn
      for (let row of rows) {
        const [staffRows] = await db.query(
          `SELECT u.id, u.name, u.phone, r.name as chuc_vu
           FROM lich_hen_nhan_vien lhnv
           JOIN nhan_vien nv ON nv.id = lhnv.nhan_vien_id
           JOIN users u ON u.id = nv.user_id
           LEFT JOIN roles r ON u.role_id = r.id
           WHERE lhnv.lich_hen_id = ?`,
          [row.id]
        );
        row.staff_list = staffRows;
      }

      return { rows, total, page: pageNum, limit: limitNum };
    } catch (err) {
      console.error("Lỗi SQL Main:", err.message);
      console.error("Params:", mainParams);
      throw err;
    }
  },
  createAppointment: async (data) => {
    const { 
      userId, 
      guest_name, 
      guest_phone, 
      nhan_vien_id, 
      goi_id, 
      ngay_bat_dau, 
      ngay_ket_thuc, 
      loai_lich, 
      dia_diem, 
      menu_chon, 
      lich_trinh,
      dat_coc,
      loai_phong,
      trang_thai_thanh_toan,
      hinh_thuc_thanh_toan,
      ngay_sinh_be,
        hinh_thuc_sinh,
        tinh_trang_me,
        so_luong_be,
        can_nang_be,
        ghi_chu_be,
        dia_chi_cu_the,
        toa_do
      } = data;
  
      let khach_hang_id = null;
  
      // 1. Nếu có userId (Khách hệ thống), tìm hoặc tạo khach_hang_id tương ứng
      if (userId) {
        const [customerRows] = await db.query("SELECT id FROM khach_hang WHERE user_id = ?", [userId]);
        if (customerRows.length > 0) {
          khach_hang_id = customerRows[0].id;
        } else {
          // Tạo khach_hang mới nếu chưa có
          const [insertResult] = await db.query(
            "INSERT INTO khach_hang (user_id, dia_chi, ghi_chu, hang_thanh_vien) VALUES (?, ?, ?, ?)",
            [userId, null, null, "Đồng"]
          );
          khach_hang_id = insertResult.insertId;
        }
      }
      // Nếu không có userId (Khách vãng lai), khach_hang_id sẽ giữ nguyên là null.
      // Thông tin khách vãng lai sẽ chỉ được lưu tại các cột guest_name, guest_phone trong bảng lich_hen.

      // Đảm bảo tiền cọc = 0 nếu phương thức là tiền mặt hoặc tại quầy
      let actualDatCoc = parseFloat(dat_coc) || 0;
      let actualTrangThaiThanhToan = trang_thai_thanh_toan || 'chua_thanh_toan';
  
      // 2. Thêm lịch hẹn (schema có hoặc không có cột nhan_vien_id)
      const supportNvCol = await hasNhanVienIdColumn();
      const insertValues = [
        khach_hang_id,
        guest_name || null,
        guest_phone || null,
        ...(supportNvCol ? [nhan_vien_id || null] : []),
        goi_id,
        ngay_bat_dau,
        ngay_ket_thuc,
        loai_lich || "linh_hoat",
        dia_diem || "tai_nha",
        null,
        JSON.stringify(lich_trinh) || null,
        actualDatCoc,
        loai_phong || "thuong",
        actualTrangThaiThanhToan,
        hinh_thuc_thanh_toan || "tien_mat",
        ngay_sinh_be || null,
        hinh_thuc_sinh || null,
        tinh_trang_me || null,
        so_luong_be ?? 1,
        can_nang_be || null,
        ghi_chu_be || null,
        dia_chi_cu_the || null,
        toa_do || null,
      ];

      const insertSql = supportNvCol
        ? `INSERT INTO lich_hen
           (khach_hang_id, guest_name, guest_phone, nhan_vien_id, goi_id, ngay_bat_dau, ngay_ket_thuc, loai_lich, dia_diem, menu_chon, lich_trinh, dat_coc, loai_phong, trang_thai_thanh_toan, hinh_thuc_thanh_toan, ngay_sinh_be, hinh_thuc_sinh, tinh_trang_me, so_luong_be, can_nang_be, ghi_chu_be, dia_chi_cu_the, toa_do, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cho_xac_nhan')`
        : `INSERT INTO lich_hen
           (khach_hang_id, guest_name, guest_phone, goi_id, ngay_bat_dau, ngay_ket_thuc, loai_lich, dia_diem, menu_chon, lich_trinh, dat_coc, loai_phong, trang_thai_thanh_toan, hinh_thuc_thanh_toan, ngay_sinh_be, hinh_thuc_sinh, tinh_trang_me, so_luong_be, can_nang_be, ghi_chu_be, dia_chi_cu_the, toa_do, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cho_xac_nhan')`;

      const [result] = await db.query(insertSql, insertValues);

    const newAppointmentId = result.insertId;

    // 3. Nếu có nhan_vien_id (users.id), map sang nhan_vien.id rồi thêm junction
    if (nhan_vien_id) {
      const nvPk = await ensureNhanVienForUser(db, nhan_vien_id);
      await db.query(
        "INSERT INTO lich_hen_nhan_vien (lich_hen_id, nhan_vien_id) VALUES (?, ?)",
        [newAppointmentId, nvPk]
      );
    }

    // THÔNG BÁO CHO TẤT CẢ NHÂN VIÊN VỀ LỊCH MỚI
    try {
      const [allStaff] = await db.query(
        "SELECT id as user_id FROM users WHERE role_id IN (1, 2, 4, 5, 6, 7, 8)"
      );
      for (let staff of allStaff) {
        await NotificationModel.create({
          user_id: staff.user_id,
          title: "Lịch hẹn mới",
          message: `Một lịch hẹn mới ${newAppointmentId} vừa được tạo. Hãy kiểm tra và nhận ca!`,
          type: "lich_moi"
        });
      }
    } catch (err) {
      console.error("Lỗi gửi thông báo lịch mới:", err);
    }
    
    return newAppointmentId;
  },
  updateEmployeeNote: async (id, note) => {
    const [result] = await db.query(
      "UPDATE lich_hen SET ghi_chu_nhan_vien = ? WHERE id = ?",
      [note, id]
    );
    return result.affectedRows;
  },
  assignEmployee: async (id, employeeId) => {
    const supportNvCol = await hasNhanVienIdColumn();

    // Kiểm tra appointment tồn tại
    const [existingAppt] = await db.query(
      supportNvCol
        ? "SELECT nhan_vien_id, ngay_bat_dau, ngay_ket_thuc FROM lich_hen WHERE id = ?"
        : "SELECT ngay_bat_dau, ngay_ket_thuc FROM lich_hen WHERE id = ?",
      [id]
    );
    if (!existingAppt.length) {
      return 0; // Thay vì ném lỗi, trả về 0 để controller phản hồi 404
    }

    // Xử lý trường hợp employeeId là mảng (nhiều nhân viên) hoặc đơn lẻ + chỉ nhận nhân viên hợp lệ còn tồn tại.
    const requestedEmpIds = normalizeEmployeeIds(employeeId);
    let empIds = [];
    if (requestedEmpIds.length > 0) {
      const [validEmployees] = await db.query(
        `SELECT id FROM users WHERE id IN (?) AND role_id IS NOT NULL AND role_id != 3`,
        [requestedEmpIds]
      );
      empIds = validEmployees.map((u) => u.id);
    }
    const primaryEmpId = empIds.length > 0 ? empIds[0] : null;

    const rangeStart = existingAppt[0].ngay_bat_dau;
    const rangeEnd = existingAppt[0].ngay_ket_thuc;

    if (empIds.length > 0) {
      for (const eId of empIds) {
        const nvPk = await ensureNhanVienForUser(db, eId);
        const overlap = await findOverlappingAppointmentForNhanVien(
          db,
          nvPk,
          id,
          rangeStart,
          rangeEnd,
        );
        if (overlap) {
          throw new Error(
            `Nhân viên đã có lịch trùng khoảng thời gian (lịch #${overlap.id} — ${overlap.service_name || "gói dịch vụ"}). Chọn người khác hoặc điều chỉnh ngày lịch.`,
          );
        }
      }
    }

    if (supportNvCol) {
      await db.query("UPDATE lich_hen SET nhan_vien_id = ? WHERE id = ?", [primaryEmpId, id]);
    }
    
    // Cập nhật bảng junction - xóa hết rồi thêm lại
    await db.query("DELETE FROM lich_hen_nhan_vien WHERE lich_hen_id = ?", [id]);

    let workDates = getDateRange(existingAppt[0].ngay_bat_dau, existingAppt[0].ngay_ket_thuc);
    if (workDates.length === 0) {
      workDates = [new Date().toISOString().split("T")[0]];
    }

    // Xóa mọi ca trong các ngày thuộc lịch (tránh trùng UNIQUE / ca check_in cũ khi phân công lại)
    if (workDates.length > 0) {
      const placeholders = workDates.map(() => "?").join(",");
      await db.query(
        `DELETE FROM chi_tiet_ca_lam WHERE lich_hen_id = ? AND ngay_lam IN (${placeholders})`,
        [id, ...workDates]
      );
    } else {
      await db.query(
        "DELETE FROM chi_tiet_ca_lam WHERE lich_hen_id = ? AND status IN ('cho_nhan', 'da_nhan')",
        [id]
      );
    }

    if (empIds.length > 0) {

      for (const eId of empIds) {
        const nvPk = await ensureNhanVienForUser(db, eId);
        await db.query(
          "INSERT INTO lich_hen_nhan_vien (lich_hen_id, nhan_vien_id) VALUES (?, ?)",
          [id, nvPk]
        );
        
        // Tạo ca làm mỗi ngày từ ngày bắt đầu đến ngày kết thúc cho nhân viên
        for (const dateStr of workDates) {
          await db.query(
            "INSERT INTO chi_tiet_ca_lam (lich_hen_id, nhan_vien_id, ngay_lam, status) VALUES (?, ?, ?, 'da_nhan')",
            [id, nvPk, dateStr]
          );
        }

        try {
          await NotificationModel.create({
            user_id: eId,
            title: "Ca làm việc mới",
            message: `Bạn được gán cho lịch hẹn ${id}. Hãy vào kiểm tra!`,
            type: "ca_lam_moi"
          });
        } catch (notifyErr) {
          console.error("Lỗi gửi thông báo phân công:", notifyErr.message);
        }
      }
    } else {
      // Nếu xóa phân công, tạo ca trống cho toàn bộ khoảng ngày để nhân viên có thể nhận từng ngày.
      for (const dateStr of workDates) {
        await db.query(
          "INSERT INTO chi_tiet_ca_lam (lich_hen_id, nhan_vien_id, ngay_lam, status) VALUES (?, NULL, ?, 'cho_nhan')",
          [id, dateStr]
        );
      }
    }
    
    return 1; // Luôn trả về 1 khi thành công để controller xử lý đúng
  },
  deleteAppointment: async (id) => {
    const [result] = await db.query("DELETE FROM lich_hen WHERE id = ?", [id]);
    return result.affectedRows;
  },
  cancelAppointment: async (id, userId) => {
    // Kiểm tra quyền sở hữu và trạng thái
    const [rows] = await db.query(`
      SELECT lh.id, lh.status 
      FROM lich_hen lh
      JOIN khach_hang kh ON lh.khach_hang_id = kh.id
      WHERE lh.id = ? AND kh.user_id = ?
    `, [id, userId]);

    if (rows.length === 0) return 0;

    const apt = rows[0];
    if (['hoan_thanh', 'da_huy', 'dang_thuc_hien'].includes(apt.status)) {
      throw new Error("Không thể hủy lịch hẹn ở trạng thái này.");
    }

    const [result] = await db.query(
      "UPDATE lich_hen SET status = 'da_huy' WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  },
  updateStatus: async (id, status, extraData = {}) => {
    const { ngay_bat_dau_thuc_te, ngay_ket_thuc_thuc_te, trang_thai_thanh_toan } = extraData;

    // Đảm bảo id là số để tránh lỗi 'Truncated incorrect DOUBLE value' nếu id là object
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new Error("ID lịch hẹn không hợp lệ (NaN)");
    }

    // Lấy thông tin hiện tại để không ghi đè status nếu chỉ cập nhật thanh toán
    const [currentAptRows] = await db.query("SELECT * FROM lich_hen WHERE id = ?", [numericId]);
    if (currentAptRows.length === 0) return 0;
    const currentApt = currentAptRows[0];
    const finalStatus = status || currentApt.status;
    const supportNvCol = await hasNhanVienIdColumn();

    let query = "UPDATE lich_hen SET status = ?";
    const params = [finalStatus];

    if (trang_thai_thanh_toan !== undefined || finalStatus === "hoan_thanh") {
      let paymentToWrite =
        trang_thai_thanh_toan !== undefined
          ? trang_thai_thanh_toan
          : currentApt.trang_thai_thanh_toan;
      if (finalStatus === "hoan_thanh") {
        paymentToWrite = "da_thanh_toan_het";
      }
      query += ", trang_thai_thanh_toan = ?";
      params.push(paymentToWrite);
    }
    if (ngay_bat_dau_thuc_te !== undefined) {
      query += ", ngay_bat_dau_thuc_te = ?";
      params.push(ngay_bat_dau_thuc_te || null);
    }
    if (ngay_ket_thuc_thuc_te !== undefined) {
      query += ", ngay_ket_thuc_thuc_te = ?";
      params.push(ngay_ket_thuc_thuc_te || null);
    }

    query += " WHERE id = ?";
    params.push(numericId);

    try {
      const [result] = await db.query(query, params);

      // LOGIC TỰ ĐỘNG: Thông báo cho Admin/Quản lý khi khách hàng thanh toán cọc thành công
      if (trang_thai_thanh_toan === "da_coc_15" && currentApt.trang_thai_thanh_toan !== "da_coc_15") {
        try {
          const [adminRows] = await db.query("SELECT id FROM users WHERE role_id IN (1, 4)");
          for (let admin of adminRows) {
            await NotificationModel.create({
              user_id: admin.id,
              title: "Thanh toán thành công 💰",
              message: `Lịch hẹn ${numericId} đã được khách hàng thanh toán tiền cọc 15% thành công!`,
              type: "thanh_toan"
            });
          }
        } catch (err) {
          console.error("Lỗi gửi thông báo thanh toán:", err);
        }
      }

      // LOGIC TỰ ĐỘNG: Nếu chuyển sang "da_xac_nhan", tạo bản ghi trong chi_tiet_ca_lam & Hồ sơ sức khỏe (nếu chưa có)
      if (finalStatus === "da_xac_nhan" || finalStatus === "dang_thuc_hien") {
          const apt = currentApt;
          // 1. Tạo ca làm việc (Trạng thái cho_nhan - Chờ nhân viên nhận hoặc Admin gán)
          const [shiftRows] = await db.query("SELECT id FROM chi_tiet_ca_lam WHERE lich_hen_id = ?", [numericId]);
          if (shiftRows.length === 0) {
            const workDates = getDateRange(apt.ngay_bat_dau, apt.ngay_ket_thuc);

            const [assignedRows] = await db.query(
              `SELECT DISTINCT lhnv.nhan_vien_id
               FROM lich_hen_nhan_vien lhnv
               JOIN nhan_vien nv ON nv.id = lhnv.nhan_vien_id
               JOIN users u ON u.id = nv.user_id
               WHERE lhnv.lich_hen_id = ? AND u.role_id IS NOT NULL AND u.role_id != 3`,
              [numericId]
            );

            const assignedEmpIds = assignedRows.map((row) => row.nhan_vien_id);
            let fallbackPrimary = [];
            if (supportNvCol && Number.isInteger(parseInt(apt.nhan_vien_id, 10))) {
              const nvPk = await getNhanVienPkByUserId(db, apt.nhan_vien_id);
              if (nvPk) fallbackPrimary = [nvPk];
            }
            const validEmpIds = assignedEmpIds.length > 0 ? assignedEmpIds : fallbackPrimary;

            for (const dateStr of workDates) {
              if (validEmpIds.length === 0) {
                await db.query(
                  "INSERT INTO chi_tiet_ca_lam (lich_hen_id, nhan_vien_id, ngay_lam, status) VALUES (?, NULL, ?, 'cho_nhan')",
                  [numericId, dateStr]
                );
                continue;
              }

              for (const empId of validEmpIds) {
                await db.query(
                  "INSERT INTO chi_tiet_ca_lam (lich_hen_id, nhan_vien_id, ngay_lam, status) VALUES (?, ?, ?, 'da_nhan')",
                  [numericId, empId, dateStr]
                );
              }
            }

            // Nếu dữ liệu lệch do sửa tay trong DB, đồng bộ lại bảng nối theo danh sách đang dùng.
            await db.query("DELETE FROM lich_hen_nhan_vien WHERE lich_hen_id = ?", [numericId]);
            for (const empId of validEmpIds) {
              await db.query(
                "INSERT IGNORE INTO lich_hen_nhan_vien (lich_hen_id, nhan_vien_id) VALUES (?, ?)",
                [numericId, empId]
              );
            }

            const primaryNvPk = validEmpIds.length > 0 ? validEmpIds[0] : null;
            if (supportNvCol && primaryNvPk) {
              const primaryUserId = await getUserIdByNhanVienPk(db, primaryNvPk);
              if (primaryUserId != null && primaryUserId !== apt.nhan_vien_id) {
                await db.query("UPDATE lich_hen SET nhan_vien_id = ? WHERE id = ?", [primaryUserId, numericId]);
              }
            }
          }

          // Gửi thông báo cho nhân viên (Notification.user_id = users.id)
          let notifyUserId = supportNvCol && apt.nhan_vien_id ? apt.nhan_vien_id : null;
          if (!notifyUserId) {
            const [nvRows] = await db.query(
              "SELECT nhan_vien_id FROM lich_hen_nhan_vien WHERE lich_hen_id = ? LIMIT 1",
              [numericId]
            );
            notifyUserId = await getUserIdByNhanVienPk(db, nvRows[0]?.nhan_vien_id);
          }
          if (notifyUserId) {
            await NotificationModel.create({
              user_id: notifyUserId,
              title: "Ca làm việc mới",
              message: `Bạn được gán cho lịch hẹn ${numericId}. Hãy vào xác nhận nhận ca!`,
              type: "ca_lam_moi"
            });
          }

          // 2. Tạo Hồ sơ sức khỏe (nếu chưa có)
          if (apt.khach_hang_id) {
            const [recordRows] = await db.query("SELECT id FROM ho_so_suc_khoe WHERE khach_hang_id = ?", [apt.khach_hang_id]);
            if (recordRows.length === 0) {
              await db.query(
                "INSERT INTO ho_so_suc_khoe (khach_hang_id, thong_tin) VALUES (?, ?)",
                [apt.khach_hang_id, "Hồ sơ được tạo tự động từ lịch hẹn " + (apt.id)]
              );
            }
          }
      }

      // LOGIC TỰ ĐỘNG: Nếu chuyển sang "hoan_thanh", cập nhật Ghi nhận doanh thu
      if (finalStatus === "hoan_thanh") {
        const [aptRows] = await db.query(`
          SELECT lh.*, kh.id as kh_id, gdv.gia 
          FROM lich_hen lh 
          LEFT JOIN khach_hang kh ON lh.khach_hang_id = kh.id 
          LEFT JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
          WHERE lh.id = ?`, [numericId]);
        
        if (aptRows.length > 0) {
          const apt = aptRows[0];
          
          // 1. Đảm bảo đã có hồ sơ sức khỏe
          if (apt.kh_id) {
            const [recordRows] = await db.query("SELECT id FROM ho_so_suc_khoe WHERE khach_hang_id = ?", [apt.kh_id]);
            if (recordRows.length === 0) {
              await db.query(
                "INSERT INTO ho_so_suc_khoe (khach_hang_id, thong_tin) VALUES (?, ?)",
                [apt.kh_id, "Hồ sơ được tạo tự động khi hoàn thành lịch hẹn"]
              );
            }
          }

          // 2. Tự động ghi nhận doanh thu nếu đã thanh toán hết (Tiền mặt hoặc VNPay)
          // Lấy trạng thái thanh toán thực tế, ưu tiên giá trị mới gửi lên, nếu không thì dùng giá trị cũ trong DB
          const currentPaymentStatus = trang_thai_thanh_toan !== undefined ? trang_thai_thanh_toan : apt.trang_thai_thanh_toan;
          if (currentPaymentStatus === 'da_thanh_toan_het') {
            const [payRows] = await db.query("SELECT id FROM thanh_toan WHERE lich_hen_id = ?", [numericId]);
            if (payRows.length === 0) {
              await db.query(
                "INSERT INTO thanh_toan (lich_hen_id, so_tien, ngay_thanh_toan) VALUES (?, ?, NOW())",
                [numericId, apt.gia]
              );
            }
          }
        }
      }

      return result.affectedRows;
    } catch (error) {
      console.error("Lỗi Model updateStatus:", error);
      throw error;
    }
  }
};

module.exports = AppointmentModel;