<template>
  <div
    class="flex items-center justify-between p-4 rounded-[16px] transition-all duration-200"
    :class="[
      themeStore.isDarkMode ? 'bg-[rgba(30,27,75,0.85)]' : 'bg-[rgba(255,255,255,0.85)]',
      themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.2)]' : 'border-[rgba(99,102,241,0.15)]'
    ]"
    style="border-width: 1px; backdrop-filter: blur(16px);"
  >
    <!-- 情侣头像：当前用户在左，对方在右，重叠效果保持原布局 -->
    <div class="flex items-center">
      <!-- 当前用户头像 -->
      <div
        class="flex items-center justify-center overflow-hidden rounded-full border"
        :style="{
          width: '40px',
          height: '40px',
          borderColor: themeStore.isDarkMode ? 'rgba(30,27,75,0.85)' : 'rgba(255,255,255,0.85)'
        }"
      >
        <UserAvatar
          :isAnonymous="userStore.isAnonymousUser"
          :avatar="userStore.currentUser?.avatar"
          :size="40"
        />
      </div>

      <!-- 对方用户头像（负数 margin 产生重叠效果） -->
      <div
        class="-ml-3 flex items-center justify-center overflow-hidden rounded-full border"
        :style="{
          width: '40px',
          height: '40px',
          borderColor: themeStore.isDarkMode ? 'rgba(30,27,75,0.85)' : 'rgba(255,255,255,0.85)'
        }"
      >
        <!-- 匿名用户/未绑定：? 占位 -->
        <UserAvatar
          v-if="userStore.isAnonymousUser || !partnerAvatar"
          :isAnonymous="false"
          :avatar="''"
          :size="40"
          :showPlaceholder="true"
        />
        <!-- 账号用户且有对方信息 → 显示对方头像或默认小河豚 -->
        <UserAvatar
          v-else
          :isAnonymous="false"
          :avatar="partnerAvatar"
          :size="40"
        />
      </div>
    </div>

    <div class="text-sm" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">
      <span
        :class="themeStore.isDarkMode ? 'text-[#F1F5F9]' : 'text-[#1E1B4B]'"
        class="font-medium"
      >TA们在一起</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import UserAvatar from '@/components/UserAvatar.vue'

const props = defineProps({
  partnerAvatar: { type: String, default: '' }
})

const themeStore = useThemeStore()
const userStore = useUserStore()
</script>
