const express = require("express");
const router = express.Router();
const careRecordController = require("../controllers/careRecordController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/:appointmentId", authMiddleware.verifyToken, careRecordController.getByAppointment);
router.post("/", authMiddleware.verifyToken, careRecordController.create);
router.put("/:id", authMiddleware.verifyToken, careRecordController.update);

module.exports = router;
