<template>
  <!-- 登录页容器：柔和氛围背景 + 不透明内容区，确保加载前后不会变淡 -->
  <div class="login-page-root">
    <!-- 背景装饰层：粉紫柔和渐变 + 光斑 + 胶片颗粒纹理，不覆盖/干扰正文 -->
    <div class="login-bg-layer" aria-hidden="true">
      <div class="login-bg-orb login-bg-orb--1"></div>
      <div class="login-bg-orb login-bg-orb--2"></div>
      <div class="login-bg-orb login-bg-orb--3"></div>
      <!-- 极简线条光斑（淡紫色曲线，呼应「帧」主题） -->
      <svg class="login-bg-lines" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="lg-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C9B8FF" stop-opacity="0" />
            <stop offset="50%" stop-color="#E5C8F5" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#F8C8DC" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path d="M 0 520 Q 200 420 400 480 T 800 440" fill="none" stroke="url(#lg-line)" stroke-width="1.2" />
        <path d="M 0 580 Q 240 500 420 540 T 800 520" fill="none" stroke="url(#lg-line)" stroke-width="1" />
      </svg>
      <!-- 胶片颗粒 / 噪点纹理层（极低透明度，呼应「帧」主题） -->
      <div class="login-bg-grain"></div>
    </div>

    <div class="login-card-wrap">
      <div class="login-card">
        <!-- 图标 + 标题区 -->
        <div class="login-header">
          <!-- 极简胶片帧 + 折角线条图标（呼应"这一帧 / 折个小角"主题） -->
          <div class="login-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <!-- 外框（胶片的一个"帧"） -->
              <rect x="10" y="12" width="44" height="36" rx="4" />
              <!-- 上下方的胶片齿孔 -->
              <circle cx="16" cy="20" r="1.2" fill="currentColor" />
              <circle cx="24" cy="20" r="1.2" fill="currentColor" />
              <circle cx="32" cy="20" r="1.2" fill="currentColor" />
              <circle cx="40" cy="20" r="1.2" fill="currentColor" />
              <circle cx="48" cy="20" r="1.2" fill="currentColor" />
              <circle cx="16" cy="40" r="1.2" fill="currentColor" />
              <circle cx="24" cy="40" r="1.2" fill="currentColor" />
              <circle cx="32" cy="40" r="1.2" fill="currentColor" />
              <circle cx="40" cy="40" r="1.2" fill="currentColor" />
              <circle cx="48" cy="40" r="1.2" fill="currentColor" />
              <!-- 右下"折个小角"的折角细节 -->
              <path d="M 44 40 L 44 48 L 36 48" />
              <!-- 帧内横线（代表画面/时光） -->
              <line x1="18" y1="28" x2="34" y2="28" />
              <line x1="18" y1="32" x2="46" y2="32" />
            </svg>
          </div>
          <h1 class="login-title">这一帧只属于我们</h1>
          <p class="login-subtitle">偷偷折个小角不能翻篇</p>
        </div>

        <!-- 登录方式切换 -->
        <div class="login-mode-switch">
          <button
            @click="switchLoginMode('account')"
            class="login-mode-btn"
            :class="loginMode === 'account' ? 'is-active' : ''"
          >
            账号登录
          </button>
          <button
            @click="switchLoginMode('anonymous')"
            class="login-mode-btn"
            :class="loginMode === 'anonymous' ? 'is-active' : ''"
          >
            匿名登录
          </button>
        </div>

        <!-- 账号登录/注册表单 -->
        <div v-if="loginMode === 'account'" class="login-form">
          <div class="login-sub-switch">
            <button
              @click="switchAccountMode('login')"
              class="login-sub-btn"
              :class="accountMode === 'login' ? 'is-active' : ''"
            >
              登录
            </button>
            <button
              @click="switchAccountMode('register')"
              class="login-sub-btn"
              :class="accountMode === 'register' ? 'is-active' : ''"
            >
              注册
            </button>
          </div>

          <!-- 用户名（登录/注册共用） -->
          <div class="field-row">
            <input
              v-model="accountForm.username"
              type="text"
              placeholder="用户名"
              class="field-input"
              @input="onUsernameInput"
              autocomplete="username"
            />
            <div v-if="usernameError" class="field-error">{{ usernameError }}</div>
          </div>

          <!-- 密码 -->
          <div class="field-row">
            <input
              v-model="accountForm.password"
              type="password"
              placeholder="密码"
              class="field-input"
              @input="onPasswordInput"
              autocomplete="current-password"
            />
            <div v-if="accountMode === 'register'" class="password-meta">
              <div class="password-strength">
                <span class="password-strength-label" :class="passwordStrengthTextColor">
                  密码强度：{{ passwordStrengthLabel }}
                </span>
                <div class="password-strength-bar">
                  <span
                    v-for="i in 4"
                    :key="i"
                    class="password-strength-seg"
                    :class="i <= passwordStrengthLevel ? passwordStrengthBarColor : 'is-idle'"
                  ></span>
                </div>
              </div>
              <ul class="password-rules">
                <li :class="ruleMet.length ? 'is-ok' : ''">
                  {{ ruleMet.length ? '✓' : '·' }} 长度 ≥ 8 位
                </li>
                <li :class="ruleMet.upper ? 'is-ok' : ''">
                  {{ ruleMet.upper ? '✓' : '·' }} 包含大写字母
                </li>
                <li :class="ruleMet.lower ? 'is-ok' : ''">
                  {{ ruleMet.lower ? '✓' : '·' }} 包含小写字母
                </li>
                <li :class="ruleMet.digit ? 'is-ok' : ''">
                  {{ ruleMet.digit ? '✓' : '·' }} 包含数字
                </li>
                <li :class="ruleMet.special ? 'is-ok' : ''">
                  {{ ruleMet.special ? '✓' : '·' }} 包含特殊字符 !@#$%^&amp;*
                </li>
                <li :class="ruleMet.noSequence ? 'is-ok' : ''">
                  {{ ruleMet.noSequence ? '✓' : '·' }} 非纯数字/字母/连续字符
                </li>
              </ul>
            </div>
            <div v-if="passwordError" class="field-error">{{ passwordError }}</div>
          </div>

          <!-- 主按钮（登录或注册） -->
          <button
            @click="handleAccountSubmit"
            :disabled="!canSubmit || loading"
            class="primary-btn"
            :class="(!canSubmit || loading) ? 'is-disabled' : ''"
          >
            {{ loading ? '处理中...' : (accountMode === 'login' ? '登录' : '注册') }}
          </button>

          <div v-if="errorMessage" class="form-error">{{ errorMessage }}</div>
        </div>

        <!-- 匿名登录按钮 -->
        <div v-else class="anonymous-section">
          <button
            @click="handleAnonymousLogin"
            :disabled="loading"
            class="anonymous-btn"
            :class="loading ? 'is-disabled' : ''"
          >
            <span class="anonymous-btn-icon">✦</span>
            {{ loading ? '登录中...' : '匿名登录' }}
          </button>
          <p class="anonymous-tip">无需注册，一键体验</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { saveToLocal, loadFromLocal } from '@/services/storage'

const emit = defineEmits(['loginSuccess'])
const userStore = useUserStore()

const loading = ref(false)
const loginMode = ref('account')
const accountMode = ref('login')
const errorMessage = ref('')

const accountForm = reactive({
  username: '',
  password: ''
})

const usernameError = ref('')
const passwordError = ref('')

// 用户名格式规则
function validateUsername(value) {
  if (!value || value.trim().length === 0) {
    return '用户名不能为空'
  }
  if (value.trim().length < 2) {
    return '用户名至少 2 个字符'
  }
  if (value.trim().length > 32) {
    return '用户名不能超过 32 个字符'
  }
  if (!/^[A-Za-z0-9_@.\-]+$/.test(value.trim())) {
    return '用户名只能包含字母、数字、下划线、@ . -'
  }
  return ''
}

// 密码强度规则检测
function computeRuleMet(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
    noSequence: !isAllSameChar(password) && !isSequential(password) && !isPureDigit(password) && !isPureLetter(password)
  }
}

function isPureDigit(pwd) {
  return /^[0-9]+$/.test(pwd)
}
function isPureLetter(pwd) {
  return /^[A-Za-z]+$/.test(pwd)
}
function isAllSameChar(pwd) {
  if (pwd.length === 0) return false
  return pwd.split('').every(c => c === pwd[0])
}
function isSequential(pwd) {
  if (pwd.length < 4) return false
  const normalized = pwd.toLowerCase()
  for (let i = 0; i <= normalized.length - 4; i++) {
    const a = normalized.charCodeAt(i)
    const b = normalized.charCodeAt(i + 1)
    const c = normalized.charCodeAt(i + 2)
    const d = normalized.charCodeAt(i + 3)
    if (b - a === 1 && c - b === 1 && d - c === 1) return true
    if (a - b === 1 && b - c === 1 && c - d === 1) return true
  }
  return false
}

const ruleMet = computed(() => computeRuleMet(accountForm.password))

const passwordStrengthLevel = computed(() => {
  const rm = ruleMet.value
  if (!rm.length) return 0
  let level = 1
  if (rm.upper) level++
  if (rm.lower) level++
  if (rm.digit) level++
  if (rm.special) level++
  if (rm.noSequence) level++
  if (level <= 2) return 1
  if (level <= 4) return 2
  if (level <= 5) return 3
  return 4
})

const passwordStrengthLabel = computed(() => {
  const lv = passwordStrengthLevel.value
  if (accountForm.password.length === 0) return '未输入'
  return ['未输入', '弱', '中', '强', '极强'][lv]
})

const passwordStrengthBarColor = computed(() => {
  const lv = passwordStrengthLevel.value
  if (lv <= 1) return 'is-weak'
  if (lv === 2) return 'is-medium'
  if (lv === 3) return 'is-strong'
  return 'is-super'
})

const passwordStrengthTextColor = computed(() => {
  const lv = passwordStrengthLevel.value
  if (lv <= 1) return 'is-weak-text'
  if (lv === 2) return 'is-medium-text'
  if (lv === 3) return 'is-strong-text'
  return 'is-super-text'
})

function getPasswordFirstFailureMsg() {
  const rm = ruleMet.value
  if (!rm.length) return '密码长度不足8位'
  if (!rm.upper) return '密码缺少大写字母'
  if (!rm.lower) return '密码缺少小写字母'
  if (!rm.digit) return '密码缺少数字'
  if (!rm.special) return '密码缺少特殊字符 (!@#$%^&*)'
  if (!rm.noSequence) return '密码不能是纯数字/纯字母/连续字符'
  return ''
}

function isPasswordStrongEnough() {
  const rm = ruleMet.value
  return rm.length && rm.upper && rm.lower && rm.digit && rm.special && rm.noSequence
}

function onUsernameInput() {
  usernameError.value = validateUsername(accountForm.username)
  errorMessage.value = ''
}

function onPasswordInput() {
  if (accountMode.value === 'register') {
    passwordError.value = ''
  }
  errorMessage.value = ''
}

const canSubmit = computed(() => {
  const usernameOk = !validateUsername(accountForm.username)
  if (accountMode.value === 'login') {
    return usernameOk && accountForm.password.length > 0
  }
  return usernameOk && isPasswordStrongEnough()
})

function switchLoginMode(mode) {
  loginMode.value = mode
  errorMessage.value = ''
}

function switchAccountMode(mode) {
  accountMode.value = mode
  errorMessage.value = ''
  usernameError.value = ''
  passwordError.value = ''
}

watch(accountMode, () => {
  errorMessage.value = ''
  usernameError.value = ''
  passwordError.value = ''
})

async function handleAnonymousLogin() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await fetch('/api/auth/anonymous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) throw new Error('登录失败')
    const data = await response.json()

    const user = {
      id: data.user.id,
      username: null,
      anonymous: true
    }

    userStore.setUser(user)
    await saveToLocal('user', user)
    console.log('匿名登录成功:', user.id)
    emit('loginSuccess')
  } catch (error) {
    console.error('匿名登录失败:', error)
    errorMessage.value = '登录失败: ' + error.message
  } finally {
    loading.value = false
  }
}

async function handleAccountSubmit() {
  errorMessage.value = ''
  usernameError.value = ''
  passwordError.value = ''

  const username = accountForm.username.trim()
  const password = accountForm.password

  const uErr = validateUsername(username)
  if (uErr) {
    usernameError.value = uErr
    return
  }
  if (!password || password.length === 0) {
    passwordError.value = '密码不能为空'
    return
  }
  if (accountMode.value === 'register') {
    if (!isPasswordStrongEnough()) {
      passwordError.value = getPasswordFirstFailureMsg()
      return
    }
  }

  loading.value = true

  try {
    const endpoint = accountMode.value === 'register' ? '/api/auth/register' : '/api/auth/login'

    const body = { username, password }

    if (accountMode.value === 'register') {
      try {
        const savedUser = await loadFromLocal('user')
        if (savedUser?.anonymous) {
          body.anonymousUserId = savedUser.id
        }
      } catch (readErr) {
        console.warn('读取本地用户信息失败，跳过匿名数据迁移:', readErr)
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    let data = {}
    try {
      data = await response.json()
    } catch (parseErr) {
      data = { error: '服务器响应异常，请稍后重试' }
    }

    if (!response.ok) {
      throw new Error(data.error || (accountMode.value === 'login' ? '登录失败，请重试' : '注册失败，请重试'))
    }

    const user = {
      id: data.user.id,
      username: data.user.username,
      anonymous: false,
      avatar: data.user.avatar || null
    }

    console.log('账号登录成功:', user.username)
    userStore.setUser(user)
    await saveToLocal('user', user)
    emit('loginSuccess')
  } catch (error) {
    console.error('账号操作失败:', error)
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ============================================================
   登录页 · 艺术氛围版
   - 粉紫柔和渐变（左上浅粉 → 右下淡紫）
   - 胶片颗粒 / 噪点纹理（呼应「帧」主题）
   - 柔和光斑 + 极简曲线点缀
   - 卡片：半透明玻璃质感 + 粉紫渐变描边 + 柔和阴影
   - 按钮 hover 微抬升 + 提亮
   - 输入框聚焦：柔和紫光晕
   所有改动仅影响视觉，不改动布局尺寸与交互逻辑
   ============================================================ */

/* ---------- 根容器：固定不透明，避免变淡 ---------- */
.login-page-root {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  /* 粉紫柔和渐变：左上浅粉 → 中部淡紫 → 右下更冷的淡紫 */
  background: linear-gradient(135deg, #FCEEF3 0%, #F3EBFF 45%, #E8E4FF 100%);
  opacity: 1 !important;
}

/* ---------- 背景装饰层（所有氛围元素，z-index:0） ---------- */
.login-bg-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

/* 3 个低透明度粉紫光斑：左上粉、右下紫、中偏右上淡粉紫 */
.login-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
}
.login-bg-orb--1 {
  width: 420px;
  height: 420px;
  left: -120px;
  top: -100px;
  background: radial-gradient(circle, #F5C6D9 0%, transparent 70%);
  opacity: 0.55;
}
.login-bg-orb--2 {
  width: 380px;
  height: 380px;
  right: -100px;
  bottom: -80px;
  background: radial-gradient(circle, #C9B8FF 0%, transparent 70%);
  opacity: 0.45;
}
.login-bg-orb--3 {
  width: 220px;
  height: 220px;
  right: 8%;
  top: 20%;
  background: radial-gradient(circle, #FFDCE8 0%, transparent 70%);
  opacity: 0.3;
}

/* 极简曲线光斑：两条淡粉→淡紫渐变曲线，仅做氛围点缀 */
.login-bg-lines {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 70%;
  opacity: 0.45;
  filter: blur(0.3px);
}

/* 胶片颗粒 / 噪点纹理：内联 SVG feTurbulence 生成真实噪点 */
.login-bg-grain {
  position: absolute;
  inset: -50%;
  background-image: url("data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>\
<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>\
<feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.40  0 0 0 0 0.60  0 0 0 0.08 0'/></filter>\
<rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  background-size: 240px 240px;
  opacity: 0.7;
  mix-blend-mode: multiply;
}

/* ---------- 卡片容器（z-index:1，浮于背景之上） ---------- */
.login-card-wrap {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  /* 粉紫渐变描边：利用外层背景做 1px 渐变边 */
  padding: 1px;
  border-radius: 22px;
  background: linear-gradient(135deg,
    rgba(255, 196, 220, 0.55) 0%,
    rgba(200, 180, 255, 0.55) 50%,
    rgba(240, 220, 255, 0.4) 100%);
  box-shadow:
    0 2px 4px rgba(120, 90, 160, 0.04),
    0 12px 32px rgba(140, 100, 180, 0.10),
    0 36px 64px rgba(140, 100, 180, 0.08);
}

.login-card {
  position: relative;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px) saturate(1.05);
  -webkit-backdrop-filter: blur(16px) saturate(1.05);
  border-radius: 21px;
  padding: 40px 32px;
}

/* ---------- 图标 + 标题 ---------- */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  /* 淡紫→淡粉的柔和色，呼应背景渐变 */
  color: #7A73C5;
  line-height: 1;
  /* 图标轻微柔化，更像插画 */
  filter: drop-shadow(0 2px 6px rgba(140, 120, 200, 0.25));
}

.login-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 500;
  color: #2E2B4A;
  letter-spacing: 0.10em;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
               "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-feature-settings: "palt";
  line-height: 1.3;
}

.login-subtitle {
  margin: 0;
  font-size: 14px;
  font-weight: 300;
  color: #7A7396;
  letter-spacing: 0.14em;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
               "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  line-height: 1.6;
}

/* ---------- 登录方式切换（tab-like） ---------- */
.login-mode-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding: 4px;
  background: rgba(140, 120, 200, 0.08);
  border-radius: 12px;
}

.login-mode-btn {
  flex: 1;
  padding: 10px 12px;
  border-radius: 9px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  background: transparent;
  color: #7A7396;
  transition: background-color 0.22s ease, color 0.22s ease, box-shadow 0.22s ease;
}
.login-mode-btn:hover:not(.is-active) {
  color: #2E2B4A;
  background: rgba(140, 120, 200, 0.10);
}
.login-mode-btn.is-active {
  background: linear-gradient(135deg, #6E67C5 0%, #A595E5 100%);
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(120, 100, 180, 0.28), 0 8px 18px rgba(120, 100, 180, 0.16);
}

/* ---------- 登录 / 注册二级切换 ---------- */
.login-sub-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.login-sub-btn {
  flex: 1;
  padding: 8px 12px;
  border-radius: 9px;
  border: 1px solid rgba(140, 120, 200, 0.22);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  background: #FFFFFF;
  color: #7A7396;
  transition: all 0.22s ease;
}
.login-sub-btn:hover:not(.is-active) {
  color: #2E2B4A;
  border-color: rgba(140, 120, 200, 0.38);
  box-shadow: 0 1px 3px rgba(140, 120, 200, 0.08);
}
.login-sub-btn.is-active {
  background: linear-gradient(135deg, #6E67C5 0%, #A595E5 100%);
  color: #FFFFFF;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(120, 100, 180, 0.28);
}

/* ---------- 表单字段 ---------- */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.field-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-input {
  width: 100%;
  padding: 12px 14px;
  box-sizing: border-box;
  border-radius: 11px;
  border: 1px solid rgba(140, 120, 200, 0.22);
  background: #FFFFFF;
  color: #2E2B4A;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  outline: none;
  transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
  /* 柔和浅色阴影，浮于背景之上 */
  box-shadow: 0 1px 2px rgba(140, 120, 200, 0.06);
}
.field-input::placeholder {
  color: #9D98B8;
}
.field-input:hover {
  border-color: rgba(140, 120, 200, 0.35);
}
.field-input:focus {
  border-color: #8B7FDB;
  /* 聚焦：柔和紫色光晕（更细腻，不刺眼） */
  box-shadow:
    0 0 0 3px rgba(140, 120, 200, 0.18),
    0 1px 3px rgba(140, 120, 200, 0.08);
}

.field-error {
  font-size: 12px;
  color: #CC5C7E;
  line-height: 1.5;
}

/* ---------- 密码强度指示器 ---------- */
.password-meta {
  margin-top: 6px;
}
.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.password-strength-label {
  font-size: 12px;
  white-space: nowrap;
  color: #7A7396;
}
.password-strength-label.is-weak-text   { color: #CC5C7E; }
.password-strength-label.is-medium-text { color: #C98A4F; }
.password-strength-label.is-strong-text { color: #6E82C9; }
.password-strength-label.is-super-text  { color: #4E9A7D; }

.password-strength-bar {
  display: flex;
  flex: 1;
  gap: 4px;
}
.password-strength-seg {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: #E7E3F3;
  transition: background-color 0.3s ease;
}
.password-strength-seg.is-idle   { background: #E7E3F3; }
.password-strength-seg.is-weak   { background: #F0B4C6; }
.password-strength-seg.is-medium { background: #F0D6A3; }
.password-strength-seg.is-strong { background: #B6C1EC; }
.password-strength-seg.is-super  { background: #9CD2B8; }

.password-rules {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px 12px;
  font-size: 12px;
  color: #8B84A8;
  line-height: 1.6;
}
.password-rules li.is-ok {
  color: #4E9A7D;
}

/* ---------- 主按钮（登录/注册）：渐变 + hover 微抬升 ---------- */
.primary-btn {
  width: 100%;
  padding: 13px 16px;
  box-sizing: border-box;
  border-radius: 11px;
  border: none;
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  letter-spacing: 0.04em;
  cursor: pointer;
  color: #FFFFFF;
  background: linear-gradient(135deg, #6E67C5 0%, #A595E5 100%);
  box-shadow:
    0 2px 6px rgba(120, 100, 180, 0.28),
    0 8px 20px rgba(120, 100, 180, 0.18);
  transition: transform 0.18s ease, box-shadow 0.22s ease, background 0.22s ease, filter 0.22s ease;
}
.primary-btn:hover:not(.is-disabled) {
  transform: translateY(-1px);
  /* hover 时轻微提亮 + 加深阴影 */
  filter: brightness(1.04);
  box-shadow:
    0 4px 12px rgba(120, 100, 180, 0.34),
    0 14px 28px rgba(120, 100, 180, 0.22);
  background: linear-gradient(135deg, #635DC0 0%, #9A89DE 100%);
}
.primary-btn:active:not(.is-disabled) {
  transform: translateY(0);
  filter: brightness(0.98);
  box-shadow: 0 2px 6px rgba(120, 100, 180, 0.28);
}
.primary-btn.is-disabled {
  cursor: not-allowed;
  background: #C7C3DB;
  box-shadow: none;
  color: #FFFFFF;
  opacity: 1;
  filter: none;
}

.form-error {
  text-align: center;
  font-size: 13px;
  color: #CC5C7E;
  margin-top: 4px;
  line-height: 1.6;
}

/* ---------- 匿名登录：柔粉色调，与主题呼应 ---------- */
.anonymous-section {
  text-align: center;
  padding-top: 4px;
}
.anonymous-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px 18px;
  box-sizing: border-box;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  font-family: inherit;
  letter-spacing: 0.06em;
  cursor: pointer;
  color: #FFFFFF;
  background: linear-gradient(135deg, #EAA4B8 0%, #D898C0 100%);
  box-shadow:
    0 2px 6px rgba(200, 130, 160, 0.28),
    0 8px 22px rgba(200, 130, 160, 0.22);
  transition: transform 0.18s ease, box-shadow 0.22s ease, background 0.22s ease, filter 0.22s ease;
}
.anonymous-btn-icon {
  font-size: 18px;
  line-height: 1;
}
.anonymous-btn:hover:not(.is-disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
  box-shadow:
    0 4px 12px rgba(200, 130, 160, 0.34),
    0 14px 28px rgba(200, 130, 160, 0.24);
  background: linear-gradient(135deg, #E397AE 0%, #CB8DB8 100%);
}
.anonymous-btn:active:not(.is-disabled) {
  transform: translateY(0);
  filter: brightness(0.98);
}
.anonymous-btn.is-disabled {
  cursor: not-allowed;
  background: #C7C3DB;
  box-shadow: none;
  opacity: 1;
  filter: none;
}
.anonymous-tip {
  margin: 14px 0 0 0;
  font-size: 13px;
  color: #8B84A8;
  letter-spacing: 0.04em;
}

/* ---------- 响应式：窄屏下保持舒适 ---------- */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 22px;
    border-radius: 19px;
  }
  .login-card-wrap {
    border-radius: 20px;
  }
  .login-title {
    font-size: 22px;
  }
  .login-subtitle {
    font-size: 13px;
  }
  .password-rules {
    grid-template-columns: 1fr;
  }
  .login-bg-orb--1 { width: 280px; height: 280px; }
  .login-bg-orb--2 { width: 260px; height: 260px; }
  .login-bg-orb--3 { width: 180px; height: 180px; }
}
</style>
