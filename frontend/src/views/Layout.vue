<template>
  <div class="layout">
    <el-container>
      <el-header class="warm-header">
        <div class="header-content">
          <div class="logo">
            <span class="logo-icon">💰</span>
            <span class="logo-text">记账本</span>
          </div>
          <nav class="nav">
            <router-link to="/records" class="nav-item">
              <span class="nav-icon">💰</span>
              <span>记账</span>
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
                    基础信息
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
  } else if (command === 'clearCache') {
    try {
      const userData = await request.get('/auth/user')
      userStore.setUser(userStore.token, userData)
      ElMessage.success('数据已刷新 ✨')
    } catch (error) {
      console.error('刷新数据失败:', error)
      ElMessage.error('刷新失败，请重新登录')
    }
  } else if (command === 'logout') {
    localStorage.clear()
    userStore.clearUser()
    ElMessage.success('已退出登录 👋')
    router.push('/login')
  } else if (command === 'deleteAccount') {
    try {
      await ElMessageBox.confirm(
        '注销账号将永久删除您的所有数据，此操作不可恢复！',
        '确认注销账号',
        {
          confirmButtonText: '确认注销',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      )
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
  background: #f8f9fa;
}

.el-header.warm-header {
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #eee;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-icon {
  font-size: 18px;
}

.nav-item:hover {
  color: #667eea;
  background: #f0f0ff;
}

.nav-item.router-link-active {
  color: #667eea;
  background: #f0f0ff;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.user-actions {
  display: flex;
  align-items: center;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-trigger:hover {
  background: #f5f5f5;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: #333;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: #999;
  transition: transform 0.3s ease;
}

.user-trigger:hover .dropdown-icon {
  transform: rotate(180deg);
}

:deep(.user-dropdown) {
  border-radius: 10px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  padding: 8px;
}

:deep(.user-dropdown .el-dropdown-menu__item) {
  border-radius: 8px;
  padding: 10px 16px;
}

:deep(.user-dropdown .el-dropdown-menu__item:hover) {
  background: #f0f0ff;
  color: #667eea;
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

.el-main.warm-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
}

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
