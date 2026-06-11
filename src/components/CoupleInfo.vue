<template>
  <div 
    class="flex items-center justify-between p-4 rounded-[16px] transition-all duration-200"
    :class="[
      themeStore.isDarkMode ? 'bg-[rgba(30,27,75,0.85)]' : 'bg-[rgba(255,255,255,0.85)]',
      themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.2)]' : 'border-[rgba(99,102,241,0.15)]'
    ]"
    style="border-width: 1px; backdrop-filter: blur(16px);"
  >
    <div class="flex items-center">
      <div 
        class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
        :style="{ background: 'linear-gradient(135deg, #6366F1, #EC4899)' }"
      >
        {{ initials[0] || '?' }}
      </div>
      <div 
        class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm -ml-3 border-2"
        :style="{ 
          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          borderColor: themeStore.isDarkMode ? 'rgba(30,27,75,0.85)' : 'rgba(255,255,255,0.85)'
        }"
      >
        {{ initials[1] || '?' }}
      </div>
    </div>
    <div class="text-sm" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">
      <span :class="themeStore.isDarkMode ? 'text-[#F1F5F9]' : 'text-[#1E1B4B]'" class="font-medium">TA们在一起</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const props = defineProps({
  user1Id: String,
  user2Id: String
})

const themeStore = useThemeStore()

const initials = computed(() => {
  return [
    props.user1Id?.substring(0, 1).toUpperCase() || '?',
    props.user2Id?.substring(0, 1).toUpperCase() || '?'
  ]
})
</script>
