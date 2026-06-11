<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div 
      class="w-full max-w-sm p-8 rounded-[24px] text-center transition-all duration-300"
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
        <Users class="w-8 h-8" />
      </div>

      <h2 class="text-xl font-semibold mb-2" :class="themeStore.isDarkMode ? 'text-[#F1F5F9]' : 'text-[#1E1B4B]'">创建情侣绑定</h2>
      <p class="text-sm mb-6" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">设置你们的相识日期，生成邀请码让TA加入</p>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-left" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">相识日期</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-4 py-3 rounded-[12px] border outline-none transition-all duration-200"
            :class="[
              themeStore.isDarkMode ? 'bg-[#0F0E1A] border-[rgba(129,140,248,0.2)] text-[#F1F5F9]' : 'bg-[#FAFAFE] border-[rgba(99,102,241,0.15)] text-[#1E1B4B]',
              'focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
            ]"
            value="2024-01-01"
          />
        </div>

        <button
          class="w-full py-4 rounded-[12px] font-medium text-white flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
          :style="{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }"
          :disabled="loading"
          @click="handleCreateCouple"
        >
          <Plus v-if="!loading" class="w-5 h-5" />
          <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ loading ? '创建中...' : '创建绑定' }}
        </button>

        <div 
          v-if="errorMessage && !loading"
          class="mt-3 text-sm text-center text-red-500 animate-fade-in"
        >{{ errorMessage }}</div>
      </div>

      <div class="mt-8 pt-6 border-t" :class="themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.2)]' : 'border-[rgba(99,102,241,0.15)'">
        <p class="text-sm mb-3" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">或输入邀请码加入</p>
        <input
          v-model="inviteCode"
          type="text"
          placeholder="输入6位邀请码"
          maxlength="6"
          class="w-full px-4 py-3 rounded-[12px] border outline-none transition-all duration-200 text-center tracking-widest text-lg"
          :class="[
            themeStore.isDarkMode ? 'bg-[#0F0E1A] border-[rgba(129,140,248,0.2)] text-[#F1F5F9]' : 'bg-[#FAFAFE] border-[rgba(99,102,241,0.15)] text-[#1E1B4B]',
            'focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
          ]"
        />
        <button
          class="w-full mt-3 py-3 rounded-[12px] font-medium transition-all duration-200"
          :class="themeStore.isDarkMode ? 'bg-[rgba(129,140,248,0.2)] text-[#94A3B8] hover:bg-[rgba(129,140,248,0.3)]' : 'bg-[rgba(99,102,241,0.15)] text-[#6B7280] hover:bg-[rgba(99,102,241,0.2)]'"
          :disabled="loading"
          @click="handleJoinCouple"
        >
          加入绑定
        </button>

        <div 
          v-if="errorMessage && !loading"
          class="mt-3 text-sm text-center text-red-500 animate-fade-in"
        >{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Users, Plus } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/services/supabase'
import { joinCouple } from '@/services/supabase'

const emit = defineEmits(['created'])

const themeStore = useThemeStore()
const userStore = useUserStore()

const startDate = ref('2024-01-01')
const inviteCode = ref('')
const loading = ref(false)
const errorMessage = ref('')

// 先绕开登录问题，用硬编码用户ID测试
const TEST_USER_ID = '452c814f-fec2-44a1-9bfc-96e81cdb3059'

async function handleCreateCouple() {
  loading.value = true
  try {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    console.log('[handleCreateCouple] 准备插入:', {
      startDate: startDate.value,
      userId: TEST_USER_ID,
      inviteCode
    })

    // 直接用项目已有的 Supabase 客户端 API，自动处理会话和令牌
    const insertResult = await Promise.race([
      supabase
        .from('couples')
        .insert([
          {
            start_date: startDate.value,
            user1_id: TEST_USER_ID,
            invite_code: inviteCode
          }
        ])
        .select(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('请求超时')), 10000))
    ])

    const { data, error } = insertResult
    if (error) throw error
    console.log('[handleCreateCouple] 插入成功:', data)
    alert(`创建成功！邀请码：${inviteCode}`)
  } catch (err) {
    console.error('[handleCreateCouple] 插入失败:', err)
    alert(`创建失败：${err.message}`)
  } finally {
    // 强制复位 loading 状态，按钮不会再卡死
    loading.value = false
    console.log('[handleCreateCouple] loading状态已复位')
  }
}

// 控制台调试函数，可直接 window.debugCreateCouple() 调用
window.debugCreateCouple = async function(startDateValue = '2024-01-01') {
  console.log('[debugCreateCouple] 开始调试')
  console.log('[debugCreateCouple] window.supabase 是否存在:', !!window.supabase)

  try {
    // 硬编码测试用户ID
    const testUserId = '452c814f-fec2-44a1-9bfc-96e81cdb3059'
    console.log('[debugCreateCouple] 测试用户ID:', testUserId)

    // 生成邀请码
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    console.log('[debugCreateCouple] 邀请码:', inviteCode)

    // 插入数据
    const { data, error } = await window.supabase
      .from('couples')
      .insert([
        {
          start_date: startDateValue,
          user1_id: testUserId,
          invite_code: inviteCode
        }
      ])
      .select()

    if (error) throw error

    console.log('[debugCreateCouple] 创建成功:', data)
    alert('创建成功！邀请码：' + inviteCode)
    return { inviteCode, data }
  } catch (err) {
    console.error('[debugCreateCouple] 捕获异常:', err)
    if (err instanceof ReferenceError) {
      console.error('[debugCreateCouple] ReferenceError:', err.message, err.stack)
    }
    alert('调试创建失败：' + (err.message || '未知错误'))
    throw err
  }
}

async function handleJoinCouple() {
  const code = inviteCode.value.trim()
  if (!code) {
    errorMessage.value = '请输入邀请码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const couple = await joinCouple(code, userStore.currentUser.id)
    emit('created', couple)
  } catch (error) {
    errorMessage.value = error.message || '加入失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
