const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  console.log('✅ 连接数据库成功');

  try {
    // 删除旧表
    console.log('🗑️ 删除旧表...');
    await connection.query('DROP TABLE IF EXISTS food_records');
    await connection.query('DROP TABLE IF EXISTS study_records');
    console.log('✅ 旧表已删除');

    // 创建消费记录表
    console.log('📝 创建消费记录表...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expense_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        category VARCHAR(50) NOT NULL COMMENT '消费类别',
        item_name VARCHAR(200) NOT NULL COMMENT '物品名称',
        amount DECIMAL(10,2) NOT NULL COMMENT '金额',
        record_date DATE NOT NULL COMMENT '记录日期',
        notes TEXT COMMENT '备注',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, record_date),
        INDEX idx_date (record_date),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ expense_records 表创建成功');

    // 创建收入记录表
    console.log('📝 创建收入记录表...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS income_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        category VARCHAR(50) NOT NULL COMMENT '收入类别',
        item_name VARCHAR(200) NOT NULL COMMENT '收入来源',
        amount DECIMAL(10,2) NOT NULL COMMENT '金额',
        record_date DATE NOT NULL COMMENT '记录日期',
        notes TEXT COMMENT '备注',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, record_date),
        INDEX idx_date (record_date),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ income_records 表创建成功');

    console.log('\n🎉 数据库更新完成！');
  } catch (error) {
    console.error('❌ 数据库更新失败:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

updateDatabase();
