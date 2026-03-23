const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '3212832002htr',
      database: process.env.DB_NAME || 'daily_tracker',
      port: process.env.DB_PORT || 3306
    });

    console.log('已连接到数据库，开始更新表结构...');

    const columns = [
      'avatar VARCHAR(255) DEFAULT NULL COMMENT \'头像URL\'',
      'gender ENUM(\'male\', \'female\', \'other\') DEFAULT NULL COMMENT \'性别\'',
      'age INT DEFAULT NULL COMMENT \'年龄\'',
      'city VARCHAR(100) DEFAULT NULL COMMENT \'城市\'',
      'province VARCHAR(100) DEFAULT NULL COMMENT \'省份\'',
      'bio TEXT DEFAULT NULL COMMENT \'个人简介\'',
      'phone VARCHAR(20) DEFAULT NULL COMMENT \'手机号\''
    ];

    for (const column of columns) {
      try {
        await connection.execute(`ALTER TABLE users ADD COLUMN ${column}`);
        console.log(`✓ 成功添加列: ${column.split(' ')[0]}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`- 列已存在，跳过: ${column.split(' ')[0]}`);
        } else {
          console.error(`✗ 添加列失败: ${column}`, error.message);
        }
      }
    }

    console.log('\n数据库更新完成！');
    
    await connection.end();
  } catch (error) {
    console.error('数据库更新失败:', error);
    process.exit(1);
  }
}

updateDatabase();
