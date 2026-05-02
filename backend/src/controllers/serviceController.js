const ServiceModel = require("../models/serviceModel");
const StatsModel = require("../models/statsModel");

const serviceController = {
  // --- SERVICE METHODS ---
  getAll: async (req, res) => {
    try {
      const services = await ServiceModel.getAllServices();
      res.status(200).json({ success: true, data: services });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dịch vụ:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  getById: async (req, res) => {
    try {
      const service = await ServiceModel.getServiceById(req.params.id);
      if (!service) return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ" });
      res.status(200).json({ success: true, data: service });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  create: async (req, res) => {
    try {
      const newId = await ServiceModel.createService(req.body);
      res.status(201).json({ success: true, message: "Thêm thành công", data: { id: newId, ...req.body } });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi thêm dịch vụ", error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const affectedRows = await ServiceModel.updateService(req.params.id, req.body);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ để cập nhật" });
      res.status(200).json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi cập nhật dịch vụ", error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const affectedRows = await ServiceModel.deleteService(req.params.id);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ để xóa" });
      res.status(200).json({ success: true, message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Không thể xóa do dịch vụ đang được sử dụng ở nơi khác" });
    }
  },

  // --- STATS METHODS ---
  getDashboardStats: async (req, res) => {
    try {
      const stats = await StatsModel.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error("Lỗi lấy thống kê dashboard:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  getRevenueStats: async (req, res) => {
    try {
      const stats = await StatsModel.getRevenueStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error("Lỗi lấy thống kê doanh thu:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  }
};

module.exports = serviceController;