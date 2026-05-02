const express = require("express");
const router = express.Router();
const cmsController = require("../controllers/cmsController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public routes: Khách vãng lai & user có thể xem danh sách (dùng cho trang Cẩm nang & Đội ngũ)
router.get("/articles", cmsController.getArticles);
router.get("/team", cmsController.getTeam);

// Admin routes: Chỉ Quản trị viên (role_id = 1) mới được Thêm/Sửa/Xóa dữ liệu
router.post("/articles", authMiddleware.verifyAdmin, cmsController.createArticle);
router.put("/articles/:id", authMiddleware.verifyAdmin, cmsController.updateArticle);
router.delete("/articles/:id", authMiddleware.verifyAdmin, cmsController.deleteArticle);

router.post("/team", authMiddleware.verifyAdmin, cmsController.createTeamMember);
router.put("/team/:id", authMiddleware.verifyAdmin, cmsController.updateTeamMember);
router.delete("/team/:id", authMiddleware.verifyAdmin, cmsController.deleteTeamMember);

module.exports = router;