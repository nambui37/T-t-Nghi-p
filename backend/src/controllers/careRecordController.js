const CareRecordModel = require("../models/careRecordModel");
const db = require("../configs/db");

const careRecordController = {
  create: async (req, res) => {
    try {
      const nhanVienId = req.user.id;

      const insertId = await CareRecordModel.create({
        ...req.body,
        nhan_vien_id: nhanVienId
      });

      res.status(201).json({ success: true, message: "Tạo Care Record thành công", data: { id: insertId } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getByAppointment: async (req, res) => {
    try {
      const records = await CareRecordModel.getByAppointmentId(req.params.appointmentId);
      res.status(200).json({ success: true, data: records });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const affectedRows = await CareRecordModel.update(req.params.id, req.body);
      if (affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi" });
      }
      res.status(200).json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = careRecordController;
