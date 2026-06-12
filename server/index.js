const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid/dist/commonjs/v4.js');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// 数据库连接配置（从环境变量读取，本地开发使用默认值）
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'couple_db'
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 中间件
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// 初始化数据库表
async function initTables() {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar MEDIUMTEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      const [existingCols] = await connection.query(`SHOW COLUMNS FROM users LIKE 'avatar'`);
      if (existingCols.length === 0) {
        await connection.execute(`ALTER TABLE users ADD COLUMN avatar MEDIUMTEXT NULL AFTER password_hash`);
        console.log('✅ users.avatar 列已新增');
      } else {
        const colType = (existingCols[0].Type || '').toLowerCase();
        if (colType === 'text' || colType === 'tinytext') {
          await connection.execute(`ALTER TABLE users MODIFY COLUMN avatar MEDIUMTEXT NULL`);
          console.log('✅ users.avatar 列类型已升级为 MEDIUMTEXT');
        }
      }
    } catch (alterErr) {
      console.warn('处理 users.avatar 列时出现非阻塞错误:', alterErr.message);
    }
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS couples (
        id INT AUTO_INCREMENT PRIMARY KEY,
        start_date DATE NOT NULL,
        user1_id VARCHAR(255) NOT NULL,
        user2_id VARCHAR(255),
        invite_code VARCHAR(20) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS anniversaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        couple_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        type VARCHAR(50) DEFAULT 'anniversary',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_couple_id (couple_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    connection.release();
    console.log('✅ 数据库表初始化完成');
  } catch (error) {
    console.error('❌ 数据库表初始化失败:', error.message);
    console.error('❌ 完整错误信息:', error);
  }
}

app.post('/api/auth/anonymous', (req, res) => {
  const userId = uuidv4();
  console.log('匿名登录，用户ID:', userId);
  res.json({ user: { id: userId, anonymous: true } });
});

function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return '密码不能为空';
  }
  if (password.length < 8) {
    return '密码长度不足8位';
  }
  if (!/[A-Z]/.test(password)) {
    return '密码必须包含大写字母';
  }
  if (!/[a-z]/.test(password)) {
    return '密码必须包含小写字母';
  }
  if (!/[0-9]/.test(password)) {
    return '密码必须包含数字';
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return '密码必须包含特殊字符 (!@#$%^&*)';
  }
  if (/^[0-9]+$/.test(password)) {
    return '密码不能为纯数字';
  }
  if (/^[A-Za-z]+$/.test(password)) {
    return '密码不能为纯字母';
  }
  if (password.length > 0 && password.split('').every(c => c === password[0])) {
    return '密码不能为相同字符重复';
  }
  const normalized = password.toLowerCase();
  for (let i = 0; i <= normalized.length - 4; i++) {
    const a = normalized.charCodeAt(i);
    const b = normalized.charCodeAt(i + 1);
    const c = normalized.charCodeAt(i + 2);
    const d = normalized.charCodeAt(i + 3);
    if ((b - a === 1 && c - b === 1 && d - c === 1) ||
        (a - b === 1 && b - c === 1 && c - d === 1)) {
      return '密码不能包含连续字符（如 abcdef / 123456）';
    }
  }
  return '';
}

function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return '用户名不能为空';
  }
  const trimmed = username.trim();
  if (trimmed.length < 2) {
    return '用户名至少 2 个字符';
  }
  if (trimmed.length > 32) {
    return '用户名不能超过 32 个字符';
  }
  if (!/^[A-Za-z0-9_@.\-]+$/.test(trimmed)) {
    return '用户名只能包含字母、数字、下划线、@ . -';
  }
  return '';
}

app.post('/api/auth/register', async (req, res) => {
  const { username, password, anonymousUserId } = req.body;

  const uErr = validateUsername(username);
  if (uErr) {
    return res.status(400).json({ error: uErr });
  }
  const pErr = validatePasswordStrength(password);
  if (pErr) {
    return res.status(400).json({ error: pErr });
  }

  const normalizedUsername = username.trim();

  try {
    const connection = await pool.getConnection();

    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE username = ?',
      [normalizedUsername]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: '该用户名已被注册，请更换其他用户名' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [normalizedUsername, passwordHash]
      );

      const newUserId = result.insertId.toString();

      if (anonymousUserId) {
        await connection.query(
          'UPDATE couples SET user1_id = ? WHERE user1_id = ?',
          [newUserId, anonymousUserId]
        );
        await connection.query(
          'UPDATE couples SET user2_id = ? WHERE user2_id = ?',
          [newUserId, anonymousUserId]
        );
      }

      await connection.commit();
      connection.release();

      console.log('注册成功，新用户:', normalizedUsername);
      res.json({ user: { id: newUserId, username: normalizedUsername, anonymous: false, avatar: null } });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败: ' + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const uErr = validateUsername(username);
  if (uErr) {
    return res.status(400).json({ error: uErr });
  }
  if (!password || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: '密码不能为空' });
  }

  const normalizedUsername = username.trim();

  try {
    const [users] = await pool.query(
      'SELECT id, username, password_hash, avatar FROM users WHERE username = ?',
      [normalizedUsername]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: '用户名不存在，请检查或注册' });
    }

    const user = users[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: '密码错误，请重新输入' });
    }

    console.log('登录成功，用户:', user.username);
    res.json({ user: { id: user.id.toString(), username: user.username, anonymous: false, avatar: user.avatar || null } });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败: ' + error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: '退出成功' });
});

app.post('/api/users/:id/avatar', async (req, res) => {
  const { id } = req.params;
  const { avatar } = req.body || {};

  if (!avatar || typeof avatar !== 'string') {
    return res.status(400).json({ error: '头像数据无效' });
  }
  if (!avatar.startsWith('data:image/')) {
    return res.status(400).json({ error: '头像格式必须为 data:image/...;base64' });
  }
  if (avatar.length > 2.2 * 1024 * 1024) {
    return res.status(413).json({ error: '头像过大（请选择小于 2MB 的图片）' });
  }

  try {
    const numericId = parseInt(id, 10);
    if (!numericId || numericId <= 0) {
      return res.status(400).json({ error: '用户 ID 无效' });
    }
    await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, numericId]);
    console.log('用户头像已更新:', numericId);
    res.json({ success: true, avatar: avatar });
  } catch (error) {
    console.error('头像更新失败:', error);
    res.status(500).json({ error: '头像更新失败: ' + error.message });
  }
});

app.delete('/api/users/:id/avatar', async (req, res) => {
  const { id } = req.params;
  try {
    const numericId = parseInt(id, 10);
    if (!numericId || numericId <= 0) {
      return res.status(400).json({ error: '用户 ID 无效' });
    }
    await pool.query('UPDATE users SET avatar = NULL WHERE id = ?', [numericId]);
    res.json({ success: true });
  } catch (error) {
    console.error('恢复默认头像失败:', error);
    res.status(500).json({ error: '恢复默认头像失败: ' + error.message });
  }
});

app.get('/api/users/:id/avatar', async (req, res) => {
  const { id } = req.params;
  try {
    const numericId = parseInt(id, 10);
    if (!numericId || numericId <= 0) {
      return res.status(400).json({ error: '用户 ID 无效' });
    }
    const [rows] = await pool.query('SELECT avatar FROM users WHERE id = ?', [numericId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ avatar: rows[0].avatar || null });
  } catch (error) {
    res.status(500).json({ error: '查询头像失败: ' + error.message });
  }
});

app.post('/api/couples', async (req, res) => {
  const { start_date, user1_id, invite_code } = req.body;
  if (!start_date || !user1_id || !invite_code) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO couples (start_date, user1_id, invite_code) VALUES (?, ?, ?)',
      [start_date, user1_id, invite_code]
    );
    const [couple] = await pool.query('SELECT * FROM couples WHERE id = ?', [result.insertId]);
    res.status(201).json(couple[0]);
  } catch (error) {
    res.status(500).json({ error: '创建失败: ' + error.message });
  }
});

app.post('/api/couples/join', async (req, res) => {
  const { invite_code, user2_id } = req.body;
  if (!invite_code || !user2_id) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  try {
    const [couples] = await pool.query('SELECT * FROM couples WHERE invite_code = ?', [invite_code]);
    if (couples.length === 0) return res.status(404).json({ error: '邀请码无效' });
    const couple = couples[0];
    if (couple.user2_id) return res.status(400).json({ error: '该邀请码已被使用' });
    if (couple.user1_id === user2_id) return res.status(400).json({ error: '不能绑定自己' });
    await pool.query('UPDATE couples SET user2_id = ? WHERE id = ?', [user2_id, couple.id]);
    const [updated] = await pool.query('SELECT * FROM couples WHERE id = ?', [couple.id]);
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: '加入失败: ' + error.message });
  }
});

app.get('/api/couples/me', async (req, res) => {
  const userId = req.query.user_id || req.headers['x-user-id'];

  if (!userId) {
    return res.json(null);
  }

  try {
    const [couples] = await pool.query(
      'SELECT * FROM couples WHERE user1_id = ? OR user2_id = ?',
      [userId, userId]
    );

    if (couples.length === 0) {
      return res.json(null);
    }

    const couple = couples[0];

    const partnerIds = [couple.user1_id, couple.user2_id];
    let partnersRows = [];
    try {
      const placeholders = partnerIds.map(() => '?').join(',');
      [partnersRows] = await pool.query(
        `SELECT id, username, avatar FROM users WHERE id IN (${placeholders})`,
        partnerIds
      );
    } catch (sqlErr) {
      console.warn('partners 查询失败，继续返回 couple 基础信息:', sqlErr.message);
      partnersRows = [];
    }

    const byId = {};
    for (const row of partnersRows) {
      byId[String(row.id)] = row;
    }

    const partners = partnerIds.map((pid) => {
      const row = byId[String(pid)];
      if (row) {
        return { id: String(row.id), username: row.username || null, avatar: row.avatar || null };
      }
      return { id: pid, username: null, avatar: null, anonymous: true };
    });

    const enriched = {
      id: couple.id,
      invite_code: couple.invite_code,
      start_date: couple.start_date,
      user1_id: couple.user1_id,
      user2_id: couple.user2_id,
      created_at: couple.created_at,
      updated_at: couple.updated_at,
      partners
    };

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: '查询失败: ' + error.message });
  }
});

app.put('/api/couples/:id', async (req, res) => {
  const { id } = req.params;
  const { start_date } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM couples WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: '未找到该绑定记录' });
    }
    const fields = [];
    const values = [];
    if (start_date !== undefined) {
      fields.push('start_date = ?');
      values.push(start_date);
    }
    if (fields.length === 0) {
      return res.json(existing[0]);
    }
    values.push(id);
    await pool.query(`UPDATE couples SET ${fields.join(', ')} WHERE id = ?`, values);
    const [updated] = await pool.query('SELECT * FROM couples WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: '更新失败: ' + error.message });
  }
});

app.get('/api/anniversaries', async (req, res) => {
  const { coupleId } = req.query;
  if (!coupleId) {
    return res.status(400).json({ error: '缺少 coupleId 参数' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT * FROM anniversaries WHERE couple_id = ? ORDER BY date ASC',
      [coupleId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '查询失败: ' + error.message });
  }
});

app.post('/api/anniversaries', async (req, res) => {
  const { couple_id, name, date, type } = req.body;
  if (!couple_id || !name || !date) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO anniversaries (couple_id, name, date, type) VALUES (?, ?, ?, ?)',
      [couple_id, name, date, type || 'anniversary']
    );
    const [rows] = await pool.query('SELECT * FROM anniversaries WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: '创建失败: ' + error.message });
  }
});

app.put('/api/anniversaries/:id', async (req, res) => {
  const { id } = req.params;
  const { name, date, type } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM anniversaries WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: '未找到该纪念日' });
    }
    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (date !== undefined) { fields.push('date = ?'); values.push(date); }
    if (type !== undefined) { fields.push('type = ?'); values.push(type); }
    if (fields.length === 0) {
      return res.json(existing[0]);
    }
    values.push(id);
    await pool.query(`UPDATE anniversaries SET ${fields.join(', ')} WHERE id = ?`, values);
    const [updated] = await pool.query('SELECT * FROM anniversaries WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: '更新失败: ' + error.message });
  }
});

app.delete('/api/anniversaries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.query('SELECT * FROM anniversaries WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: '未找到该纪念日' });
    }
    await pool.query('DELETE FROM anniversaries WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '删除失败: ' + error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  console.log('🚀 正在启动后端服务...');
  
  if (!process.env.DB_HOST || process.env.DB_HOST === 'localhost') {
    console.warn('⚠️ 警告：未配置数据库连接（DB_HOST）或使用 localhost，数据库相关功能将不可用');
    console.warn('⚠️ 如需使用完整功能，请在 Railway 配置环境变量：DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
  } else {
    await initTables();
    
    try {
      const connection = await pool.getConnection();
      console.log('✅ 数据库连接成功');
      connection.release();
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      console.error('❌ 完整错误信息:', error);
      console.warn('⚠️ 服务将继续启动，但数据库相关功能不可用');
    }
  }

  const HOST = '0.0.0.0';
  app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:${PORT}`);
    console.log(`📡 健康检查接口: http://${HOST}:${PORT}/api/health`);
  });
}

startServer().catch((error) => {
  console.error('❌ 服务启动失败:', error);
  process.exit(1);
});