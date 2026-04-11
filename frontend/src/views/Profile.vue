<template>
  <div class="profile-page fade-in">
    <!-- 用户信息卡片 -->
    <div class="profile-header">
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <img v-if="form.avatar" :src="form.avatar" class="user-avatar" />
          <div v-else class="avatar-placeholder">{{ user.username?.[0] || 'U' }}</div>
          <el-upload
            class="avatar-upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            action="/api/upload"
            name="file"
            :headers="uploadHeaders"
          >
            <el-button circle size="small" class="avatar-edit-btn">
              <el-icon><Edit /></el-icon>
            </el-button>
          </el-upload>
        </div>
        <div class="user-basic">
          <h2 class="username">{{ user.username }}</h2>
          <p class="email">{{ user.email }}</p>
        </div>
      </div>
    </div>

    <!-- 编辑资料 -->
    <div class="section">
      <h3 class="section-title">✏️ 编辑资料</h3>
      <div class="card edit-card">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="edit-form">
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="用户名" size="large" />
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="form.gender" placeholder="选择性别" style="width: 100%" size="large">
              <el-option label="👨 男" value="male" />
              <el-option label="👩 女" value="female" />
              <el-option label="🧑 其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="年龄">
            <el-input-number v-model="form.age" :min="1" :max="150" style="width: 100%" size="large" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="form.phone" placeholder="手机号" size="large" />
          </el-form-item>
          <el-form-item label="个人简介">
            <el-input v-model="form.bio" type="textarea" :rows="3" placeholder="介绍一下..." maxlength="200" show-word-limit size="large" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="loading" class="submit-btn">
              保存修改
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 账户信息 -->
    <div class="section">
      <h3 class="section-title">🔐 账户信息</h3>
      <div class="card">
        <div class="info-row">
          <span class="info-label">注册时间</span>
          <span class="info-value">{{ formatDate(user.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- 系统设置 -->
    <div class="section">
      <h3 class="section-title">⚙️ 系统设置</h3>
      <div class="card">
        <div class="info-row" @click="showEmailDialog = true">
          <span class="info-label">📧 修改邮箱</span>
          <span class="info-arrow">›</span>
        </div>
        <div class="info-row" @click="showPasswordDialog = true">
          <span class="info-label">🔒 修改密码</span>
          <span class="info-arrow">›</span>
        </div>
        <div class="info-row" @click="clearCache">
          <span class="info-label">🔄 清除缓存</span>
          <span class="info-arrow">›</span>
        </div>
      </div>
    </div>

    <!-- 账户操作 -->
    <div class="section">
      <h3 class="section-title">📋 账户操作</h3>
      <div class="card">
        <div class="info-row" @click="handleLogout">
          <span class="info-label">🚪 退出登录</span>
          <span class="info-arrow">›</span>
        </div>
        <div class="info-row danger" @click="handleDeleteAccount">
          <span class="info-label">🗑️ 注销账号</span>
          <span class="info-arrow">›</span>
        </div>
      </div>
    </div>

    <!-- 修改邮箱对话框 -->
    <el-dialog v-model="showEmailDialog" title="修改邮箱" width="400px">
      <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="80px">
        <el-form-item label="新邮箱" prop="email">
          <el-input v-model="emailForm.email" placeholder="请输入新邮箱" />
        </el-form-item>
        <el-form-item label="当前密码" prop="password">
          <el-input v-model="emailForm.password" type="password" placeholder="请输入当前密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEmailDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateEmail" :loading="emailLoading">确认</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="90px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="至少6位" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="再输入一次" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePassword" :loading="passwordLoading">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Edit } from '@element-plus/icons-vue'
import { useUserStore } from '../store'
import request from '../utils/request'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

// 邮箱修改
const showEmailDialog = ref(false)
const emailLoading = ref(false)
const emailFormRef = ref(null)
const emailForm = reactive({ email: '', password: '' })
const emailRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 密码修改
const showPasswordDialog = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref(null)
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const validateConfirm = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次密码不一致'))
  } else {
    callback()
  }
}
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

const uploadHeaders = { Authorization: `Bearer ${userStore.token}` }

const user = reactive({ username: '', email: '', createdAt: '' })
const form = reactive({ username: '', avatar: '', gender: '', age: null, bio: '', phone: '' })
const rules = {
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }]
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '未知'

const handleAvatarSuccess = (res) => {
  form.avatar = res.url
  ElMessage.success('头像上传成功，记得保存')
}
const beforeAvatarUpload = (file) => {
  const isImg = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImg) ElMessage.error('只能是 JPG/PNG')
  if (!isLt2M) ElMessage.error('不超过 2MB')
  return isImg && isLt2M
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    await request.put('/auth/user', form)
    await fetchUserData()
    ElMessage.success('保存成功')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchUserData = async () => {
  try {
    const d = await request.get('/auth/user')
    Object.assign(user, { username: d.username || '', email: d.email || '', createdAt: d.created_at || '' })
    Object.assign(form, { username: d.username || '', avatar: d.avatar || '', gender: d.gender || '', age: d.age || null, bio: d.bio || '', phone: d.phone || '' })
  } catch (e) {
    ElMessage.error('获取信息失败')
  }
}

const handleUpdateEmail = async () => {
  try {
    await emailFormRef.value.validate()
    emailLoading.value = true
    await request.put('/auth/email', emailForm)
    user.email = emailForm.email
    userStore.setUser(userStore.token, { ...userStore.user, email: emailForm.email })
    ElMessage.success('邮箱修改成功')
    showEmailDialog.value = false
    emailForm.email = ''
    emailForm.password = ''
  } catch (e) {
    ElMessage.error(e.response?.status === 401 ? '密码错误' : '修改失败')
  } finally {
    emailLoading.value = false
  }
}

const handleUpdatePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    await request.put('/auth/password', { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword })
    ElMessage.success('密码修改成功')
    showPasswordDialog.value = false
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (e) {
    ElMessage.error(e.response?.status === 401 ? '密码错误' : '修改失败')
  } finally {
    passwordLoading.value = false
  }
}

const clearCache = () => {
  localStorage.clear()
  location.reload()
}

const handleLogout = () => {
  localStorage.clear()
  userStore.clearUser()
  ElMessage.success('已退出登录')
  router.push('/login')
}

const handleDeleteAccount = async () => {
  try {
    await ElMessageBox.confirm('注销后所有数据将被永久删除！', '确认注销', { type: 'warning', confirmButtonClass: 'el-button--danger' })
    await ElMessageBox.confirm('所有数据将无法恢复！', '再次确认', { type: 'error', confirmButtonClass: 'el-button--danger' })
    await request.delete('/auth/account')
    localStorage.clear()
    userStore.clearUser()
    ElMessage.success('已注销')
    router.push('/login')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('注销失败')
  }
}

onMounted(() => fetchUserData())
</script>

<style scoped>
.profile-page { padding: 0; max-width: 600px; margin: 0 auto; }

.profile-header {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.avatar-section { display: flex; align-items: center; gap: 16px; }
.avatar-wrapper { position: relative; }

.user-avatar, .avatar-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-placeholder {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #667eea !important;
  border-color: #fff !important;
}

.username { font-size: 20px; color: #333; margin: 0 0 4px; }
.email { font-size: 13px; color: #999; margin: 0; }

.section { margin-bottom: 16px; }
.section-title { font-size: 13px; color: #999; margin: 0 0 8px 4px; }

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

.edit-card { padding: 8px 20px 20px; }

.edit-form { margin-top: 12px; }
.edit-form .el-form-item { margin-bottom: 20px; }
.edit-form .el-form-item:last-child { margin-bottom: 0; }

.submit-btn { width: 100%; height: 44px; font-size: 16px; }

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}
.info-row:last-child { border-bottom: none; }
.info-row:hover { background: #f8f8f8; }
.info-label { font-size: 15px; color: #333; }
.info-value { color: #333; font-size: 14px; }
.info-arrow { font-size: 18px; color: #ccc; }
.danger .info-label { color: #f56c6c; }

</style>
