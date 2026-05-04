const db = require("../configs/db");

const employeeController = {
  // Lấy danh sách tất cả người dùng có vai trò là nhân viên (không phải khách hàng)
  getAll: async (req, res) => {
    try {
      const [employees] = await db.query(`
        SELECT u.id, u.name, u.email, u.phone, u.status, u.avatar, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.role_id IS NOT NULL AND u.role_id != 3
        ORDER BY u.name ASC
      `);
      res.status(200).json({ success: true, data: employees });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },
  
  // Chức năng getById, create, update, delete không còn cần thiết ở đây.
  // Việc quản lý nhân viên giờ đây được thực hiện thông qua quản lý vai trò người dùng tại /api/users.
  
  // Sửa lại chức năng tính lương để hoạt động với cấu trúc mới
  getSalaries: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT 
          u.id, u.name, r.name as role_name,
          (SELECT COUNT(*) FROM chi_tiet_ca_lam WHERE nhan_vien_id = u.id AND status = 'hoan_thanh') as shifts_completed
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.role_id != 3
      `);
      
      // Logic tính lương giả định
      const salaries = rows.map(emp => {
        const baseSalary = emp.role_name === 'quan_ly' ? 10000000 : 7000000;
        const commissionPerShift = 100000;
        const totalCommission = emp.shifts_completed * commissionPerShift;
        return {
          ...emp,
          baseSalary,
          commissionPerShift,
          totalCommission,
          totalSalary: baseSalary + totalCommission,
          status: 'Chưa thanh toán'
        };
      });

      res.status(200).json({ success: true, data: salaries });
    } catch (error) {
      console.error("Lỗi lấy bảng lương:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  }
};

module.exports = employeeController;
