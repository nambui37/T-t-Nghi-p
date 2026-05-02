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

# Mở cổng mà backend chạy (ví dụ 5001)
EXPOSE 5001

# Lệnh khởi chạy backend
CMD ["npm", "start"]
