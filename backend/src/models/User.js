const pool = require('../config/database');

class User {
  static async create({ username, email, password }) {
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async findByUsernameOrEmail(identifier) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [identifier, identifier]
    );
    return rows[0];
  }

  static async findByUsernameAndEmail(username, email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND email = ?',
      [username, email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, email, avatar, gender, age, city, province, bio, phone, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByIdWithPassword(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async updateProfile(id, { username, avatar, gender, age, city, province, bio, phone }) {
    // 只更新提供的字段，空字符串保持原值
    const updates = [];
    const values = [];

    if (username !== undefined && username !== null && username !== '') {
      updates.push('username = ?');
      values.push(username);
    }
    if (avatar !== undefined && avatar !== null && avatar !== '') {
      updates.push('avatar = ?');
      values.push(avatar);
    }
    if (gender !== undefined && gender !== null && gender !== '') {
      updates.push('gender = ?');
      values.push(gender);
    }
    if (age !== undefined && age !== null) {
      updates.push('age = ?');
      values.push(age);
    }
    if (city !== undefined && city !== null && city !== '') {
      updates.push('city = ?');
      values.push(city);
    }
    if (province !== undefined && province !== null && province !== '') {
      updates.push('province = ?');
      values.push(province);
    }
    if (bio !== undefined && bio !== null && bio !== '') {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (phone !== undefined && phone !== null && phone !== '') {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (updates.length === 0) {
      return false; // 没有字段需要更新
    }

    values.push(id);

    const [result] = await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async updateEmail(id, email) {
    const [result] = await pool.execute(
      'UPDATE users SET email = ? WHERE id = ?',
      [email, id]
    );
    return result.affectedRows > 0;
  }

  static async updatePassword(id, hashedPassword) {
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }

  static async deleteAccount(id) {
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteUserRecords(userId) {
    // 删除用户的饮食记录
    await pool.execute('DELETE FROM food_records WHERE user_id = ?', [userId]);
    // 删除用户的学习记录
    await pool.execute('DELETE FROM study_records WHERE user_id = ?', [userId]);
  }
}

module.exports = User;
