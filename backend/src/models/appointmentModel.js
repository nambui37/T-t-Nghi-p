const db = require("../configs/db");
const NotificationModel = require("./notificationModel");

const AppointmentModel = {
  getAllAppointments: async (userId = null, filters = {}) => {
    const { page, limit, status, search } = filters;
    const limitNum = parseInt(limit) || 10;
    const pageNum = parseInt(page) || 1;
    const offsetNum = (pageNum - 1) * limitNum;

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

    if (search) {
      whereClause += ` AND (lh.guest_name LIKE ? OR u.name LIKE ? OR lh.guest_phone LIKE ? OR u.phone LIKE ?) `;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    const joinClause = `
      FROM lich_hen lh
      LEFT JOIN khach_hang kh ON lh.khach_hang_id = kh.id
      LEFT JOIN users u ON kh.user_id = u.id
      LEFT JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
      LEFT JOIN users unv ON lh.nhan_vien_id = unv.id
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
    const selectClause = `
      SELECT 
        lh.id, lh.khach_hang_id, lh.nhan_vien_id, lh.goi_id, 
        lh.ngay_bat_dau, lh.ngay_ket_thuc, lh.loai_lich, lh.dia_diem, 
        lh.status, lh.trang_thai_thanh_toan, lh.hinh_thuc_thanh_toan,
        lh.ngay_sinh_be, lh.hinh_thuc_sinh, lh.tinh_trang_me, lh.can_nang_be, lh.ghi_chu_be,
        lh.dia_chi_cu_the, lh.toa_do, lh.created_at, lh.ghi_chu_nhan_vien, lh.dat_coc,
        lh.ngay_bat_dau_thuc_te, lh.ngay_ket_thuc_thuc_te,
        kh.dia_chi AS khach_hang_dia_chi, 
        COALESCE(u.name, lh.guest_name) AS customer_name, 
        COALESCE(u.phone, lh.guest_phone) AS phone, 
        gdv.name AS service_name, gdv.gia,
        unv.name AS nhan_vien_name
    `;

    const mainQuery = `
      ${selectClause}
      ${joinClause}
      ${whereClause}
      ORDER BY lh.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const mainParams = [...params, limitNum, offsetNum];

    try {
      const [rows] = await db.query(mainQuery, mainParams);

      // Lấy thêm danh sách nhân viên cho mỗi lịch hẹn
      for (let row of rows) {
        const [staffRows] = await db.query(
          `SELECT u.id, u.name, u.phone, r.name as chuc_vu
           FROM lich_hen_nhan_vien lhnv
           JOIN users u ON lhnv.nhan_vien_id = u.id
           LEFT JOIN roles r ON u.role_id = r.id
           WHERE lhnv.lich_hen_id = ?`,
          [row.id]
        );
        row.staff_list = staffRows;
      }

      return { rows, total, page: pageNum, limit: limitNum };
    } catch (err) {
      console.error("Lỗi SQL Main:", err.message);
      console.error("Main Query:", mainQuery);
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
  
      // 1. Nếu có userId, tìm khach_hang_id tương ứng (hoặc tạo mới nếu chưa có)
      if (userId) {
        const [customerRows] = await db.query("SELECT id FROM khach_hang WHERE user_id = ?", [userId]);
        if (customerRows.length > 0) {
          khach_hang_id = customerRows[0].id;
        } else {
          // Tạo khach_hang mới nếu chưa có
          const [insertResult] = await db.query(
            "INSERT INTO khach_hang (user_id, dia_chi, ghi_chu, diem_tich_luy, hang_thanh_vien) VALUES (?, ?, ?, ?, ?)",
            [userId, null, null, 0, "Đồng"]
          );
          khach_hang_id = insertResult.insertId;
        }
      }

      // Đảm bảo tiền cọc = 0 nếu phương thức là tiền mặt hoặc tại quầy
      let actualDatCoc = parseFloat(dat_coc) || 0;
      if (hinh_thuc_thanh_toan === 'tien_mat' || hinh_thuc_thanh_toan === 'thanh_toan_tai_quay') {
        actualDatCoc = 0;
      }

      // Đảm bảo trạng thái thanh toán dựa trên tiền cọc thực tế
      let actualTrangThaiThanhToan = trang_thai_thanh_toan || 'chua_thanh_toan';
      if (actualDatCoc === 0) {
        // Nếu không có tiền cọc (tiền mặt), status phải là "chưa thanh toán"
        actualTrangThaiThanhToan = 'chua_thanh_toan';
      } else if (actualDatCoc > 0 && !trang_thai_thanh_toan) {
        // Nếu có tiền cọc nhưng không có status, set là "đã cọc 15%"
        actualTrangThaiThanhToan = 'da_coc_15';
      }
  
      // 2. Thêm lịch hẹn
      const [result] = await db.query(
        `INSERT INTO lich_hen 
         (khach_hang_id, guest_name, guest_phone, nhan_vien_id, goi_id, ngay_bat_dau, ngay_ket_thuc, loai_lich, dia_diem, menu_chon, lich_trinh, dat_coc, loai_phong, trang_thai_thanh_toan, hinh_thuc_thanh_toan, ngay_sinh_be, hinh_thuc_sinh, tinh_trang_me, so_luong_be, can_nang_be, ghi_chu_be, dia_chi_cu_the, toa_do, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cho_xac_nhan')`,
        [
          khach_hang_id, 
          guest_name || null, 
          guest_phone || null, 
          nhan_vien_id || null, 
          goi_id, 
          ngay_bat_dau, 
          ngay_ket_thuc, 
          loai_lich || 'linh_hoat', 
          dia_diem || 'tai_nha', 
          null, // menu_chon
          JSON.stringify(lich_trinh) || null, 
          actualDatCoc,
          loai_phong || 'thuong',
          actualTrangThaiThanhToan,
          hinh_thuc_thanh_toan || 'tien_mat',
          ngay_sinh_be || null,
          hinh_thuc_sinh || null,
          tinh_trang_me || null,
          so_luong_be || 1,
          can_nang_be || null,
          ghi_chu_be || null,
          dia_chi_cu_the || null,
          toa_do || null
        ]
      );

    const newAppointmentId = result.insertId;

    // 3. Nếu có nhan_vien_id, thêm vào bảng junction
    if (nhan_vien_id) {
      await db.query(
        "INSERT INTO lich_hen_nhan_vien (lich_hen_id, nhan_vien_id) VALUES (?, ?)",
        [newAppointmentId, nhan_vien_id]
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
          message: `Một lịch hẹn mới #${newAppointmentId} vừa được tạo. Hãy kiểm tra và nhận ca!`,
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
    // Kiểm tra appointment tồn tại
    const [existingAppt] = await db.query("SELECT nhan_vien_id FROM lich_hen WHERE id = ?", [id]);
    if (!existingAppt.length) {
      throw new Error("Lịch hẹn không tồn tại");
    }

    const empId = employeeId ? employeeId : null;
    
    // Tránh phân công nhân viên bị trùng lặp - Kiểm tra nếu nhân viên này đã được phân công
    if (empId) {
      const [existingAssignment] = await db.query(
        "SELECT id FROM lich_hen_nhan_vien WHERE lich_hen_id = ? AND nhan_vien_id = ?",
        [id, empId]
      );
      if (existingAssignment.length > 0) {
        // Đã phân công rồi, không cần phân công lại
        return 1;
      }
    }

    const [result] = await db.query(
      "UPDATE lich_hen SET nhan_vien_id = ? WHERE id = ?",
      [empId, id]
    );
    
    // Cập nhật bảng junction - xóa hết rồi thêm lại (chỉ 1 nhân viên)
    await db.query("DELETE FROM lich_hen_nhan_vien WHERE lich_hen_id = ?", [id]);
    if (empId) {
      await db.query(
        "INSERT INTO lich_hen_nhan_vien (lich_hen_id, nhan_vien_id) VALUES (?, ?)",
        [id, empId]
      );
      
      // Cập nhật ca làm nếu đã có ca làm 'cho_nhan' nhưng bị null nhân viên
      await db.query(
        "UPDATE chi_tiet_ca_lam SET nhan_vien_id = ? WHERE lich_hen_id = ? AND nhan_vien_id IS NULL",
        [empId, id]
      );

      // Gửi thông báo
      if (empId) {
        await NotificationModel.create({
          user_id: empId,
          title: "Ca làm việc mới",
          message: `Bạn được gán cho lịch hẹn #${id}. Hãy vào kiểm tra!`,
          type: "ca_lam_moi"
        });
      }
    }
    
    return result.affectedRows;
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
    let query = "UPDATE lich_hen SET status = ?";
    const params = [status];

    if (trang_thai_thanh_toan !== undefined) {
      query += ", trang_thai_thanh_toan = ?";
      params.push(trang_thai_thanh_toan);
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
    params.push(id);

    // Đảm bảo id là số để tránh lỗi 'Truncated incorrect DOUBLE value' nếu id là object
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new Error("ID lịch hẹn không hợp lệ (NaN)");
    }

    try {
      const [result] = await db.query(query, params);

      // LOGIC TỰ ĐỘNG: Nếu chuyển sang "da_xac_nhan", tạo bản ghi trong chi_tiet_ca_lam & Hồ sơ sức khỏe (nếu chưa có)
      if (status === "da_xac_nhan" || status === "dang_thuc_hien") {
        const [aptRows] = await db.query("SELECT * FROM lich_hen WHERE id = ?", [numericId]);
        if (aptRows.length > 0) {
          const apt = aptRows[0];
          // 1. Tạo ca làm việc (Trạng thái cho_nhan - Chờ nhân viên nhận hoặc Admin gán)
          const [shiftRows] = await db.query("SELECT id FROM chi_tiet_ca_lam WHERE lich_hen_id = ?", [numericId]);
          if (shiftRows.length === 0) {
            await db.query(
              "INSERT INTO chi_tiet_ca_lam (lich_hen_id, nhan_vien_id, ngay_lam, status) VALUES (?, ?, ?, ?)",
              [numericId, apt.nhan_vien_id, apt.ngay_bat_dau, "cho_nhan"]
            );
          }

          // Gửi thông báo cho nhân viên nếu đã gán
          if (apt.nhan_vien_id) {
            await NotificationModel.create({
              user_id: apt.nhan_vien_id,
              title: "Ca làm việc mới",
              message: `Bạn được gán cho lịch hẹn #${numericId}. Hãy vào xác nhận nhận ca!`,
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
      }

      // LOGIC TỰ ĐỘNG: Nếu chuyển sang "hoan_thanh", cập nhật Ghi nhận doanh thu
      if (status === "hoan_thanh") {
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