const StudyRecord = require('../models/StudyRecord');

const createRecord = async (req, res) => {
  try {
    const { subject, content, studyHours, difficulty, recordDate, notes, completion } = req.body;
    const userId = req.userId;

    if (!subject || !content || !recordDate) {
      return res.status(400).json({ error: '科目、内容和日期是必需的' });
    }

    const id = await StudyRecord.create({
      userId,
      subject,
      content,
      studyHours: studyHours || null,
      difficulty: difficulty || 'medium',
      recordDate,
      notes: notes || null,
      completion: completion || 100
    });

    const record = await StudyRecord.findById(id);
    res.status(201).json({ message: '记录添加成功', record });
  } catch (error) {
    console.error('创建学习记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getRecords = async (req, res) => {
  try {
    const userId = req.userId;
    const records = await StudyRecord.findByUserId(userId);
    console.log('获取学习记录 - 用户ID:', userId, '记录数:', records.length);
    console.log('学习记录数据:', JSON.stringify(records, null, 2));
    res.json(records);
  } catch (error) {
    console.error('获取学习记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await StudyRecord.findById(id);

    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (record.user_id !== req.userId) {
      return res.status(403).json({ error: '无权访问此记录' });
    }

    res.json(record);
  } catch (error) {
    console.error('获取学习记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, content, studyHours, difficulty, recordDate, notes, completion } = req.body;

    console.log('更新学习记录 - ID:', id);
    console.log('更新数据:', { subject, content, studyHours, difficulty, recordDate, notes, completion });

    const record = await StudyRecord.findById(id);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (record.user_id !== req.userId) {
      return res.status(403).json({ error: '无权修改此记录' });
    }

    await StudyRecord.update(id, {
      subject,
      content,
      studyHours: studyHours || null,
      difficulty,
      recordDate,
      notes,
      completion: completion || 100
    });

    const updatedRecord = await StudyRecord.findById(id);
    res.json({ message: '记录更新成功', record: updatedRecord });
  } catch (error) {
    console.error('更新学习记录错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '服务器错误', details: error.message });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await StudyRecord.findById(id);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (record.user_id !== req.userId) {
      return res.status(403).json({ error: '无权删除此记录' });
    }

    await StudyRecord.delete(id);
    res.json({ message: '记录删除成功' });
  } catch (error) {
    console.error('删除学习记录错误:', error);
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

    const subjectStats = await StudyRecord.getStatsBySubject(userId, startDate, endDate);
    const dailyStats = await StudyRecord.getDailyStats(userId, startDate, endDate);

    res.json({ subjectStats, dailyStats });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = { createRecord, getRecords, getRecord, updateRecord, deleteRecord, getStats };
