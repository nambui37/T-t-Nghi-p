const AppointmentModel = require("../models/appointmentModel");
const { sendEmail } = require("../utils/emailHelper");

const appointmentController = {
  getAll: async (req, res) => {
    try {
      const { page, limit, status, search } = req.query;
      
      // Kiểm tra req.user
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Không tìm thấy thông tin xác thực" });
      }

      // Nếu là Admin (role_id = 1) hoặc Nhân viên/Bác sĩ/Y tá (2, 4, 5, 6, 7, 8), lấy hết (hoặc theo filter). 
      // Nếu là User, chỉ lấy của chính họ.
      const isAdminOrStaff = [1, 2, 4, 5, 6, 7, 8].includes(Number(req.user.role_id));
      const userId = isAdminOrStaff ? null : req.user.id;
      
      console.log("Fetching appointments for user:", { userId, role: req.user.role_id });

      const result = await AppointmentModel.getAllAppointments(userId, { page, limit, status, search });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      console.error("Lỗi lấy danh sách lịch hẹn:", error);
      res.status(500).json({ success: false, message: "Lỗi lấy danh sách lịch hẹn", error: error.message });
    }
  },
  create: async (req, res) => {
    try {
      // Lấy userId từ token nếu có (nhờ middleware verifyToken linh hoạt)
      const userId = req.user ? req.user.id : null;
      
      // Gộp userId (có thể null) vào dữ liệu lịch hẹn
      const appointmentData = { ...req.body, userId };
      
      const newId = await AppointmentModel.createAppointment(appointmentData);
      res.status(201).json({ success: true, message: "Đặt lịch thành công", data: { id: newId } });
    } catch (error) {
      console.error("Lỗi đặt lịch:", error);
      res.status(500).json({ success: false, message: error.message || "Lỗi đặt lịch" });
    }
  },
  addNote: async (req, res) => {
    try {
      const { id } = req.params;
      const { ghi_chu_nhan_vien } = req.body;
      const affectedRows = await AppointmentModel.updateEmployeeNote(id, ghi_chu_nhan_vien);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy lịch hẹn" });
      res.status(200).json({ success: true, message: "Đã cập nhật ghi chú nhân viên" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi cập nhật ghi chú", error: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const affectedRows = await AppointmentModel.deleteAppointment(req.params.id);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy lịch hẹn" });
      res.status(200).json({ success: true, message: "Đã hủy lịch hẹn" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi hủy lịch hẹn", error: error.message });
    }
  },
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, ngay_bat_dau_thuc_te, ngay_ket_thuc_thuc_te, trang_thai_thanh_toan } = req.body;
      
      console.log("Updating Appointment Status:", { id, status, ngay_bat_dau_thuc_te, ngay_ket_thuc_thuc_te, trang_thai_thanh_toan });

      const affectedRows = await AppointmentModel.updateStatus(id, status, { 
        ngay_bat_dau_thuc_te, 
        ngay_ket_thuc_thuc_te,
        trang_thai_thanh_toan
      });
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy lịch hẹn" });

      // GỬI EMAIL THÔNG BÁO TỰ ĐỘNG
      try {
        const [aptData] = await require("../configs/db").query(`
          SELECT lh.*, gdv.name as service_name, u.email as user_email
          FROM lich_hen lh
          LEFT JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
          LEFT JOIN khach_hang kh ON lh.khach_hang_id = kh.id
          LEFT JOIN users u ON kh.user_id = u.id
          WHERE lh.id = ?`, [id]);
        
        const apt = aptData[0];
        const targetEmail = apt.user_email;

        if (targetEmail) {
          let subject = "";
          let content = "";

          if (status === "da_xac_nhan") {
            subject = "Lịch hẹn Mom&Baby của bạn đã được xác nhận!";
            content = `<h3>Chào ${apt.guest_name || 'bạn'},</h3>
                       <p>Lịch hẹn <b>#${id}</b> (${apt.service_name}) của bạn đã được xác nhận thành công.</p>
                       <p>Thời gian dự kiến: ${new Date(apt.ngay_bat_dau).toLocaleDateString()}</p>
                       <p>Chúng tôi sẽ sớm cử nhân viên đến hỗ trợ bạn. Cảm ơn bạn đã tin dùng dịch vụ!</p>`;
          } else if (status === "hoan_thanh") {
            subject = "Cảm ơn bạn đã sử dụng dịch vụ tại Mom&Baby!";
            content = `<h3>Chúc mừng mẹ và bé đã hoàn thành ca chăm sóc!</h3>
                       <p>Lịch hẹn <b>#${id}</b> đã hoàn tất vào ngày ${new Date().toLocaleDateString()}.</p>
                       <p>Bạn có thể vào trang cá nhân để xem Hồ sơ sức khỏe của mình. Rất mong được gặp lại bạn!</p>`;
          }

          if (subject) {
            await sendEmail(targetEmail, subject, content);
          }
        }
      } catch (emailErr) {
        console.error("Lỗi gửi email thông báo:", emailErr);
      }

      res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công" });
    } catch (error) {
      console.error("Lỗi Controller updateStatus:", error);
      res.status(500).json({ success: false, message: "Lỗi cập nhật trạng thái", error: error.message });
    }
  }
};
module.exports = appointmentController;