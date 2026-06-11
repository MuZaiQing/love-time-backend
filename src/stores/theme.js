import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(false)

  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    updateDOM()
    saveToStorage()
  }

  function setTheme(dark) {
    isDarkMode.value = dark
    updateDOM()
    saveToStorage()
  }

  function updateDOM() {
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  }

  function saveToStorage() {
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  }

  function loadFromStorage() {
    const saved = localStorage.getItem('theme')
    if (saved !== null) {
      isDarkMode.value = saved === 'dark'
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateDOM()
  }

  watch(isDarkMode, () => {
    updateDOM()
    saveToStorage()
  })

  return {
    isDarkMode,
    toggleTheme,
    setTheme,
    loadFromStorage
  }
})
