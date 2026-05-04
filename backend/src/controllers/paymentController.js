const axios = require('axios');
const crypto = require('crypto');
const AppointmentModel = require("../models/appointmentModel");

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

exports.createVNPayPayment = async (req, res) => {
  try {
    const { amount, orderId, orderInfo } = req.body;
    
    let date = new Date();
    let createDate = date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
    
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let tmnCode = process.env.VNP_TMN_CODE || "382BANDA"; 
    let secretKey = process.env.VNP_HASH_SECRET || "LAEOGK9481U02Z2WMDFR9MGOJO8MUE7A"; 
    let vnpUrl = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    
    // Fix: Cấu hình ReturnUrl linh hoạt hơn
    let protocol = req.protocol;
    let host = req.get('host');
    let returnUrl;
    
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      returnUrl = `http://localhost:5173/ho-so`;
    } else {
      // Nếu truy cập qua IP mạng LAN (ví dụ 192.168.1.10)
      let ip = host.split(':')[0];
      returnUrl = `${protocol}://${ip}:5173/ho-so`;
    }

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId + "_" + date.getTime();
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    let paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });

    res.json({ payUrl: paymentUrl });
  } catch (error) {
    console.error("VNPay Error:", error);
    res.status(500).json({ message: "Lỗi tạo link VNPay" });
  }
};

exports.vnpayReturn = async (req, res) => {
  let protocol = req.protocol;
  let host = req.get('host');
  let redirectUrl;
  
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    redirectUrl = `http://localhost:5173/ho-so?status=success`;
  } else {
    let ip = host.split(':')[0];
    redirectUrl = `${protocol}://${ip}:5173/ho-so?status=success`;
  }
  
  res.redirect(redirectUrl);
};

exports.vnpayIPN = async (req, res) => {
  try {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    
    let orderIdStr = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];
    let amount = vnp_Params['vnp_Amount'] / 100;

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    
    let secretKey = process.env.VNP_HASH_SECRET || "LAEOGK9481U02Z2WMDFR9MGOJO8MUE7A";
    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");     

    if (secureHash === signed) {
      let orderId = orderIdStr.split('_')[0]; // Tách lấy ID lịch hẹn do lúc tạo nối thêm date.getTime()
      
      if (rspCode === '00') {
        // Cập nhật trạng thái lịch hẹn
        await AppointmentModel.updateStatus(orderId, "da_xac_nhan", { 
          trang_thai_thanh_toan: "da_coc_15" // Cọc 15%
        });
        
        // Ghi lại lịch sử giao dịch vào bảng thanh_toan
        const db = require("../configs/db");
        await db.query(
          "INSERT INTO thanh_toan (lich_hen_id, so_tien, hinh_thuc, ngay_thanh_toan) VALUES (?, ?, 'vnpay', NOW())",
          [orderId, amount]
        );
      }
      // Báo lại cho VNPay biết là Server đã ghi nhận thành công
      res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } else {
      res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }
  } catch (error) {
    console.error("Lỗi xử lý IPN VNPay:", error);
    res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};