<template>
  <div class="layout">
    <el-container>
      <el-header class="warm-header">
        <div class="header-content">
          <div class="logo">
            <span class="logo-icon">🍊</span>
            <span class="logo-text">每日记录</span>
          </div>
          <nav class="nav">
            <router-link to="/food" class="nav-item">
              <span class="nav-icon">🍎</span>
              <span>饮食</span>
            </router-link>
            <router-link to="/study" class="nav-item">
              <span class="nav-icon">📚</span>
              <span>学习</span>
            </router-link>
          </nav>
          <div class="user-actions">
            <el-dropdown @command="handleCommand" trigger="click">
              <div class="user-trigger">
                <div class="user-avatar">
                  <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" />
                  <span v-else class="avatar-placeholder">{{ userStore.user?.username?.[0] || 'U' }}</span>
                </div>
                <span class="username">{{ userStore.user?.username }}</span>
                <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="user-dropdown">
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人信息
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>
                    系统设置
                  </el-dropdown-item>
                  <el-dropdown-item command="clearCache">
                    <el-icon><Refresh /></el-icon>
                    刷新数据
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                  <el-dropdown-item command="deleteAccount" class="danger-item">
                    <el-icon><Delete /></el-icon>
                    注销账号
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main class="warm-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { useUserStore } from '../store'
import { useRouter } from 'vue-router'
import { ArrowDown, Refresh, SwitchButton, User, Setting, Delete } from '@element-plus/icons-vue'
import request from '../utils/request'

const router = useRouter()
const userStore = useUserStore()

const handleCommand = async (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'settings') {
    router.push('/settings')
  } else if (command === 'clearCache') {
    // 不再清除localStorage，直接重新获取数据
    try {
      const userData = await request.get('/auth/user')
      userStore.setUser(userStore.token, userData)
      ElMessage.success('数据已刷新 ✨')
    } catch (error) {
      console.error('刷新数据失败:', error)
      ElMessage.error('刷新失败，请重新登录')
    }
  } else if (command === 'logout') {
    // 清除缓存和用户信息
    localStorage.clear()
    userStore.clearUser()
    ElMessage.success('已退出登录 👋')
    router.push('/login')
  } else if (command === 'deleteAccount') {
    // 二次确认
    try {
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
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--color-bg-page);
}

/* Header */
.el-header.warm-header {
  background: var(--color-bg-card);
  box-shadow: var(--shadow-header);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--color-bg-secondary);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.logo-icon {
  font-size: 28px;
  animation: pulse 3s ease-in-out infinite;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Navigation */
.nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: var(--radius-button);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-icon {
  font-size: 18px;
}

.nav-item:hover {
  color: var(--color-primary);
  background: var(--color-bg-secondary);
}

.nav-item.router-link-active {
  color: var(--color-primary);
  background: var(--color-bg-secondary);
  font-weight: 600;
}

.nav-item.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: var(--gradient-primary);
  border-radius: 2px;
}

/* User Actions */
.user-actions {
  display: flex;
  align-items: center;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: var(--radius-button);
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-trigger:hover {
  background: var(--color-bg-secondary);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.username {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: var(--color-text-secondary);
  transition: transform 0.3s ease;
}

.user-trigger:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* Dropdown Menu */
:deep(.user-dropdown) {
  border-radius: var(--radius-button);
  border: none;
  box-shadow: var(--shadow-card-hover);
  padding: 8px;
}

:deep(.user-dropdown .el-dropdown-menu__item) {
  border-radius: 8px;
  padding: 10px 16px;
}

:deep(.user-dropdown .el-dropdown-menu__item:hover) {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
}

:deep(.user-dropdown .danger-item) {
  color: #f56c6c;
}

:deep(.user-dropdown .danger-item:hover) {
  background: #fef0f0;
  color: #f56c6c;
}

:deep(.user-dropdown .danger-item .el-icon) {
  color: #f56c6c;
}

/* Main */
.el-main.warm-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
}

/* Page Transition */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    height: 56px;
  }

  .logo-text {
    display: none;
  }

  .nav {
    gap: 4px;
  }

  .nav-item {
    padding: 8px 12px;
    flex-direction: column;
    gap: 2px;
    font-size: 12px;
  }

  .nav-icon {
    font-size: 20px;
  }

  .nav-item span:not(.nav-icon) {
    display: none;
  }

  .username {
    display: none;
  }

  .el-main.warm-main {
    padding: 16px;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(-5deg);
  }
  75% {
    transform: scale(1.1) rotate(5deg);
  }
}
</style>
