-- ===================================================
-- 每日记录系统数据库初始化脚本
-- 创建日期: 2024-03-17
-- 描述: 用户、饮食记录和学习记录管理系统
-- ===================================================

-- 设置字符集和排序规则
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS daily_tracker 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE daily_tracker;

-- ===================================================
-- 用户表
-- ===================================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ===================================================
-- 饮食记录表
-- ===================================================
CREATE TABLE IF NOT EXISTS food_records (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  user_id INT NOT NULL COMMENT '用户ID',
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL COMMENT '餐别:早餐/午餐/晚餐/零食',
  food_name VARCHAR(200) NOT NULL COMMENT '食物名称',
  calories DECIMAL(10,2) DEFAULT NULL COMMENT '热量(千卡)',
  protein DECIMAL(10,2) DEFAULT NULL COMMENT '蛋白质(克)',
  carbs DECIMAL(10,2) DEFAULT NULL COMMENT '碳水化合物(克)',
  fat DECIMAL(10,2) DEFAULT NULL COMMENT '脂肪(克)',
  record_date DATE NOT NULL COMMENT '记录日期',
  notes TEXT DEFAULT NULL COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_date (user_id, record_date),
  INDEX idx_meal_type (meal_type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='饮食记录表';

-- ===================================================
-- 学习记录表
-- ===================================================
CREATE TABLE IF NOT EXISTS study_records (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  user_id INT NOT NULL COMMENT '用户ID',
  subject VARCHAR(100) NOT NULL COMMENT '学习科目',
  content TEXT NOT NULL COMMENT '学习内容',
  study_hours DECIMAL(4,2) DEFAULT NULL COMMENT '学习时长(小时)',
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium' COMMENT '难度:简单/中等/困难',
  record_date DATE NOT NULL COMMENT '记录日期',
  notes TEXT DEFAULT NULL COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_date (user_id, record_date),
  INDEX idx_subject (subject),
  INDEX idx_difficulty (difficulty),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习记录表';

-- ===================================================
-- 恢复外键检查
-- ===================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================
-- 查看创建的表
-- ===================================================
SELECT '数据库初始化完成！' AS message;
SHOW TABLES;
