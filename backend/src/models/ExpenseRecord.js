const pool = require('../config/database');

class ExpenseRecord {
  static async create({ userId, category, itemName, amount, recordDate, notes }) {
    const [result] = await pool.execute(
      `INSERT INTO expense_records (user_id, category, item_name, amount, record_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, category, itemName, amount, recordDate, notes]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM expense_records WHERE user_id = ? ORDER BY record_date DESC, created_at DESC',
      [userId]
    );
    return rows;
  }

  static async findRecentByUserId(userId, fromDate) {
    const [rows] = await pool.execute(
      'SELECT * FROM expense_records WHERE user_id = ? AND record_date >= ? ORDER BY record_date DESC',
      [userId, fromDate]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM expense_records WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, { category, itemName, amount, recordDate, notes }) {
    await pool.execute(
      `UPDATE expense_records
       SET category = ?, item_name = ?, amount = ?, record_date = ?, notes = ?
       WHERE id = ?`,
      [category, itemName, amount, recordDate, notes, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM expense_records WHERE id = ?', [id]);
  }

  static async getStatsByDate(userId, startDate, endDate) {
    const [rows] = await pool.execute(
      `SELECT record_date, SUM(amount) as total_amount, category
       FROM expense_records
       WHERE user_id = ? AND record_date BETWEEN ? AND ?
       GROUP BY record_date, category
       ORDER BY record_date`,
      [userId, startDate, endDate]
    );
    return rows;
  }

  static async getUserStats(userId) {
    const [totalResult] = await pool.execute(
      `SELECT SUM(amount) as total_expense, COUNT(*) as total_records
       FROM expense_records
       WHERE user_id = ?`,
      [userId]
    );

    const [categoryResult] = await pool.execute(
      `SELECT category, SUM(amount) as total
       FROM expense_records
       WHERE user_id = ?
       GROUP BY category
       ORDER BY total DESC`,
      [userId]
    );

    return {
      totalExpense: totalResult[0]?.total_expense || 0,
      totalRecords: totalResult[0]?.total_records || 0,
      categoryStats: categoryResult
    };
  }
}

module.exports = ExpenseRecord;
