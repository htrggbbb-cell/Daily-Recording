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
      <div class="header-actions">
        <el-button type="primary" @click="handleSubmit" :loading="loading" size="large" class="save-button">
          <el-icon class="save-icon"><Check /></el-icon>
          <span>保存修改</span>
        </el-button>
        <div v-if="hasUnsavedChanges" class="save-hint">
          <el-icon class="hint-icon"><Warning /></el-icon>
          <span>有未保存的修改，记得点击保存按钮</span>
        </div>
      </div>
    </div>

    <!-- 数据统计 -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <div class="stat-value">{{ userStats.recordDays }}</div>
          <div class="stat-label">记录天数</div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">🍎</div>
        <div class="stat-info">
          <div class="stat-value">{{ userStats.totalCalories }}</div>
          <div class="stat-label">总热量(kcal)</div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">⏱️</div>
        <div class="stat-info">
          <div class="stat-value">{{ userStats.totalHours }}</div>
          <div class="stat-label">学习时长(h)</div>
        </div>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <!-- 编辑资料 -->
        <el-card class="edit-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">✏️ 编辑资料</span>
            </div>
          </template>
          <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="用户名">
                  <el-input v-model="form.username" placeholder="用户名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别">
                  <el-select v-model="form.gender" placeholder="选择性别" style="width: 100%">
                    <el-option label="👨 男" value="male" />
                    <el-option label="👩 女" value="female" />
                    <el-option label="🧑 其他" value="other" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="年龄">
                  <el-input-number v-model="form.age" :min="1" :max="150" style="width: 100%" controls-position="right" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号">
                  <el-input v-model="form.phone" placeholder="手机号" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="所在地区">
              <div style="display: flex; gap: 8px; width: 100%; flex-wrap: wrap;">
                <el-select
                  v-model="form.province"
                  placeholder="选择省份"
                  filterable
                  style="flex: 1; min-width: 140px;"
                  @change="handleProvinceChange"
                >
                  <el-option
                    v-for="prov in provinces"
                    :key="prov.name"
                    :label="prov.name"
                    :value="prov.name"
                  />
                </el-select>
                <el-select
                  v-model="form.city"
                  placeholder="选择城市"
                  filterable
                  style="flex: 1; min-width: 140px;"
                  :disabled="!form.province"
                >
                  <el-option
                    v-for="city in cities"
                    :key="city"
                    :label="city"
                    :value="city"
                  />
                </el-select>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="info"
                plain
                :loading="locating"
                @click="handleAutoLocate"
                style="width: 100%"
              >
                {{ locating ? '定位中...' : '📍 自动定位我的城市' }}
              </el-button>
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input
                v-model="form.bio"
                type="textarea"
                :rows="4"
                placeholder="介绍一下你自己..."
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 目标设定 -->
        <el-card class="goals-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">🎯 目标设定</span>
            </div>
          </template>
          <div class="goals-section">
            <div class="goal-item">
              <div class="goal-header">
                <span class="goal-title">🔥 每日热量目标</span>
                <el-input-number
                  v-model="goals.dailyCalories"
                  :min="1000"
                  :max="5000"
                  :step="100"
                  size="small"
                  controls-position="right"
                />
              </div>
              <div class="goal-progress">
                <el-progress
                  :percentage="calorieProgress"
                  :color="progressColor"
                  :stroke-width="12"
                />
                <span class="goal-current">{{ todayCalories }} / {{ goals.dailyCalories }} kcal</span>
              </div>
            </div>

            <div class="goal-item">
              <div class="goal-header">
                <span class="goal-title">📚 每日学习目标</span>
                <el-input-number
                  v-model="goals.dailyHours"
                  :min="0.5"
                  :max="12"
                  :step="0.5"
                  size="small"
                  controls-position="right"
                />
              </div>
              <div class="goal-progress">
                <el-progress
                  :percentage="hoursProgress"
                  :color="progressColor"
                  :stroke-width="12"
                />
                <span class="goal-current">{{ todayHours }} / {{ goals.dailyHours }} 小时</span>
              </div>
            </div>

            <el-button type="primary" @click="saveGoals" :loading="goalLoading" style="width: 100%; margin-top: 16px;">
              保存目标
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 账户信息 -->
        <el-card class="account-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">🔐 账户信息</span>
            </div>
          </template>
          <div class="account-info">
            <div class="info-row">
              <span class="info-label">用户名</span>
              <span class="info-value">{{ user.username }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">邮箱</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">注册时间</span>
              <span class="info-value">{{ formatDate(user.createdAt) }}</span>
            </div>
            <el-divider />
            <el-button type="danger" plain @click="handleLogout" style="width: 100%;">
              退出登录
            </el-button>
          </div>
        </el-card>

        <!-- 快捷操作 -->
        <el-card class="actions-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">⚡ 快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button @click="showExportDialog = true" class="action-btn">
              <span class="btn-content">
                <el-icon><Download /></el-icon>
                <span>导出数据</span>
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

        <!-- 账户安全 -->
        <el-card class="security-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">🔒 账户安全</span>
            </div>
          </template>
          <div class="security-actions">
            <el-button @click="showEmailDialog = true" class="action-btn">
              <span class="btn-content">
                <el-icon><Message /></el-icon>
                <span>修改邮箱</span>
              </span>
            </el-button>
            <el-button @click="showPasswordDialog = true" class="action-btn">
              <span class="btn-content">
                <el-icon><Lock /></el-icon>
                <span>修改密码</span>
              </span>
            </el-button>
          </div>
        </el-card>

        <!-- 刷新统计数据 -->
        <el-card class="refresh-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">🔄 数据同步</span>
            </div>
          </template>
          <el-button @click="refreshAllData" :loading="refreshing" style="width: 100%">
            {{ refreshing ? '刷新中...' : '刷新统计数据' }}
          </el-button>
          <p class="refresh-tip">
            添加记录后可点击此按钮同步最新数据
          </p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 导出格式选择对话框 -->
    <el-dialog v-model="showExportDialog" title="选择导出格式" width="400px">
      <el-radio-group v-model="exportFormat" class="export-format-group">
        <el-radio value="json" size="large" border class="export-format-option">
          <div class="export-format-content">
            <div class="export-format-title">📦 JSON 格式</div>
            <div class="export-format-desc">适合程序读取，数据完整</div>
          </div>
        </el-radio>
        <el-radio value="html" size="large" border class="export-format-option">
          <div class="export-format-content">
            <div class="export-format-title">📄 HTML 格式</div>
            <div class="export-format-desc">适合浏览器查看，带样式</div>
          </div>
        </el-radio>
        <el-radio value="txt" size="large" border class="export-format-option">
          <div class="export-format-content">
            <div class="export-format-title">📝 TXT 格式</div>
            <div class="export-format-desc">纯文本，兼容性好</div>
          </div>
        </el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button type="primary" @click="exportData" :loading="exporting">导出</el-button>
      </template>
    </el-dialog>

    <!-- 修改邮箱对话框 -->
    <el-dialog v-model="showEmailDialog" title="修改邮箱" width="400px">
      <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="80px">
        <el-form-item label="新邮箱" prop="email">
          <el-input v-model="emailForm.email" placeholder="请输入新邮箱" />
        </el-form-item>
        <el-form-item label="当前密码" prop="password">
          <el-input v-model="emailForm.password" type="password" placeholder="请输入当前密码以验证身份" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEmailDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateEmail" :loading="emailLoading">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="90px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（至少6位）" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePassword" :loading="passwordLoading">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, Download, Refresh, Message, Lock, Check, Warning } from '@element-plus/icons-vue'
import { useUserStore } from '../store'
import request from '../utils/request'
import { getUserLocationByIP } from '../utils/location'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const goalLoading = ref(false)
const refreshing = ref(false)
const showExportDialog = ref(false)
const exportFormat = ref('json')
const exporting = ref(false)

// 跟踪未保存的修改
const hasUnsavedChanges = ref(false)
const originalForm = ref({})

// 邮箱修改
const showEmailDialog = ref(false)
const emailLoading = ref(false)
const emailFormRef = ref(null)
const emailForm = reactive({
  email: '',
  password: ''
})
const emailRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ]
}

// 密码修改
const showPasswordDialog = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const uploadHeaders = {
  Authorization: `Bearer ${userStore.token}`
}

const locating = ref(false)
const cities = ref([])

// 省市数据
const provinces = [
  { name: '北京市', cities: ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区'] },
  { name: '上海市', cities: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区'] },
  { name: '广东省', cities: ['广州', '深圳', '珠海', '汕头', '佛山', '东莞', '中山', '惠州', '江门'] },
  { name: '江苏省', cities: ['南京', '无锡', '徐州', '常州', '苏州', '南通', '连云港', '淮安', '盐城', '扬州', '镇江', '泰州', '宿迁'] },
  { name: '浙江省', cities: ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'] },
  { name: '四川省', cities: ['成都', '绵阳', '自贡', '攀枝花', '泸州', '德阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山'] },
  { name: '湖北省', cities: ['武汉', '黄石', '十堰', '宜昌', '襄阳', '鄂州', '荆门', '孝感', '荆州', '黄冈', '咸宁', '随州'] },
  { name: '湖南省', cities: ['长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底'] },
  { name: '河南省', cities: ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店'] },
  { name: '山东省', cities: ['济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '临沂', '德州', '聊城', '滨州', '菏泽'] },
  { name: '福建省', cities: ['福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德'] },
  { name: '安徽省', cities: ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '阜阳', '宿州', '六安', '亳州', '池州', '宣城'] },
  { name: '江西省', cities: ['南昌', '景德镇', '萍乡', '九江', '新余', '鹰潭', '赣州', '吉安', '宜春', '抚州', '上饶'] },
  { name: '辽宁省', cities: ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'] },
  { name: '吉林省', cities: ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '延边'] },
  { name: '黑龙江省', cities: ['哈尔滨', '齐齐哈尔', '鸡西', '鹤岗', '双鸭山', '大庆', '伊春', '佳木斯', '七台河', '牡丹江', '黑河', '绥化'] },
  { name: '陕西省', cities: ['西安', '铜川', '宝鸡', '咸阳', '渭南', '延安', '汉中', '榆林', '安康', '商洛'] },
  { name: '甘肃省', cities: ['兰州', '嘉峪关', '金昌', '白银', '天水', '武威', '张掖', '平凉', '酒泉', '庆阳', '定西', '陇南'] },
  { name: '山西省', cities: ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '晋中', '运城', '忻州', '临汾', '吕梁'] },
  { name: '河北省', cities: ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'] },
  { name: '天津市', cities: ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区', '宝坻区', '滨海新区'] },
  { name: '内蒙古', cities: ['呼和浩特', '包头', '乌海', '赤峰', '通辽', '鄂尔多斯', '呼伦贝尔', '巴彦淖尔', '乌兰察布', '兴安', '锡林郭勒', '阿拉善'] },
  { name: '广西', cities: ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左'] },
  { name: '海南省', cities: ['海口', '三亚', '三沙', '儋州'] },
  { name: '重庆市', cities: ['万州区', '涪陵区', '渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '綦江区', '大足区', '渝北区', '巴南区', '黔江区', '长寿区', '江津区', '合川区', '永川区', '南川区', '璧山区', '铜梁区', '潼南区', '荣昌区', '开州区', '梁平区', '武隆区'] },
  { name: '贵州省', cities: ['贵阳', '六盘水', '遵义', '安顺', '毕节', '铜仁'] },
  { name: '云南省', cities: ['昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧', '楚雄', '红河', '文山', '西双版纳', '大理', '德宏', '怒江', '迪庆'] },
  { name: '西藏', cities: ['拉萨', '日喀则', '昌都', '林芝', '山南', '那曲', '阿里'] },
  { name: '青海省', cities: ['西宁', '海东', '海北', '黄南', '海南', '果洛', '玉树', '海西'] },
  { name: '宁夏', cities: ['银川', '石嘴山', '吴忠', '固原', '中卫'] },
  { name: '新疆', cities: ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博尔塔拉', '巴音郭楞', '阿克苏', '克孜勒苏', '喀什', '和田', '伊犁', '塔城', '阿勒泰'] }
]

const user = reactive({
  username: '',
  email: '',
  createdAt: ''
})

const form = reactive({
  username: '',
  avatar: '',
  gender: '',
  age: null,
  province: '',
  city: '',
  bio: '',
  phone: ''
})

const goals = reactive({
  dailyCalories: 2000,
  dailyHours: 2
})

const userStats = reactive({
  recordDays: 0,
  totalCalories: 0,
  totalHours: 0
})

const realTodayCalories = ref(0)
const realTodayHours = ref(0)

const rules = {
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const todayCalories = computed(() => {
  return realTodayCalories.value || 0
})

const todayHours = computed(() => {
  return realTodayHours.value.toFixed(1)
})

const calorieProgress = computed(() => {
  return Math.min((todayCalories.value / goals.dailyCalories) * 100, 100).toFixed(1)
})

const hoursProgress = computed(() => {
  return Math.min((todayHours.value / goals.dailyHours) * 100, 100).toFixed(1)
})

const progressColor = computed(() => {
  return [
    { color: '#FF8C42', percentage: 50 },
    { color: '#FFB347', percentage: 80 },
    { color: '#2ECC71', percentage: 100 }
  ]
})

const formatDate = (dateStr) => {
  if (!dateStr) return '未知'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const handleAvatarSuccess = (res) => {
  form.avatar = res.url
  hasUnsavedChanges.value = true
  ElMessage({
    message: '头像上传成功！记得点击保存按钮保存修改 💾',
    type: 'success',
    duration: 4000,
    showClose: true
  })
}

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    await request.put('/auth/user', form)

    // 重新获取用户信息，确保显示最新数据
    await fetchUserData()

    // 重置未保存状态
    originalForm.value = { ...form }
    hasUnsavedChanges.value = false

    ElMessage.success('保存成功 ✅')
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    loading.value = false
  }
}

const saveGoals = async () => {
  try {
    goalLoading.value = true
    // TODO: 保存目标到后端
    ElMessage.success('目标已保存 🎯')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    goalLoading.value = false
  }
}

const handleLogout = () => {
  userStore.clearUser()
  ElMessage.success('已退出登录 👋')
  router.push('/login')
}

const exportData = async () => {
  try {
    showExportDialog.value = false
    exporting.value = true
    ElMessage.info('正在准备导出数据...')

    // 并发获取所有数据
    const [foodRecords, studyRecords] = await Promise.all([
      request.get('/food/records').catch(() => []),
      request.get('/study/records').catch(() => [])
    ])

    const data = {
      exportTime: new Date().toISOString(),
      exportDate: new Date().toLocaleDateString('zh-CN'),
      userInfo: {
        username: user.username,
        email: user.email,
        ...form
      },
      statistics: {
        recordDays: userStats.recordDays,
        totalCalories: userStats.totalCalories,
        totalHours: userStats.totalHours
      },
      goals: {
        dailyCalories: goals.dailyCalories,
        dailyHours: goals.dailyHours
      },
      foodRecords: Array.isArray(foodRecords) ? foodRecords : [],
      studyRecords: Array.isArray(studyRecords) ? studyRecords : []
    }

    const dateStr = new Date().toISOString().split('T')[0]
    let content = ''
    let mimeType = ''
    let fileName = ''

    // 根据格式生成内容
    if (exportFormat.value === 'json') {
      content = JSON.stringify(data, null, 2)
      mimeType = 'application/json'
      fileName = `${user.username}_数据导出_${dateStr}.json`
    } else if (exportFormat.value === 'html') {
      content = generateHTML(data)
      mimeType = 'text/html'
      fileName = `${user.username}_数据导出_${dateStr}.html`
    } else if (exportFormat.value === 'txt') {
      content = generateTXT(data)
      mimeType = 'text/plain'
      fileName = `${user.username}_数据导出_${dateStr}.txt`
    }

    // 下载文件
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)

    ElMessage.success({ message: '数据导出成功 📊', duration: 1500 })
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 生成 HTML 格式
const generateHTML = (data) => {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.userInfo.username} 的数据导出</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'PingFang SC', sans-serif; padding: 40px; background: #FFF8F0; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    h1 { color: #FF8C42; margin-bottom: 10px; }
    .subtitle { color: #7F8C8D; margin-bottom: 30px; font-size: 14px; }
    h2 { color: #2C3E50; margin: 30px 0 15px; padding-bottom: 10px; border-bottom: 2px solid #FFB347; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
    .info-item { background: #FFF0E6; padding: 15px; border-radius: 8px; }
    .info-label { color: #7F8C8D; font-size: 12px; margin-bottom: 5px; }
    .info-value { color: #2C3E50; font-weight: 600; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .stat-card { background: linear-gradient(135deg, #FF8C42 0%, #FFB347 100%); padding: 20px; border-radius: 12px; color: white; text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; }
    .stat-label { font-size: 14px; margin-top: 5px; opacity: 0.9; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E0E0E0; }
    th { background: #FFF0E6; color: #2C3E50; font-weight: 600; }
    tr:hover { background: #FFF8F0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 ${data.userInfo.username} 的数据报告</h1>
    <p class="subtitle">导出时间：${data.exportDate}</p>

    <h2>👤 用户信息</h2>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">用户名</div><div class="info-value">${data.userInfo.username}</div></div>
      <div class="info-item"><div class="info-label">邮箱</div><div class="info-value">${data.userInfo.email}</div></div>
      <div class="info-item"><div class="info-label">城市</div><div class="info-value">${data.userInfo.city || '未设置'}</div></div>
      <div class="info-item"><div class="info-label">性别</div><div class="info-value">${data.userInfo.gender === 'male' ? '男' : data.userInfo.gender === 'female' ? '女' : '其他'}</div></div>
    </div>

    <h2>📈 统计数据</h2>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">${data.statistics.recordDays}</div><div class="stat-label">记录天数</div></div>
      <div class="stat-card"><div class="stat-value">${data.statistics.totalCalories}</div><div class="stat-label">总热量</div></div>
      <div class="stat-card"><div class="stat-value">${data.statistics.totalHours}</div><div class="stat-label">总时长(h)</div></div>
    </div>

    <h2>🎯 目标设定</h2>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">每日热量目标</div><div class="info-value">${data.goals.dailyCalories} kcal</div></div>
      <div class="info-item"><div class="info-label">每日学习目标</div><div class="info-value">${data.goals.dailyHours} 小时</div></div>
    </div>

    <h2>🍎 饮食记录 (${data.foodRecords.length} 条)</h2>
    <table>
      <thead><tr><th>日期</th><th>餐别</th><th>食物</th><th>热量</th><th>蛋白质</th></tr></thead>
      <tbody>
        ${data.foodRecords.map(r => `
          <tr>
            <td>${r.record_date ? r.record_date.split('T')[0] : ''}</td>
            <td>${r.meal_type === 'breakfast' ? '早餐' : r.meal_type === 'lunch' ? '午餐' : r.meal_type === 'dinner' ? '晚餐' : '零食'}</td>
            <td>${r.food_name}</td>
            <td>${r.calories || 0} kcal</td>
            <td>${r.protein || 0}g</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>📚 学习记录 (${data.studyRecords.length} 条)</h2>
    <table>
      <thead><tr><th>日期</th><th>科目</th><th>时长</th><th>内容</th></tr></thead>
      <tbody>
        ${data.studyRecords.map(r => `
          <tr>
            <td>${r.study_date ? r.study_date.split('T')[0] : ''}</td>
            <td>${r.subject || '-'}</td>
            <td>${r.hours || 0}h</td>
            <td>${r.content || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`
}

// 生成 TXT 格式
const generateTXT = (data) => {
  let txt = `========================================\n`
  txt += `   ${data.userInfo.username} 的数据报告\n`
  txt += `========================================\n\n`
  txt += `导出时间：${data.exportDate}\n\n`

  txt += `【用户信息】\n`
  txt += `----------------------------------------\n`
  txt += `用户名：${data.userInfo.username}\n`
  txt += `邮箱：${data.userInfo.email}\n`
  txt += `城市：${data.userInfo.city || '未设置'}\n`
  txt += `性别：${data.userInfo.gender === 'male' ? '男' : data.userInfo.gender === 'female' ? '女' : '其他'}\n\n`

  txt += `【统计数据】\n`
  txt += `----------------------------------------\n`
  txt += `记录天数：${data.statistics.recordDays} 天\n`
  txt += `总热量：${data.statistics.totalCalories} kcal\n`
  txt += `总时长：${data.statistics.totalHours} 小时\n\n`

  txt += `【目标设定】\n`
  txt += `----------------------------------------\n`
  txt += `每日热量目标：${data.goals.dailyCalories} kcal\n`
  txt += `每日学习目标：${data.goals.dailyHours} 小时\n\n`

  txt += `【饮食记录】共 ${data.foodRecords.length} 条\n`
  txt += `----------------------------------------\n`
  data.foodRecords.forEach(r => {
    txt += `${r.record_date ? r.record_date.split('T')[0] : ''} | `
    txt += `${r.meal_type === 'breakfast' ? '早餐' : r.meal_type === 'lunch' ? '午餐' : r.meal_type === 'dinner' ? '晚餐' : '零食'} | `
    txt += `${r.food_name} | ${r.calories || 0}kcal | 蛋白质${r.protein || 0}g\n`
  })
  txt += `\n`

  txt += `【学习记录】共 ${data.studyRecords.length} 条\n`
  txt += `----------------------------------------\n`
  data.studyRecords.forEach(r => {
    txt += `${r.study_date ? r.study_date.split('T')[0] : ''} | `
    txt += `${r.subject || '-'} | ${r.hours || 0}h | ${r.content || '-'}\n`
  })

  txt += `\n========================================\n`
  txt += `         数据导出完成\n`
  txt += `========================================\n`

  return txt
}

const clearCache = () => {
  localStorage.clear()
  ElMessage.success('缓存已清除 ✨')
}

// 修改邮箱
const handleUpdateEmail = async () => {
  try {
    await emailFormRef.value.validate()
    emailLoading.value = true

    await request.put('/auth/email', {
      email: emailForm.email,
      password: emailForm.password
    })

    // 更新本地用户信息
    user.email = emailForm.email
    userStore.setUser(userStore.token, { ...userStore.user, email: emailForm.email })

    ElMessage.success('邮箱修改成功 ✅')
    showEmailDialog.value = false
    emailForm.email = ''
    emailForm.password = ''
  } catch (error) {
    console.error('修改邮箱失败:', error)
    if (error.response?.status === 401) {
      ElMessage.error('当前密码错误')
    } else {
      ElMessage.error('修改邮箱失败，请重试')
    }
  } finally {
    emailLoading.value = false
  }
}

// 修改密码
const handleUpdatePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true

    await request.put('/auth/password', {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    ElMessage.success('密码修改成功 ✅')
    showPasswordDialog.value = false
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    console.error('修改密码失败:', error)
    if (error.response?.status === 401) {
      ElMessage.error('当前密码错误')
    } else {
      ElMessage.error('修改密码失败，请重试')
    }
  } finally {
    passwordLoading.value = false
  }
}

// 省份改变时更新城市列表
const handleProvinceChange = () => {
  form.city = ''
  const prov = provinces.find(p => p.name === form.province)
  cities.value = prov ? prov.cities : []
}

// 自动定位
const handleAutoLocate = async () => {
  locating.value = true
  try {
    const location = await getUserLocationByIP()
    if (location && location.city) {
      // 匹配省份和城市
      for (const prov of provinces) {
        for (const city of prov.cities) {
          if (location.city.includes(city) || city.includes(location.city)) {
            form.province = prov.name
            cities.value = prov.cities
            form.city = city
            ElMessage.success(`定位成功：${prov.name} ${city}`)
            return
          }
        }
      }
      // 如果没匹配到，使用原始城市名
      form.city = location.city
      ElMessage.success(`定位成功：${location.city}`)
    } else {
      ElMessage.warning('定位失败，请手动选择')
    }
  } catch (error) {
    ElMessage.error('定位失败，请手动选择')
  } finally {
    locating.value = false
  }
}

const fetchUserData = async () => {
  try {
    const userData = await request.get('/auth/user')
    Object.assign(user, {
      username: userData.username || '',
      email: userData.email || '',
      createdAt: userData.created_at || ''
    })

    Object.assign(form, {
      username: userData.username || '',
      avatar: userData.avatar || '',
      gender: userData.gender || '',
      age: userData.age || null,
      province: userData.province || '',
      city: userData.city || '',
      bio: userData.bio || '',
      phone: userData.phone || ''
    })

    // 如果有省份，初始化城市列表
    if (form.province) {
      const prov = provinces.find(p => p.name === form.province)
      cities.value = prov ? prov.cities : []
    }

    if (userData.goals) {
      goals.dailyCalories = userData.goals.dailyCalories || 2000
      goals.dailyHours = userData.goals.dailyHours || 2
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败，请重新登录')
  }
}

const fetchUserStats = async () => {
  try {
    console.log('[fetchUserStats] 开始请求统计数据...')
    const stats = await request.get('/user/stats')
    console.log('[fetchUserStats] 获取到的原始统计数据:', stats)
    console.log('[fetchUserStats] stats.recordDays:', stats.recordDays)
    console.log('[fetchUserStats] stats.totalCalories:', stats.totalCalories, '类型:', typeof stats.totalCalories)
    console.log('[fetchUserStats] stats.totalHours:', stats.totalHours, '类型:', typeof stats.totalHours)

    Object.assign(userStats, {
      recordDays: stats.recordDays || 0,
      totalCalories: Math.round(Number(stats.totalCalories) || 0),
      totalHours: Number(stats.totalHours).toFixed(1),
      completedGoals: stats.completedGoals || 0
    })

    // 更新今日数据
    realTodayCalories.value = stats.todayCalories || 0
    realTodayHours.value = parseFloat(stats.todayHours) || 0
    console.log('[fetchUserStats] 更新后的userStats:', JSON.parse(JSON.stringify(userStats)))
  } catch (error) {
    console.error('[fetchUserStats] 获取统计数据失败:', error)
    console.error('[fetchUserStats] 错误详情:', error.response?.data)
    // 失败时使用0值
    Object.assign(userStats, {
      recordDays: 0,
      totalCalories: 0,
      totalHours: 0
    })
  }
}

// 刷新所有数据
const refreshAllData = async () => {
  refreshing.value = true
  try {
    await Promise.all([
      fetchUserData(),
      fetchUserStats()
    ])
    ElMessage.success('数据已刷新 ✅')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    refreshing.value = false
  }
}

onMounted(async () => {
  await fetchUserData()
  await fetchUserStats()

  // 保存初始表单数据
  originalForm.value = { ...form }
})

// 监听表单变化
watch(form, (newVal) => {
  hasUnsavedChanges.value = Object.keys(newVal).some(key => {
    return JSON.stringify(newVal[key]) !== JSON.stringify(originalForm.value[key])
  })
}, { deep: true })
</script>

<style scoped>
.profile-page {
  padding: 0;
}

/* 用户信息头部 */
.profile-header {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 32px;
  box-shadow: var(--shadow-card);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-wrapper {
  position: relative;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--color-primary-light);
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  font-size: 40px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid var(--color-primary-light);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--color-primary) !important;
  border-color: white !important;
}

.user-basic h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: var(--color-text-primary);
}

.email {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 保存按钮 */
.save-button {
  min-width: 160px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  padding: 0 32px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FF8C42 0%, #FF6B2C 100%) !important;
  border: none;
  box-shadow: 0 4px 12px rgba(255, 140, 66, 0.3);
  transition: all 0.3s ease;
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 140, 66, 0.4);
}

.save-button:active {
  transform: translateY(0);
}

.save-button .save-icon {
  font-size: 18px;
  margin-right: 6px;
}

/* 保存提示 */
.save-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FFF0E6;
  border: 1.5px solid #FFB347;
  border-radius: 10px;
  animation: slideIn 0.3s ease;
  margin-top: 12px;
}

.save-hint .hint-icon {
  color: #FF8C42;
  font-size: 18px;
  flex-shrink: 0;
}

.save-hint span {
  color: #D66A00;
  font-size: 14px;
  font-weight: 500;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 数据统计 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-item {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.stat-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-card);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

/* 卡片 */
.warm-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* 目标设定 */
.goals-section {
  padding: 10px 0;
}

.goal-item {
  margin-bottom: 24px;
}

.goal-item:last-child {
  margin-bottom: 0;
}

.goal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.goal-title {
  font-weight: 500;
  color: var(--color-text-primary);
}

.goal-progress {
  position: relative;
}

.goal-current {
  display: block;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 8px;
}

/* 账户信息 */
.account-info {
  padding: 10px 0;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px;
  border-bottom: 1px solid var(--color-bg-secondary);
  gap: 8px;
  min-width: max-content;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--color-text-secondary);
  font-size: 14px;
  flex-shrink: 0;
  min-width: 65px;
  max-width: 65px;
}

.info-value {
  color: var(--color-text-primary);
  font-weight: 500;
  text-align: right;
  flex-shrink: 0;
}

/* 设置 */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 账户安全操作 */
.security-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.security-actions .el-button {
  margin: 0;
}

.quick-action-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: var(--color-bg-page);
  border-radius: var(--radius-button);
  transition: all 0.3s ease;
  gap: 10px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toggle-label .el-icon {
  font-size: 18px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.toggle-label span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-btn {
  width: 100%;
  height: 40px;
  margin: 0 !important;
  box-sizing: border-box !important;
  overflow-x: hidden;
}

.action-btn :deep(.el-button__content) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 100%;
  width: 100%;
  padding: 0 12px;
  white-space: nowrap;
}

.action-btn :deep(.el-icon) {
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
}

.action-btn :deep(.btn-content) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.action-btn :deep(span:not(.el-icon)) {
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

/* 刷新提示 */
.refresh-tip {
  font-size: 12px;
  color: var(--color-text-light);
  margin-top: 8px;
  text-align: center;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 导出格式选择 */
.export-format-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.export-format-option {
  width: 100%;
  margin: 0 !important;
  padding: 0 !important;
}

.export-format-option :deep(.el-radio__label) {
  width: 100%;
  padding: 0;
}

.export-format-content {
  padding: 10px 12px;
  width: 100%;
  box-sizing: border-box;
}

.export-format-title {
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.export-format-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
  line-height: 1.3;
}

/* 响应式 */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  /* 手机端单列布局 */
  .el-row {
    flex-direction: column !important;
  }

  .el-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }

  /* 整合右侧卡片为一个视觉组 */
  .el-col:last-child .warm-card {
    margin-bottom: 0;
    border-radius: 0;
    border-bottom: none;
  }

  .el-col:last-child .warm-card:first-child {
    border-radius: var(--radius-card) var(--radius-card) 0 0;
  }

  .el-col:last-child .warm-card:last-child {
    border-radius: 0 0 var(--radius-card) var(--radius-card);
    border-bottom: 1px solid var(--color-bg-secondary);
  }

  /* 恢复快捷操作为垂直布局 */
  .quick-actions,
  .security-actions {
    flex-direction: column !important;
    overflow: visible !important;
  }

  .quick-actions .action-btn,
  .security-actions .action-btn {
    width: 100% !important;
    min-width: auto !important;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 20px;
  }

  .avatar-section {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .header-actions .el-button {
    width: 100%;
    max-width: 300px;
  }

  .save-hint {
    width: 100%;
    max-width: 300px;
    text-align: center;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    padding: 16px;
  }

  .stat-icon {
    font-size: 32px;
    width: 50px;
    height: 50px;
  }

  .stat-value {
    font-size: 24px;
  }

  /* 编辑资料卡片 */
  .el-form :deep(.el-col) {
    width: 100% !important;
    margin-bottom: 0;
  }

  .el-form :deep(.el-form-item__label) {
    width: 80px !important;
    font-size: 14px;
  }

  /* 省市选择器 */
  .el-select {
    width: 100% !important;
    margin: 0 !important;
    margin-bottom: 8px !important;
  }

  /* 目标设定 */
  .goal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .goal-header .el-input-number {
    width: 100% !important;
  }

  .goal-current {
    font-size: 12px;
  }

  /* 账户信息 */
  .account-info {
    overflow: visible;
  }

  .info-row {
    flex-wrap: wrap;
    padding: 12px 4px;
  }

  .info-label {
    font-size: 13px !important;
    min-width: auto;
    max-width: none;
  }

  .info-value {
    font-size: 13px !important;
    white-space: normal;
  }

  /* 快捷操作和账户安全 - 垂直布局 */
  .quick-actions .action-btn,
  .security-actions .action-btn {
    height: auto !important;
    padding: 12px 16px;
  }

  .action-btn :deep(.el-button__content) {
    font-size: 14px !important;
  }

  .action-btn :deep(.el-icon) {
    font-size: 16px !important;
  }

  /* 导出格式选择 */
  .export-format-title {
    font-size: 12px !important;
  }

  .export-format-desc {
    font-size: 10px !important;
  }

  /* 刷新卡片 */
  .refresh-card .el-button {
    font-size: 11px !important;
    height: 44px !important;
    min-height: 44px;
  }

  .refresh-card .el-button :deep(.el-button__content) {
    font-size: 11px !important;
    white-space: normal;
  }

  .refresh-card p {
    font-size: 10px !important;
    line-height: 1.4;
    padding: 0 8px;
  }
}

@media (max-width: 480px) {
  .profile-header {
    padding: 16px;
  }

  .user-avatar,
  .avatar-placeholder {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }

  .user-basic h2 {
    font-size: 20px;
  }

  .email {
    font-size: 13px;
  }

  .el-form :deep(.el-form-item__label) {
    width: 70px !important;
    font-size: 13px;
  }

  .goal-title {
    font-size: 14px;
  }
}
</style>
