import { createClient } from '@supabase/supabase-js'
import { saveToLocal, loadFromLocal } from './storage'

const CONFIG = {
  supabaseUrl: 'https://oxznpoadstzkxjotgfvd.supabase.co',
  supabaseAnonKey: 'sb_publishable_DrNLamNrJm1yS-DDMHwBNQ_K9mdloD7',
  anonymousPrefix: '匿名用户'
}

export const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})

// 挂载到全局 window，方便控制台调试
window.supabase = supabase

export { saveToLocal, loadFromLocal }

const REQUEST_TIMEOUT_MS = 10000
const MAX_RETRIES = 1
const RETRY_DELAY_MS = 1000

function classifyError(error) {
  if (!error) {
    return { type: 'unknown', message: '请求失败，请重试' }
  }

  const msg = (error.message || '').toString().toLowerCase()
  const code = (error.code || '').toString()

  if (msg.includes('timeout') || code === 'TIMEOUT' || msg.includes('超时')) {
    return { type: 'timeout', message: '请求超时，请重试' }
  }

  if (code === '42501' || msg.includes('permission') || msg.includes('forbidden') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('401')) {
    return { type: 'permission', message: '权限不足，请重新登录后再试' }
  }

  if (code === 'PGRST301' || msg.includes('row level security') || msg.includes('policy')) {
    return { type: 'permission', message: '权限不足，请确认已登录并刷新页面' }
  }

  if (msg.includes('network') || msg.includes('offline') || msg.includes('dns') || msg.includes('failed to fetch') || msg.includes('aborted') || msg.includes('typeerror')) {
    return { type: 'network', message: '网络连接异常，请检查网络后重试' }
  }

  if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('冲突')) {
    return { type: 'duplicate', message: '邀请码已被使用，请重新生成' }
  }

  if (msg.includes('rate limit') || msg.includes('too many')) {
    return { type: 'rateLimit', message: '请求过于频繁，请稍后再试' }
  }

  if (msg.includes('invite') || msg.includes('邀请码')) {
    return { type: 'invite', message: error.message || '邀请码无效' }
  }

  return { type: 'server', message: error.message || '服务器异常，请稍后再试' }
}

async function requestWithRetry(requestBuilder, retries = MAX_RETRIES) {
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = { timeoutId: null, finished: false }
    console.log(`[requestWithRetry] 第 ${attempt + 1} 次尝试`)

    try {
      const timeoutPromise = new Promise((_, reject) => {
        controller.timeoutId = setTimeout(() => {
          if (controller.finished) return
          const err = new Error('请求超时，请重试')
          err.code = 'TIMEOUT'
          reject(err)
        }, REQUEST_TIMEOUT_MS)
      })

      let rawResult
      try {
        console.log('[requestWithRetry] 实际发出请求，10秒超时开始计时')
        rawResult = await Promise.race([requestBuilder(), timeoutPromise])
        console.log('[requestWithRetry] 请求完成（未超时）', rawResult)
      } finally {
        controller.finished = true
        if (controller.timeoutId) clearTimeout(controller.timeoutId)
      }

      if (rawResult && rawResult.error) {
        console.error('[requestWithRetry] 响应包含 error', rawResult.error)
        throw rawResult.error
      }

      console.log('[requestWithRetry] 成功，无 error')
      return rawResult
    } catch (err) {
      if (!controller.finished) {
        controller.finished = true
        if (controller.timeoutId) clearTimeout(controller.timeoutId)
      }
      console.error(`[requestWithRetry] 第 ${attempt + 1} 次失败:`, err.message, 'code:', err.code)
      lastError = err

      if (attempt < retries) {
        const classified = classifyError(err)
        if (classified.type === 'timeout' || classified.type === 'network' || classified.type === 'unknown') {
          console.log(`[requestWithRetry] 将重试，等待 ${RETRY_DELAY_MS}ms`)
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
          continue
        }
        console.log('[requestWithRetry] 非网络错误，不重试，直接抛出')
        throw err
      }

      console.log('[requestWithRetry] 已无可用重试次数，抛出错误')
      throw err
    }
  }

  throw lastError
}

function validateUserId(userId, fieldName = 'user1_id') {
  if (!userId) {
    return { valid: false, message: `${fieldName} 无效：未获取到用户信息，请重新登录` }
  }
  if (typeof userId !== 'string' || userId.trim().length < 5) {
    return { valid: false, message: `${fieldName} 格式无效` }
  }
  return { valid: true, value: userId.trim() }
}

function validateStartDate(startDate) {
  if (!startDate) {
    return { valid: false, message: '请选择相识日期' }
  }

  const cleaned = (typeof startDate === 'string' ? startDate.trim() : startDate)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(cleaned)) {
    return { valid: false, message: '日期格式错误，应为 YYYY-MM-DD' }
  }

  const d = new Date(cleaned)
  if (isNaN(d.getTime())) {
    return { valid: false, message: '日期无效' }
  }

  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const normalized = `${yyyy}-${mm}-${dd}`

  return { valid: true, value: normalized, date: d }
}

function validateInviteCode(code) {
  if (!code) return { valid: false, message: '请输入邀请码' }
  const cleaned = String(code).trim().toUpperCase()
  if (cleaned.length < 4 || cleaned.length > 20) {
    return { valid: false, message: '邀请码格式无效' }
  }
  return { valid: true, value: cleaned }
}

export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function createCouple(startDate, userId) {
  console.log('[createCouple] 调用参数', { startDate, userId })

  const userIdCheck = validateUserId(userId, 'user1_id')
  console.log('[createCouple] userId 校验', userIdCheck)
  if (!userIdCheck.valid) {
    throw new Error(userIdCheck.message)
  }

  const dateCheck = validateStartDate(startDate)
  console.log('[createCouple] date 校验', dateCheck)
  if (!dateCheck.valid) {
    throw new Error(dateCheck.message)
  }

  const inviteCode = generateInviteCode()
  console.log('[createCouple] 生成的 inviteCode', inviteCode)

  try {
    console.log('[createCouple] 发送请求到 Supabase...')
    const { data, error } = await requestWithRetry(() =>
      supabase
        .from('couples')
        .insert({
          invite_code: inviteCode,
          user1_id: userIdCheck.value,
          start_date: dateCheck.value
        })
        .select()
        .single()
    )
    console.log('[createCouple] 原始响应', { data, error })

    if (error) throw error
    if (!data) throw new Error('创建失败，未收到服务器响应')
    console.log('[createCouple] 成功返回', data)
    return data
  } catch (err) {
    console.error('[createCouple] 请求异常', err)
    const classified = classifyError(err)

    if (classified.type === 'timeout' || classified.type === 'network') {
      const finalErr = new Error(classified.message)
      finalErr.code = 'TIMEOUT'
      throw finalErr
    }

    if (classified.type === 'permission') {
      throw new Error(classified.message)
    }

    if (classified.type === 'duplicate') {
      throw new Error(classified.message)
    }

    throw err
  }
}

export async function joinCouple(inviteCodeInput, userId) {
  const userIdCheck = validateUserId(userId, 'user2_id')
  if (!userIdCheck.valid) {
    throw new Error(userIdCheck.message)
  }

  const codeCheck = validateInviteCode(inviteCodeInput)
  if (!codeCheck.valid) {
    throw new Error(codeCheck.message)
  }

  try {
    const { data: couple, error: findError } = await requestWithRetry(() =>
      supabase
        .from('couples')
        .select('*')
        .eq('invite_code', codeCheck.value)
        .maybeSingle()
    )

    if (findError) throw findError
    if (!couple) {
      throw new Error('邀请码无效')
    }

    if (couple.user2_id) {
      throw new Error('该邀请码已被使用')
    }

    const { data, error } = await requestWithRetry(() =>
      supabase
        .from('couples')
        .update({ user2_id: userIdCheck.value })
        .eq('id', couple.id)
        .select()
        .single()
    )

    if (error) throw error
    return data
  } catch (err) {
    const classified = classifyError(err)

    if (classified.type === 'timeout' || classified.type === 'network') {
      const finalErr = new Error(classified.message)
      finalErr.code = 'TIMEOUT'
      throw finalErr
    }

    if (classified.type === 'permission') {
      throw new Error(classified.message)
    }

    if (classified.type === 'invite') {
      throw err
    }

    throw err
  }
}

export async function getCoupleByUserId(userId) {
  try {
    const { data, error } = await requestWithRetry(() =>
      supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .maybeSingle()
    )

    if (error) throw error
    return data || null
  } catch (err) {
    const classified = classifyError(err)
    console.warn('[getCoupleByUserId] 查询失败：', classified.message)
    return null
  }
}

export async function updateCoupleStartDate(coupleId, startDate) {
  if (!coupleId) {
    throw new Error('缺少 coupleId，无法更新日期')
  }

  const dateCheck = validateStartDate(startDate)
  if (!dateCheck.valid) {
    throw new Error(dateCheck.message)
  }

  try {
    const { data, error } = await requestWithRetry(() =>
      supabase
        .from('couples')
        .update({ start_date: dateCheck.value })
        .eq('id', coupleId)
        .select()
        .single()
    )

    if (error) throw error
    return data
  } catch (err) {
    const classified = classifyError(err)
    if (classified.type === 'timeout' || classified.type === 'network') {
      throw new Error(classified.message)
    }
    if (classified.type === 'permission') {
      throw new Error(classified.message)
    }
    throw err
  }
}

export async function getAnniversaries(coupleId) {
  if (!coupleId) {
    return []
  }

  try {
    const { data, error } = await requestWithRetry(() =>
      supabase
        .from('anniversaries')
        .select('*')
        .eq('couple_id', coupleId)
        .order('date', { ascending: true })
    )

    if (error) throw error
    return data || []
  } catch (err) {
    const classified = classifyError(err)
    console.warn('[getAnniversaries] 查询失败：', classified.message)
    return []
  }
}

export async function createAnniversary(coupleId, name, date, type = 'anniversary') {
  if (!coupleId) {
    throw new Error('缺少 coupleId，无法创建纪念日')
  }
  if (!name || !String(name).trim()) {
    throw new Error('纪念日名称不能为空')
  }

  const dateCheck = validateStartDate(date)
  if (!dateCheck.valid) {
    throw new Error(dateCheck.message)
  }

  try {
    const { data, error } = await requestWithRetry(() =>
      supabase
        .from('anniversaries')
        .insert({
          couple_id: coupleId,
          name: String(name).trim(),
          date: dateCheck.value,
          type: type || 'anniversary'
        })
        .select()
        .single()
    )

    if (error) throw error
    return data
  } catch (err) {
    const classified = classifyError(err)
    if (classified.type === 'timeout' || classified.type === 'network') {
      throw new Error(classified.message)
    }
    if (classified.type === 'permission') {
      throw new Error(classified.message)
    }
    throw err
  }
}

export async function updateAnniversary(id, updates) {
  if (!id) {
    throw new Error('缺少纪念日 id，无法更新')
  }

  const patch = {}
  if (updates && typeof updates === 'object') {
    if (updates.name !== undefined) {
      const trimmed = String(updates.name).trim()
      if (!trimmed) throw new Error('纪念日名称不能为空')
      patch.name = trimmed
    }
    if (updates.date !== undefined) {
      const dateCheck = validateStartDate(updates.date)
      if (!dateCheck.valid) throw new Error(dateCheck.message)
      patch.date = dateCheck.value
    }
    if (updates.type !== undefined) {
      patch.type = String(updates.type).trim() || 'anniversary'
    }
  }

  if (Object.keys(patch).length === 0) {
    throw new Error('没有需要更新的内容')
  }

  patch.updated_at = new Date().toISOString()

  try {
    const { data, error } = await requestWithRetry(() =>
      supabase
        .from('anniversaries')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
    )

    if (error) throw error
    return data
  } catch (err) {
    const classified = classifyError(err)
    if (classified.type === 'timeout' || classified.type === 'network') {
      throw new Error(classified.message)
    }
    if (classified.type === 'permission') {
      throw new Error(classified.message)
    }
    throw err
  }
}

export async function deleteAnniversary(id) {
  if (!id) {
    throw new Error('缺少纪念日 id，无法删除')
  }

  try {
    const { error } = await requestWithRetry(() =>
      supabase
        .from('anniversaries')
        .delete()
        .eq('id', id)
    )

    if (error) throw error
  } catch (err) {
    const classified = classifyError(err)
    if (classified.type === 'timeout' || classified.type === 'network') {
      throw new Error(classified.message)
    }
    if (classified.type === 'permission') {
      throw new Error(classified.message)
    }
    throw err
  }
}

export function generateInviteCode() {
  let code = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export function calculateDays(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  start.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.floor((now - start) / (1000 * 60 * 60 * 24))
}

export function calculateCountdown(targetDate) {
  const target = new Date(targetDate)
  const now = new Date()
  target.setFullYear(now.getFullYear())
  if (target < now) {
    target.setFullYear(now.getFullYear() + 1)
  }
  const diff = target - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getTimeComponents(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  const diff = now - start

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}
