const AppointmentModel = require("../models/appointmentModel");
const { sendEmail } = require("../utils/emailHelper");

const appointmentController = {
  getAll: async (req, res) => {
    try {
      const { page, limit, status, search, dia_diem, ngay_trong_lich } = req.query;
      
      // Kiểm tra req.user
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Không tìm thấy thông tin xác thực" });
      }

      // Nếu là Admin (role_id = 1) hoặc Nhân viên/Bác sĩ/Y tá (2, 4, 5, 6, 7, 8), lấy hết (hoặc theo filter). 
      // Nếu là User, chỉ lấy của chính họ.
      const isAdminOrStaff = [1, 2, 4, 5, 6, 7, 8].includes(Number(req.user.role_id));
      const userId = isAdminOrStaff ? null : req.user.id;
      
      console.log("Fetching appointments for user:", { userId, role: req.user.role_id });

      const result = await AppointmentModel.getAllAppointments(userId, {
        page,
        limit,
        status,
        search,
        dia_diem,
        ngay_trong_lich,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      console.error("Lỗi lấy danh sách lịch hẹn:", error);
      res.status(500).json({ success: false, message: "Lỗi lấy danh sách lịch hẹn", error: error.message });
    }
  },
  create: async (req, res) => {
    try {
      // Logic xác định userId:
      // 1. Nếu là Admin/Nhân viên tạo lịch: 
      //    - Nếu chọn khách hàng hệ thống: dùng user_id từ body.
      //    - Nếu là khách vãng lai: dùng null.
      // 2. Nếu là Khách hàng tự đặt (qua app/web):
      //    - Dùng ID của chính họ từ token (req.user.id).
      
      const isAdminOrStaff = req.user && [1, 2, 4, 5, 6, 7, 8].includes(Number(req.user.role_id));
      let userId = null;

      if (isAdminOrStaff) {
        // Admin tạo: lấy user_id từ body, nếu không có (khách vãng lai) thì để null
        userId = req.body.user_id || null;
      } else if (req.user) {
        // Khách hàng tự đặt: lấy ID từ token
        userId = req.user.id;
      } else {
        // Trường hợp không đăng nhập (nếu có cho phép đặt ẩn danh)
        userId = req.body.user_id || null;
      }
      
      // Gộp userId vào dữ liệu lịch hẹn
      const appointmentData = { ...req.body, userId };
      console.log("Creating appointment with userId:", userId, "Guest:", req.body.guest_name);
      
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
  assignEmployee: async (req, res) => {
    try {
      const { id } = req.params;
      const { nhan_vien_id } = req.body;
      
      // Chỉ Admin (1) và Quản lý (4) mới có quyền phân việc
      if (![1, 4].includes(Number(req.user.role_id))) {
        return res.status(403).json({ success: false, message: "Bạn không có quyền phân chia việc." });
      }

      const affectedRows = await AppointmentModel.assignEmployee(id, nhan_vien_id);
      if (affectedRows === 0) return res.status(404).json({ success: false, message: "Không tìm thấy lịch hẹn" });
      
      res.status(200).json({ success: true, message: "Đã phân chia việc cho nhân viên" });
    } catch (error) {
      console.error("Lỗi phân chia việc:", error);
      const msg = error.message || "";
      if (msg.includes("Nhân viên đã có lịch trùng")) {
        return res.status(400).json({ success: false, message: msg });
      }
      res.status(500).json({ success: false, message: "Lỗi phân chia việc", error: error.message });
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
  cancel: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const affectedRows = await AppointmentModel.cancelAppointment(id, userId);
      if (affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy lịch hẹn hoặc bạn không có quyền hủy lịch này." });
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Đã hủy lịch hẹn. Lưu ý: Tiền cọc sẽ không được hoàn lại theo quy định." 
      });
    } catch (error) {
      console.error("Lỗi hủy lịch hẹn:", error);
      res.status(500).json({ success: false, message: error.message || "Lỗi khi hủy lịch hẹn" });
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