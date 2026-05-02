const db = require("../configs/db");

const CMSModel = {
  // =====================
  // 1. QUẢN LÝ CẨM NANG (ARTICLES)
  // =====================
  getAllArticles: async () => {
    const [rows] = await db.query("SELECT * FROM cam_nang ORDER BY id DESC");
    return rows;
  },
  createArticle: async (data) => {
    const { title = null, summary = null, content = null, category = null, author = null, read_time = null, image_url = null } = data;
    const [result] = await db.query(
      "INSERT INTO cam_nang (title, summary, content, category, author, read_time, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, summary, content, category, author, read_time, image_url]
    );
    return result.insertId;
  },
  updateArticle: async (id, data) => {
    const { title = null, summary = null, content = null, category = null, author = null, read_time = null, image_url = null } = data;
    const [result] = await db.query(
      "UPDATE cam_nang SET title=?, summary=?, content=?, category=?, author=?, read_time=?, image_url=? WHERE id=?",
      [title, summary, content, category, author, read_time, image_url, id]
    );
    return result.affectedRows;
  },
  deleteArticle: async (id) => {
    const [result] = await db.query("DELETE FROM cam_nang WHERE id=?", [id]);
    return result.affectedRows;
  },

  // =====================
  // 2. QUẢN LÝ ĐỘI NGŨ (TEAM MEMBERS)
  // =====================
  getAllTeam: async () => {
    const [rows] = await db.query("SELECT * FROM team_members ORDER BY id DESC");
    return rows;
  },
  createTeamMember: async (data) => {
    const { name = null, role = null, experience = null, image_url = null } = data;
    const [result] = await db.query(
      "INSERT INTO team_members (name, role, experience, image_url) VALUES (?, ?, ?, ?)",
      [name, role, experience, image_url]
    );
    return result.insertId;
  },
  updateTeamMember: async (id, data) => {
    const { name = null, role = null, experience = null, image_url = null } = data;
    const [result] = await db.query(
      "UPDATE team_members SET name=?, role=?, experience=?, image_url=? WHERE id=?",
      [name, role, experience, image_url, id]
    );
    return result.affectedRows;
  },
  deleteTeamMember: async (id) => {
    const [result] = await db.query("DELETE FROM team_members WHERE id=?", [id]);
    return result.affectedRows;
  }
};

module.exports = CMSModel;