const db = require("../configs/db");

const initDatabase = async (retries = 5) => {
  while (retries > 0) {
    try {
      console.log("Checking and initializing database tables...");
      
      // Chúng ta tin tưởng vào init.sql trong Docker. 
      // Tuy nhiên, để hỗ trợ chạy local không Docker, chúng ta vẫn giữ logic kiểm tra cơ bản.
      
      const essentialTables = [
        `CREATE TABLE IF NOT EXISTS roles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          role_id INT,
          status ENUM('hoat_dong','bi_khoa') DEFAULT 'hoat_dong',
          is_verified TINYINT(1) DEFAULT 0,
          verification_token VARCHAR(255),
          otp_expires_at DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
        )`,
        `CREATE TABLE IF NOT EXISTS khach_hang (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNIQUE,
          dia_chi TEXT,
          ghi_chu TEXT,
          diem_tich_luy INT DEFAULT 0,
          hang_thanh_vien VARCHAR(50) DEFAULT 'Đồng',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS em_be (
          id INT AUTO_INCREMENT PRIMARY KEY,
          khach_hang_id INT,
          ten VARCHAR(255) NOT NULL,
          ngay_sinh DATE,
          ghi_chu TEXT,
          FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS ho_so_suc_khoe (
          id INT AUTO_INCREMENT PRIMARY KEY,
          khach_hang_id INT UNIQUE,
          thong_tin TEXT,
          FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS nhan_vien (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNIQUE,
          chuc_vu VARCHAR(100),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS loai_dich_vu (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS goi_dich_vu (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          loai_id INT,
          gia DECIMAL(10,2),
          FOREIGN KEY (loai_id) REFERENCES loai_dich_vu(id) ON DELETE SET NULL
        )`,
        `CREATE TABLE IF NOT EXISTS chi_tiet_goi (
          id INT AUTO_INCREMENT PRIMARY KEY,
          goi_id INT,
          mo_ta TEXT,
          FOREIGN KEY (goi_id) REFERENCES goi_dich_vu(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS lich_hen (
          id INT AUTO_INCREMENT PRIMARY KEY,
          khach_hang_id INT,
          guest_name VARCHAR(255),
          guest_phone VARCHAR(20),
          nhan_vien_id INT,
          goi_id INT,
          ngay_bat_dau DATE,
          ngay_ket_thuc DATE,
          loai_lich ENUM('co_dinh','linh_hoat') DEFAULT 'linh_hoat',
          dia_diem ENUM('tai_nha','trung_tam') DEFAULT 'tai_nha',
          dia_chi_cu_the TEXT,
          toa_do VARCHAR(100),
          menu_chon VARCHAR(255),
          lich_trinh JSON,
          ghi_chu_nhan_vien TEXT,
          ngay_sinh_be DATE,
          hinh_thuc_sinh ENUM('sinh_thuong', 'sinh_mo'),
          tinh_trang_me TEXT,
          can_nang_be DECIMAL(4,2),
          ghi_chu_be TEXT,
          dat_coc DECIMAL(10,2) DEFAULT 0,
          status ENUM('cho_xac_nhan','da_xac_nhan','dang_thuc_hien','hoan_thanh','da_huy') DEFAULT 'cho_xac_nhan',
          ngay_bat_dau_thuc_te DATE,
          ngay_ket_thuc_thuc_te DATE,
          loai_phong ENUM('thuong', 'vip') DEFAULT 'thuong',
          trang_thai_thanh_toan ENUM('chua_thanh_toan', 'da_coc_30', 'da_thanh_toan_het') DEFAULT 'chua_thanh_toan',
          hinh_thuc_thanh_toan ENUM('tien_mat', 'vnpay', 'momo') DEFAULT 'vnpay',
          vnpay_transaction_id VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE SET NULL,
          FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id) ON DELETE SET NULL,
          FOREIGN KEY (goi_id) REFERENCES goi_dich_vu(id) ON DELETE SET NULL
        )`,
        `CREATE TABLE IF NOT EXISTS chi_tiet_ca_lam (
          id INT AUTO_INCREMENT PRIMARY KEY,
          lich_hen_id INT,
          nhan_vien_id INT,
          ngay_lam DATE,
          check_in DATETIME,
          check_out DATETIME,
          status ENUM('da_nhan', 'dang_lam', 'hoan_thanh', 'da_huy') DEFAULT 'da_nhan',
          toa_do_check_in VARCHAR(100),
          hinh_anh_xac_nhan VARCHAR(255),
          ghi_chu TEXT,
          FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id) ON DELETE CASCADE,
          FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS lich_hen_nhan_vien (
          lich_hen_id INT,
          nhan_vien_id INT,
          PRIMARY KEY (lich_hen_id, nhan_vien_id),
          FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id) ON DELETE CASCADE,
          FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS thong_bao (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          title VARCHAR(255) NOT NULL,
          message TEXT,
          type VARCHAR(50) DEFAULT 'system',
          is_read TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS thanh_toan (
          id INT AUTO_INCREMENT PRIMARY KEY,
          lich_hen_id INT,
          so_tien DECIMAL(10,2) NOT NULL,
          ngay_thanh_toan DATETIME DEFAULT CURRENT_TIMESTAMP,
          hinh_thuc VARCHAR(50),
          FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS danh_gia (
          id INT AUTO_INCREMENT PRIMARY KEY,
          khach_hang_id INT,
          user_id INT,
          goi_id INT,
          rating INT CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE SET NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (goi_id) REFERENCES goi_dich_vu(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS cam_nang (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          summary TEXT,
          content TEXT,
          category VARCHAR(100),
          author VARCHAR(100),
          read_time VARCHAR(50),
          image_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        `CREATE TABLE IF NOT EXISTS team_members (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(100),
          experience VARCHAR(255),
          image_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      ];

      for (let q of essentialTables) {
        await db.query(q);
      }

      // Kiểm tra và seed bảng roles nếu chưa có dữ liệu
      const [roleCount] = await db.query("SELECT COUNT(*) as count FROM roles");
      if (roleCount[0].count === 0) {
        console.log("Seeding roles...");
        await db.query(`
          INSERT INTO roles (id, name) VALUES 
          (1,'admin'),
          (2,'nhan_vien'),
          (3,'khach_hang'),
          (4,'quan_ly'),
          (5,'Bác sĩ'),
          (6,'Y tá'),
          (7,'Chuyên viên tư vấn'),
          (8,'Chuyên viên kỹ thuật')
        `);
      }

      // Không tự động xóa các bảng khác để tránh mất dữ liệu không mong muốn
      // Người dùng sẽ quản lý qua init.sql

      console.log("Database tables checked/created successfully.");
      break; 
    } catch (error) {
      console.error(`Error initializing database (retries left: ${retries - 1}):`, error.message);
      retries -= 1;
      if (retries === 0) {
        console.error("Could not initialize database after several retries. Exiting.");
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = initDatabase;
