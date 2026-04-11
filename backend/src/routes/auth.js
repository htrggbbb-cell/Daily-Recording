const express = require('express');
const router = express.Router();
// 暂时禁用速率限制（个人使用不需要）
// const rateLimit = require('express-rate-limit');
const { register, login, getUser, updateProfile, getUserStats, updateEmail, updatePassword, deleteAccount } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/user', auth, getUser);
router.put('/user', auth, updateProfile);
router.get('/user/stats', auth, getUserStats);
router.put('/email', auth, updateEmail);
router.put('/password', auth, updatePassword);
router.delete('/account', auth, deleteAccount);

module.exports = router;
