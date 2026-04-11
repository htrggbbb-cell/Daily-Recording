const ExpenseRecord = require('../models/ExpenseRecord');
const IncomeRecord = require('../models/IncomeRecord');

const getUserStats = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('[getUserStats] 获取用户统计 - 用户ID:', userId);

    // 获取消费和收入统计
    const expenseStats = await ExpenseRecord.getUserStats(userId);
    const incomeStats = await IncomeRecord.getUserStats(userId);

    console.log('[getUserStats] 消费统计:', expenseStats);
    console.log('[getUserStats] 收入统计:', incomeStats);

    // 合并统计数据
    const stats = {
      totalExpense: expenseStats.totalExpense || 0,
      totalIncome: incomeStats.totalIncome || 0,
      balance: (incomeStats.totalIncome || 0) - (expenseStats.totalExpense || 0),
      expenseRecords: expenseStats.totalRecords || 0,
      incomeRecords: incomeStats.totalRecords || 0,
      expenseByCategory: expenseStats.categoryStats || [],
      incomeByCategory: incomeStats.categoryStats || []
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
