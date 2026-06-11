<template>
  <div 
    class="min-h-screen min-h-dvh transition-colors duration-300"
    :class="themeStore.isDarkMode ? 'bg-[#0F0E1A]' : 'bg-[#FAFAFE]'"
  >
    <FlowFieldBackground />

    <NavBar 
      @openLogin="showLoginModal = true"
      @openSettings="showSettingsModal = true"
    />

    <LoginView v-if="!userStore.isLoggedIn" @loginSuccess="handleLoginSuccess" />
    
    <MainView 
      v-else-if="userStore.hasCouple"
      @openAddAnniversary="showAddAnniversaryModal = true"
      @openEditAnniversary="handleEditAnniversary"
      @openSettings="showSettingsModal = true"
    />

    <CoupleSetupModal 
      v-else-if="userStore.isLoggedIn && !userStore.hasCouple"
      @created="handleCoupleCreated"
    />

    <Modal :visible="showAddAnniversaryModal" title="添加纪念日" @close="showAddAnniversaryModal = false">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">名称</label>
          <input
            v-model="newAnniversary.name"
            type="text"
            class="w-full px-4 py-3 rounded-[12px] border outline-none transition-all duration-200"
            :class="[
              themeStore.isDarkMode ? 'bg-[#0F0E1A] border-[rgba(129,140,248,0.2)] text-[#F1F5F9]' : 'bg-[#FAFAFE] border-[rgba(99,102,241,0.15)] text-[#1E1B4B]',
              'focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
            ]"
            placeholder="如：第一次约会"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">日期</label>
          <input
            v-model="newAnniversary.date"
            type="date"
            class="w-full px-4 py-3 rounded-[12px] border outline-none transition-all duration-200"
            :class="[
              themeStore.isDarkMode ? 'bg-[#0F0E1A] border-[rgba(129,140,248,0.2)] text-[#F1F5F9]' : 'bg-[#FAFAFE] border-[rgba(99,102,241,0.15)] text-[#1E1B4B]',
              'focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
            ]"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">类型</label>
          <select
            v-model="newAnniversary.type"
            class="w-full px-4 py-3 rounded-[12px] border outline-none transition-all duration-200 appearance-none"
            :class="[
              themeStore.isDarkMode ? 'bg-[#0F0E1A] border-[rgba(129,140,248,0.2)] text-[#F1F5F9]' : 'bg-[#FAFAFE] border-[rgba(99,102,241,0.15)] text-[#1E1B4B]',
              'focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
            ]"
          >
            <option value="anniversary">纪念日</option>
            <option value="birthday">生日</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div class="flex gap-3 pt-4">
          <button
            class="flex-1 py-3 rounded-[12px] font-medium transition-all duration-200"
            :class="themeStore.isDarkMode ? 'bg-[rgba(129,140,248,0.2)] text-[#94A3B8] hover:bg-[rgba(129,140,248,0.3)]' : 'bg-[rgba(99,102,241,0.15)] text-[#6B7280] hover:bg-[rgba(99,102,241,0.2)]'"
            @click="showAddAnniversaryModal = false"
          >
            取消
          </button>
          <button
            class="flex-1 py-3 rounded-[12px] font-medium text-white transition-all duration-200 hover:shadow-lg active:scale-98"
            :style="{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }"
            @click="handleAddAnniversary"
          >
            保存
          </button>
        </div>
      </div>
    </Modal>

    <Modal :visible="showEditAnniversaryModal" title="编辑纪念日" @close="showEditAnniversaryModal = false">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">名称</label>
          <input
            v-model="editingAnniversary.name"
            type="text"
            class="w-full px-4 py-3 rounded-[12px] border outline-none transition-all duration-200"
            :class="[
              themeStore.isDarkMode ? 'bg-[#0F0E1A] border-[rgba(129,140,248,0.2)] text-[#F1F5F9]' : 'bg-[#FAFAFE] border-[rgba(99,102,241,0.15)] text-[#1E1B4B]',
              'focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
            ]"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">日期</label>
          <input
            v-model="editingAnniversary.date"
            type="date"
            class="w-full px-4 py-3 rounded-[12px] border outline-none transition-all duration-200"
            :class="[
              themeStore.isDarkMode ? 'bg-[#0F0E1A] border-[rgba(129,140,248,0.2)] text-[#F1F5F9]' : 'bg-[#FAFAFE] border-[rgba(99,102,241,0.15)] text-[#1E1B4B]',
              'focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
            ]"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">类型</label>
          <select
            v-model="editingAnniversary.type"
            class="w-full px-4 py-3 rounded-[12px] border outline-none transition-all duration-200 appearance-none"
            :class="[
              themeStore.isDarkMode ? 'bg-[#0F0E1A] border-[rgba(129,140,248,0.2)] text-[#F1F5F9]' : 'bg-[#FAFAFE] border-[rgba(99,102,241,0.15)] text-[#1E1B4B]',
              'focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
            ]"
          >
            <option value="anniversary">纪念日</option>
            <option value="birthday">生日</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div class="flex gap-3 pt-4">
          <button
            class="flex-1 py-3 rounded-[12px] font-medium text-red-500 transition-all duration-200 hover:bg-red-500/10"
            @click="showDeleteConfirm = true"
          >
            删除
          </button>
          <button
            class="flex-1 py-3 rounded-[12px] font-medium text-white transition-all duration-200 hover:shadow-lg active:scale-98"
            :style="{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }"
            @click="handleUpdateAnniversary"
          >
            保存
          </button>
        </div>
      </div>
    </Modal>

    <Modal :visible="showDeleteConfirm" title="" @close="showDeleteConfirm = false">
      <div class="text-center">
        <div class="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-100">
          <Trash2 class="w-6 h-6 text-red-500" />
        </div>
        <h3 class="text-lg font-semibold mb-2" :class="themeStore.isDarkMode ? 'text-[#F1F5F9]' : 'text-[#1E1B4B]'">确认删除</h3>
        <p class="text-sm mb-6" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">删除后无法恢复，确定要删除这个纪念日吗？</p>
        <div class="flex gap-3">
          <button
            class="flex-1 py-3 rounded-[12px] font-medium transition-all duration-200"
            :class="themeStore.isDarkMode ? 'bg-[rgba(129,140,248,0.2)] text-[#94A3B8]' : 'bg-[rgba(99,102,241,0.15)] text-[#6B7280]'"
            @click="showDeleteConfirm = false"
          >
            取消
          </button>
          <button
            class="flex-1 py-3 rounded-[12px] font-medium text-white bg-red-500 transition-all duration-200 hover:bg-red-600"
            @click="handleDeleteAnniversary"
          >
            删除
          </button>
        </div>
      </div>
    </Modal>

    <Modal :visible="showSettingsModal" title="设置" @close="showSettingsModal = false">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">相识日期</label>
          <input
            v-model="settingsForm.startDate"
            type="date"
            class="w-full px-4 py-3 rounded-[12px] border outline-none transition-all duration-200"
            :class="[
              themeStore.isDarkMode ? 'bg-[#0F0E1A] border-[rgba(129,140,248,0.2)] text-[#F1F5F9]' : 'bg-[#FAFAFE] border-[rgba(99,102,241,0.15)] text-[#1E1B4B]',
              'focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
            ]"
          />
        </div>
        <button
          class="w-full py-3 rounded-[12px] font-medium transition-all duration-200"
          :class="themeStore.isDarkMode ? 'bg-[rgba(129,140,248,0.2)] text-[#94A3B8] hover:bg-[rgba(129,140,248,0.3)]' : 'bg-[rgba(99,102,241,0.15)] text-[#6B7280] hover:bg-[rgba(99,102,241,0.2)]'"
          @click="handleUpdateStartDate"
        >
          更新日期
        </button>

        <div class="pt-4 border-t" :class="themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.2)]' : 'border-[rgba(99,102,241,0.15)'">
          <button
            class="w-full py-3 rounded-[12px] font-medium transition-all duration-200"
            :class="themeStore.isDarkMode ? 'bg-[rgba(129,140,248,0.2)] text-[#94A3B8] hover:bg-[rgba(129,140,248,0.3)]' : 'bg-[rgba(99,102,241,0.15)] text-[#6B7280] hover:bg-[rgba(99,102,241,0.2)]'"
            @click="showInviteModal = true"
          >
            邀请TA加入
          </button>
        </div>

        <div class="pt-4 border-t" :class="themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.2)]' : 'border-[rgba(99,102,241,0.15)'">
          <button
            class="w-full py-3 rounded-[12px] font-medium transition-all duration-200"
            :class="themeStore.isDarkMode ? 'text-[#94A3B8] hover:bg-[rgba(129,140,248,0.2)]' : 'text-[#6B7280] hover:bg-[rgba(99,102,241,0.15)]'"
            @click="handleLogout"
          >
            退出登录
          </button>
        </div>
      </div>
    </Modal>

    <Modal :visible="showInviteModal" title="邀请TA" @close="showInviteModal = false">
      <div class="text-center">
        <p class="text-sm mb-4" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">将此邀请码发送给另一半</p>
        <div 
          class="p-6 rounded-[12px] mb-4"
          :class="themeStore.isDarkMode ? 'bg-[#0F0E1A]' : 'bg-[#FAFAFE]'"
        >
          <div class="text-xs mb-2" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">邀请码</div>
          <div class="font-mono text-3xl font-semibold tracking-widest" :class="themeStore.isDarkMode ? 'text-[#818CF8]' : 'text-[#6366F1]'">
            {{ userStore.currentCouple?.invite_code }}
          </div>
        </div>
        <button
          class="w-full py-3 rounded-[12px] font-medium transition-all duration-200"
          :class="themeStore.isDarkMode ? 'bg-[rgba(129,140,248,0.2)] text-[#94A3B8] hover:bg-[rgba(129,140,248,0.3)]' : 'bg-[rgba(99,102,241,0.15)] text-[#6B7280] hover:bg-[rgba(99,102,241,0.2)]'"
          @click="copyInviteCode"
        >
          复制邀请码
        </button>
      </div>
    </Modal>

    <div class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="px-4 py-3 rounded-[12px] text-sm shadow-lg animate-toast-in pointer-events-auto"
          :class="[
            themeStore.isDarkMode ? 'bg-[rgba(30,27,75,0.95)] text-[#F1F5F9]' : 'bg-white text-[#1E1B4B]',
            toast.type === 'success' ? 'border-l-4 border-green-500' : '',
            toast.type === 'error' ? 'border-l-4 border-red-500' : '',
            toast.type === 'info' ? 'border-l-4 border-blue-500' : ''
          ]"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import FlowFieldBackground from '@/components/FlowFieldBackground.vue'
import NavBar from '@/components/NavBar.vue'
import Modal from '@/components/Modal.vue'
import LoginView from '@/views/LoginView.vue'
import MainView from '@/views/MainView.vue'
import CoupleSetupModal from '@/components/CoupleSetupModal.vue'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { 
  supabase, 
  getCurrentSession, 
  getCoupleByUserId, 
  getAnniversaries,
  createAnniversary,
  updateAnniversary,
  deleteAnniversary,
  updateCoupleStartDate,
  signOut,
  saveToLocal,
  loadFromLocal
} from '@/services/supabase'

const themeStore = useThemeStore()
const userStore = useUserStore()

const showLoginModal = ref(false)
const showSettingsModal = ref(false)
const showAddAnniversaryModal = ref(false)
const showEditAnniversaryModal = ref(false)
const showDeleteConfirm = ref(false)
const showInviteModal = ref(false)

const newAnniversary = reactive({
  name: '',
  date: '',
  type: 'anniversary'
})

const editingAnniversary = reactive({
  id: '',
  name: '',
  date: '',
  type: 'anniversary'
})

const settingsForm = reactive({
  startDate: ''
})

const toasts = ref([])
let toastId = 0

function showToast(message, type = 'info') {
  const id = toastId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 2500)
}

async function handleLoginSuccess() {
  await loadUserData()
}

async function loadUserData() {
  try {
    const session = await getCurrentSession()
    if (session?.user) {
      userStore.setUser(session.user)
      
      const localData = await loadFromLocal('user_data')
      if (localData) {
        userStore.setCouple(localData.couple)
        userStore.setAnniversaries(localData.anniversaries || [])
      }

      const couple = await getCoupleByUserId(session.user.id)
      if (couple) {
        userStore.setCouple(couple)
        
        const anniversaries = await getAnniversaries(couple.id)
        userStore.setAnniversaries(anniversaries)

        await saveToLocal('user_data', {
          couple,
          anniversaries,
          timestamp: Date.now()
        })
      }

      settingsForm.startDate = userStore.currentCouple?.start_date || ''
    }
  } catch (error) {
    console.error('Load user data failed:', error)
    showToast('加载数据失败: ' + error.message, 'error')
  }
}

async function handleCoupleCreated(couple) {
  userStore.setCouple(couple)
  userStore.setAnniversaries([])
  settingsForm.startDate = couple.start_date
  showToast('情侣绑定成功', 'success')
}

function handleEditAnniversary(item) {
  editingAnniversary.id = item.id
  editingAnniversary.name = item.name
  editingAnniversary.date = item.date
  editingAnniversary.type = item.type
  showEditAnniversaryModal.value = true
}

async function handleAddAnniversary() {
  if (!newAnniversary.name || !newAnniversary.date) {
    showToast('请填写名称和日期', 'error')
    return
  }

  try {
    const result = await createAnniversary(
      userStore.currentCouple.id,
      newAnniversary.name,
      newAnniversary.date,
      newAnniversary.type
    )
    userStore.addAnniversary(result)
    await saveToLocal('user_data', {
      couple: userStore.currentCouple,
      anniversaries: userStore.anniversaries,
      timestamp: Date.now()
    })
    showAddAnniversaryModal.value = false
    newAnniversary.name = ''
    newAnniversary.date = ''
    newAnniversary.type = 'anniversary'
    showToast('添加成功', 'success')
  } catch (error) {
    showToast('添加失败: ' + error.message, 'error')
  }
}

async function handleUpdateAnniversary() {
  if (!editingAnniversary.name || !editingAnniversary.date) {
    showToast('请填写名称和日期', 'error')
    return
  }

  try {
    const result = await updateAnniversary(editingAnniversary.id, {
      name: editingAnniversary.name,
      date: editingAnniversary.date,
      type: editingAnniversary.type
    })
    userStore.updateAnniversary(editingAnniversary.id, result)
    await saveToLocal('user_data', {
      couple: userStore.currentCouple,
      anniversaries: userStore.anniversaries,
      timestamp: Date.now()
    })
    showEditAnniversaryModal.value = false
    showToast('更新成功', 'success')
  } catch (error) {
    showToast('更新失败: ' + error.message, 'error')
  }
}

async function handleDeleteAnniversary() {
  try {
    await deleteAnniversary(editingAnniversary.id)
    userStore.removeAnniversary(editingAnniversary.id)
    await saveToLocal('user_data', {
      couple: userStore.currentCouple,
      anniversaries: userStore.anniversaries,
      timestamp: Date.now()
    })
    showDeleteConfirm.value = false
    showEditAnniversaryModal.value = false
    showToast('已删除', 'success')
  } catch (error) {
    showToast('删除失败: ' + error.message, 'error')
  }
}

async function handleUpdateStartDate() {
  if (!settingsForm.startDate) {
    showToast('请选择日期', 'error')
    return
  }

  try {
    const result = await updateCoupleStartDate(userStore.currentCouple.id, settingsForm.startDate)
    userStore.setCouple(result)
    await saveToLocal('user_data', {
      couple: result,
      anniversaries: userStore.anniversaries,
      timestamp: Date.now()
    })
    showSettingsModal.value = false
    showToast('日期已更新', 'success')
  } catch (error) {
    showToast('更新失败: ' + error.message, 'error')
  }
}

async function handleLogout() {
  try {
    await signOut()
    userStore.logout()
    showSettingsModal.value = false
    showToast('已退出登录', 'info')
  } catch (error) {
    showToast('退出失败: ' + error.message, 'error')
  }
}

function copyInviteCode() {
  const code = userStore.currentCouple?.invite_code
  if (code) {
    navigator.clipboard.writeText(code)
    showToast('已复制', 'success')
    showInviteModal.value = false
  }
}

watch(() => userStore.currentCouple, (couple) => {
  if (couple) {
    settingsForm.startDate = couple.start_date
  }
})

onMounted(() => {
  themeStore.loadFromStorage()
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      userStore.setUser(session.user)
      await loadUserData()
    } else if (event === 'SIGNED_OUT') {
      userStore.logout()
    }
  })

  loadUserData()
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
</style>
