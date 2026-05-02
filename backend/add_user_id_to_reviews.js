require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'mydb',
    port: process.env.DB_PORT || 3308
  });

  try {
    console.log('Starting migration: Adding user_id to danh_gia table...');
    
    // 1. Thêm cột user_id nếu chưa có
    const [columns] = await connection.query('SHOW COLUMNS FROM danh_gia LIKE "user_id"');
    if (columns.length === 0) {
      await connection.query('ALTER TABLE danh_gia ADD COLUMN user_id INT AFTER khach_hang_id');
      await connection.query('ALTER TABLE danh_gia ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
      console.log('Column user_id added.');
    } else {
      console.log('Column user_id already exists.');
    }

    // 2. Cập nhật dữ liệu cũ: Điền user_id dựa trên khach_hang_id
    await connection.query(`
      UPDATE danh_gia dg
      JOIN khach_hang kh ON dg.khach_hang_id = kh.id
      SET dg.user_id = kh.user_id
      WHERE dg.user_id IS NULL AND dg.khach_hang_id IS NOT NULL
    `);
    console.log('Existing reviews updated with user_id.');

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
