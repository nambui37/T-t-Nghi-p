const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware.verifyToken, incidentController.getAll);
router.post("/report", authMiddleware.verifyToken, incidentController.report);
router.put("/:id/handle", authMiddleware.verifyToken, incidentController.handle);

module.exports = router;
