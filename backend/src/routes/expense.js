const express = require('express');
const router = express.Router();
const {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  getStats,
  getSmartSuggestions
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');

router.get('/records', auth, getRecords);
router.get('/records/:id', auth, getRecord);
router.post('/records', auth, createRecord);
router.put('/records/:id', auth, updateRecord);
router.delete('/records/:id', auth, deleteRecord);
router.get('/stats', auth, getStats);
router.get('/suggestions', auth, getSmartSuggestions);

module.exports = router;
