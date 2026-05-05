const db = require("../configs/db");

/**
 * Bảng nhan_vien là cầu nối user_id → users.id.
 * Junction chi_tiet_ca_lam / lich_hen_nhan_vien dùng nhan_vien.id (PK), không phải users.id.
 */

async function getNhanVienPkByUserId(connection, userId) {
  const pool = connection || db;
  const [rows] = await pool.query("SELECT id FROM nhan_vien WHERE user_id = ? LIMIT 1", [userId]);
  return rows[0]?.id ?? null;
}

async function ensureNhanVienForUser(connection, userId) {
  if (!userId) return null;
  const existing = await getNhanVienPkByUserId(connection, userId);
  if (existing) return existing;
  const pool = connection || db;
  const [result] = await pool.query("INSERT INTO nhan_vien (user_id, chuc_vu) VALUES (?, NULL)", [userId]);
  return result.insertId;
}

async function getUserIdByNhanVienPk(connection, nvPk) {
  if (!nvPk) return null;
  const pool = connection || db;
  const [rows] = await pool.query("SELECT user_id FROM nhan_vien WHERE id = ? LIMIT 1", [nvPk]);
  return rows[0]?.user_id ?? null;
}

module.exports = {
  getNhanVienPkByUserId,
  ensureNhanVienForUser,
  getUserIdByNhanVienPk,
};
