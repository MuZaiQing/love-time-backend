const DB_NAME = 'lovetime_db'
const DB_VERSION = 1

let db = null

/**
 * 把任意值安全地转换为普通 JS 对象。
 * - 解决 Vue 3 ref() / reactive() 返回的 Proxy 对象无法被 IndexedDB structuredClone 克隆的问题
 * - 也作为一层兜底，防止嵌套 Proxy / 非可克隆结构写入失败
 * - value 为 null / 原始类型时直接返回
 */
function toPlain(value) {
  if (value === null || value === undefined) return value
  if (typeof value !== 'object') return value
  try {
    return JSON.parse(JSON.stringify(value))
  } catch (err) {
    console.warn('[storage] JSON 序列化失败，回退原值：', err)
    return value
  }
}

export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    request.onupgradeneeded = (e) => {
      const database = e.target.result
      if (!database.objectStoreNames.contains('data')) {
        database.createObjectStore('data', { keyPath: 'key' })
      }
    }
  })
}

export async function saveToLocal(key, value) {
  if (!db) await initDB()
  // 关键修复：在写入 IndexedDB 前剥掉所有 Vue Proxy 包装，避免 "Proxy object could not be cloned"
  const safeValue = toPlain(value)
  return new Promise((resolve, reject) => {
    const tx = db.transaction('data', 'readwrite')
    tx.objectStore('data').put({ key, value: safeValue, timestamp: Date.now() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadFromLocal(key) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('data', 'readonly')
    const request = tx.objectStore('data').get(key)
    request.onsuccess = () => {
      const raw = request.result?.value
      // 读取出来再做一次 JSON 往返，确保读取到的一定是普通对象（非 Proxy）
      resolve(toPlain(raw))
    }
    request.onerror = () => reject(request.error)
  })
}
