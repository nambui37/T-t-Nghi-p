const CMSModel = require("../models/cmsModel");

const cmsController = {
  // =====================
  // CẨM NANG (ARTICLES)
  // =====================
  getArticles: async (req, res) => {
    try {
      const articles = await CMSModel.getAllArticles();
      res.status(200).json({ success: true, data: articles });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách cẩm nang", error: error.message });
    }
  },
  createArticle: async (req, res) => {
    try {
      const insertId = await CMSModel.createArticle(req.body);
      res.status(201).json({ success: true, message: "Đăng bài viết mới thành công", data: { id: insertId, ...req.body } });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi khi đăng bài viết", error: error.message });
    }
  },
  updateArticle: async (req, res) => {
    try {
      const affectedRows = await CMSModel.updateArticle(req.params.id, req.body);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy bài viết để cập nhật" });
      res.status(200).json({ success: true, message: "Cập nhật bài viết thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi khi cập nhật bài viết", error: error.message });
    }
  },
  deleteArticle: async (req, res) => {
    try {
      const affectedRows = await CMSModel.deleteArticle(req.params.id);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy bài viết để xóa" });
      res.status(200).json({ success: true, message: "Xóa bài viết thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi khi xóa bài viết", error: error.message });
    }
  },

  // =====================
  // ĐỘI NGŨ (TEAM MEMBERS)
  // =====================
  getTeam: async (req, res) => {
    try {
      const team = await CMSModel.getAllTeam();
      res.status(200).json({ success: true, data: team });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách đội ngũ", error: error.message });
    }
  },
  createTeamMember: async (req, res) => {
    try {
      const insertId = await CMSModel.createTeamMember(req.body);
      res.status(201).json({ success: true, message: "Thêm thành viên thành công", data: { id: insertId, ...req.body } });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi khi thêm thành viên", error: error.message });
    }
  },
  updateTeamMember: async (req, res) => {
    try {
      const affectedRows = await CMSModel.updateTeamMember(req.params.id, req.body);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy thành viên để cập nhật" });
      res.status(200).json({ success: true, message: "Cập nhật thành viên thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi khi cập nhật thành viên", error: error.message });
    }
  },
  deleteTeamMember: async (req, res) => {
    try {
      const affectedRows = await CMSModel.deleteTeamMember(req.params.id);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy thành viên để xóa" });
      res.status(200).json({ success: true, message: "Xóa thành viên thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi khi xóa thành viên", error: error.message });
    }
  }
};

module.exports = cmsController;