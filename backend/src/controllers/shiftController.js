const ShiftModel = require("../models/shiftModel");
const db = require("../configs/db");

const shiftController = {
  getAvailable: async (req, res) => {
    try {
      const employeeId = req.user.id;
      const employeeRoles = [1, 2, 4, 5, 6, 7, 8];
      if (!employeeRoles.includes(Number(req.user.role_id))) {
        return res.status(403).json({ success: false, message: "Tài khoản của bạn không phải là nhân viên." });
      }

      if (!employeeId) {
        return res
          .status(403)
          .json({ success: false, message: "Bạn không phải là nhân viên" });
      }

      const shifts = await ShiftModel.getAvailableShifts(employeeId);
      res.status(200).json({ success: true, data: shifts });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  accept: async (req, res) => {
    try {
      const { lichHenId } = req.body;
      const employeeId = req.user.id;
      const employeeRoles = [1, 2, 4, 5, 6, 7, 8];
      if (!employeeRoles.includes(Number(req.user.role_id))) {
        return res.status(403).json({ success: false, message: "Tài khoản của bạn không phải là nhân viên." });
      }

      const affectedRows = await ShiftModel.acceptShift(
        employeeId,
        lichHenId,
      );
      if (affectedRows === 0)
        return res.status(400).json({
          success: false,
          message: "Ca này đã có người nhận hoặc không tồn tại",
        });
      res.status(200).json({ success: true, message: "Nhận ca thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  checkIn: async (req, res) => {
    try {
      const { lichHenId, toaDo } = req.body;
      const employeeId = req.user.id;
      const employeeRoles = [1, 2, 4, 5, 6, 7, 8];
      if (!employeeRoles.includes(Number(req.user.role_id))) {
        return res.status(403).json({ success: false, message: "Tài khoản của bạn không phải là nhân viên." });
      }

      const caLamId = await ShiftModel.checkIn(
        employeeId,
        lichHenId,
        toaDo,
      );
      res.status(200).json({
        success: true,
        data: { caLamId },
        message: "Check-in thành công",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  startService: async (req, res) => {
    try {
      const { caLamId } = req.body;
      const employeeId = req.user.id;
      const employeeRoles = [1, 2, 4, 5, 6, 7, 8];
      if (!employeeRoles.includes(Number(req.user.role_id))) {
        return res.status(403).json({ success: false, message: "Tài khoản của bạn không phải là nhân viên." });
      }

      const affectedRows = await ShiftModel.startService(employeeId, caLamId);
      if (affectedRows === 0) {
        return res.status(400).json({ success: false, message: "Không thể bắt đầu dịch vụ" });
      }
      res.status(200).json({ success: true, message: "Đã bắt đầu thực hiện dịch vụ" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  checkOut: async (req, res) => {
    try {
      const { caLamId, ghiChu } = req.body;
      const employeeId = req.user.id;
      const employeeRoles = [1, 2, 4, 5, 6, 7, 8];
      if (!employeeRoles.includes(Number(req.user.role_id))) {
        return res.status(403).json({ success: false, message: "Tài khoản của bạn không phải là nhân viên." });
      }

      const affectedRows = await ShiftModel.checkOut(
        employeeId,
        caLamId,
        ghiChu,
      );
      res.status(200).json({ success: true, message: "Check-out thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = shiftController;
