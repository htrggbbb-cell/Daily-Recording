const express = require('express');
const router = express.Router();
const { getUserStats } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/stats', auth, getUserStats);

module.exports = router;
