CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50)
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  phone VARCHAR(20),
  role_id INT,
  status ENUM('hoat_dong', 'bi_khoa'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE khach_hang (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  dia_chi TEXT,
  ghi_chu TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE em_be (
  id INT AUTO_INCREMENT PRIMARY KEY,
  khach_hang_id INT,
  ten VARCHAR(255),
  ngay_sinh DATE,
  gioi_tinh ENUM('nam', 'nu', 'khac'),
  ghi_chu_suc_khoe TEXT,
  FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id)
);

CREATE TABLE nhan_vien (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  chuyen_mon VARCHAR(255),
  kinh_nghiem INT,
  trang_thai ENUM('dang_lam', 'nghi_viec'),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE ca_lam (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ten_ca VARCHAR(100),
  gio_bat_dau TIME,
  gio_ket_thuc TIME
);

CREATE TABLE phan_ca_nhan_vien (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nhan_vien_id INT,
  ca_lam_id INT,
  ngay_lam DATE,
  FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id),
  FOREIGN KEY (ca_lam_id) REFERENCES ca_lam(id)
);

CREATE TABLE loai_dich_vu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ten VARCHAR(255)
);

CREATE TABLE dich_vu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loai_id INT,
  ten VARCHAR(255),
  gia DECIMAL(10,2),
  thoi_gian INT,
  mo_ta TEXT,
  FOREIGN KEY (loai_id) REFERENCES loai_dich_vu(id)
);

CREATE TABLE goi_dich_vu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ten VARCHAR(255),
  gia DECIMAL(10,2),
  tong_so_buoi INT
);

CREATE TABLE chi_tiet_goi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  goi_id INT,
  dich_vu_id INT,
  so_buoi INT,
  FOREIGN KEY (goi_id) REFERENCES goi_dich_vu(id),
  FOREIGN KEY (dich_vu_id) REFERENCES dich_vu(id)
);

CREATE TABLE goi_cua_khach (
  id INT AUTO_INCREMENT PRIMARY KEY,
  khach_hang_id INT,
  goi_id INT,
  so_buoi_con_lai INT,
  FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id),
  FOREIGN KEY (goi_id) REFERENCES goi_dich_vu(id)
);

CREATE TABLE khuyen_mai (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ma VARCHAR(50),
  loai ENUM('phan_tram', 'tien_mat'),
  gia_tri DECIMAL(10,2),
  han_su_dung DATE
);

CREATE TABLE lich_hen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  khach_hang_id INT,
  nhan_vien_id INT,
  khuyen_mai_id INT,
  gio_bat_dau DATETIME,
  gio_ket_thuc DATETIME,
  gio_bat_dau_thuc_te DATETIME,
  gio_ket_thuc_thuc_te DATETIME,
  trang_thai ENUM('cho_xac_nhan', 'da_xac_nhan', 'dang_thuc_hien', 'hoan_thanh', 'da_huy'),
  ghi_chu TEXT,
  dia_chi TEXT,
  tai_nha BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id),
  FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id),
  FOREIGN KEY (khuyen_mai_id) REFERENCES khuyen_mai(id)
);

CREATE TABLE chi_tiet_lich_hen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lich_hen_id INT,
  dich_vu_id INT,
  so_luong INT,
  gia DECIMAL(10,2),
  thoi_gian INT,
  FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id),
  FOREIGN KEY (dich_vu_id) REFERENCES dich_vu(id)
);

CREATE TABLE lich_su_lich_hen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lich_hen_id INT,
  hanh_dong ENUM('tao_moi', 'cap_nhat', 'huy'),
  gio_cu DATETIME,
  gio_moi DATETIME,
  nguoi_sua INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id),
  FOREIGN KEY (nguoi_sua) REFERENCES users(id)
);

CREATE TABLE thanh_toan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lich_hen_id INT,
  so_tien DECIMAL(10,2),
  phuong_thuc ENUM('tien_mat', 'chuyen_khoan', 'the'),
  trang_thai ENUM('chua_thanh_toan', 'da_thanh_toan', 'that_bai'),
  thoi_gian_tt DATETIME,
  FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id)
);

CREATE TABLE hoa_don (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lich_hen_id INT,
  tong_tien DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id)
);

CREATE TABLE cuoc_tro_chuyen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  khach_hang_id INT,
  nhan_vien_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id),
  FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id)
);

CREATE TABLE tin_nhan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cuoc_tro_chuyen_id INT,
  nguoi_gui INT,
  noi_dung TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cuoc_tro_chuyen_id) REFERENCES cuoc_tro_chuyen(id),
  FOREIGN KEY (nguoi_gui) REFERENCES users(id)
);

CREATE TABLE danh_gia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lich_hen_id INT,
  so_sao INT,
  noi_dung TEXT,
  phan_hoi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id)
);

CREATE TABLE thong_bao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  tieu_de VARCHAR(255),
  noi_dung TEXT,
  da_doc BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE ho_so_cham_soc (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lich_hen_id INT,
  nhan_vien_id INT,
  ghi_chu TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id),
  FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id)
);

CREATE TABLE hinh_anh (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lich_hen_id INT,
  url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id)
);

CREATE TABLE tai_nguyen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ten VARCHAR(255),
  loai VARCHAR(100)
);

CREATE TABLE tai_nguyen_lich_hen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lich_hen_id INT,
  tai_nguyen_id INT,
  FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id),
  FOREIGN KEY (tai_nguyen_id) REFERENCES tai_nguyen(id)
);

CREATE TABLE luong_nhan_vien (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nhan_vien_id INT,
  lich_hen_id INT,
  so_tien DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien(id),
  FOREIGN KEY (lich_hen_id) REFERENCES lich_hen(id)
);

CREATE TABLE log_he_thong (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  hanh_dong TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);