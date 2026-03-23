const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: '所有字段都是必需的' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: '用户名已被使用' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await User.create({ username, email, password: hashedPassword });

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: '注册成功',
      token,
      user: { id: userId, username, email }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码是必需的' });
    }

    const user = await User.findByUsernameAndEmail(username, email);
    if (!user) {
      return res.status(400).json({ error: '用户名或邮箱错误' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: '用户名或邮箱错误' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: '登录成功',
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        avatar: user.avatar,
        gender: user.gender,
        age: user.age,
        city: user.city,
        province: user.province,
        bio: user.bio,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, avatar, gender, age, city, province, bio, phone } = req.body;
    const userId = req.userId;

    const updated = await User.updateProfile(userId, {
      username,
      avatar,
      gender,
      age,
      city,
      province,
      bio,
      phone
    });

    if (updated) {
      const user = await User.findById(userId);
      res.json({ message: '更新成功', user });
    } else {
      res.status(400).json({ error: '更新失败' });
    }
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const userId = req.userId;
    const FoodRecord = require('../models/FoodRecord');
    const StudyRecord = require('../models/StudyRecord');

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const foodRecords = await FoodRecord.findByUserId(userId);
    const studyRecords = await StudyRecord.findByUserId(userId);

    const todayFoodRecords = foodRecords.filter(r => r.record_date === today);
    const todayStudyRecords = studyRecords.filter(r => r.record_date === today);

    const totalCalories = foodRecords.reduce((sum, r) => sum + (parseFloat(r.calories) || 0), 0);
    const todayCalories = todayFoodRecords.reduce((sum, r) => sum + (parseFloat(r.calories) || 0), 0);
    const totalHours = studyRecords.reduce((sum, r) => sum + (parseFloat(r.study_hours) || 0), 0);
    const todayHours = todayStudyRecords.reduce((sum, r) => sum + (parseFloat(r.study_hours) || 0), 0);

    const uniqueDates = new Set([...foodRecords.map(r => r.record_date), ...studyRecords.map(r => r.record_date)]);
    const recordDays = uniqueDates.size;

    const protein = foodRecords.reduce((sum, r) => sum + (parseFloat(r.protein) || 0), 0);
    const carbs = foodRecords.reduce((sum, r) => sum + (parseFloat(r.carbs) || 0), 0);
    const fat = foodRecords.reduce((sum, r) => sum + (parseFloat(r.fat) || 0), 0);

    const uniqueDays = Array.from(uniqueDates).sort().reverse();
    let completedGoals = 0;
    uniqueDays.forEach(date => {
      const dayFoodRecords = foodRecords.filter(r => r.record_date === date);
      const dayStudyRecords = studyRecords.filter(r => r.record_date === date);
      const dayCalories = dayFoodRecords.reduce((sum, r) => sum + (parseFloat(r.calories) || 0), 0);
      const dayHours = dayStudyRecords.reduce((sum, r) => sum + (parseFloat(r.study_hours) || 0), 0);
      if (dayCalories >= 1500 && dayHours >= 1) {
        completedGoals++;
      }
    });

    res.json({
      recordDays,
      totalCalories: Math.round(totalCalories),
      todayCalories: Math.round(todayCalories),
      totalHours: totalHours.toFixed(1),
      todayHours: todayHours.toFixed(1),
      totalProtein: Math.round(protein),
      totalCarbs: Math.round(carbs),
      totalFat: Math.round(fat),
      foodRecordsCount: foodRecords.length,
      studyRecordsCount: studyRecords.length,
      completedGoals
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 修改邮箱
const updateEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userId = req.userId;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码是必需的' });
    }

    // 验证当前密码 - 使用包含密码的完整用户信息
    const user = await User.findByIdWithPassword(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '当前密码错误' });
    }

    // 检查新邮箱是否已被使用
    const existingUser = await User.findByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ error: '邮箱已被其他用户使用' });
    }

    // 更新邮箱
    await User.updateEmail(userId, email);

    res.json({ message: '邮箱修改成功', email });
  } catch (error) {
    console.error('修改邮箱错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 修改密码
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '当前密码和新密码是必需的' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码长度不能少于6位' });
    }

    // 获取用户并验证当前密码 - 使用包含密码的完整用户信息
    const user = await User.findByIdWithPassword(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '当前密码错误' });
    }

    // 加密新密码（使用12 rounds增强安全性）
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 更新密码
    await User.updatePassword(userId, hashedPassword);

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 注销账号
const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    // 先删除用户的所有记录
    await User.deleteUserRecords(userId);

    // 再删除用户账号
    await User.deleteAccount(userId);

    res.json({ message: '账号已注销' });
  } catch (error) {
    console.error('注销账号错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = { register, login, getUser, updateProfile, getUserStats, updateEmail, updatePassword, deleteAccount };
