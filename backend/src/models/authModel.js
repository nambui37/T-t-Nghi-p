const db = require("../configs/db");
const bcrypt = require("bcryptjs");

const AuthModel = {
  // --- AUTH METHODS ---
  findUserByEmail: async (email) => {
    const [rows] = await db.query(
      `SELECT u.*, k.id as khach_hang_id 
       FROM users u 
       LEFT JOIN khach_hang k ON u.id = k.user_id 
       WHERE u.email = ?`, 
      [email]
    );
    return rows[0];
  },

  createUser: async (userData) => {
    const { name, email, password, phone, verificationToken, otpExpiresAt } = userData;
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Mặc định role_id = 3 (khach_hang) cho người dùng mới đăng ký
    const defaultRoleId = 3;

    const [result] = await db.query(
      "INSERT INTO users (name, email, password, phone, role_id, verification_token, otp_expires_at, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone || null, defaultRoleId, verificationToken || null, otpExpiresAt || null, verificationToken ? 0 : 1]
    );
    
    // Sau khi tạo user, tạo luôn một record trong bảng khach_hang
    await db.query("INSERT INTO khach_hang (user_id) VALUES (?)", [result.insertId]);

    return { userId: result.insertId };
  },

  verifyEmail: async (email, otp) => {
    const [result] = await db.query(
      "UPDATE users SET is_verified = 1, verification_token = NULL, otp_expires_at = NULL WHERE email = ? AND verification_token = ? AND otp_expires_at > NOW()",
      [email, otp]
    );
    return result.affectedRows > 0;
  },

  getUserProfile: async (userId) => {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar, u.role_id, u.created_at, r.name as role_name, k.id as khach_hang_id, k.hang_thanh_vien
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN khach_hang k ON u.id = k.user_id
       WHERE u.id = ?`,
      [userId]
    );
    return rows[0];
  },

  updatePassword: async (userId, hashedPassword) => {
    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  },

  updateAvatar: async (userId, avatarPath) => {
    const [result] = await db.query(
      "UPDATE users SET avatar = ? WHERE id = ?",
      [avatarPath, userId]
    );
    return result.affectedRows > 0;
  },

  getPassword: async (userId) => {
    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [userId]);
    return rows[0]?.password;
  },

  savePasswordResetToken: async (email, token, expiresAt) => {
    const [result] = await db.query(
      "UPDATE users SET verification_token = ?, otp_expires_at = ? WHERE email = ?",
      [token, expiresAt, email]
    );
    return result.affectedRows > 0;
  },

  updatePasswordWithToken: async (email, token, hashedPassword) => {
    const [result] = await db.query(
      "UPDATE users SET password = ?, verification_token = NULL, otp_expires_at = NULL WHERE email = ? AND verification_token = ? AND otp_expires_at > NOW()",
      [hashedPassword, email, token]
    );
    return result.affectedRows > 0;
  },

  updateVerificationToken: async (email, token, expiresAt) => {
    const [result] = await db.query(
      "UPDATE users SET verification_token = ?, otp_expires_at = ? WHERE email = ?",
      [token, expiresAt, email]
    );
    return result.affectedRows > 0;
  },

  // --- USER MANAGEMENT METHODS (ADMIN) ---
  getAllCustomers: async () => {
    const [rows] = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.created_at, u.status,
        kh.dia_chi, kh.hang_thanh_vien,
        (SELECT COUNT(*) FROM lich_hen WHERE khach_hang_id = kh.id) as total_appointments
      FROM users u
      LEFT JOIN khach_hang kh ON u.id = kh.user_id
      WHERE u.role_id = 3
      UNION ALL
      SELECT 
        NULL as id, lh.guest_name as name, 'Guest' as email, lh.guest_phone as phone, 
        MIN(lh.created_at) as created_at, 'hoat_dong' as status,
        NULL as dia_chi, 'Vãng lai' as hang_thanh_vien,
        COUNT(*) as total_appointments
      FROM lich_hen lh
      WHERE lh.khach_hang_id IS NULL
      GROUP BY lh.guest_name, lh.guest_phone
      ORDER BY created_at DESC
    `);
    return rows;
  },

  getAllUsers: async () => {
    const [rows] = await db.query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    return rows;
  },

  adminCreateUser: async (userData) => {
    const { name, email, password, phone, role_id } = userData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      "INSERT INTO users (name, email, password, phone, role_id, is_verified) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone, role_id, 1]
    );
    
    if (parseInt(role_id) === 3) {
      await db.query("INSERT INTO khach_hang (user_id) VALUES (?)", [result.insertId]);
    }
    return result.insertId;
  },

  updateUser: async (id, userData) => {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(userData)) {
      if (['name', 'email', 'phone', 'role_id', 'status', 'avatar'].includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return 0;
    
    values.push(id);
    const [result] = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  },

  deleteUser: async (id) => {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows;
  },

  updateStatus: async (id, status) => {
    const [result] = await db.query(
      "UPDATE users SET status = ? WHERE id = ?",
      [status, id]
    );
    return result.affectedRows;
  }
};

module.exports = AuthModel;