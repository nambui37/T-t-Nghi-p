-- Khởi tạo DB khớp schema thực tế (Adminer / Docker)
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mydb;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================
-- ROLES & USERS (nền tảng)
-- =====================
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `status` enum('hoat_dong','bi_khoa') COLLATE utf8mb4_unicode_ci DEFAULT 'hoat_dong',
  `is_verified` tinyint(1) DEFAULT '0',
  `verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `nhan_vien` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `chuc_vu` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `nhan_vien_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `khach_hang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `dia_chi` text COLLATE utf8mb4_unicode_ci,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `hang_thanh_vien` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Đồng',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `khach_hang_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `em_be` (
  `id` int NOT NULL AUTO_INCREMENT,
  `khach_hang_id` int DEFAULT NULL,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `so_luong_be` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `khach_hang_id` (`khach_hang_id`),
  CONSTRAINT `em_be_ibfk_1` FOREIGN KEY (`khach_hang_id`) REFERENCES `khach_hang` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `loai_dich_vu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `goi_dich_vu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loai_id` int DEFAULT NULL,
  `gia` decimal(10,2) DEFAULT NULL,
  `thoi_gian` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '60 Phút',
  PRIMARY KEY (`id`),
  KEY `loai_id` (`loai_id`),
  CONSTRAINT `goi_dich_vu_ibfk_1` FOREIGN KEY (`loai_id`) REFERENCES `loai_dich_vu` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chi_tiet_goi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `goi_id` int DEFAULT NULL,
  `mo_ta` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `goi_id` (`goi_id`),
  CONSTRAINT `chi_tiet_goi_ibfk_1` FOREIGN KEY (`goi_id`) REFERENCES `goi_dich_vu` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `phong` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_phong` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `co_so_vat_chat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phong_id` int DEFAULT NULL,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `phong_id` (`phong_id`),
  CONSTRAINT `co_so_vat_chat_ibfk_1` FOREIGN KEY (`phong_id`) REFERENCES `phong` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ho_so_suc_khoe` (
  `id` int NOT NULL AUTO_INCREMENT,
  `khach_hang_id` int DEFAULT NULL,
  `thong_tin` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `khach_hang_id` (`khach_hang_id`),
  CONSTRAINT `ho_so_suc_khoe_ibfk_1` FOREIGN KEY (`khach_hang_id`) REFERENCES `khach_hang` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ca_lam` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_ca` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gio_bat_dau` time DEFAULT NULL,
  `gio_ket_thuc` time DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lich_lam_viec` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nhan_vien_id` int DEFAULT NULL,
  `ca_lam_id` int DEFAULT NULL,
  `ngay` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `nhan_vien_id` (`nhan_vien_id`),
  KEY `ca_lam_id` (`ca_lam_id`),
  CONSTRAINT `lich_lam_viec_ibfk_1` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lich_lam_viec_ibfk_2` FOREIGN KEY (`ca_lam_id`) REFERENCES `ca_lam` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lich_hen` (
  `id` int NOT NULL AUTO_INCREMENT,
  `khach_hang_id` int DEFAULT NULL,
  `guest_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `goi_id` int DEFAULT NULL,
  `ngay_bat_dau` date DEFAULT NULL,
  `ngay_ket_thuc` date DEFAULT NULL,
  `loai_lich` enum('co_dinh','linh_hoat') COLLATE utf8mb4_unicode_ci DEFAULT 'linh_hoat',
  `dia_diem` enum('tai_nha','trung_tam') COLLATE utf8mb4_unicode_ci DEFAULT 'tai_nha',
  `dia_chi_cu_the` text COLLATE utf8mb4_unicode_ci,
  `toa_do` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `menu_chon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lich_trinh` json DEFAULT NULL,
  `ghi_chu_nhan_vien` text COLLATE utf8mb4_unicode_ci,
  `ngay_sinh_be` date DEFAULT NULL,
  `hinh_thuc_sinh` enum('sinh_thuong','sinh_mo','chua_sinh') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tinh_trang_me` text COLLATE utf8mb4_unicode_ci,
  `can_nang_be` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ghi_chu_be` text COLLATE utf8mb4_unicode_ci,
  `dat_coc` decimal(10,2) DEFAULT '0.00',
  `status` enum('cho_xac_nhan','da_xac_nhan','dang_thuc_hien','hoan_thanh','da_huy') COLLATE utf8mb4_unicode_ci DEFAULT 'cho_xac_nhan',
  `ngay_bat_dau_thuc_te` date DEFAULT NULL,
  `ngay_ket_thuc_thuc_te` date DEFAULT NULL,
  `loai_phong` enum('thuong','vip') COLLATE utf8mb4_unicode_ci DEFAULT 'thuong',
  `trang_thai_thanh_toan` enum('chua_thanh_toan','da_coc_15','da_thanh_toan_het') COLLATE utf8mb4_unicode_ci DEFAULT 'chua_thanh_toan',
  `hinh_thuc_thanh_toan` enum('tien_mat','vnpay','momo') COLLATE utf8mb4_unicode_ci DEFAULT 'vnpay',
  `vnpay_transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `so_luong_be` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `khach_hang_id` (`khach_hang_id`),
  KEY `goi_id` (`goi_id`),
  CONSTRAINT `lich_hen_ibfk_1` FOREIGN KEY (`khach_hang_id`) REFERENCES `khach_hang` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lich_hen_ibfk_3` FOREIGN KEY (`goi_id`) REFERENCES `goi_dich_vu` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lich_hen_nhan_vien` (
  `lich_hen_id` int NOT NULL,
  `nhan_vien_id` int NOT NULL,
  PRIMARY KEY (`lich_hen_id`,`nhan_vien_id`),
  UNIQUE KEY `lich_hen_id` (`lich_hen_id`,`nhan_vien_id`),
  KEY `nhan_vien_id` (`nhan_vien_id`),
  CONSTRAINT `lich_hen_nhan_vien_ibfk_1` FOREIGN KEY (`lich_hen_id`) REFERENCES `lich_hen` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lich_hen_nhan_vien_ibfk_2` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chi_tiet_ca_lam` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lich_hen_id` int DEFAULT NULL,
  `nhan_vien_id` int DEFAULT NULL,
  `ngay_lam` date DEFAULT NULL,
  `check_in` datetime DEFAULT NULL,
  `check_out` datetime DEFAULT NULL,
  `status` enum('cho_nhan','da_nhan','check_in','dang_thuc_hien','hoan_thanh','bao_loi','da_huy') COLLATE utf8mb4_unicode_ci DEFAULT 'cho_nhan',
  `toa_do_check_in` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hinh_anh_xac_nhan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `lich_hen_id` (`lich_hen_id`),
  KEY `nhan_vien_id` (`nhan_vien_id`),
  CONSTRAINT `chi_tiet_ca_lam_ibfk_1` FOREIGN KEY (`lich_hen_id`) REFERENCES `lich_hen` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chi_tiet_ca_lam_ibfk_2` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `care_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lich_hen_id` int DEFAULT NULL,
  `nhan_vien_id` int DEFAULT NULL,
  `ca_lam_id` int DEFAULT NULL,
  `ngay_thuc_hien` datetime DEFAULT CURRENT_TIMESTAMP,
  `noi_dung_cham_soc` text COLLATE utf8mb4_unicode_ci,
  `tinh_trang_me` text COLLATE utf8mb4_unicode_ci,
  `tinh_trang_be` text COLLATE utf8mb4_unicode_ci,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `hinh_anh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lich_hen_id` (`lich_hen_id`),
  KEY `nhan_vien_id` (`nhan_vien_id`),
  KEY `ca_lam_id` (`ca_lam_id`),
  CONSTRAINT `care_records_ibfk_1` FOREIGN KEY (`lich_hen_id`) REFERENCES `lich_hen` (`id`) ON DELETE CASCADE,
  CONSTRAINT `care_records_ibfk_2` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE SET NULL,
  CONSTRAINT `care_records_ibfk_3` FOREIGN KEY (`ca_lam_id`) REFERENCES `chi_tiet_ca_lam` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `danh_gia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `khach_hang_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `goi_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `khach_hang_id` (`khach_hang_id`),
  KEY `goi_id` (`goi_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `danh_gia_ibfk_1` FOREIGN KEY (`khach_hang_id`) REFERENCES `khach_hang` (`id`) ON DELETE CASCADE,
  CONSTRAINT `danh_gia_ibfk_2` FOREIGN KEY (`goi_id`) REFERENCES `goi_dich_vu` (`id`) ON DELETE CASCADE,
  CONSTRAINT `danh_gia_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `danh_gia_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int DEFAULT NULL,
  `receiver_id` int DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `room` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cam_nang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `content` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `read_time` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `khuyen_mai` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `giam_gia` decimal(5,2) DEFAULT NULL,
  `ngay_het_han` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `phuong_thuc_tt` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `su_co` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lich_hen_id` int DEFAULT NULL,
  `nhan_vien_id` int DEFAULT NULL,
  `ca_lam_id` int DEFAULT NULL,
  `noi_dung` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `muc_do` enum('nhe','trung_binh','nghiem_trong') COLLATE utf8mb4_unicode_ci DEFAULT 'nhe',
  `trang_thai` enum('cho_xu_ly','dang_xu_ly','da_xu_ly') COLLATE utf8mb4_unicode_ci DEFAULT 'cho_xu_ly',
  `admin_ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lich_hen_id` (`lich_hen_id`),
  KEY `nhan_vien_id` (`nhan_vien_id`),
  KEY `ca_lam_id` (`ca_lam_id`),
  CONSTRAINT `su_co_ibfk_1` FOREIGN KEY (`lich_hen_id`) REFERENCES `lich_hen` (`id`) ON DELETE CASCADE,
  CONSTRAINT `su_co_ibfk_2` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE SET NULL,
  CONSTRAINT `su_co_ibfk_3` FOREIGN KEY (`ca_lam_id`) REFERENCES `chi_tiet_ca_lam` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `team_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `thanh_toan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lich_hen_id` int DEFAULT NULL,
  `so_tien` decimal(10,2) NOT NULL,
  `ngay_thanh_toan` datetime DEFAULT CURRENT_TIMESTAMP,
  `hinh_thuc` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lich_hen_id` (`lich_hen_id`),
  CONSTRAINT `thanh_toan_ibfk_1` FOREIGN KEY (`lich_hen_id`) REFERENCES `lich_hen` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `thong_bao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `thong_bao_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tro_ly_ai` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================
-- DỮ LIỆU MẪU (mật khẩu demo: 123456 — bcrypt như cũ)
-- =====================
INSERT INTO roles (id, name) VALUES
(1,'admin'),
(2,'nhan_vien'),
(3,'khach_hang'),
(4,'quan_ly'),
(5,'Bác sĩ'),
(6,'Chuyên viên tư vấn'),
(7,'Chuyên viên dinh dưỡng'),
(8,'Lễ tân');

INSERT INTO users (id, name, email, password, phone, role_id, is_verified) VALUES
(1, 'Admin System', 'admin@gmail.com', '$2b$10$8Hf6M/Igm2VNb4GURcVIIeuX4f9Q3SAjrJXTuH/ZcWkkXguUwJJIm', '0123456789', 1, 1),
(2, 'Nguyễn Văn A', 'nva@gmail.com', '$2b$10$8Hf6M/Igm2VNb4GURcVIIeuX4f9Q3SAjrJXTuH/ZcWkkXguUwJJIm', '0987654321', 2, 1),
(3, 'Trần Thị B', 'ttb@gmail.com', '$2b$10$8Hf6M/Igm2VNb4GURcVIIeuX4f9Q3SAjrJXTuH/ZcWkkXguUwJJIm', '0111222333', 3, 1),
(4, 'Lê Văn C', 'lvc@gmail.com', '$2b$10$8Hf6M/Igm2VNb4GURcVIIeuX4f9Q3SAjrJXTuH/ZcWkkXguUwJJIm', '0444555666', 2, 1);

INSERT INTO nhan_vien (id, user_id, chuc_vu) VALUES
(1, 2, 'Nhân viên'),
(2, 4, 'Nhân viên');

INSERT INTO khach_hang (id, user_id, dia_chi, hang_thanh_vien) VALUES
(1, 3, '123 Đường ABC, Quận 1, TP.HCM', 'Bạc');

INSERT INTO em_be (id, khach_hang_id, ten, ngay_sinh) VALUES
(1, 1, 'Bé Bi', '2026-01-01');

INSERT INTO loai_dich_vu (id, name) VALUES
(1, 'Bé và Mẹ'),
(2, 'Chăm sóc Mẹ'),
(3, 'Dưỡng sinh & Trị liệu');

INSERT INTO goi_dich_vu (id, name, loai_id, gia) VALUES
(1, 'MASSAGE MẸ', 2, 450000),
(2, 'CHĂM SÓC MẸ VÀ BÉ TẠI TRUNG TÂM', 2, 800000),
(3, 'CHĂM SÓC MẸ VÀ BÉ TẠI NHÀ', 2, 1000000),
(4, 'DƯỠNG SINH GIA ĐÌNH', 3, 600000),
(5, 'ĐẢ THÔNG KINH LẠC', 3, 500000),
(6, 'ĐAU MỎI VAI GÁY, TÊ BÌ TAY', 3, 400000),
(7, 'ĐAU MỎI NHỨC, TÊ BÌ CHÂN', 3, 400000);

INSERT INTO chi_tiet_goi (goi_id, mo_ta) VALUES
(1, 'Massage thư giãn giúp mẹ giảm căng thẳng, mệt mỏi và cải thiện tuần hoàn máu.'),
(2, 'Chăm sóc toàn diện cho mẹ và bé tại trung tâm với trang thiết bị hiện đại.'),
(3, 'Dịch vụ chăm sóc tận nơi, tiện lợi và an tâm cho cả gia đình.'),
(4, 'Các liệu trình dưỡng sinh giúp cân bằng cơ thể và tăng cường sức khỏe cho cả gia đình.'),
(5, 'Giúp lưu thông khí huyết, giảm đau nhức và cải thiện sức khỏe tổng thể.'),
(6, 'Chuyên sâu giảm đau mỏi vai gáy và tê bì chân tay hiệu quả.'),
(7, 'Liệu pháp đặc trị đau nhức và tê bì chân giúp đi lại nhẹ nhàng.');

INSERT INTO phong (id, ten_phong) VALUES (1, 'Phòng VIP 1');

INSERT INTO ho_so_suc_khoe (khach_hang_id, thong_tin) VALUES
(1, 'Mẹ khỏe mạnh, bé phát triển bình thường. Cần chú ý chế độ dinh dưỡng.');

INSERT INTO lich_hen (id, khach_hang_id, goi_id, ngay_bat_dau, ngay_ket_thuc, status, dia_diem, dia_chi_cu_the) VALUES
(1, 1, 1, '2026-05-10', '2026-05-10', 'cho_xac_nhan', 'tai_nha', '123 Đường ABC, Quận 1, TP.HCM');

INSERT INTO lich_hen_nhan_vien (lich_hen_id, nhan_vien_id) VALUES (1, 1);

INSERT INTO chi_tiet_ca_lam (lich_hen_id, nhan_vien_id, ngay_lam, status) VALUES
(1, 1, '2026-05-10', 'da_nhan');

INSERT INTO phuong_thuc_tt (id, name) VALUES
(1,'Tiền mặt'),
(2,'VNPay'),
(4,'Chuyển khoản ngân hàng');

INSERT INTO cam_nang (title, summary, content, category, author, read_time, image_url) VALUES
('Cách chăm sóc trẻ sơ sinh', 'Những điều cần biết khi mới sinh bé.', 'Nội dung chi tiết về cách chăm sóc trẻ sơ sinh...', 'Chăm sóc bé', 'BS. Minh Thị', '5 phút đọc', 'https://images.unsplash.com/photo-1519689689378-43d70a440156?q=80&w=400&h=250&auto=format&fit=crop'),
('Thực đơn dinh dưỡng cho mẹ sau sinh lợi sữa', 'Dinh dưỡng sau sinh đóng vai trò quan trọng trong việc phục hồi sức khỏe của mẹ...', 'Nội dung chi tiết về thực đơn dinh dưỡng cho mẹ sau sinh...', 'Dinh dưỡng', 'ThS. Trang Lê', '7 phút đọc', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400&h=250&auto=format&fit=crop'),
('Dấu hiệu trầm cảm sau sinh và cách vượt qua', 'Trầm cảm sau sinh là tình trạng phổ biến nhưng thường bị bỏ qua.', 'Nội dung chi tiết về trầm cảm sau sinh...', 'Tâm lý', 'Chuyên gia Hương Trần', '10 phút đọc', 'https://images.unsplash.com/photo-1516534775068-ba3e84529519?q=80&w=400&h=250&auto=format&fit=crop'),
('5 bài tập Yoga nhẹ nhàng giúp mẹ nhanh về dáng', 'Vận động nhẹ nhàng với các bài tập Yoga phù hợp.', 'Nội dung chi tiết về bài tập Yoga cho mẹ sau sinh...', 'Sức khỏe mẹ', 'HLV. Hải Yến', '6 phút đọc', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&h=250&auto=format&fit=crop');

INSERT INTO team_members (name, role, experience) VALUES
('Nguyễn Văn A', 'Y tá chuyên nghiệp', '5 năm kinh nghiệm chăm sóc mẹ và bé'),
('Trần Thị D', 'Chuyên gia tư vấn', '10 năm kinh nghiệm trong ngành sản nhi');

ALTER TABLE nhan_vien AUTO_INCREMENT = 3;
ALTER TABLE lich_hen AUTO_INCREMENT = 2;
ALTER TABLE chi_tiet_ca_lam AUTO_INCREMENT = 2;
