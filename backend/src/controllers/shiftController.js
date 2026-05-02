const ShiftModel = require("../models/shiftModel");
const db = require("../configs/db");

// Hàm hỗ trợ lấy id nhân viên, nếu chưa có trong bảng nhan_vien thì tạo mới (dành cho các tài khoản cũ)
const getOrCreateEmployeeId = async (userId, roleId) => {
  const [nv] = await db.query("SELECT id FROM nhan_vien WHERE user_id = ?", [
    userId,
  ]);
  if (nv.length > 0) return nv[0].id;

  // Nếu là các role nhân viên (2, 4, 5, 6, 7, 8) nhưng chưa có trong bảng nhan_vien
  const allowedRoles = [1, 2, 4, 5, 6, 7, 8];
  if (allowedRoles.includes(Number(roleId))) {
    const chuc_vu_map = {
      1: "Quản lý (Admin)",
      2: "Nhân viên",
      4: "Chuyên gia",
      5: "Bác sĩ",
      6: "Y tá",
      7: "Chuyên viên tư vấn",
      8: "Chuyên viên kỹ thuật",
    };
    const chuc_vu = chuc_vu_map[roleId] || "Nhân viên";
    const [result] = await db.query(
      "INSERT INTO nhan_vien (user_id, chuc_vu) VALUES (?, ?)",
      [userId, chuc_vu],
    );
    return result.insertId;
  }
  return null;
};

const shiftController = {
  getAvailable: async (req, res) => {
    try {
      const employeeId = await getOrCreateEmployeeId(
        req.user.id,
        req.user.role_id,
      );
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
      const employeeId = await getOrCreateEmployeeId(
        req.user.id,
        req.user.role_id,
      );
      if (!employeeId) {
        return res
          .status(403)
          .json({ success: false, message: "Bạn không phải là nhân viên" });
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
      const employeeId = await getOrCreateEmployeeId(
        req.user.id,
        req.user.role_id,
      );
      if (!employeeId) {
        return res
          .status(403)
          .json({ success: false, message: "Bạn không phải là nhân viên" });
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

  checkOut: async (req, res) => {
    try {
      const { caLamId, ghiChu } = req.body;
      const employeeId = await getOrCreateEmployeeId(
        req.user.id,
        req.user.role_id,
      );
      if (!employeeId) {
        return res
          .status(403)
          .json({ success: false, message: "Bạn không phải là nhân viên" });
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
