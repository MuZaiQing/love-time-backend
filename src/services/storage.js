const DB_NAME = 'lovetime_db'
const DB_VERSION = 1

let db = null

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
  return new Promise((resolve, reject) => {
    const tx = db.transaction('data', 'readwrite')
    tx.objectStore('data').put({ key, value, timestamp: Date.now() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadFromLocal(key) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('data', 'readonly')
    const request = tx.objectStore('data').get(key)
    request.onsuccess = () => resolve(request.result?.value)
    request.onerror = () => reject(request.error)
  })
}
