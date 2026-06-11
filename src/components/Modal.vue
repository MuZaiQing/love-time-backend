<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        ></div>

        <div 
          class="relative w-full max-w-[360px] max-h-[90vh] overflow-y-auto rounded-[24px] transition-all duration-200"
          :class="[
            themeStore.isDarkMode ? 'bg-[rgba(30,27,75,0.95)]' : 'bg-[rgba(255,255,255,0.98)]',
            themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.2)]' : 'border-[rgba(99,102,241,0.15)]'
          ]"
          style="border-width: 1px; backdrop-filter: blur(20px);"
        >
          <div 
            v-if="title"
            class="flex justify-between items-center p-5 border-b"
            :class="themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.2)]' : 'border-[rgba(99,102,241,0.15)]'"
          >
            <h3 class="text-lg font-semibold" :class="themeStore.isDarkMode ? 'text-[#F1F5F9]' : 'text-[#1E1B4B]'">{{ title }}</h3>
            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              :class="themeStore.isDarkMode ? 'hover:bg-[rgba(129,140,248,0.2)] text-[#94A3B8]' : 'hover:bg-[rgba(99,102,241,0.15)] text-[#6B7280]'"
              @click="$emit('close')"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-5">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  }
})

defineEmits(['close'])

const themeStore = useThemeStore()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: translateY(20px);
}
</style>
