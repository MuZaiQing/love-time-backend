<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <LoginCard :loading="loading" @login="handleLogin" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LoginCard from '@/components/LoginCard.vue'
import { signInAnonymously } from '@/services/supabase'

defineEmits(['loginSuccess'])

const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    await signInAnonymously()
  } catch (error) {
    console.error('Login failed:', error)
    alert('登录失败: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>
