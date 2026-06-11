<template>
  <div 
    class="relative rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ease-out group"
    :class="[
      themeStore.isDarkMode ? 'bg-[rgba(22,20,50,0.92)]' : 'bg-[rgba(255,255,255,0.92)]',
      themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.15)]' : 'border-[rgba(99,102,241,0.12)]'
    ]"
    style="border-width: 1px; backdrop-filter: blur(20px); box-shadow: 0 8px 32px rgba(0,0,0,0.08);"
    @click="$emit('click')"
  >
    <div 
      class="absolute inset-0 rounded-3xl opacity-60"
      :style="{
        background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${themeStore.isDarkMode ? 'rgba(167,139,250,0.15)' : 'rgba(236,72,153,0.12)'} 0%, transparent 70%)`,
        animation: 'breathe 4s ease-in-out infinite'
      }"
    ></div>
    <div 
      class="absolute inset-0 rounded-3xl opacity-50"
      :style="{
        background: `radial-gradient(ellipse 70% 50% at 50% 60%, ${themeStore.isDarkMode ? 'rgba(96,165,250,0.12)' : 'rgba(139,92,246,0.1)'} 0%, transparent 60%)`,
        animation: 'breathe 4s ease-in-out infinite 1.5s'
      }"
    ></div>

    <div class="relative z-10">
      <div class="mb-1">
        <span 
          class="font-mono text-5xl sm:text-6xl md:text-7xl font-extralight tracking-tight transition-all duration-500"
          :class="themeStore.isDarkMode ? 'text-[#F1F5F9]' : 'text-[#1E1B4B]'"
        >{{ animatedDays }}</span>
        <span 
          class="text-lg sm:text-xl font-light ml-1"
          :class="themeStore.isDarkMode ? 'text-[#F472B6]' : 'text-[#EC4899]'"
        >天</span>
      </div>
      
      <p 
        class="text-xs sm:text-sm font-light tracking-wide mb-3"
        :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'"
      >与你的缘分已走过</p>
      
      <div 
        class="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full mb-5"
        :class="themeStore.isDarkMode ? 'bg-[rgba(129,140,248,0.1)] text-[#94A3B8]' : 'bg-[rgba(99,102,241,0.08)] text-[#6B7280]'"
      >
        <Calendar class="w-3 h-3" />
        <span>从</span>
        <span 
          class="font-medium"
          :class="themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'"
        >{{ formattedStartDate }}</span>
        <span>开始</span>
      </div>

      <div 
        class="flex justify-center gap-4 sm:gap-6 pt-5"
        :class="themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.15)]' : 'border-[rgba(99,102,241,0.12)]'"
        style="border-top-width: 1px;"
      >
        <div class="text-center min-w-[48px]">
          <div 
            class="font-mono text-lg sm:text-xl font-light tabular-nums"
            :class="themeStore.isDarkMode ? 'text-[#E2E8F0]' : 'text-[#334155]'"
          >{{ String(timeComponents.hours).padStart(2, '0') }}</div>
          <div 
            class="text-[10px] mt-0.5 tracking-wider"
            :class="themeStore.isDarkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'"
          >小时</div>
        </div>
        <div 
          class="text-xl font-extralight self-start mt-0.5"
          :class="themeStore.isDarkMode ? 'text-[#475569]' : 'text-[#CBD5E1]'"
        >:</div>
        <div class="text-center min-w-[48px]">
          <div 
            class="font-mono text-lg sm:text-xl font-light tabular-nums"
            :class="themeStore.isDarkMode ? 'text-[#E2E8F0]' : 'text-[#334155]'"
          >{{ String(timeComponents.minutes).padStart(2, '0') }}</div>
          <div 
            class="text-[10px] mt-0.5 tracking-wider"
            :class="themeStore.isDarkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'"
          >分钟</div>
        </div>
        <div 
          class="text-xl font-extralight self-start mt-0.5"
          :class="themeStore.isDarkMode ? 'text-[#475569]' : 'text-[#CBD5E1]'"
        >:</div>
        <div class="text-center min-w-[48px]">
          <div 
            class="font-mono text-lg sm:text-xl font-light tabular-nums"
            :class="themeStore.isDarkMode ? 'text-[#E2E8F0]' : 'text-[#334155]'"
          >{{ String(timeComponents.seconds).padStart(2, '0') }}</div>
          <div 
            class="text-[10px] mt-0.5 tracking-wider"
            :class="themeStore.isDarkMode ? 'text-[#64748B]' : 'text-[#94A3B8]'"
          >秒</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Calendar } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { formatDate, getTimeComponents } from '@/services/supabase'

const props = defineProps({
  startDate: {
    type: String,
    required: true
  }
})

defineEmits(['click'])

const themeStore = useThemeStore()
const animatedDays = ref(0)
const timeComponents = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer = null

const formattedStartDate = computed(() => formatDate(props.startDate))

function updateTimer() {
  const components = getTimeComponents(props.startDate)
  timeComponents.value = components
  
  animateNumber(animatedDays, components.days)
}

function animateNumber(element, targetValue) {
  const currentValue = element.value || 0
  if (currentValue === targetValue) return

  const diff = targetValue - currentValue
  const steps = 40
  const stepValue = diff / steps
  let step = 0

  const animate = () => {
    step++
    const progress = step / steps
    const eased = 1 - Math.pow(1 - progress, 3)
    const value = Math.round(currentValue + diff * eased)
    element.value = value
    if (step < steps) {
      requestAnimationFrame(animate)
    } else {
      element.value = targetValue
    }
  }

  requestAnimationFrame(animate)
}

watch(() => props.startDate, () => {
  updateTimer()
})

onMounted(() => {
  updateTimer()
  timer = setInterval(updateTimer, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>
