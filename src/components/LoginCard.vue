<template>
  <div 
    class="w-full max-w-sm mx-auto p-8 rounded-[24px] text-center transition-all duration-300"
    :class="[
      themeStore.isDarkMode ? 'bg-[rgba(30,27,75,0.9)]' : 'bg-[rgba(255,255,255,0.95)]',
      themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.2)]' : 'border-[rgba(99,102,241,0.15)]'
    ]"
    style="border-width: 1px; backdrop-filter: blur(20px);"
  >
    <div 
      class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
      :style="{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }"
    >
      <Heart class="w-8 h-8" />
    </div>

    <h2 class="text-2xl font-semibold mb-2" :class="themeStore.isDarkMode ? 'text-[#F1F5F9]' : 'text-[#1E1B4B]'">LoveTime</h2>
    <p class="text-sm mb-6" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">记录你们相爱的每一天</p>

    <button
      class="w-full py-4 rounded-[12px] font-medium text-white flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
      :style="{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }"
      :disabled="loading"
      @click="$emit('login')"
    >
      <Sparkles v-if="!loading" class="w-5 h-5" />
      <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      {{ loading ? '登录中...' : '匿名登录' }}
    </button>

    <p class="text-xs mt-4" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">
      登录后可同步数据到云端
    </p>
  </div>
</template>

<script setup>
import { Heart, Sparkles } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['login'])

const themeStore = useThemeStore()
</script>
