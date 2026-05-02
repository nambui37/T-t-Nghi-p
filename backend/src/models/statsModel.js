const db = require("../configs/db");

const StatsModel = {
  getDashboardStats: async () => {
    // 1. Lịch hẹn hôm nay
    const [todayApts] = await db.query(
      "SELECT COUNT(*) as total FROM lich_hen WHERE DATE(created_at) = CURDATE()"
    );

    // 2. Doanh thu tháng này (Tính từ các giao dịch thanh toán)
    const [monthlyRevenue] = await db.query(
      "SELECT SUM(so_tien) as total FROM thanh_toan WHERE MONTH(ngay_thanh_toan) = MONTH(CURDATE()) AND YEAR(ngay_thanh_toan) = YEAR(CURDATE())"
    );

    // Doanh thu dự kiến (Từ các lịch hẹn hoàn thành nhưng chưa thanh toán hết)
    const [estimatedRevenue] = await db.query(`
      SELECT SUM(gdv.gia) as total 
      FROM lich_hen lh
      JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
      WHERE lh.status = 'hoan_thanh' 
      AND lh.trang_thai_thanh_toan != 'da_thanh_toan_het'
    `);

    // 3. Khách hàng mới tháng này (Bao gồm User và Guest)
    const [newCustomers] = await db.query(`
      SELECT (
        (SELECT COUNT(*) FROM users WHERE role_id = 3 AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()))
        +
        (SELECT COUNT(DISTINCT guest_phone) FROM lich_hen WHERE khach_hang_id IS NULL AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()))
      ) as total
    `);

    // 4. Nhân viên hoạt động
    const [activeEmployees] = await db.query(
      "SELECT COUNT(*) as total FROM nhan_vien"
    );

    // 5. Lịch hẹn gần đây (chờ xác nhận)
    const [recentApts] = await db.query(`
      SELECT lh.*, gdv.name as service_name 
      FROM lich_hen lh
      LEFT JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
      WHERE lh.status = 'cho_xac_nhan'
      ORDER BY lh.created_at DESC
      LIMIT 5
    `);

    return {
      todayAppointments: todayApts[0].total || 0,
      monthlyRevenue: (monthlyRevenue[0].total || 0) + (estimatedRevenue[0].total || 0),
      newCustomers: newCustomers[0].total || 0,
      activeEmployees: activeEmployees[0].total || 0,
      recentAppointments: recentApts
    };
  },

  getRevenueStats: async () => {
    // Doanh thu theo tháng trong năm hiện tại (Dựa trên cả thanh toán và lịch hẹn đã hoàn thành)
    const [revenueByMonth] = await db.query(`
      SELECT month, SUM(revenue) as revenue
      FROM (
        -- Doanh thu từ bảng thanh toán
        SELECT MONTH(ngay_thanh_toan) as month, SUM(so_tien) as revenue 
        FROM thanh_toan 
        WHERE YEAR(ngay_thanh_toan) = YEAR(CURDATE())
        GROUP BY MONTH(ngay_thanh_toan)
        
        UNION ALL
        
        -- Doanh thu từ lịch hẹn hoàn thành (nhưng chưa có trong bảng thanh toán - giả sử thanh toán tiền mặt khi xong)
        SELECT MONTH(lh.ngay_ket_thuc_thuc_te) as month, SUM(gdv.gia) as revenue
        FROM lich_hen lh
        JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
        WHERE lh.status = 'hoan_thanh' 
        AND lh.trang_thai_thanh_toan = 'chua_thanh_toan'
        AND YEAR(lh.ngay_ket_thuc_thuc_te) = YEAR(CURDATE())
        GROUP BY MONTH(lh.ngay_ket_thuc_thuc_te)
      ) as combined_revenue
      GROUP BY month
      ORDER BY month
    `);

    // Giao dịch gần đây
    const [recentTransactions] = await db.query(`
      SELECT tt.*, lh.id as lich_hen_id, 
             COALESCE(u.name, lh.guest_name) as customer_name
      FROM thanh_toan tt
      JOIN lich_hen lh ON tt.lich_hen_id = lh.id
      LEFT JOIN khach_hang kh ON lh.khach_hang_id = kh.id
      LEFT JOIN users u ON kh.user_id = u.id
      ORDER BY tt.ngay_thanh_toan DESC
      LIMIT 10
    `);

    return {
      revenueByMonth,
      recentTransactions
    };
  }
};

module.exports = StatsModel;
