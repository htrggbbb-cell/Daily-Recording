-- 消费收入记录网站数据库表结构
-- 创建数据库
CREATE DATABASE IF NOT EXISTS daily_tracker DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE daily_tracker;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  gender ENUM('male', 'female', 'other'),
  age INT,
  city VARCHAR(50),
  province VARCHAR(50),
  bio TEXT,
  phone VARCHAR(20),
  goals JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 消费记录表
CREATE TABLE IF NOT EXISTS expense_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category VARCHAR(50) NOT NULL COMMENT '消费类别：食品、日用品、居住、交通等',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 收入记录表
CREATE TABLE IF NOT EXISTS income_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category VARCHAR(50) NOT NULL COMMENT '收入类别：工资、兼职、投资、礼金等',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入测试数据（可选）
INSERT INTO users (username, email, password, city, province) VALUES
('testuser', 'test@example.com', '$2b$10$Xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '南京', '江苏省');
