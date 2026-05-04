const IncidentModel = require("../models/incidentModel");
const db = require("../configs/db");

const incidentController = {
  report: async (req, res) => {
    try {
      const nhanVienId = req.user.id;

      const insertId = await IncidentModel.create({
        ...req.body,
        nhan_vien_id: nhanVienId
      });

      res.status(201).json({ success: true, message: "Báo cáo sự cố thành công. Admin đã được thông báo.", data: { id: insertId } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      if (req.user.role_id !== 1 && req.user.role_id !== 4) {
        return res.status(403).json({ success: false, message: "Chỉ Admin/Quản lý mới có quyền xem danh sách sự cố" });
      }
      const incidents = await IncidentModel.getAll();
      res.status(200).json({ success: true, data: incidents });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  handle: async (req, res) => {
    try {
      if (req.user.role_id !== 1 && req.user.role_id !== 4) {
        return res.status(403).json({ success: false, message: "Chỉ Admin/Quản lý mới có quyền xử lý sự cố" });
      }
      const { status, admin_ghi_chu } = req.body;
      const affectedRows = await IncidentModel.updateStatus(req.params.id, status, admin_ghi_chu);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy sự cố" });
      res.status(200).json({ success: true, message: "Cập nhật trạng thái sự cố thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = incidentController;
