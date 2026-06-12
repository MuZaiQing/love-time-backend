<template>
  <nav
    class="sticky top-0 z-40 px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center transition-theme"
    :class="[
      themeStore.isDarkMode ? 'bg-[rgba(12,11,22,0.85)]' : 'bg-[rgba(250,250,254,0.85)]',
      themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.1)]' : 'border-[rgba(99,102,241,0.08)]'
    ]"
    style="border-width: 0 0 1px 0; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);"
  >
    <div class="flex items-center gap-2">
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center"
        :class="themeStore.isDarkMode ? 'bg-[rgba(129,140,248,0.15)]' : 'bg-[rgba(99,102,241,0.1)]'"
      >
        <Heart class="w-4 h-4" :class="themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'" />
      </div>
      <span
        class="text-sm sm:text-base font-semibold tracking-tight"
        :class="themeStore.isDarkMode ? 'text-[#F1F5F9]' : 'text-[#1E1B4B]'"
      >LoveTime</span>
    </div>

    <div class="flex items-center gap-1.5 sm:gap-2">
      <button
        class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
        :class="[
          themeStore.isDarkMode
            ? 'hover:bg-[rgba(129,140,248,0.15)] text-[#94A3B8] hover:text-[#A78BFA]'
            : 'hover:bg-[rgba(99,102,241,0.1)] text-[#6B7280] hover:text-[#7C3AED]'
        ]"
        @click="themeStore.toggleTheme"
        :title="themeStore.isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
      >
        <Transition name="theme-icon" mode="out-in">
          <Sun v-if="!themeStore.isDarkMode" class="w-[18px] h-[18px] sm:w-5 sm:h-5" />
          <Moon v-else class="w-[18px] h-[18px] sm:w-5 sm:h-5" />
        </Transition>
      </button>

      <div
        v-if="userStore.isLoggedIn" class="flex items-center gap-1.5 sm:gap-2">
        <button
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
          :class="[
            themeStore.isDarkMode
              ? 'hover:bg-[rgba(129,140,248,0.15)] text-[#94A3B8] hover:text-[#A78BFA]'
              : 'hover:bg-[rgba(99,102,241,0.1)] text-[#6B7280] hover:text-[#7C3AED]'
          ]"
          @click="$emit('openSettings')"
        >
          <Settings class="w-[18px] h-[18px] sm:w-5 sm:h-5" />
        </button>

        <!-- 右上角头像：与 CoupleInfo 共用同一个组件 UserAvatar，状态判断完全一致 -->
        <div
          class="cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
          @click="$emit('openSettings')"
        >
          <UserAvatar
            :isAnonymous="userStore.isAnonymousUser"
            :avatar="userStore.currentUser?.avatar"
            :size="36"
          />
        </div>
      </div>

      <span v-else></span>
    </div>
  </nav>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { Heart, Sun, Moon, Settings } from 'lucide-vue-next'
import UserAvatar from '@/components/UserAvatar.vue'

defineEmits(['openLogin', 'openSettings'])

const themeStore = useThemeStore()
const userStore = useUserStore()
</script>

<style scoped>
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}
</style>
