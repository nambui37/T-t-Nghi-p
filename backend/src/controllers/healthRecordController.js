const HealthRecordModel = require("../models/healthRecordModel");

const healthRecordController = {
  getAll: async (req, res) => {
    try {
      const records = await HealthRecordModel.getAll();
      res.status(200).json({ success: true, data: records });
    } catch (error) {
      console.error("Lỗi lấy danh sách hồ sơ sức khỏe:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  getById: async (req, res) => {
    try {
      const record = await HealthRecordModel.getById(req.params.id);
      if (!record) return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ" });
      res.status(200).json({ success: true, data: record });
    } catch (error) {
      console.error("Lỗi lấy chi tiết hồ sơ sức khỏe:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ: " + error.message });
    }
  },

  create: async (req, res) => {
    try {
      const newId = await HealthRecordModel.create(req.body);
      res.status(201).json({ success: true, message: "Tạo hồ sơ thành công", data: { id: newId } });
    } catch (error) {
      console.error("Lỗi tạo hồ sơ:", error);
      res.status(500).json({ success: false, message: "Lỗi tạo hồ sơ (có thể khách hàng đã có hồ sơ)" });
    }
  },

  update: async (req, res) => {
    try {
      const affectedRows = await HealthRecordModel.update(req.params.id, req.body);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ" });
      res.status(200).json({ success: true, message: "Cập nhật hồ sơ thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  delete: async (req, res) => {
    try {
      const affectedRows = await HealthRecordModel.delete(req.params.id);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ" });
      res.status(200).json({ success: true, message: "Xóa hồ sơ thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  }
};

module.exports = healthRecordController;
