# Sử dụng node image chính thức
FROM node:20-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Mở cổng mà frontend chạy (Vite mặc định là 5173)
EXPOSE 5173

# Lệnh khởi chạy frontend (sử dụng --host để truy cập từ bên ngoài container)
CMD ["npm", "run", "dev", "--", "--host"]
