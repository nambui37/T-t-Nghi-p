const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// VNPay only
router.post("/vnpay", paymentController.createVNPayPayment);
router.get("/vnpay-return", paymentController.vnpayReturn);
router.get("/vnpay-ipn", paymentController.vnpayIPN);

module.exports = router;