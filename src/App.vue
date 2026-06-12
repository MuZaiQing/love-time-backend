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

        <!-- 头像设置（仅对已登录的账号用户显示，匿名用户不支持自定义头像） -->
        <div
          v-if="userStore.isLoggedIn && !userStore.isAnonymousUser"
          class="pt-4 border-t"
          :class="themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.2)]' : 'border-[rgba(99,102,241,0.15)]'"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="text-sm font-medium" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">头像设置</div>
            <button
              v-if="userStore.currentUser?.avatar"
              class="text-xs transition-colors"
              :class="themeStore.isDarkMode ? 'text-[#94A3B8] hover:text-[#F1F5F9]' : 'text-[#6B7280] hover:text-[#1E1B4B]'"
              @click="handleResetAvatar"
              :disabled="avatarSaving"
            >
              恢复默认
            </button>
          </div>

          <div class="flex items-center gap-4">
            <!-- 头像预览（圆形裁剪） -->
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden shrink-0 border"
              :class="themeStore.isDarkMode ? 'border-[rgba(129,140,248,0.2)]' : 'border-[rgba(99,102,241,0.15)]'"
            >
              <img
                v-if="avatarPreview"
                :src="avatarPreview"
                alt="avatar"
                class="w-full h-full object-cover"
              />
              <!-- 默认小河豚预览 -->
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
                style="background: linear-gradient(135deg, #7C3AED, #DB2777);"
              >
                <svg viewBox="0 0 40 40" class="w-8 h-8" fill="white" stroke="white" stroke-width="0.6">
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
            </div>

            <div class="flex-1 flex flex-col gap-2 min-w-0">
              <label
                class="inline-flex items-center justify-center cursor-pointer py-2.5 px-3 rounded-[12px] border text-sm font-medium transition-all duration-200"
                :class="[
                  themeStore.isDarkMode
                    ? 'bg-[rgba(129,140,248,0.15)] border-[rgba(129,140,248,0.2)] text-[#F1F5F9] hover:bg-[rgba(129,140,248,0.25)]'
                    : 'bg-[rgba(99,102,241,0.08)] border-[rgba(99,102,241,0.15)] text-[#1E1B4B] hover:bg-[rgba(99,102,241,0.15)]'
                ]"
              >
                {{ avatarPreview ? '更换图片' : '选择本地图片' }}
                <input
                  ref="avatarFileInput"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  class="hidden"
                  @change="onAvatarFileChange"
                />
              </label>
              <button
                v-if="avatarIsDirty"
                class="py-2.5 px-3 rounded-[12px] text-sm font-medium text-white transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                :class="avatarSaving ? 'opacity-60 cursor-not-allowed' : ''"
                style="background: linear-gradient(135deg, #6366F1, #8B5CF6);"
                @click="handleSaveAvatar"
                :disabled="avatarSaving"
              >
                {{ avatarSaving ? '保存中...' : '保存头像' }}
              </button>
              <div
                v-if="avatarMessage"
                class="text-xs"
                :class="avatarMessageType === 'error' ? 'text-red-500' : 'text-[#6B7280]'"
              >
                {{ avatarMessage }}
              </div>
            </div>
          </div>
        </div>

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
            v-if="userStore.isAnonymousUser"
            class="w-full py-3 rounded-[12px] font-medium transition-all duration-200"
            :class="themeStore.isDarkMode ? 'text-[#94A3B8] hover:bg-[rgba(129,140,248,0.2)]' : 'text-[#6B7280] hover:bg-[rgba(99,102,241,0.15)]'"
            @click="showRegisterModal = true"
          >
            创建账号
          </button>
          <button
            v-else
            class="w-full py-3 rounded-[12px] font-medium transition-all duration-200 text-red-500 hover:bg-red-500/10"
            @click="showLogoutConfirm = true"
          >
            退出登录
          </button>
        </div>
      </div>
    </Modal>

    <!-- 退出登录确认弹窗 -->
    <Modal :visible="showLogoutConfirm" title="" @close="showLogoutConfirm = false">
      <div class="text-center">
        <div class="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-100">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4a1 1 0 11-2 0 1 1 0 012 0zm-3-2a3 3 0 100-6 3 3 0 000 6z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2" :class="themeStore.isDarkMode ? 'text-[#F1F5F9]' : 'text-[#1E1B4B]'">确认退出登录？</h3>
        <p class="text-sm mb-6" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">退出后需要重新登录才能访问您的数据</p>
        <div class="flex gap-3">
          <button
            class="flex-1 py-3 rounded-[12px] font-medium transition-all duration-200"
            :class="themeStore.isDarkMode ? 'bg-[rgba(129,140,248,0.2)] text-[#94A3B8]' : 'bg-[rgba(99,102,241,0.15)] text-[#6B7280]'"
            @click="showLogoutConfirm = false"
          >
            取消
          </button>
          <button
            class="flex-1 py-3 rounded-[12px] font-medium text-white bg-red-500 transition-all duration-200 hover:bg-red-600"
            @click="handleLogout"
          >
            确认退出
          </button>
        </div>
      </div>
    </Modal>

    <Modal :visible="showRegisterModal" title="创建账号" @close="showRegisterModal = false">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">用户名</label>
          <input
            v-model="registerForm.username"
            type="text"
            class="w-full px-4 py-3 rounded-[12px] border outline-none transition-all duration-200"
            :class="[
              themeStore.isDarkMode ? 'bg-[#0F0E1A] border-[rgba(129,140,248,0.2)] text-[#F1F5F9]' : 'bg-[#FAFAFE] border-[rgba(99,102,241,0.15)] text-[#1E1B4B]',
              'focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
            ]"
            placeholder="设置一个用户名"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2" :class="themeStore.isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'">密码</label>
          <input
            v-model="registerForm.password"
            type="password"
            class="w-full px-4 py-3 rounded-[12px] border outline-none transition-all duration-200"
            :class="[
              themeStore.isDarkMode ? 'bg-[#0F0E1A] border-[rgba(129,140,248,0.2)] text-[#F1F5F9]' : 'bg-[#FAFAFE] border-[rgba(99,102,241,0.15)] text-[#1E1B4B]',
              'focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
            ]"
            placeholder="设置登录密码"
          />
        </div>
        <div v-if="registerError" class="text-red-500 text-sm">
          {{ registerError }}
        </div>
        <div class="flex gap-3 pt-4">
          <button
            class="flex-1 py-3 rounded-[12px] font-medium transition-all duration-200"
            :class="themeStore.isDarkMode ? 'bg-[rgba(129,140,248,0.2)] text-[#94A3B8] hover:bg-[rgba(129,140,248,0.3)]' : 'bg-[rgba(99,102,241,0.15)] text-[#6B7280] hover:bg-[rgba(99,102,241,0.2)]'"
            @click="showRegisterModal = false"
          >
            取消
          </button>
          <button
            class="flex-1 py-3 rounded-[12px] font-medium text-white transition-all duration-200 hover:shadow-lg active:scale-98"
            :style="{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }"
            @click="handleRegister"
            :disabled="registerLoading"
          >
            {{ registerLoading ? '处理中...' : '创建' }}
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
import { saveToLocal, loadFromLocal } from './services/storage'
import { computed } from 'vue'

const themeStore = useThemeStore()
const userStore = useUserStore()

const API_BASE_URL = '/api'

const showLoginModal = ref(false)
const showSettingsModal = ref(false)
const showAddAnniversaryModal = ref(false)
const showEditAnniversaryModal = ref(false)
const showDeleteConfirm = ref(false)
const showInviteModal = ref(false)
const showRegisterModal = ref(false)
const showLogoutConfirm = ref(false)

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

const registerForm = reactive({
  username: '',
  password: ''
})

const registerError = ref('')
const registerLoading = ref(false)

// 头像：弹窗内预览 + 是否有未保存的更改 + 错误提示
const avatarFileInput = ref(null)
const avatarPreview = ref('')
const avatarIsDirty = ref(false)
const avatarSaving = ref(false)
const avatarMessage = ref('')
const avatarMessageType = ref('info')

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
  // 登录成功后：只加载情侣数据，不恢复用户信息（用户信息已由登录流程设置）
  await loadUserData()
}

async function loadUserData() {
  try {
    // 1. 只有在用户未登录时，才从localStorage恢复用户信息
    // 重要：账号登录后，userStore.currentUser已由LoginView设置为 anonymous: false
    // 此处检查确保不会用旧的匿名用户数据覆盖已登录的账号用户
    if (!userStore.currentUser) {
      const savedUser = await loadFromLocal('user')
      if (savedUser) {
        userStore.setUser(savedUser)
        console.log('[loadUserData] 从本地恢复用户:', savedUser.username || savedUser.id, '匿名状态:', savedUser.anonymous)
      }
    } else {
      console.log('[loadUserData] 当前用户已存在，跳过localStorage恢复:', 
        userStore.currentUser.username || userStore.currentUser.id, 
        '匿名状态:', userStore.currentUser.anonymous)
    }

    // 2. 恢复情侣绑定数据（不影响用户状态）
    const localData = await loadFromLocal('user_data')
    if (localData) {
      userStore.setCouple(localData.couple)
      userStore.setAnniversaries(localData.anniversaries || [])
    }

    // 3. 如果有用户ID，从API获取最新数据（确保数据是当前用户的）
    if (userStore.currentUser?.id) {
      try {
        const response = await fetch(`${API_BASE_URL}/couples/me?user_id=${userStore.currentUser.id}`)
        if (response.ok) {
          const couple = await response.json()
          if (couple) {
            userStore.setCouple(couple)

            const annivResponse = await fetch(`${API_BASE_URL}/anniversaries?coupleId=${couple.id}`)
            if (annivResponse.ok) {
              const anniversaries = await annivResponse.json()
              userStore.setAnniversaries(anniversaries)
            }

            await saveToLocal('user_data', {
              couple: toPlain(couple),
              anniversaries: toPlain(userStore.anniversaries || []),
              timestamp: Date.now()
            })
          }
        }
      } catch (apiError) {
        console.warn('[loadUserData] API unavailable, using local data:', apiError.message)
      }
    }

    // 4. 如果是已登录账号（非匿名），从接口刷新头像（确保头像可能在别的设备上改过）
    if (userStore.currentUser?.id && !userStore.isAnonymousUser) {
      try {
        const avatarResponse = await fetch(`${API_BASE_URL}/users/${userStore.currentUser.id}/avatar`)
        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json()
          // 如果后端返回了有效 avatar，则更新本地 + IndexedDB
          if (avatarData && avatarData.avatar) {
            userStore.setAvatar(avatarData.avatar)
            await saveToLocal('user', { ...userStore.currentUser })
          }
        }
      } catch (avatarErr) {
        // 头像刷新失败是低优先级任务，失败不阻塞主流程
        console.warn('[loadUserData] 刷新头像失败（可忽略）:', avatarErr.message)
      }
    }

    console.log('[loadUserData] 用户状态最终结果:',
      '已登录:', userStore.isLoggedIn,
      '匿名:', userStore.isAnonymousUser)

    settingsForm.startDate = userStore.currentCouple?.start_date || ''
  } catch (error) {
    console.error('[loadUserData] 加载数据失败:', error)
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
    const response = await fetch(`${API_BASE_URL}/anniversaries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        couple_id: userStore.currentCouple.id,
        name: newAnniversary.name,
        date: newAnniversary.date,
        type: newAnniversary.type
      })
    })

    if (!response.ok) throw new Error('添加失败')
    const result = await response.json()
    
    userStore.addAnniversary(result)
    await saveToLocal('user_data', {
      couple: toPlain(userStore.currentCouple),
      anniversaries: toPlain(userStore.anniversaries),
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
    const response = await fetch(`${API_BASE_URL}/anniversaries/${editingAnniversary.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: editingAnniversary.name,
        date: editingAnniversary.date,
        type: editingAnniversary.type
      })
    })

    if (!response.ok) throw new Error('更新失败')
    const result = await response.json()
    
    userStore.updateAnniversary(editingAnniversary.id, result)
    await saveToLocal('user_data', {
      couple: toPlain(userStore.currentCouple),
      anniversaries: toPlain(userStore.anniversaries),
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
    const response = await fetch(`${API_BASE_URL}/anniversaries/${editingAnniversary.id}`, {
      method: 'DELETE'
    })

    if (!response.ok) throw new Error('删除失败')
    
    userStore.removeAnniversary(editingAnniversary.id)
    await saveToLocal('user_data', {
      couple: toPlain(userStore.currentCouple),
      anniversaries: toPlain(userStore.anniversaries),
      timestamp: Date.now()
    })
    showDeleteConfirm.value = false
    showEditAnniversaryModal.value = false
    showToast('已删除', 'success')
  } catch (error) {
    showToast('删除失败: ' + error.message, 'error')
  }
}

/**
 * 把 Vue 响应式对象（Proxy / reactive）转换为普通 JS 对象，
 * 用于避免 IndexedDB 的 "Proxy object could not be cloned" 报错。
 */
function toPlain(value) {
  if (value === null || value === undefined) return value
  if (typeof value !== 'object') return value
  try {
    return JSON.parse(JSON.stringify(value))
  } catch (err) {
    console.warn('[toPlain] 序列化失败，回退原值：', err)
    return value
  }
}

async function handleUpdateStartDate() {
  if (!settingsForm.startDate) {
    showToast('请选择日期', 'error')
    return
  }
  if (!userStore.currentCouple?.id) {
    showToast('当前没有可更新的绑定信息', 'error')
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/couples/${userStore.currentCouple.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        start_date: settingsForm.startDate
      })
    })

    if (!response.ok) throw new Error('更新失败')
    const result = await response.json()

    // 更新 Pinia store（Vue 会自动把 result 包成响应式对象）
    userStore.setCouple(result)

    // 显式同步到表单（避免 watch 的时序问题导致下次打开弹窗时显示旧日期）
    settingsForm.startDate = result.start_date

    // 持久化到 IndexedDB — 此处显式传入普通对象，再配合 storage.js 的 toPlain 双保险
    await saveToLocal('user_data', {
      couple: toPlain(result),
      anniversaries: toPlain(userStore.anniversaries || []),
      timestamp: Date.now()
    })

    // 更新成功后自动关闭设置弹窗（用户需求：成功即关闭，失败保留提示）
    showSettingsModal.value = false
    showToast('日期已更新', 'success')
  } catch (error) {
    console.error('[handleUpdateStartDate] 更新相识日期失败：', error)
    showToast('更新失败: ' + error.message, 'error')
  }
}

async function handleLogout() {
  try {
    // 调用后端退出接口
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST'
    })
  } catch (error) {
    console.warn('Logout API failed:', error)
  } finally {
    // 清空本地存储
    await saveToLocal('user', null)
    await saveToLocal('user_data', null)
    
    // 清空 store 状态
    userStore.logout()
    
    // 关闭所有弹窗
    showSettingsModal.value = false
    showLogoutConfirm.value = false
    
    showToast('已退出登录', 'info')
  }
}

async function handleRegister() {
  const { username, password } = registerForm
  
  if (!username || !password) {
    registerError.value = '用户名和密码不能为空'
    return
  }

  registerLoading.value = true
  registerError.value = ''

  try {
    // 从 IndexedDB 中读取持久化的匿名用户信息，确保即使 store 状态延迟也能拿到正确的 ID 做数据迁移
    let anonymousUserId = null
    try {
      const savedUser = await loadFromLocal('user')
      if (savedUser && savedUser.anonymous && savedUser.id) {
        anonymousUserId = savedUser.id
      }
    } catch (readErr) {
      console.warn('[handleRegister] 读取本地用户信息失败，回退到 store:', readErr)
      if (userStore.currentUser?.anonymous && userStore.currentUser.id) {
        anonymousUserId = userStore.currentUser.id
      }
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        anonymousUserId
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '注册失败')
    }

    const user = {
      id: data.user.id,
      username: data.user.username,
      anonymous: false
    }

    console.log('[handleRegister] 注册成功，更新用户状态:', user)
    userStore.setUser(user)
    await saveToLocal('user', user)
    
    // 注册成功后，完整刷新情侣绑定 + 纪念日数据（后端已更新couples表中的user1_id）
    try {
      const coupleResponse = await fetch(`${API_BASE_URL}/couples/me?user_id=${user.id}`)
      if (coupleResponse.ok) {
        const couple = await coupleResponse.json()
        if (couple) {
          userStore.setCouple(couple)
          let anniversaries = []
          try {
            const annivResponse = await fetch(`${API_BASE_URL}/anniversaries?coupleId=${couple.id}`)
            if (annivResponse.ok) {
              anniversaries = await annivResponse.json()
            }
          } catch (apiError) {
            console.warn('[handleRegister] 刷新纪念日数据失败:', apiError.message)
          }
          userStore.setAnniversaries(anniversaries)
          await saveToLocal('user_data', {
            couple,
            anniversaries,
            timestamp: Date.now()
          })
        }
      }
    } catch (apiError) {
      console.warn('[handleRegister] 刷新情侣数据失败:', apiError.message)
    }

    console.log('[handleRegister] 用户状态最终:', 
      'isAnonymousUser:', userStore.isAnonymousUser, 
      'isLoggedIn:', userStore.isLoggedIn)
    
    showRegisterModal.value = false
    registerForm.username = ''
    registerForm.password = ''
    
    showToast('账号创建成功', 'success')
  } catch (error) {
    console.error('注册失败:', error)
    registerError.value = error.message
  } finally {
    registerLoading.value = false
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

/* ----------- 头像上传 / 保存 / 恢复默认 ----------- */

function onAvatarFileChange(event) {
  const file = event.target?.files?.[0]
  if (!file) return

  // 类型检查（双重保险）
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  if (!allowed.includes(file.type)) {
    avatarMessage.value = '仅支持 PNG / JPG / WebP 格式的图片'
    avatarMessageType.value = 'error'
    return
  }

  // 大小限制 2MB
  if (file.size > 2 * 1024 * 1024) {
    avatarMessage.value = '图片过大（请选择小于 2MB 的图片）'
    avatarMessageType.value = 'error'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result
    avatarIsDirty.value = true
    avatarMessage.value = '已选择图片，点击「保存头像」进行更新'
    avatarMessageType.value = 'info'
  }
  reader.onerror = () => {
    avatarMessage.value = '读取图片失败，请重试'
    avatarMessageType.value = 'error'
  }
  reader.readAsDataURL(file)
}

async function handleSaveAvatar() {
  if (!avatarPreview.value || !userStore.currentUser?.id) return
  avatarSaving.value = true
  avatarMessage.value = ''
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userStore.currentUser.id}/avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: avatarPreview.value })
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      // 把后端返回的具体错误信息透传到前端展示（例如：列类型不匹配 / 字段不存在 / 连接超时）
      throw new Error(data?.error || `保存头像失败（HTTP ${response.status}）`)
    }

    // ① 更新 Pinia store（NavBar 立刻重渲染）
    userStore.setAvatar(avatarPreview.value)

    // ② 把新头像与当前用户记录一起写入 IndexedDB（刷新后不会丢）
    await saveToLocal('user', { ...userStore.currentUser })

    avatarIsDirty.value = false
    avatarMessage.value = '头像保存成功'
    avatarMessageType.value = 'info'
    showToast('头像已更新', 'success')
  } catch (error) {
    console.error('[handleSaveAvatar] 保存头像失败：', error)
    avatarMessage.value = error.message || '保存失败，请稍后重试'
    avatarMessageType.value = 'error'
    showToast('头像更新失败', 'error')
  } finally {
    avatarSaving.value = false
  }
}

async function handleResetAvatar() {
  if (!userStore.currentUser?.id) return
  avatarSaving.value = true
  avatarMessage.value = ''
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userStore.currentUser.id}/avatar`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data?.error || `恢复默认头像失败（HTTP ${response.status}）`)
    }

    userStore.setAvatar(null)
    // 同步到 IndexedDB
    await saveToLocal('user', { ...userStore.currentUser })

    avatarPreview.value = ''
    avatarIsDirty.value = false
    avatarMessage.value = '已恢复默认小河豚头像'
    avatarMessageType.value = 'info'
    showToast('已恢复默认头像', 'success')
  } catch (error) {
    console.error('[handleResetAvatar] 恢复默认头像失败：', error)
    avatarMessage.value = error.message || '恢复失败，请稍后重试'
    avatarMessageType.value = 'error'
  } finally {
    avatarSaving.value = false
  }
}

/* ----------- 监听弹窗显示：打开时同步头像预览；关闭时清理临时状态 ----------- */

watch(showSettingsModal, (val) => {
  if (val) {
    // 打开设置弹窗：用当前 store 中的 avatar 初始化预览
    avatarPreview.value = userStore.currentUser?.avatar || ''
    avatarIsDirty.value = false
    avatarMessage.value = ''
    if (avatarFileInput.value) avatarFileInput.value.value = ''
  } else {
    // 关闭：清理临时状态（已保存的不会丢失，因为已写入 store）
    avatarIsDirty.value = false
    avatarMessage.value = ''
  }
})

watch(() => userStore.currentCouple, (couple) => {
  if (couple) {
    settingsForm.startDate = couple.start_date
  }
})

onMounted(() => {
  themeStore.loadFromStorage()
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
