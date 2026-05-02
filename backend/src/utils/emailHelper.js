const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Khởi tạo transporter với cấu hình Gmail và App Password của bạn
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "nambui37x11@gmail.com",
        pass: process.env.EMAIL_PASS || "jbub yins zhnj gwxo", // Đã xác minh mật khẩu này hoạt động
      },
    });

    // Thiết lập nội dung email
    const mailOptions = {
      from: '"Mom & Baby" <nambui37x11@gmail.com>', // Tên người gửi hiển thị
      to: to, // Email người nhận
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Đã gửi email thành công: " + info.response);
    return true;
  } catch (error) {
    console.error("Lỗi khi gửi email: ", error);
    return false;
  }
};

module.exports = { sendEmail };