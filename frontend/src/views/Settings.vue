<template>
  <div class="settings-page fade-in">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">⚙️ 系统设置</h1>
      <p class="page-subtitle">自定义你的使用体验</p>
    </div>

    <!-- 设置卡片 -->
    <el-row :gutter="20">
      <el-col :span="16">
        <!-- 外观设置 -->
        <el-card class="settings-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">🎨 外观设置</span>
            </div>
          </template>
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">自动深色模式</div>
                <div class="setting-desc">根据时间和天气自动切换深色模式</div>
              </div>
              <el-switch v-model="settings.darkModeAuto" @change="handleDarkModeAutoChange" />
            </div>
            <div class="setting-item" v-if="!settings.darkModeAuto">
              <div class="setting-info">
                <div class="setting-label">手动深色模式</div>
                <div class="setting-desc">手动控制深色模式开关</div>
              </div>
              <el-switch v-model="settings.darkMode" @change="handleDarkModeChange" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 快捷操作 -->
        <el-card class="settings-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">⚡ 快捷操作</span>
            </div>
          </template>
          <div class="settings-actions">
            <el-button @click="router.push('/profile')" class="action-btn">
              <span class="btn-content">
                <el-icon><User /></el-icon>
                <span>个人信息</span>
              </span>
            </el-button>
            <el-button @click="clearCache" class="action-btn">
              <span class="btn-content">
                <el-icon><Refresh /></el-icon>
                <span>清除缓存</span>
              </span>
            </el-button>
          </div>
        </el-card>

        <!-- 账户操作 -->
        <el-card class="settings-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">👤 账户</span>
            </div>
          </template>
          <div class="settings-actions">
            <el-button @click="handleLogout" class="action-btn">
              <span class="btn-content">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </span>
            </el-button>
            <el-button type="danger" plain @click="handleDeleteAccount" class="action-btn delete-btn">
              <span class="btn-content">
                <el-icon><Delete /></el-icon>
                <span>注销账号</span>
              </span>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Refresh, SwitchButton, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '../store'
import request from '../utils/request'

const router = useRouter()
const userStore = useUserStore()

const settings = reactive({
  darkMode: false,
  darkModeAuto: true
})

// 深色模式切换
const handleDarkModeChange = (value) => {
  if (value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', value)
  // 发送事件让其他组件同步
  window.dispatchEvent(new CustomEvent('darkModeChange', { detail: value }))
}

// 自动深色模式切换
const handleDarkModeAutoChange = (value) => {
  localStorage.setItem('darkModeAuto', value)
  // 触发事件让App.vue知道自动模式状态
  window.dispatchEvent(new CustomEvent('darkModeAutoChange', { detail: value }))
}

// 清除缓存
const clearCache = () => {
  localStorage.clear()
  location.reload()
}

// 退出登录
const handleLogout = () => {
  // 清除缓存和用户信息
  localStorage.clear()
  userStore.clearUser()
  ElMessage.success('已退出登录 👋')
  router.push('/login')
}

// 注销账号
const handleDeleteAccount = async () => {
  try {
    // 二次确认
    await ElMessageBox.confirm(
      '注销账号将永久删除您的所有数据（包括饮食记录、学习记录等），此操作不可恢复！',
      '确认注销账号',
      {
        confirmButtonText: '确认注销',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    // 再次确认
    await ElMessageBox.confirm(
      '您真的要注销账号吗？所有数据将永久丢失！',
      '最后确认',
      {
        confirmButtonText: '我确认注销',
        cancelButtonText: '我再想想',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )
    // 执行注销
    await request.delete('/auth/account')
    localStorage.clear()
    userStore.clearUser()
    ElMessage.success('账号已注销 👋')
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('注销账号失败:', error)
      ElMessage.error('注销失败，请重试')
    }
  }
}

// 监听自动深色模式变化（App.vue自动切换时会发送事件）
const handleAutoDarkModeChange = (e) => {
  settings.darkMode = e.detail
}

onMounted(async () => {
  // 初始化设置
  const actualDarkMode = document.documentElement.classList.contains('dark')
  const savedDarkModeAuto = localStorage.getItem('darkModeAuto') !== 'false'

  settings.darkMode = actualDarkMode
  settings.darkModeAuto = savedDarkModeAuto

  // 同步localStorage
  localStorage.setItem('darkMode', actualDarkMode.toString())

  // 监听自动深色模式变化
  window.addEventListener('darkModeChange', handleAutoDarkModeChange)
})
</script>

<style scoped>
.settings-page {
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0;
}

/* 设置卡片 */
.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* 设置列表 */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-bg-secondary);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 13px;
  color: var(--color-text-light);
}

/* 快捷操作按钮 */
.settings-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  width: 100%;
  justify-content: flex-start;
  padding: 12px 16px;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 按钮对齐 */
.settings-actions .el-button {
  margin: 0;
}

/* 注销按钮特殊样式 */
.delete-btn {
  border-color: #f56c6c !important;
  color: #f56c6c !important;
}

.delete-btn:hover {
  background: #fef0f0 !important;
  border-color: #f56c6c !important;
  color: #f56c6c !important;
}

.delete-btn .el-icon {
  color: #f56c6c;
}

/* 淡入动画 */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 手机端适配 */
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  /* 单列布局 */
  .el-row {
    flex-direction: column !important;
  }

  .el-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }

  /* 快捷操作恢复垂直排列 */
  .settings-actions {
    flex-direction: column !important;
    overflow: visible !important;
  }

  .settings-actions .action-btn {
    width: 100% !important;
    min-width: auto !important;
  }
}
</style>
