const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "mydb",
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối Pool - Với mysql2/promise, chúng ta dùng async/await hoặc then
pool.getConnection()
  .then(connection => {
    console.log("Kết nối DB thành công qua Pool (Promise API)");
    connection.release();
  })
  .catch(err => {
    console.error("Lỗi kết nối DB:", err);
  });

module.exports = pool;