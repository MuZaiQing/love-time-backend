import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // currentUser: { id, username?, anonymous: boolean, avatar?: string|null }
  //   - anonymous === true  → 匿名用户，id 为 UUID，username 为空
  //   - anonymous === false → 已登录账号，id 为数字，可能有 username/avatar
  const currentUser = ref(null)
  const currentCouple = ref(null)
  const anniversaries = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!currentUser.value)
  const isAnonymousUser = computed(() => {
    return currentUser.value && currentUser.value.anonymous === true
  })
  const hasCouple = computed(() => !!currentCouple.value)

  function setUser(user) {
    currentUser.value = user
  }

  function setAvatar(avatar) {
    if (!currentUser.value) return
    // 显式构造一个新对象，确保 Pinia ref 触发响应式更新
    currentUser.value = {
      ...currentUser.value,
      avatar: avatar || null
    }
  }

  function setCouple(couple) {
    currentCouple.value = couple
  }

  function setAnniversaries(data) {
    anniversaries.value = data.sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  function addAnniversary(item) {
    anniversaries.value.push(item)
    anniversaries.value.sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  function updateAnniversary(id, updates) {
    const idx = anniversaries.value.findIndex(a => a.id === id)
    if (idx !== -1) {
      anniversaries.value[idx] = { ...anniversaries.value[idx], ...updates }
    }
  }

  function removeAnniversary(id) {
    anniversaries.value = anniversaries.value.filter(a => a.id !== id)
  }

  function setLoading(loading) {
    isLoading.value = loading
  }

  function setError(err) {
    error.value = err
  }

  function clearError() {
    error.value = null
  }

  function logout() {
    currentUser.value = null
    currentCouple.value = null
    anniversaries.value = []
    error.value = null
  }

  return {
    currentUser,
    currentCouple,
    anniversaries,
    isLoading,
    error,
    isLoggedIn,
    isAnonymousUser,
    hasCouple,
    setUser,
    setAvatar,
    setCouple,
    setAnniversaries,
    addAnniversary,
    updateAnniversary,
    removeAnniversary,
    setLoading,
    setError,
    clearError,
    logout
  }
})
