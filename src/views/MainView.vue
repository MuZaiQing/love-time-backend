<template>
  <div class="min-h-screen pb-20">
    <div class="max-w-[480px] mx-auto px-4 py-6 space-y-6">
      <TimerCard
        v-if="userStore.currentCouple"
        :startDate="userStore.currentCouple.start_date"
        @click="openSettings"
      />

      <CoupleInfo
        v-if="userStore.currentCouple"
        :partnerAvatar="partnerAvatar"
      />

      <AnniversaryList
        v-if="userStore.currentCouple"
        :anniversaries="userStore.anniversaries"
        @edit="openEditAnniversary"
      />
    </div>

    <button
      v-if="userStore.currentCouple"
      class="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-95 z-30"
      :style="{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }"
      @click="openAddAnniversary"
    >
      <Plus class="w-6 h-6" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import TimerCard from '@/components/TimerCard.vue'
import CoupleInfo from '@/components/CoupleInfo.vue'
import AnniversaryList from '@/components/AnniversaryList.vue'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['openAddAnniversary', 'openEditAnniversary', 'openSettings'])
const userStore = useUserStore()

// 从 couples/me 返回的 partners 中找到“不是自己”的那一个，取其 avatar
const partnerAvatar = computed(() => {
  const couple = userStore.currentCouple
  if (!couple || !Array.isArray(couple.partners) || couple.partners.length === 0) return ''
  const myId = userStore.currentUser?.id
  const partner = couple.partners.find((p) => String(p.id) !== String(myId))
  return partner?.avatar || ''
})

function openAddAnniversary() {
  emit('openAddAnniversary')
}

function openEditAnniversary(item) {
  emit('openEditAnniversary', item)
}

function openSettings() {
  emit('openSettings')
}
</script>
