<template>
  <div class="register-page">
    <!-- 左侧品牌展示区 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="brand-logo">🍊</div>
        <h1 class="brand-title">加入我们</h1>
        <p class="brand-slogan">开始你的记录之旅</p>
        <div class="brand-benefits">
          <div class="benefit-item">✓ 完全免费使用</div>
          <div class="benefit-item">✓ 数据安全存储</div>
          <div class="benefit-item">✓ 自动定位城市</div>
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
        <div class="form-header">
          <h2>创建账户 🎉</h2>
          <p>填写信息开始使用</p>
        </div>

        <el-form :model="form" :rules="rules" ref="formRef" class="register-form">
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
              placeholder="密码（至少6位）"
              prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="确认密码"
              prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <!-- 省市两级联动 -->
          <el-row :gutter="12">
            <el-col :span="12">
              <el-form-item prop="province">
                <el-select
                  v-model="form.province"
                  placeholder="选择省份"
                  size="large"
                  style="width: 100%"
                  filterable
                  @change="handleProvinceChange"
                >
                  <el-option
                    v-for="prov in provinces"
                    :key="prov.name"
                    :label="prov.name"
                    :value="prov.name"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="city">
                <el-select
                  v-model="form.city"
                  placeholder="选择城市"
                  size="large"
                  style="width: 100%"
                  filterable
                  :disabled="!form.province"
                >
                  <el-option
                    v-for="city in cities"
                    :key="city"
                    :label="city"
                    :value="city"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 自动定位按钮 -->
          <el-form-item>
            <el-button
              type="info"
              plain
              :icon="locating ? 'Loading' : 'Location'"
              :loading="locating"
              @click="handleAutoLocate"
              size="large"
              style="width: 100%"
            >
              {{ locating ? '定位中...' : '📍 自动定位我的城市' }}
            </el-button>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleRegister"
              :loading="loading"
              size="large"
              class="register-button"
            >
              {{ loading ? '注册中...' : '立即注册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-footer">
          <p>已有账号？
            <router-link to="/login" class="login-link">
              前往登录 →
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Location, Loading } from '@element-plus/icons-vue'
import request from '../utils/request'
import { getUserLocationByIP } from '../utils/location'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const locating = ref(false)

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
  { name: '新疆', cities: ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博尔塔拉', '巴音郭楞', '阿克苏', '克孜勒苏', '喀什', '和田', '伊犁', '塔城', '阿勒泰'] },
  { name: '北京市', cities: ['北京'] },
  { name: '上海市', cities: ['上海'] },
  { name: '天津市', cities: ['天津'] }
]

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  province: '',
  city: ''
})

const cities = ref([])

const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码至少6位'))
  } else {
    if (form.confirmPassword !== '') {
      formRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请确认密码'))
  } else if (value !== form.password) {
    callback(new Error('两次密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为2-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  city: [
    { required: true, message: '请选择城市', trigger: 'change' }
  ]
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

const handleRegister = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    await request.post('/auth/register', {
      username: form.username,
      email: form.email,
      password: form.password,
      city: form.city
    })

    ElMessage.success('注册成功！请登录 🎊')
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 页面加载后自动定位
  handleAutoLocate()
})
</script>

<style scoped>
.register-page {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg-page);
}

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

.brand-benefits {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.benefit-item {
  background: rgba(255, 255, 255, 0.2);
  padding: 12px 24px;
  border-radius: var(--radius-tag);
  backdrop-filter: blur(10px);
  font-size: 16px;
  transition: all 0.3s ease;
}

.benefit-item:hover {
  transform: translateX(10px);
  background: rgba(255, 255, 255, 0.25);
}

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
  max-width: 450px;
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card-hover);
  padding: 40px;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
  font-size: 26px;
  color: var(--color-text-primary);
  margin-bottom: 5px;
}

.form-header p {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.register-form :deep(.el-input__wrapper) {
  padding: 12px 15px;
}

.register-button {
  width: 100%;
  height: 46px;
  font-size: 16px;
  font-weight: 600;
}

.form-footer {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.login-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

@media (max-width: 900px) {
  .brand-section {
    display: none;
  }

  .form-section {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 25px 20px;
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
