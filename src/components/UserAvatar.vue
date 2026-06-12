<template>
  <!--
    头像组件：单一真相源，与右上角 NavBar 完全一致的判断逻辑
    props:
      - isAnonymous: 当前是否匿名用户（匿名时只显示灰色调 incognito 图标）
      - avatar: 自定义头像 base64 data URL（账号用户且已上传时传入）
      - size:   直径像素数（默认 32，即 w-8 h-8）
      - showPlaceholder: 当没有任何头像/未登录时是否展示「?」占位（默认 false）
      - interactive: 开启 hover 微动画（放大 + 柔和阴影）
  -->
  <div
    class="rounded-full flex items-center justify-center overflow-hidden select-none"
    :class="[
      interactive ? 'cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95' : ''
    ]"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <!-- 匿名用户：incognito 图标 + 灰色调背景，明显区别于账号用户 -->
    <div
      v-if="isAnonymous"
      class="w-full h-full flex items-center justify-center"
      style="background: linear-gradient(135deg, #94A3B8, #64748B);"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :style="{ width: (size * 0.55) + 'px', height: (size * 0.55) + 'px' }"
      >
        <ellipse cx="12" cy="5" rx="6" ry="3"></ellipse>
        <path d="M6 5c0 3 1 6 3 9"></path>
        <path d="M18 5c0 3-1 6-3 9"></path>
        <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"></path>
        <line x1="9" y1="11" x2="9" y2="11.01"></line>
        <line x1="15" y1="11" x2="15" y2="11.01"></line>
      </svg>
    </div>

    <!-- 账号用户：有自定义头像 → <img> -->
    <img
      v-else-if="avatar"
      :src="avatar"
      alt="avatar"
      class="w-full h-full object-cover"
    />

    <!-- 账号用户：无自定义头像 → 小河豚默认头像（紫色调） -->
    <div
      v-else-if="!showPlaceholder"
      class="w-full h-full flex items-center justify-center"
      style="background: linear-gradient(135deg, #7C3AED, #DB2777);"
    >
      <svg
        viewBox="0 0 40 40"
        fill="white"
        stroke="white"
        stroke-width="0.6"
        :style="{ width: (size * 0.75) + 'px', height: (size * 0.75) + 'px' }"
      >
        <ellipse cx="20" cy="21" rx="14" ry="11" fill="rgba(255,255,255,0.95)" stroke="none"/>
        <path d="M10 11 L12 7 L14 11 Z" fill="rgba(255,255,255,0.95)" stroke="none"/>
        <path d="M16 9 L18 5 L20 9 Z" fill="rgba(255,255,255,0.95)" stroke="none"/>
        <path d="M22 9 L24 5 L26 9 Z" fill="rgba(255,255,255,0.95)" stroke="none"/>
        <path d="M28 11 L30 7 L32 11 Z" fill="rgba(255,255,255,0.95)" stroke="none"/>
        <circle cx="14" cy="20" r="2.2" fill="#2E2B4A"/>
        <circle cx="15" cy="19" r="0.7" fill="white"/>
        <circle cx="26" cy="20" r="2.2" fill="#2E2B4A"/>
        <circle cx="27" cy="19" r="0.7" fill="white"/>
        <path d="M17 25 Q20 27 23 25" fill="none" stroke="#2E2B4A" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="11" cy="24" r="1.2" fill="#F9A8D4" opacity="0.7"/>
        <circle cx="29" cy="24" r="1.2" fill="#F9A8D4" opacity="0.7"/>
      </svg>
    </div>

    <!-- 未绑定/未知身份：「?」占位 -->
    <div
      v-else
      class="w-full h-full flex items-center justify-center font-semibold text-white"
      :style="{
        fontSize: Math.round(size * 0.55) + 'px',
        background: 'linear-gradient(135deg, #CBD5E1, #94A3B8)'
      }"
    >?</div>
  </div>
</template>

<script setup>
defineProps({
  isAnonymous: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  size: { type: [Number, String], default: 32 },
  showPlaceholder: { type: Boolean, default: false },
  interactive: { type: Boolean, default: false }
})
</script>
