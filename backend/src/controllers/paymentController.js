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

exports.createMomoPayment = async (req, res) => {
  const { amount, orderId, orderInfo } = req.body;
  
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  
  const requestId = partnerCode + new Date().getTime();
  const requestType = "captureWallet";
  const extraData = ""; 
  const redirectUrl = "http://localhost:5173/ho-so"; 
  const ipnUrl = "http://localhost:5001/api/payment/momo-ipn"; 

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  
  const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

  const requestBody = {
    partnerCode, accessKey, requestId, amount, orderId, orderInfo,
    redirectUrl, ipnUrl, extraData, requestType, signature, lang: "vi"
  };

  try {
    const response = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody);
    return res.json({ payUrl: response.data.payUrl });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi kết nối tới Momo", error: error.message });
  }
};

exports.momoIPN = async (req, res) => {
  try {
    const { partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature } = req.body;

    const secretKey = process.env.MOMO_SECRET_KEY;
    const accessKey = process.env.MOMO_ACCESS_KEY;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const checkSignature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    if (signature !== checkSignature) {
      console.error("Momo IPN: Invalid signature!");
      return res.status(400).json({ message: "Invalid signature" });
    }

    if (resultCode === 0) {
      console.log(`Momo IPN: Payment successful for Order ID: ${orderId}`);
      await AppointmentModel.updateStatus(orderId, "da_xac_nhan", { 
        trang_thai_thanh_toan: "da_coc_30" 
      });
      
      const db = require("../configs/db");
      await db.query(
        "INSERT INTO thanh_toan (lich_hen_id, so_tien, ngay_thanh_toan) VALUES (?, ?, NOW())",
        [orderId, amount]
      );
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Lỗi xử lý Momo IPN:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

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

    let tmnCode = process.env.VNP_TMN_CODE || "TCB00011"; 
    let secretKey = process.env.VNP_HASH_SECRET || "ABCDEFGH"; 
    let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    let returnUrl = "http://localhost:5173/ho-so";

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
  res.redirect("http://localhost:5173/ho-so?status=success");
};