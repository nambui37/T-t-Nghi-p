// File: backend/src/routes/chatbotRoutes.js

const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

// Định nghĩa route: POST /api/chatbot
router.post("/", chatbotController.chat);

module.exports = router;
