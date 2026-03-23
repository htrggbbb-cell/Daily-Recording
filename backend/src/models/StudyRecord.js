const pool = require('../config/database');

class StudyRecord {
  static async create({ userId, subject, content, studyHours, difficulty, recordDate, notes, completion }) {
    const [result] = await pool.execute(
      `INSERT INTO study_records (user_id, subject, content, study_hours, difficulty, record_date, notes, completion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, subject, content, studyHours, difficulty, recordDate, notes, completion || 100]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM study_records WHERE user_id = ? ORDER BY record_date DESC, created_at DESC',
      [userId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM study_records WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, { subject, content, studyHours, difficulty, recordDate, notes, completion }) {
    await pool.execute(
      `UPDATE study_records
       SET subject = ?, content = ?, study_hours = ?, difficulty = ?, record_date = ?, notes = ?, completion = ?
       WHERE id = ?`,
      [subject, content, studyHours, difficulty, recordDate, notes, completion || 100, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM study_records WHERE id = ?', [id]);
  }

  static async getStatsBySubject(userId, startDate, endDate) {
    const [rows] = await pool.execute(
      `SELECT subject, SUM(study_hours) as total_hours, COUNT(*) as record_count
       FROM study_records 
       WHERE user_id = ? AND record_date BETWEEN ? AND ?
       GROUP BY subject
       ORDER BY total_hours DESC`,
      [userId, startDate, endDate]
    );
    return rows;
  }

  static async getDailyStats(userId, startDate, endDate) {
    const [rows] = await pool.execute(
      `SELECT record_date, SUM(study_hours) as total_hours
       FROM study_records
       WHERE user_id = ? AND record_date BETWEEN ? AND ?
       GROUP BY record_date
       ORDER BY record_date`,
      [userId, startDate, endDate]
    );
    return rows;
  }

  static async getUserStats(userId) {
    const [recordDaysResult] = await pool.execute(
      `SELECT COUNT(DISTINCT record_date) as days FROM study_records WHERE user_id = ?`,
      [userId]
    )

    const [totalStatsResult] = await pool.execute(
      `SELECT
        SUM(study_hours) as total_hours,
        COUNT(*) as total_records
       FROM study_records
       WHERE user_id = ?`,
      [userId]
    )

    return {
      recordDays: recordDaysResult[0]?.days || 0,
      totalHours: totalStatsResult[0]?.total_hours || 0,
      totalRecords: totalStatsResult[0]?.total_records || 0
    }
  }
}

module.exports = StudyRecord;
