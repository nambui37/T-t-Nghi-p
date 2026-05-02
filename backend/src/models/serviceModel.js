const db = require("../configs/db");

const ServiceModel = {
  getAllServices: async () => {
    const [rows] = await db.query(`
      SELECT g.*, c.mo_ta, l.name as loai_name,
      (SELECT AVG(rating) FROM danh_gia WHERE goi_id = g.id) as average_rating,
      (SELECT COUNT(*) FROM danh_gia WHERE goi_id = g.id) as review_count
      FROM goi_dich_vu g 
      LEFT JOIN chi_tiet_goi c ON g.id = c.goi_id
      LEFT JOIN loai_dich_vu l ON g.loai_id = l.id
    `);
    return rows;
  },
  getServiceById: async (id) => {
    const [rows] = await db.query(`
      SELECT g.*, c.mo_ta, l.name as loai_name,
      (SELECT AVG(rating) FROM danh_gia WHERE goi_id = g.id) as average_rating,
      (SELECT COUNT(*) FROM danh_gia WHERE goi_id = g.id) as review_count
      FROM goi_dich_vu g 
      LEFT JOIN chi_tiet_goi c ON g.id = c.goi_id
      LEFT JOIN loai_dich_vu l ON g.loai_id = l.id
      WHERE g.id = ?
    `, [id]);
    return rows[0];
  },
  createService: async (serviceData) => {
    const { name, loai_id, gia, mo_ta, thoi_gian } = serviceData;
    const [result] = await db.query("INSERT INTO goi_dich_vu (name, loai_id, gia, thoi_gian) VALUES (?, ?, ?, ?)", [name, loai_id, gia, thoi_gian || '60 Phút']);
    const newId = result.insertId;
    if (mo_ta) {
      await db.query("INSERT INTO chi_tiet_goi (goi_id, mo_ta) VALUES (?, ?)", [newId, mo_ta]);
    }
    return newId;
  },
  updateService: async (id, serviceData) => {
    const { name, loai_id, gia, mo_ta, thoi_gian } = serviceData;
    const [result] = await db.query("UPDATE goi_dich_vu SET name = ?, loai_id = ?, gia = ?, thoi_gian = ? WHERE id = ?", [name, loai_id, gia, thoi_gian, id]);
    
    // Cập nhật mô tả
    if (mo_ta !== undefined) {
      const [details] = await db.query("SELECT id FROM chi_tiet_goi WHERE goi_id = ?", [id]);
      if (details.length > 0) {
        await db.query("UPDATE chi_tiet_goi SET mo_ta = ? WHERE goi_id = ?", [mo_ta, id]);
      } else {
        await db.query("INSERT INTO chi_tiet_goi (goi_id, mo_ta) VALUES (?, ?)", [id, mo_ta]);
      }
    }
    
    return result.affectedRows;
  },
  deleteService: async (id) => {
    // Xóa chi tiết trước
    await db.query("DELETE FROM chi_tiet_goi WHERE goi_id = ?", [id]);
    const [result] = await db.query("DELETE FROM goi_dich_vu WHERE id = ?", [id]);
    return result.affectedRows;
  }
};

module.exports = ServiceModel;