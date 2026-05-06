const express = require("express");
const router = express.Router();
const db = require("../configs/db");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { goi_id, rating, comment } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role_id;

    // Admin Roles (1, 4, 5, etc.) bypass all checks
    const isAdmin = [1, 4, 5, 6, 7, 8].includes(Number(userRole));

    // Lấy khach_hang_id từ user_id (nếu có)
    const [khRows] = await db.query("SELECT id FROM khach_hang WHERE user_id = ?", [userId]);
    const khach_hang_id = khRows.length > 0 ? khRows[0].id : null;

    // Nếu không phải Admin thì mới kiểm tra điều kiện hoàn thành
    if (!isAdmin) {
      if (!khach_hang_id) {
        return res.status(403).json({ success: false, message: "Bạn không phải là khách hàng." });
      }

      // KIỂM TRA: 1 tài khoản chỉ đánh giá 1 lần cho 1 dịch vụ
      const [existingReview] = await db.query(
        "SELECT id FROM danh_gia WHERE user_id = ? AND goi_id = ?",
        [userId, goi_id]
      );

      if (existingReview.length > 0) {
        return res.status(400).json({ success: false, message: "Bạn đã đánh giá dịch vụ này rồi." });
      }

      // KIỂM TRA: Phải sử dụng gói mới cho đánh giá
      const [usageRows] = await db.query(
        "SELECT id FROM lich_hen WHERE khach_hang_id = ? AND goi_id = ? AND status = 'hoan_thanh'",
        [khach_hang_id, goi_id]
      );

      if (usageRows.length === 0) {
        return res.status(403).json({ success: false, message: "Bạn cần hoàn thành sử dụng gói dịch vụ này trước khi đánh giá." });
      }
    }

    // Lưu vào CSDL (Dùng cả user_id và khach_hang_id để tương thích ngược)
    await db.query(
      "INSERT INTO danh_gia (khach_hang_id, user_id, goi_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [khach_hang_id, userId, goi_id, rating, comment]
    );
    
    res.status(201).json({ success: true, message: "Cảm ơn bạn đã đánh giá!" });
  } catch (error) {
    console.error("Lỗi đánh giá:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi lưu đánh giá." });
  }
});

// User Route: Cập nhật đánh giá (trong vòng 24h)
router.put("/:id", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const reviewId = req.params.id;
    const userId = req.user.id;

    // 1. Tìm đánh giá
    const [reviews] = await db.query("SELECT * FROM danh_gia WHERE id = ?", [reviewId]);
    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá." });
    }
    
    const review = reviews[0];
    if (review.user_id !== userId) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền chỉnh sửa đánh giá này." });
    }

    // 2. Kiểm tra thời gian (24h)
    const reviewDate = new Date(review.created_at).getTime();
    const now = new Date().getTime();
    if (now - reviewDate > 24 * 60 * 60 * 1000) {
      return res.status(400).json({ success: false, message: "Đã quá 24h, bạn không thể chỉnh sửa đánh giá này nữa." });
    }

    // 3. Cập nhật
    await db.query("UPDATE danh_gia SET rating = ?, comment = ? WHERE id = ?", [rating, comment, reviewId]);
    res.status(200).json({ success: true, message: "Cập nhật đánh giá thành công!" });
  } catch (error) {
    console.error("Lỗi cập nhật đánh giá:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật đánh giá." });
  }
});

// Admin Route: Lấy tất cả đánh giá
router.get("/all", authMiddleware.verifyAdmin, async (req, res) => {
  try {
    const { search, rating } = req.query;
    let query = `
      SELECT dg.id, dg.rating, dg.comment, dg.created_at, 
             COALESCE(u.name, 'Khách hàng ẩn danh') as customer_name, 
             u.avatar as customer_avatar,
             COALESCE(g.name, 'Dịch vụ đã xóa') as service_name
      FROM danh_gia dg
      LEFT JOIN users u ON dg.user_id = u.id
      LEFT JOIN goi_dich_vu g ON dg.goi_id = g.id
      WHERE 1=1
    `;
    const params = [];

    if (rating) {
      query += ` AND dg.rating = ?`;
      params.push(rating);
    }

    if (search) {
      query += ` AND (u.name LIKE ? OR g.name LIKE ? OR dg.comment LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY dg.created_at DESC`;

    const [rows] = await db.query(query, params);
    
    // Xử lý đường dẫn avatar cho admin
    const processedRows = rows.map(row => {
      if (row.customer_avatar && !row.customer_avatar.startsWith('http')) {
        row.customer_avatar = `${process.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001"}${row.customer_avatar}`;
      }
      return row;
    });

    res.status(200).json({ success: true, data: processedRows });
  } catch (error) {
    console.error("Lỗi lấy danh sách đánh giá:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/service/:goiId", async (req, res) => {
  try {
    const { goiId } = req.params;
    const [rows] = await db.query(
      `SELECT dg.id, dg.rating, dg.comment, dg.created_at, 
              COALESCE(u.name, 'Khách hàng ẩn danh') as customer_name, 
              u.avatar as customer_avatar
       FROM danh_gia dg
       LEFT JOIN users u ON dg.user_id = u.id
       WHERE dg.goi_id = ?
       ORDER BY dg.id DESC`,
      [goiId]
    );

    // Xử lý đường dẫn avatar cho danh sách review theo dịch vụ
    const processedRows = rows.map(row => {
      if (row.customer_avatar && !row.customer_avatar.startsWith('http')) {
        row.customer_avatar = `${process.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001"}${row.customer_avatar}`;
      }
      return row;
    });

    res.status(200).json({ success: true, data: processedRows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Route: Xóa đánh giá
router.delete("/:id", authMiddleware.verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM danh_gia WHERE id = ?", [id]);
    res.status(200).json({ success: true, message: "Đã xóa đánh giá thành công." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
