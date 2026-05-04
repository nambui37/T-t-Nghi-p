const jwt = require("jsonwebtoken");

const authMiddleware = {
  // Middleware kiểm tra xem người dùng đã đăng nhập (có token) chưa
  verifyToken: (req, res, next) => {
    let token = null;
    
    // Ưu tiên số 1: Lấy token từ Header (chuẩn Bearer Token mà Frontend đang gửi)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } 
    // Ưu tiên số 2: Lấy từ Cookie (dự phòng cho các request test bằng Postman/trình duyệt trực tiếp)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    console.log("--- Auth Check ---");
    console.log("Path:", req.originalUrl);
    console.log("Has Token:", !!token);

    if (!token) {
      console.log("No token found in request");
      return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập. Vui lòng cung cấp Token!" });
    }

    try {
      // Giải mã token bằng Secret Key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Gán thông tin user đã giải mã vào req để các Controller sau có thể sử dụng
      req.user = decoded; 
      
      next(); // Cho phép request đi tiếp vào Controller
    } catch (error) {
      return res.status(401).json({ success: false, message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!" });
    }
  },

  // (Nâng cao) Middleware kiểm tra xem người dùng có phải là Admin hoặc Quản lý không
  verifyAdmin: (req, res, next) => {
    console.log("verifyAdmin middleware called");
    authMiddleware.verifyToken(req, res, () => {
      console.log("Token verified for user:", req.user?.email, "role_id:", req.user?.role_id);
      // role_id = 1: Admin, 4: Quản lý, 2: Nhân viên (tạm thời cho phép Nhân viên vào các phần quản lý cơ bản)
      const adminRoles = [1, 2, 4, 5, 6, 7, 8];
      if (adminRoles.includes(Number(req.user.role_id))) {
        next();
      } else {
        console.log("User role unauthorized:", req.user?.role_id);
        res.status(403).json({ success: false, message: "Bạn không có quyền quản trị để thực hiện thao tác này!" });
      }
    });
  },

  // Middleware cho phép Admin và các vai trò nhân viên (2, 4, 5, 6, 7, 8)
  verifyAdminOrStaff: (req, res, next) => {
    authMiddleware.verifyToken(req, res, () => {
      const allowedRoles = [1, 2, 4, 5, 6, 7, 8];
      if (allowedRoles.includes(Number(req.user.role_id))) {
        next();
      } else {
        res.status(403).json({ success: false, message: "Bạn không có quyền truy cập chức năng này!" });
      }
    });
  }
};

module.exports = authMiddleware;