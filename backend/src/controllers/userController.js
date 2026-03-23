const FoodRecord = require('../models/FoodRecord');
const StudyRecord = require('../models/StudyRecord');

const getUserStats = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('[getUserStats] 获取用户统计 - 用户ID:', userId);

    // 获取饮食和学习统计
    const foodStats = await FoodRecord.getUserStats(userId);
    const studyStats = await StudyRecord.getUserStats(userId);

    console.log('[getUserStats] 饮食统计:', foodStats);
    console.log('[getUserStats] 学习统计:', studyStats);

    // 合并统计数据
    const stats = {
      recordDays: Math.max(foodStats.recordDays || 0, studyStats.recordDays || 0),
      totalCalories: foodStats.totalCalories || 0,
      totalHours: studyStats.totalHours || 0,
      completedGoals: 0, // TODO: 实现目标功能后计算
      foodRecords: foodStats.totalRecords || 0,
      studyRecords: studyStats.totalRecords || 0
    };

    console.log('[getUserStats] 合并后的统计:', stats);
    res.json(stats);
  } catch (error) {
    console.error('获取用户统计数据错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = { getUserStats };
