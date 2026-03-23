const pool = require('../config/database');

class FoodRecord {
  static async create({ userId, mealType, foodName, calories, protein, carbs, fat, recordDate, notes }) {
    const [result] = await pool.execute(
      `INSERT INTO food_records (user_id, meal_type, food_name, calories, protein, carbs, fat, record_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, mealType, foodName, calories, protein, carbs, fat, recordDate, notes]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM food_records WHERE user_id = ? ORDER BY record_date DESC, created_at DESC',
      [userId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM food_records WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, { mealType, foodName, calories, protein, carbs, fat, recordDate, notes }) {
    await pool.execute(
      `UPDATE food_records 
       SET meal_type = ?, food_name = ?, calories = ?, protein = ?, carbs = ?, fat = ?, record_date = ?, notes = ?
       WHERE id = ?`,
      [mealType, foodName, calories, protein, carbs, fat, recordDate, notes, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM food_records WHERE id = ?', [id]);
  }

  static async getStatsByDate(userId, startDate, endDate) {
    const [rows] = await pool.execute(
      `SELECT record_date, SUM(calories) as total_calories,
              SUM(protein) as total_protein, SUM(carbs) as total_carbs, SUM(fat) as total_fat
       FROM food_records
       WHERE user_id = ? AND record_date BETWEEN ? AND ?
       GROUP BY record_date
       ORDER BY record_date`,
      [userId, startDate, endDate]
    );
    return rows;
  }

  static async getUserStats(userId) {
    // 获取用户的总体统计数据
    const [recordDaysResult] = await pool.execute(
      `SELECT COUNT(DISTINCT record_date) as days FROM food_records WHERE user_id = ?`,
      [userId]
    )

    const [totalStatsResult] = await pool.execute(
      `SELECT
        SUM(calories) as total_calories,
        COUNT(*) as total_records
       FROM food_records
       WHERE user_id = ?`,
      [userId]
    )

    return {
      recordDays: recordDaysResult[0]?.days || 0,
      totalCalories: totalStatsResult[0]?.total_calories || 0,
      totalRecords: totalStatsResult[0]?.total_records || 0
    }
  }
}

module.exports = FoodRecord;
