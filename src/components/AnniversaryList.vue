<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 
        class="text-base sm:text-lg font-semibold tracking-tight"
        :class="themeStore.isDarkMode ? 'text-[#F1F5F9]' : 'text-[#1E1B4B]'"
      >纪念日</h2>
    </div>

    <div 
      v-if="anniversaries.length === 0" 
      class="text-center py-10 sm:py-12 animate-fade-in"
    >
      <div 
        class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
        :class="themeStore.isDarkMode ? 'bg-[rgba(129,140,248,0.15)]' : 'bg-[rgba(99,102,241,0.1)]'"
      >
        <CalendarHeart 
          class="w-7 h-7 sm:w-8 sm:h-8" 
          :class="themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'" 
        />
      </div>
      <h3 
        class="text-sm sm:text-base font-medium mb-2"
        :class="themeStore.isDarkMode ? 'text-[#E2E8F0]' : 'text-[#334155]'"
      >还没有纪念日</h3>
      <p 
        class="text-xs sm:text-sm max-w-[200px] mx-auto leading-relaxed"
        :class="themeStore.isDarkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'"
      >点击右下角按钮添加你们的第一个纪念日</p>
    </div>

    <div v-else class="space-y-2.5 sm:space-y-3">
      <div
        v-for="(item, index) in anniversaries"
        :key="item.id"
        class="p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 ease-out animate-fade-in-up group"
        :class="[
          themeStore.isDarkMode ? 'bg-[rgba(22,20,50,0.9)]' : 'bg-[rgba(255,255,255,0.9)]',
          themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.12)]' : 'border-[rgba(99,102,241,0.1)]',
          'hover:scale-[1.01] hover:shadow-lg'
        ]"
        :style="{ 
          borderWidth: '1px', 
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          animationDelay: `${index * 0.08}s`,
          opacity: 0
        }"
        @click="$emit('edit', item)"
      >
        <div class="flex justify-between items-start mb-2">
          <span 
            class="text-sm sm:text-base font-medium"
            :class="themeStore.isDarkMode ? 'text-[#F1F5F9]' : 'text-[#1E1B4B]'"
          >{{ item.name }}</span>
          <span 
            class="text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full font-medium"
            :class="[
              themeStore.isDarkMode 
                ? 'bg-[rgba(129,140,248,0.15)] text-[#A78BFA]' 
                : 'bg-[rgba(99,102,241,0.1)] text-[#7C3AED]'
            ]"
          >
            {{ typeLabels[item.type] || '其他' }}
          </span>
        </div>

        <div class="flex items-end gap-2 mb-1">
          <div 
            class="font-mono text-2xl sm:text-3xl font-extralight leading-none tabular-nums"
            :class="getCountdownClass(item.date)"
          >{{ getCountdown(item.date) }}</div>
          <div 
            class="text-[10px] sm:text-xs pb-0.5"
            :class="themeStore.isDarkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'"
          >天后</div>
        </div>
        
        <div 
          class="text-[11px] sm:text-xs mt-1.5"
          :class="themeStore.isDarkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'"
        >{{ formatDate(item.date) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CalendarHeart } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { formatDate, calculateCountdown } from '@/services/supabase'

defineProps({
  anniversaries: {
    type: Array,
    default: () => []
  }
})

defineEmits(['edit'])

const themeStore = useThemeStore()

const typeLabels = {
  anniversary: '纪念日',
  birthday: '生日',
  other: '其他'
}

function getCountdown(date) {
  return calculateCountdown(date)
}

function getCountdownClass(date) {
  const days = calculateCountdown(date)
  if (days <= 7) {
    return themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'
  }
  return themeStore.isDarkMode ? 'text-[#F472B6]' : 'text-[#EC4899]'
}
</script>
