const FoodRecord = require('../models/FoodRecord');

const createRecord = async (req, res) => {
  try {
    const { mealType, foodName, calories, protein, carbs, fat, recordDate, notes } = req.body;
    const userId = req.userId;

    if (!mealType || !foodName || !recordDate) {
      return res.status(400).json({ error: '餐别、食物名称和日期是必需的' });
    }

    const id = await FoodRecord.create({
      userId,
      mealType,
      foodName,
      calories: calories || null,
      protein: protein || null,
      carbs: carbs || null,
      fat: fat || null,
      recordDate,
      notes: notes || null
    });

    const record = await FoodRecord.findById(id);
    res.status(201).json({ message: '记录添加成功', record });
  } catch (error) {
    console.error('创建饮食记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getRecords = async (req, res) => {
  try {
    const userId = req.userId;
    const records = await FoodRecord.findByUserId(userId);
    console.log('获取饮食记录 - 用户ID:', userId, '记录数:', records.length);
    console.log('饮食记录数据:', JSON.stringify(records, null, 2));
    res.json(records);
  } catch (error) {
    console.error('获取饮食记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await FoodRecord.findById(id);

    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (record.user_id !== req.userId) {
      return res.status(403).json({ error: '无权访问此记录' });
    }

    res.json(record);
  } catch (error) {
    console.error('获取饮食记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { mealType, foodName, calories, protein, carbs, fat, recordDate, notes } = req.body;

    console.log('更新饮食记录 - ID:', id);
    console.log('更新数据:', { mealType, foodName, calories, protein, carbs, fat, recordDate, notes });

    const record = await FoodRecord.findById(id);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (record.user_id !== req.userId) {
      return res.status(403).json({ error: '无权修改此记录' });
    }

    await FoodRecord.update(id, {
      mealType,
      foodName,
      calories: calories || null,
      protein: protein || null,
      carbs: carbs || null,
      fat: fat || null,
      recordDate,
      notes
    });

    const updatedRecord = await FoodRecord.findById(id);
    res.json({ message: '记录更新成功', record: updatedRecord });
  } catch (error) {
    console.error('更新饮食记录错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '服务器错误', details: error.message });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await FoodRecord.findById(id);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (record.user_id !== req.userId) {
      return res.status(403).json({ error: '无权删除此记录' });
    }

    await FoodRecord.delete(id);
    res.json({ message: '记录删除成功' });
  } catch (error) {
    console.error('删除饮食记录错误:', error);
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

    const stats = await FoodRecord.getStatsByDate(userId, startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = { createRecord, getRecords, getRecord, updateRecord, deleteRecord, getStats };
