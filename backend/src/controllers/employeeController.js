const EmployeeModel = require("../models/employeeModel");

const employeeController = {
  getAll: async (req, res) => {
    try {
      const employees = await EmployeeModel.getAllEmployees();
      res.status(200).json({ success: true, data: employees });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  getById: async (req, res) => {
    try {
      const employee = await EmployeeModel.getEmployeeById(req.params.id);
      if (!employee) return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
      res.status(200).json({ success: true, data: employee });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  },

  create: async (req, res) => {
    try {
      const newId = await EmployeeModel.createEmployee(req.body);
      res.status(201).json({ success: true, message: "Thêm nhân viên thành công", data: { id: newId, ...req.body } });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi thêm nhân viên", error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const affectedRows = await EmployeeModel.updateEmployee(req.params.id, req.body);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên để cập nhật" });
      res.status(200).json({ success: true, message: "Cập nhật nhân viên thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi cập nhật nhân viên", error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const affectedRows = await EmployeeModel.deleteEmployee(req.params.id);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên để xóa" });
      res.status(200).json({ success: true, message: "Xóa nhân viên thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Không thể xóa nhân viên do có dữ liệu liên quan" });
    }
  },

  getSalaries: async (req, res) => {
    try {
      const salaries = await EmployeeModel.getSalaries();
      res.status(200).json({ success: true, data: salaries });
    } catch (error) {
      console.error("Lỗi lấy bảng lương:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
  }
};

module.exports = employeeController;
