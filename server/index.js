const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// 数据库连接配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Fqh112233!',
  database: 'couple_db'
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 中间件
app.use(cors());
// 提升 JSON 请求体大小限制（base64 头像会产生较大 payload）
// 默认 100KB，头像上传时容易被中间件拒绝并返回 HTTP 413 (Payload Too Large)
// 这里设为 5MB（配合前端 < 2MB 的图片限制，以及后端 MEDIUMTEXT 列 16MB 上限，留有足够余量）
app.use(express.json({ limit: '5mb' }));
// urlencoded 也同步放宽，避免表单类请求被截断
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// 初始化数据库表
async function initTables() {
  try {
    const connection = await pool.getConnection();
    
    // 创建 users 表（如果不存在）
    // 头像字段用 MEDIUMTEXT（最大 16MB，兼容 base64 图片）；TEXT 只有 64KB，不足以存常见图片
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar MEDIUMTEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 为历史数据库实例补齐 avatar 列（如果表已存在但缺少该列，或之前是 TEXT/容量不足）
    // 说明：MySQL 5.x 不支持 ALTER TABLE ... ADD COLUMN IF NOT EXISTS，这里改用 SHOW COLUMNS 做显式判断
    try {
      const [existingCols] = await connection.query(`SHOW COLUMNS FROM users LIKE 'avatar'`);
      if (existingCols.length === 0) {
        // 列不存在，新增
        await connection.execute(`ALTER TABLE users ADD COLUMN avatar MEDIUMTEXT NULL AFTER password_hash`);
        console.log('✅ users.avatar 列已新增');
      } else {
        // 列已存在，确保类型是 MEDIUMTEXT（历史库可能是 TEXT，容量不足导致写入失败）
        const colType = (existingCols[0].Type || '').toLowerCase();
        if (colType === 'text' || colType === 'tinytext') {
          await connection.execute(`ALTER TABLE users MODIFY COLUMN avatar MEDIUMTEXT NULL`);
          console.log('✅ users.avatar 列类型已升级为 MEDIUMTEXT');
        }
      }
    } catch (alterErr) {
      console.warn('处理 users.avatar 列时出现非阻塞错误（可忽略）:', alterErr.message);
    }
    
    // 创建 couples 表（如果不存在）
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

    // 创建 anniversaries 表（如果不存在）
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
  }
}

// POST /api/auth/anonymous - 匿名登录
app.post('/api/auth/anonymous', (req, res) => {
  const userId = uuidv4();
  console.log('匿名登录，用户ID:', userId);
  res.json({ user: { id: userId, anonymous: true } });
});

// 密码强度校验（后端统一规则，防止绕过前端）
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
  // 禁止纯数字 / 纯字母
  if (/^[0-9]+$/.test(password)) {
    return '密码不能为纯数字';
  }
  if (/^[A-Za-z]+$/.test(password)) {
    return '密码不能为纯字母';
  }
  // 禁止全相同字符（如 aaaaaaaa）
  if (password.length > 0 && password.split('').every(c => c === password[0])) {
    return '密码不能为相同字符重复';
  }
  // 禁止连续递增/递减字符（如 abcdef / 123456）
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

// 用户名校验（后端统一规则）
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

// POST /api/auth/register - 注册账号（支持匿名升级 + 密码强度 + 用户名唯一）
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

    // 检查用户名是否已存在
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE username = ?',
      [normalizedUsername]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: '该用户名已被注册，请更换其他用户名' });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 开启事务
    await connection.beginTransaction();

    try {
      // 创建用户
      const [result] = await connection.query(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [normalizedUsername, passwordHash]
      );

      const newUserId = result.insertId.toString();

      // 如果是匿名用户升级，迁移数据
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

// POST /api/auth/login - 账号登录（区分用户名不存在 / 密码错误）
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

    // 验证密码
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

// POST /api/auth/logout - 退出登录
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: '退出成功' });
});

// POST /api/users/:id/avatar - 上传/更新头像（接收 base64 data URL）
app.post('/api/users/:id/avatar', async (req, res) => {
  const { id } = req.params;
  const { avatar } = req.body || {};

  if (!avatar || typeof avatar !== 'string') {
    return res.status(400).json({ error: '头像数据无效' });
  }
  if (!avatar.startsWith('data:image/')) {
    return res.status(400).json({ error: '头像格式必须为 data:image/...;base64' });
  }
  // 粗略大小限制（约 2MB），与前端保持一致；防止绕过前端校验直接提交大 payload
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
    // 把 MySQL/解析层的具体错误原样透传到前端，便于定位
    console.error('头像更新失败:', error);
    res.status(500).json({ error: '头像更新失败: ' + error.message });
  }
});

// DELETE /api/users/:id/avatar - 恢复默认头像（清空 avatar 字段）
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

// GET /api/users/:id/avatar - 查询用户头像（返回 base64 或 null）
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

// POST /api/couples - 创建情侣绑定
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

// POST /api/couples/join - 通过邀请码绑定
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

// GET /api/couples/me - 查询当前用户的绑定关系
// 返回值：
//   { id, invite_code, start_date, user1_id, user2_id, created_at, updated_at,
//     partners: [{ id, avatar, username }, { id, avatar, username }] }
// 匿名用户不会出现在 users 表中，partners 对匿名用户仅 id，avatar/username 为 null
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

    // 为两个 user_id 查询头像（users 表中只有账号用户存在；匿名用户 id 为 UUID，查不到）
    const partnerIds = [couple.user1_id, couple.user2_id];
    let partnersRows = [];
    try {
      const placeholders = partnerIds.map(() => '?').join(',');
      [partnersRows] = await pool.query(
        `SELECT id, username, avatar FROM users WHERE id IN (${placeholders})`,
        partnerIds
      );
    } catch (sqlErr) {
      // partnersRows 为空数组时，前端会用默认头像占位，不阻断主流程
      console.warn('partners 查询失败，继续返回 couple 基础信息:', sqlErr.message);
      partnersRows = [];
    }

    // 把 partnersRows 按 user_id 映射成对象，便于前端直接索引
    const byId = {};
    for (const row of partnersRows) {
      byId[String(row.id)] = row;
    }

    const partners = partnerIds.map((pid) => {
      const row = byId[String(pid)];
      if (row) {
        return { id: String(row.id), username: row.username || null, avatar: row.avatar || null };
      }
      // 匿名用户：id 为 UUID，users 表中不存在
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

// PUT /api/couples/:id - 更新情侣绑定信息（例如 start_date）
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

// GET /api/anniversaries - 根据 coupleId 获取纪念日列表
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

// POST /api/anniversaries - 创建纪念日
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

// PUT /api/anniversaries/:id - 更新纪念日
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

// DELETE /api/anniversaries/:id - 删除纪念日
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

// GET /api/health - 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务
async function startServer() {
  await initTables();
  
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 后端服务已启动，端口: ${PORT} (监听所有 IP，支持局域网访问)`);
    console.log(`   本机局域网 IP: 10.15.7.8`);
  });
}

startServer().catch(console.error);
