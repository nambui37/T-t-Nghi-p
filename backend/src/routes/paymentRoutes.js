const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/momo", paymentController.createMomoPayment);
router.post("/momo-ipn", paymentController.momoIPN);

router.post("/vnpay", paymentController.createVNPayPayment);
router.get("/vnpay-return", paymentController.vnpayReturn);

module.exports = router;
