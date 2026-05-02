const db = require("../configs/db");

const EmployeeModel = {
  getAllEmployees: async () => {
    const query = `
      SELECT u.id as user_id, u.name, u.email, u.phone, u.status, r.name as role_name, u.role_id, nv.id as employee_id, nv.chuc_vu
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN nhan_vien nv ON u.id = nv.user_id
      WHERE u.role_id IN (2, 4, 5, 6, 7, 8)
      ORDER BY u.role_id ASC
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  getEmployeeById: async (id) => {
    const query = `
      SELECT nv.*, u.name, u.email, u.phone, u.status 
      FROM nhan_vien nv
      JOIN users u ON nv.user_id = u.id
      WHERE nv.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  },

  createEmployee: async (data) => {
    const { user_id, chuc_vu } = data;
    const [result] = await db.query(
      "INSERT INTO nhan_vien (user_id, chuc_vu) VALUES (?, ?)",
      [user_id, chuc_vu]
    );
    return result.insertId;
  },

  updateEmployee: async (id, data) => {
    const { chuc_vu } = data;
    const [result] = await db.query(
      "UPDATE nhan_vien SET chuc_vu = ? WHERE id = ?",
      [chuc_vu, id]
    );
    return result.affectedRows;
  },

  deleteEmployee: async (id) => {
    const [result] = await db.query("DELETE FROM nhan_vien WHERE id = ?", [id]);
    return result.affectedRows;
  },

  getSalaries: async () => {
    const query = `
      SELECT 
        nv.id, u.name, nv.chuc_vu,
        (SELECT COUNT(*) FROM lich_hen WHERE nhan_vien_id = nv.id AND status = 'hoan_thanh') as shifts_completed
      FROM nhan_vien nv
      JOIN users u ON nv.user_id = u.id
    `;
    const [rows] = await db.query(query);
    
    // Logic tính lương giả định
    return rows.map(emp => {
      const baseSalary = emp.chuc_vu === 'Quản lý' ? 10000000 : 7000000;
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
  }
};

module.exports = EmployeeModel;
