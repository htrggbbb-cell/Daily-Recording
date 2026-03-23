const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, getUser, updateProfile, getUserStats, updateEmail, updatePassword, deleteAccount } = require('../controllers/authController');
const auth = require('../middleware/auth');

// 登录/注册速率限制：每15分钟最多5次请求
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 通用API速率限制：每分钟最多20次请求
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/user', auth, apiLimiter, getUser);
router.put('/user', auth, apiLimiter, updateProfile);
router.get('/user/stats', auth, apiLimiter, getUserStats);
router.put('/email', auth, apiLimiter, updateEmail);
router.put('/password', auth, apiLimiter, updatePassword);
router.delete('/account', auth, apiLimiter, deleteAccount);

module.exports = router;
