const IncomeRecord = require('../models/IncomeRecord');

const createRecord = async (req, res) => {
  try {
    const { category, itemName, amount, recordDate, notes } = req.body;
    const userId = req.userId;

    if (!category || !itemName || !amount || !recordDate) {
      return res.status(400).json({ error: '类别、收入来源、金额和日期是必需的' });
    }

    const id = await IncomeRecord.create({
      userId,
      category,
      itemName,
      amount,
      recordDate,
      notes: notes || null
    });

    const record = await IncomeRecord.findById(id);
    res.status(201).json({ message: '记录添加成功', record });
  } catch (error) {
    console.error('创建收入记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getRecords = async (req, res) => {
  try {
    const userId = req.userId;
    const records = await IncomeRecord.findByUserId(userId);
    res.json(records);
  } catch (error) {
    console.error('获取收入记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await IncomeRecord.findById(id);

    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (record.user_id !== req.userId) {
      return res.status(403).json({ error: '无权访问此记录' });
    }

    res.json(record);
  } catch (error) {
    console.error('获取收入记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, itemName, amount, recordDate, notes } = req.body;

    const record = await IncomeRecord.findById(id);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (record.user_id !== req.userId) {
      return res.status(403).json({ error: '无权修改此记录' });
    }

    await IncomeRecord.update(id, {
      category,
      itemName,
      amount,
      recordDate,
      notes
    });

    const updatedRecord = await IncomeRecord.findById(id);
    res.json({ message: '记录更新成功', record: updatedRecord });
  } catch (error) {
    console.error('更新收入记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await IncomeRecord.findById(id);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (record.user_id !== req.userId) {
      return res.status(403).json({ error: '无权删除此记录' });
    }

    await IncomeRecord.delete(id);
    res.json({ message: '记录删除成功' });
  } catch (error) {
    console.error('删除收入记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: '开始日期和结束日期是必需的' });
    }

    const stats = await IncomeRecord.getStatsByDate(userId, startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  getStats
};
