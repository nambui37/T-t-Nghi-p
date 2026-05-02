-- Tạo DB
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mydb;

-- Xóa bảng cũ (theo thứ tự ngược lại của khóa ngoại)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS danh_gia;
DROP TABLE IF EXISTS khuyen_mai;
DROP TABLE IF EXISTS phuong_thuc_tt;
DROP TABLE IF EXISTS thanh_toan;
DROP TABLE IF EXISTS thong_bao;
DROP TABLE IF EXISTS lich_hen_nhan_vien;
DROP TABLE IF EXISTS chi_tiet_ca_lam;
DROP TABLE IF EXISTS lich_hen;
DROP TABLE IF EXISTS tro_ly_ai;
DROP TABLE IF EXISTS co_so_vat_chat;
DROP TABLE IF EXISTS phong;
DROP TABLE IF EXISTS loai_phong;
DROP TABLE IF EXISTS chi_tiet_goi;
DROP TABLE IF EXISTS goi_dich_vu;
DROP TABLE IF EXISTS loai_dich_vu;
DROP TABLE IF EXISTS lich_lam_viec;
DROP TABLE IF EXISTS ca_lam;
DROP TABLE IF EXISTS nhan_vien;
DROP TABLE IF EXISTS ho_so_suc_khoe;
DROP TABLE IF EXISTS em_be;
DROP TABLE IF EXISTS khach_hang;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS cam_nang;
DROP TABLE IF EXISTS team_members;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================
-- 1. ROLES
-- =====================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- =====================
-- 2. USERS
-- =====================
CREATE TABLE users (
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
);

-- =====================
-- 3. KHÁCH HÀNG
-- =====================
CREATE TABLE khach_hang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    dia_chi TEXT,
    ghi_chu TEXT,
    diem_tich_luy INT DEFAULT 0,
    hang_thanh_vien VARCHAR(50) DEFAULT 'Đồng',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================
-- 4. EM BÉ
-- =====================
CREATE TABLE em_be (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khach_hang_id INT,
    ten VARCHAR(255) NOT NULL,
    ngay_sinh DATE,
    ghi_chu TEXT,
    FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE CASCADE
);

-- =====================
-- 5. HỒ SƠ SỨC KHỎE
-- =====================
CREATE TABLE ho_so_suc_khoe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khach_hang_id INT UNIQUE,
    thong_tin TEXT,
    FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE CASCADE
);

-- =====================
-- 6. NHÂN VIÊN
-- =====================
CREATE TABLE nhan_vien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    chuc_vu VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================
-- 7. CA LÀM
-- =====================
CREATE TABLE ca_lam (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_ca VARCHAR(100) NOT NULL,
    gio_bat_dau TIME,
    gio_ket_thuc TIME
);

-- =====================
-- 8. LỊCH LÀM VIỆC
-- =====================
CREATE TABLE lich_lam_viec (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nhan_vien_id INT,
    ca_lam_id INT,
    ngay DATE,
    FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id) ON DELETE CASCADE,
    FOREIGN KEY (ca_lam_id) REFERENCES ca_lam(id) ON DELETE CASCADE
);

-- =====================
-- 9. LOẠI DỊCH VỤ
-- =====================
CREATE TABLE loai_dich_vu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- =====================
-- 10. GÓI DỊCH VỤ
-- =====================
CREATE TABLE goi_dich_vu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    loai_id INT,
    gia DECIMAL(10,2),
    FOREIGN KEY (loai_id) REFERENCES loai_dich_vu(id) ON DELETE SET NULL
);

-- =====================
-- 11. CHI TIẾT GÓI
-- =====================
CREATE TABLE chi_tiet_goi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goi_id INT,
    mo_ta TEXT,
    FOREIGN KEY (goi_id) REFERENCES goi_dich_vu(id) ON DELETE CASCADE
);

-- =====================
-- 12. PHÒNG
-- =====================
CREATE TABLE loai_phong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE phong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loai_id INT,
    ten_phong VARCHAR(100) NOT NULL,
    FOREIGN KEY (loai_id) REFERENCES loai_phong(id) ON DELETE SET NULL
);

-- =====================
-- 13. CƠ SỞ VẬT CHẤT
-- =====================
CREATE TABLE co_so_vat_chat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phong_id INT,
    ten VARCHAR(255) NOT NULL,
    FOREIGN KEY (phong_id) REFERENCES phong(id) ON DELETE CASCADE
);

-- =====================
-- 14. TRỢ LÝ AI
-- =====================
CREATE TABLE tro_ly_ai (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(100) NOT NULL
);

-- =====================
-- 15. LỊCH HẸN
-- =====================
CREATE TABLE lich_hen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khach_hang_id INT,
    guest_name VARCHAR(255),
    guest_phone VARCHAR(20),
    nhan_vien_id INT, -- Nhân viên phụ trách chính
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
);

-- =====================
-- 15.1 BẢNG CHI TIẾT CA LÀM (NHẬN CA & CHECK-IN)
-- =====================
CREATE TABLE chi_tiet_ca_lam (
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
);

-- =====================
-- 15.2 BẢNG TRUNG GIAN LỊCH HẸN - NHÂN VIÊN (NHIỀU NHÂN VIÊN CÙNG CA)
-- =====================
CREATE TABLE lich_hen_nhan_vien (
    lich_hen_id INT,
    nhan_vien_id INT,
    PRIMARY KEY (lich_hen_id, nhan_vien_id),
    FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id) ON DELETE CASCADE,
    FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id) ON DELETE CASCADE
);

-- =====================
-- 15.3 BẢNG THÔNG BÁO (NOTIFICATIONS)
-- =====================
CREATE TABLE thong_bao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'system',
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================
-- 16. THANH TOÁN
-- =====================
CREATE TABLE thanh_toan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lich_hen_id INT,
    so_tien DECIMAL(10,2) NOT NULL,
    ngay_thanh_toan DATETIME DEFAULT CURRENT_TIMESTAMP,
    hinh_thuc VARCHAR(50),
    FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id) ON DELETE CASCADE
);

-- =====================
-- 17. PHƯƠNG THỨC THANH TOÁN
-- =====================
CREATE TABLE phuong_thuc_tt (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- =====================
-- 18. KHUYẾN MÃI
-- =====================
CREATE TABLE khuyen_mai (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    giam_gia DECIMAL(5,2),
    ngay_het_han DATE
);

-- =====================
-- 19. ĐÁNH GIÁ
-- =====================
CREATE TABLE danh_gia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khach_hang_id INT,
    goi_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE CASCADE,
    FOREIGN KEY (goi_id) REFERENCES goi_dich_vu(id) ON DELETE CASCADE
);

-- =====================
-- 20. CẨM NANG (HANDBOOK)
-- =====================
CREATE TABLE cam_nang (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT,
    category VARCHAR(100),
    author VARCHAR(100),
    read_time VARCHAR(50),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- 21. ĐỘI NGŨ (TEAM)
-- =====================
CREATE TABLE team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    experience VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- DỮ LIỆU MẪU (DUMMY DATA)
-- =====================

-- Roles
INSERT INTO roles (id, name) VALUES 
(1,'admin'),
(2,'nhan_vien'),
(3,'khach_hang'),
(4,'quan_ly'),
(5,'Bác sĩ'),
(6,'Y tá'),
(7,'Chuyên viên tư vấn'),
(8,'Chuyên viên kỹ thuật');

-- Users (Mật khẩu: 123456)
INSERT INTO users (id, name, email, password, phone, role_id, is_verified) VALUES 
(1, 'Admin System', 'admin@gmail.com', '$2b$10$8Hf6M/Igm2VNb4GURcVIIeuX4f9Q3SAjrJXTuH/ZcWkkXguUwJJIm', '0123456789', 1, 1),
(2, 'Nguyễn Văn A', 'nva@gmail.com', '$2b$10$8Hf6M/Igm2VNb4GURcVIIeuX4f9Q3SAjrJXTuH/ZcWkkXguUwJJIm', '0987654321', 2, 1),
(3, 'Trần Thị B', 'ttb@gmail.com', '$2b$10$8Hf6M/Igm2VNb4GURcVIIeuX4f9Q3SAjrJXTuH/ZcWkkXguUwJJIm', '0111222333', 3, 1),
(4, 'Lê Văn C', 'lvc@gmail.com', '$2b$10$8Hf6M/Igm2VNb4GURcVIIeuX4f9Q3SAjrJXTuH/ZcWkkXguUwJJIm', '0444555666', 2, 1);

-- Khách hàng
INSERT INTO khach_hang (id, user_id, dia_chi, diem_tich_luy, hang_thanh_vien) VALUES 
(1, 3, '123 Đường ABC, Quận 1, TP.HCM', 100, 'Bạc');

-- Nhân viên
INSERT INTO nhan_vien (id, user_id, chuc_vu) VALUES 
(1, 2, 'Y tá'),
(2, 4, 'Chuyên viên kỹ thuật');

-- Em bé
INSERT INTO em_be (id, khach_hang_id, ten, ngay_sinh) VALUES 
(1, 1, 'Bé Bi', '2026-01-01');

-- Loại dịch vụ
INSERT INTO loai_dich_vu (id, name) VALUES 
(1, 'Chăm sóc Bé'),
(2, 'Chăm sóc Mẹ'),
(3, 'Dưỡng sinh & Trị liệu');

-- Gói dịch vụ
INSERT INTO goi_dich_vu (id, name, loai_id, gia) VALUES 
(1, 'MASSAGE MẸ', 2, 450000),
(2, 'CHĂM SÓC MẸ VÀ BÉ TẠI TRUNG TÂM', 2, 800000),
(3, 'CHĂM SÓC MẸ VÀ BÉ TẠI NHÀ', 2, 1000000),
(4, 'DƯỠNG SINH GIA ĐÌNH', 3, 600000),
(5, 'ĐẢ THÔNG KINH LẠC', 3, 500000),
(6, 'ĐAU MỎI VAI GÁY, TÊ BÌ TAY', 3, 400000),
(7, 'ĐAU MỎI NHỨC, TÊ BÌ CHÂN', 3, 400000);

-- Chi tiết gói
INSERT INTO chi_tiet_goi (goi_id, mo_ta) VALUES 
(1, 'Massage thư giãn giúp mẹ giảm căng thẳng, mệt mỏi và cải thiện tuần hoàn máu.'),
(2, 'Chăm sóc toàn diện cho mẹ và bé tại trung tâm với trang thiết bị hiện đại.'),
(3, 'Dịch vụ chăm sóc tận nơi, tiện lợi và an tâm cho cả gia đình.'),
(4, 'Các liệu trình dưỡng sinh giúp cân bằng cơ thể và tăng cường sức khỏe cho cả gia đình.'),
(5, 'Giúp lưu thông khí huyết, giảm đau nhức và cải thiện sức khỏe tổng thể.'),
(6, 'Chuyên sâu giảm đau mỏi vai gáy và tê bì chân tay hiệu quả.'),
(7, 'Liệu pháp đặc trị đau nhức và tê bì chân giúp đi lại nhẹ nhàng.');

-- Hồ sơ sức khỏe
INSERT INTO ho_so_suc_khoe (khach_hang_id, thong_tin) VALUES 
(1, 'Mẹ khỏe mạnh, bé phát triển bình thường. Cần chú ý chế độ dinh dưỡng.');

-- Lịch hẹn
INSERT INTO lich_hen (id, khach_hang_id, nhan_vien_id, goi_id, ngay_bat_dau, ngay_ket_thuc, status, dia_diem, dia_chi_cu_the) VALUES 
(1, 1, 1, 1, '2026-05-10', '2026-05-10', 'cho_xac_nhan', 'tai_nha', '123 Đường ABC, Quận 1, TP.HCM');

-- Cẩm nang
INSERT INTO cam_nang (title, summary, content, category, author, read_time, image_url) VALUES 
('Cách chăm sóc trẻ sơ sinh', 'Những điều cần biết khi mới sinh bé.', 'Nội dung chi tiết về cách chăm sóc trẻ sơ sinh...', 'Chăm sóc bé', 'BS. Minh Thị', '5 phút đọc', 'https://images.unsplash.com/photo-1519689689378-43d70a440156?q=80&w=400&h=250&auto=format&fit=crop'),
('Thực đơn dinh dưỡng cho mẹ sau sinh lợi sữa', 'Dinh dưỡng sau sinh đóng vai trò quan trọng trong việc phục hồi sức khỏe của mẹ...', 'Nội dung chi tiết về thực đơn dinh dưỡng cho mẹ sau sinh...', 'Dinh dưỡng', 'ThS. Trang Lê', '7 phút đọc', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400&h=250&auto=format&fit=crop'),
('Dấu hiệu trầm cảm sau sinh và cách vượt qua', 'Trầm cảm sau sinh là tình trạng phổ biến nhưng thường bị bỏ qua.', 'Nội dung chi tiết về trầm cảm sau sinh...', 'Tâm lý', 'Chuyên gia Hương Trần', '10 phút đọc', 'https://images.unsplash.com/photo-1516534775068-ba3e84529519?q=80&w=400&h=250&auto=format&fit=crop'),
('5 bài tập Yoga nhẹ nhàng giúp mẹ nhanh về dáng', 'Vận động nhẹ nhàng với các bài tập Yoga phù hợp.', 'Nội dung chi tiết về bài tập Yoga cho mẹ sau sinh...', 'Sức khỏe mẹ', 'HLV. Hải Yến', '6 phút đọc', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&h=250&auto=format&fit=crop');

-- Đội ngũ
INSERT INTO team_members (name, role, experience) VALUES 
('Nguyễn Văn A', 'Y tá chuyên nghiệp', '5 năm kinh nghiệm chăm sóc mẹ và bé'),
('Trần Thị D', 'Chuyên gia tư vấn', '10 năm kinh nghiệm trong ngành sản nhi');
