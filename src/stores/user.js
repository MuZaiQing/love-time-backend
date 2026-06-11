import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const currentCouple = ref(null)
  const anniversaries = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!currentUser.value)
  const hasCouple = computed(() => !!currentCouple.value)

  function setUser(user) {
    currentUser.value = user
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
    hasCouple,
    setUser,
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
