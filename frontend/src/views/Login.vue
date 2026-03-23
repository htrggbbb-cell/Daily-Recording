<template>
  <div class="login-page">
    <!-- 左侧品牌展示区 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="brand-logo">🍊</div>
        <h1 class="brand-title">每日记录</h1>
        <p class="brand-slogan">记录每一餐，见证每一天</p>
        <div class="brand-features">
          <div class="feature-item">
            <span class="feature-icon">🍎</span>
            <span>饮食追踪</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📚</span>
            <span>学习记录</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span>数据分析</span>
          </div>
        </div>

        <!-- 深色模式开关 -->
        <div class="dark-mode-toggle">
          <div class="toggle-content">
            <span class="toggle-icon">🌙</span>
            <span class="toggle-text">深色模式</span>
          </div>
          <el-switch
            v-model="darkMode"
            @change="handleDarkModeChange"
            size="large"
            :active-icon="Moon"
            :inactive-icon="Sunny"
            inline-prompt
            active-text="开"
            inactive-text="关"
            class="mode-switch"
          />
        </div>
      </div>
      <div class="brand-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="form-section">
      <div class="form-container fade-in">
        <!-- 移动端深色模式开关 -->
        <div class="mobile-dark-mode-toggle">
          <span class="toggle-label">🌙 深色模式</span>
          <el-switch
            v-model="darkMode"
            @change="handleDarkModeChange"
            size="large"
            :active-icon="Moon"
            :inactive-icon="Sunny"
            inline-prompt
            active-text="开"
            inactive-text="关"
          />
        </div>

        <div class="form-header">
          <h2>欢迎回来 👋</h2>
          <p>登录你的账户继续记录</p>
        </div>

        <el-form :model="form" :rules="rules" ref="formRef" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名"
              prefix-icon="User"
              size="large"
              clearable
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              placeholder="邮箱地址"
              prefix-icon="Message"
              size="large"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleLogin"
              :loading="loading"
              size="large"
              class="login-button"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-footer">
          <p>还没有账号？
            <router-link to="/register" class="register-link">
              立即注册 →
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store'
import request from '../utils/request'
import { Moon, Sunny } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

// 深色模式
const darkMode = ref(localStorage.getItem('darkMode') === 'true')

const handleDarkModeChange = (value) => {
  localStorage.setItem('darkMode', value.toString())
  localStorage.setItem('darkModeAuto', 'false')  // 关闭自动模式

  if (value) {
    document.documentElement.classList.add('dark')
    window.dispatchEvent(new CustomEvent('darkModeChange', { detail: true }))
  } else {
    document.documentElement.classList.remove('dark')
    window.dispatchEvent(new CustomEvent('darkModeChange', { detail: false }))
  }
}

onMounted(() => {
  // 初始化深色模式状态
  darkMode.value = localStorage.getItem('darkMode') === 'true'
})

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const res = await request.post('/auth/login', {
      username: form.username,
      email: form.email,
      password: form.password
    })

    console.log('登录成功，收到token:', res.token)
    console.log('用户信息:', res.user)

    // 先保存用户信息到localStorage
    userStore.setUser(res.token, res.user)

    console.log('准备跳转到首页')
    ElMessage.success('登录成功！欢迎回来 🎉')

    // 使用setTimeout确保Vue响应式更新完成，让路由守卫能正确检测登录状态
    setTimeout(() => {
      // 使用replace而不是push，避免返回到登录页
      router.replace('/')
    }, 100)
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg-page);
}

/* 左侧品牌区 */
.brand-section {
  flex: 1;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.brand-content {
  text-align: center;
  color: white;
  z-index: 2;
  padding: 40px;
}

.brand-logo {
  font-size: 80px;
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite;
}

.brand-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.brand-slogan {
  font-size: 20px;
  opacity: 0.95;
  margin-bottom: 50px;
}

.brand-features {
  display: flex;
  gap: 30px;
  justify-content: center;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: var(--radius-card);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.25);
}

.feature-icon {
  font-size: 32px;
}

/* 深色模式开关 */
.dark-mode-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.25);
  padding: 16px 24px;
  border-radius: var(--radius-card);
  backdrop-filter: blur(10px);
  margin-top: 30px;
  transition: all 0.3s ease;
}

.dark-mode-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.toggle-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-icon {
  font-size: 24px;
}

.toggle-text {
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.mode-switch {
  --el-switch-on-color: #FF8C42;
  --el-switch-off-color: #E0E0E0;
}

.mode-switch :deep(.el-switch__core) {
  height: 28px;
  min-width: 56px;
}

.mode-switch :deep(.el-switch__action) {
  height: 22px;
  width: 22px;
}

/* 装饰圆圈 */
.brand-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: 100px;
  right: -50px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 20%;
}

/* 右侧表单区 */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--color-bg-page);
}

.form-container {
  width: 100%;
  max-width: 420px;
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card-hover);
  padding: 50px;
}

.form-header {
  text-align: center;
  margin-bottom: 35px;
}

.form-header h2 {
  font-size: 28px;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.form-header p {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.login-form {
  margin-bottom: 25px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 12px 15px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 10px;
}

.form-footer {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.register-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* 移动端深色模式开关 */
.mobile-dark-mode-toggle {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-card);
  margin-bottom: 24px;
}

.mobile-dark-mode-toggle .toggle-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.mobile-dark-mode-toggle .el-switch {
  --el-switch-on-color: #FF8C42;
}

/* 响应式 */
@media (max-width: 900px) {
  .brand-section {
    display: none;
  }

  .form-section {
    flex: 1;
  }

  /* 移动端显示深色模式开关 */
  .mobile-dark-mode-toggle {
    display: flex;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 30px 20px;
  }

  .brand-title {
    font-size: 36px;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
