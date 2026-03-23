<template>
  <div class="food-page fade-in">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div class="stat-card calories-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalCalories }}</div>
          <div class="stat-label">累计热量</div>
          <div class="stat-unit">kcal</div>
        </div>
        <div class="stat-trend">
          📊
        </div>
      </div>

      <div class="stat-card protein-card">
        <div class="stat-icon">💪</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalProtein }}</div>
          <div class="stat-label">蛋白质</div>
          <div class="stat-unit">g</div>
        </div>
        <div class="stat-progress">
          <div class="progress-bar" :style="{ width: Math.min(totalProtein / 100 * 100, 100) + '%' }"></div>
        </div>
      </div>

      <div class="stat-card carbs-card">
        <div class="stat-icon">🍞</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalCarbs }}</div>
          <div class="stat-label">碳水</div>
          <div class="stat-unit">g</div>
        </div>
        <div class="stat-progress">
          <div class="progress-bar" :style="{ width: Math.min(totalCarbs / 250 * 100, 100) + '%' }"></div>
        </div>
      </div>

      <div class="stat-card fat-card">
        <div class="stat-icon">🥑</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalFat }}</div>
          <div class="stat-label">脂肪</div>
          <div class="stat-unit">g</div>
        </div>
        <div class="stat-progress">
          <div class="progress-bar" :style="{ width: Math.min(totalFat / 70 * 100, 100) + '%' }"></div>
        </div>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <!-- 添加记录表单 -->
        <el-card class="form-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">📝 添加饮食记录</span>
            </div>
          </template>
          <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="日期" prop="recordDate">
                  <el-date-picker
                    v-model="form.recordDate"
                    type="date"
                    placeholder="选择日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="餐别" prop="mealType">
                  <el-select v-model="form.mealType" placeholder="选择餐别" style="width: 100%">
                    <el-option label="🍳 早餐" value="breakfast" />
                    <el-option label="🍱 午餐" value="lunch" />
                    <el-option label="🍽️ 晚餐" value="dinner" />
                    <el-option label="🍿 零食" value="snack" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="食物名称" prop="foodName">
              <el-autocomplete
                v-model="form.foodName"
                :fetch-suggestions="searchFood"
                placeholder="输入食物名称（如：鸡蛋、米饭）"
                @select="handleFoodSelect"
                style="width: 100%"
                :highlight-first-item="true"
              >
                <template #default="{ item }">
                  <div class="food-suggestion">
                    <span class="food-name">{{ item.name }}</span>
                    <span class="food-calories">{{ item.calories }} kcal/100g</span>
                    <span class="food-category">{{ item.category }}</span>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item label="热量">
                  <el-input-number v-model="form.calories" :min="0" :precision="0" placeholder="0" style="width: 100%" controls-position="right" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="蛋白质">
                  <el-input-number v-model="form.protein" :min="0" :precision="1" placeholder="0" style="width: 100%" controls-position="right" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="碳水">
                  <el-input-number v-model="form.carbs" :min="0" :precision="1" placeholder="0" style="width: 100%" controls-position="right" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="脂肪">
                  <el-input-number v-model="form.fat" :min="0" :precision="1" placeholder="0" style="width: 100%" controls-position="right" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="备注">
              <el-input v-model="form.notes" type="textarea" :rows="2" placeholder="添加备注信息（可选）" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="loading" size="large">
                {{ editingId ? '更新记录' : '添加记录' }}
              </el-button>
              <el-button @click="handleReset" size="large">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 记录列表 -->
        <el-card class="list-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">📋 饮食记录</span>
              <el-tag type="info">{{ records.length }} 条</el-tag>
            </div>
          </template>
          <div class="record-list" v-loading="tableLoading">
            <div v-for="record in records" :key="record.id" class="record-item">
              <div class="record-meal">
                <el-tag :type="getMealTypeTag(record.meal_type)" size="large">
                  {{ getMealTypeEmoji(record.meal_type) }} {{ getMealTypeLabel(record.meal_type) }}
                </el-tag>
                <span class="record-date">{{ record.record_date }}</span>
              </div>
              <div class="record-food">{{ record.food_name }}</div>
              <div class="record-nutrition">
                <span class="nutrition-item calories">{{ record.calories || 0 }} kcal</span>
                <span class="nutrition-item">蛋白质 {{ record.protein || 0 }}g</span>
                <span class="nutrition-item">碳水 {{ record.carbs || 0 }}g</span>
                <span class="nutrition-item">脂肪 {{ record.fat || 0 }}g</span>
              </div>
              <div class="record-notes" v-if="record.notes">{{ record.notes }}</div>
              <div class="record-actions">
                <el-button size="small" @click="handleEdit(record)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(record.id)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
            <el-empty v-if="!tableLoading && records.length === 0" description="暂无记录，快去添加吧 🍎" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 天气卡片 -->
        <el-card class="weather-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">🌤️ 天气信息</span>
            </div>
          </template>
          <div v-if="weather" class="weather-content">
            <div class="weather-main">
              <div class="weather-icon">{{ getWeatherEmoji(weather.weather) }}</div>
              <div class="weather-temp">{{ weather.temp }}°C</div>
              <div class="weather-desc">{{ weather.weather }}</div>
            </div>
            <el-divider />
            <div class="weather-details">
              <div class="detail-row">
                <el-icon><Location /></el-icon>
                <span>{{ userStore.user?.city || '未设置' }}</span>
              </div>
              <div class="detail-row">
                <el-icon><Drizzling /></el-icon>
                <span>湿度 {{ weather.humidity }}%</span>
              </div>
              <div class="detail-row">
                <el-icon><WindPower /></el-icon>
                <span>风速 {{ weather.wind }}级</span>
              </div>
            </div>
          </div>
          <el-empty v-else description="请在个人中心设置城市 📍" />
        </el-card>

        <!-- 地图卡片 -->
        <el-card class="map-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">🗺️ 位置地图</span>
            </div>
          </template>
          <ChinaMap v-if="userLocation" :userLocation="userLocation" :weather="weather" />
          <el-empty v-else description="请在个人中心设置城市 📍" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, defineAsyncComponent } from 'vue'
import { Edit, Delete, Location, Drizzling, WindPower } from '@element-plus/icons-vue'
import { useUserStore } from '../store'
import request from '../utils/request'
import { getRealWeatherData, getCityCoordinates } from '../utils/weather'
import { foodDatabase } from '../data/foodDatabase'

// 异步加载地图组件（延迟加载ECharts）
const ChinaMap = defineAsyncComponent(() => import('../components/ChinaMap.vue'))

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const tableLoading = ref(false)
const editingId = ref(null)
const records = ref([])
const weather = ref(null)

const form = reactive({
  recordDate: new Date().toISOString().split('T')[0],
  mealType: '',
  foodName: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  notes: ''
})

const rules = {
  recordDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  mealType: [{ required: true, message: '请选择餐别', trigger: 'change' }],
  foodName: [{ required: true, message: '请输入食物名称', trigger: 'blur' }]
}

const userLocation = computed(() => {
  const city = userStore.user?.city
  if (!city) return null
  return {
    name: city,
    ...getCityCoordinates(city)
  }
})

// 累计统计（所有记录的总和）
const totalCalories = computed(() => {
  const total = records.value.reduce((sum, r) => sum + (parseFloat(r.calories) || 0), 0)
  console.log('[totalCalories] 计算结果:', total, '记录数:', records.value.length)
  return Math.round(total)
})

const totalProtein = computed(() => {
  const total = records.value.reduce((sum, r) => sum + (parseFloat(r.protein) || 0), 0)
  return total > 0 ? total.toFixed(1) : '0.0'
})

const totalCarbs = computed(() => {
  const total = records.value.reduce((sum, r) => sum + (parseFloat(r.carbs) || 0), 0)
  return total > 0 ? total.toFixed(1) : '0.0'
})

const totalFat = computed(() => {
  const total = records.value.reduce((sum, r) => sum + (parseFloat(r.fat) || 0), 0)
  return total > 0 ? total.toFixed(1) : '0.0'
})

// 今日统计
const todayCalories = computed(() => {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const todayRecords = records.value.filter(r => {
    const recordDate = String(r.record_date).split('T')[0]
    return recordDate === today
  })
  const total = todayRecords.reduce((sum, r) => sum + (parseFloat(r.calories) || 0), 0)
  return Math.round(total)
})

const todayProtein = computed(() => {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const total = records.value
    .filter(r => {
      const recordDate = String(r.record_date).split('T')[0]
      return recordDate === today
    })
    .reduce((sum, r) => sum + (parseFloat(r.protein) || 0), 0)
  return total > 0 ? total.toFixed(1) : '0.0'
})

const todayCarbs = computed(() => {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const total = records.value
    .filter(r => {
      const recordDate = String(r.record_date).split('T')[0]
      return recordDate === today
    })
    .reduce((sum, r) => sum + (parseFloat(r.carbs) || 0), 0)
  return total > 0 ? total.toFixed(1) : '0.0'
})

const todayFat = computed(() => {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const total = records.value
    .filter(r => {
      const recordDate = String(r.record_date).split('T')[0]
      return recordDate === today
    })
    .reduce((sum, r) => sum + (parseFloat(r.fat) || 0), 0)
  return total > 0 ? total.toFixed(1) : '0.0'
})

const getMealTypeLabel = (type) => {
  const map = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '零食' }
  return map[type] || type
}

const getMealTypeEmoji = (type) => {
  const map = { breakfast: '🍳', lunch: '🍱', dinner: '🍽️', snack: '🍿' }
  return map[type] || '🍽️'
}

const getMealTypeTag = (type) => {
  const map = { breakfast: 'success', lunch: 'warning', dinner: 'danger', snack: 'info' }
  return map[type] || ''
}

const getWeatherEmoji = (weather) => {
  const map = {
    '晴': '☀️', '多云': '⛅', '阴': '☁️',
    '小雨': '🌧️', '中雨': '🌧️', '大雨': '⛈️',
    '雪': '❄️', '雾': '🌫️'
  }
  return map[weather] || '🌤️'
}

// 搜索食物
const searchFood = (queryString, cb) => {
  if (!queryString || queryString.trim().length < 1) {
    cb([])
    return
  }

  const query = queryString.trim().toLowerCase()

  const results = foodDatabase
    .filter(food => {
      return food.name.toLowerCase().includes(query) ||
             food.category.toLowerCase().includes(query)
    })
    .sort((a, b) => {
      // 完全匹配优先
      if (b.name.toLowerCase() === query) return 1
      if (a.name.toLowerCase() === query) return -1
      // 前缀匹配次之
      if (b.name.toLowerCase().startsWith(query)) return 1
      if (a.name.toLowerCase().startsWith(query)) return -1
      return 0
    })
    .slice(0, 5)
    .map(item => ({ ...item }))

  // 如果没有匹配结果，提供手动输入提示
  if (results.length === 0) {
    cb([{
      name: '未找到匹配食物，请手动输入营养数据',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      category: '',
      isPlaceholder: true
    }])
  } else {
    cb(results)
  }
}

// 选择食物后自动填充营养数据
const handleFoodSelect = (item) => {
  if (item.isPlaceholder) {
    // 是占位符，不自动填充
    return
  }
  // 设置食物名称（防止 el-autocomplete 将对象赋值给字符串）
  form.foodName = item.name
  // 自动填充营养数据
  form.calories = item.calories
  form.protein = item.protein
  form.carbs = item.carbs
  form.fat = item.fat
  ElMessage.success({ message: `已自动填充 ${item.name} 的营养数据 📊`, duration: 1500 })
}

const fetchWeather = async () => {
  const city = userStore.user?.city
  console.log('[fetchWeather] 用户城市:', city)
  if (city) {
    try {
      const weatherData = await getRealWeatherData(city)
      console.log('[fetchWeather] 获取到的天气数据:', weatherData)
      weather.value = weatherData
    } catch (error) {
      console.error('[fetchWeather] 获取天气失败:', error)
      weather.value = null
    }
  } else {
    console.log('[fetchWeather] 未设置城市')
  }
}

const fetchRecords = async () => {
  try {
    tableLoading.value = true
    const data = await request.get('/food/records')
    records.value = Array.isArray(data) ? data : []
    console.log('获取到饮食记录:', records.value.length)
    console.log('饮食记录数据:', JSON.stringify(records.value, null, 2))

    // 调试：显示今日日期和匹配的记录
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    console.log('[Food] 今日日期:', today)
    const todayRecords = records.value.filter(r => r.record_date === today)
    console.log('[Food] 今日记录数:', todayRecords.length)
  } catch (error) {
    console.error('获取记录失败:', error)
    records.value = []
  } finally {
    tableLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    if (editingId.value) {
      await request.put(`/food/records/${editingId.value}`, form)
      ElMessage.success({ message: '更新成功 ✅', duration: 1500 })
    } else {
      await request.post('/food/records', form)
      ElMessage.success({ message: '添加成功 ✅', duration: 1500 })
    }

    handleReset()
    fetchRecords()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

const handleEdit = (row) => {
  editingId.value = row.id
  // 将字符串转换为数字，处理null值
  const toNumber = (val) => val === null || val === undefined ? 0 : parseFloat(val)

  Object.assign(form, {
    recordDate: row.record_date ? String(row.record_date).split('T')[0] : '',
    mealType: row.meal_type,
    foodName: row.food_name,
    calories: toNumber(row.calories),
    protein: toNumber(row.protein),
    carbs: toNumber(row.carbs),
    fat: toNumber(row.fat),
    notes: row.notes
  })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/food/records/${id}`)
    ElMessage.success({ message: '删除成功 ✅', duration: 1500 })
    fetchRecords()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleReset = () => {
  editingId.value = null
  formRef.value?.resetFields()
  form.recordDate = new Date().toISOString().split('T')[0]
}

onMounted(() => {
  fetchRecords()
  fetchWeather()
})
</script>

<style scoped>
.food-page {
  padding: 0;
}

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.stat-icon {
  font-size: 48px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-card);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.stat-unit {
  font-size: 12px;
  color: var(--color-text-light);
  margin-left: 4px;
}

.stat-trend {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  color: var(--color-success);
}

.stat-trend.up {
  color: var(--color-danger);
}

.stat-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-bg-secondary);
}

.progress-bar {
  height: 100%;
  background: var(--gradient-primary);
  transition: width 0.5s ease;
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

/* 记录列表 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-button);
  padding: 16px;
  transition: all 0.3s ease;
}

.record-item:hover {
  background: #FFF8F0;
  transform: translateX(4px);
}

.record-meal {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.record-date {
  font-size: 12px;
  color: var(--color-text-light);
}

.record-food {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.record-nutrition {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.nutrition-item {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.nutrition-item.calories {
  color: var(--color-primary);
  font-weight: 600;
}

.record-notes {
  font-size: 13px;
  color: var(--color-text-light);
  padding: 8px 12px;
  background: rgba(255, 140, 66, 0.1);
  border-radius: var(--radius-small);
  margin-bottom: 8px;
}

.record-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.record-actions .el-button {
  margin: 0;
}

/* 天气卡片 */
.weather-content {
  padding: 10px 0;
}

.weather-main {
  text-align: center;
  margin-bottom: 20px;
}

.weather-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.weather-temp {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-primary);
}

.weather-desc {
  font-size: 18px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.detail-row .el-icon {
  color: var(--color-primary);
}

/* 地图卡片 */
.map-card {
  height: 450px;
}

.map-card :deep(.el-card__body) {
  height: calc(100% - 57px);
  padding: 0;
}

.map-card :deep(.china-map-wrapper) {
  height: 100%;
}

/* 响应式 */
@media (max-width: 1024px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-section {
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    font-size: 36px;
    width: 48px;
    height: 48px;
  }

  .stat-value {
    font-size: 24px;
  }

  /* 饮食记录手机端优化 */
  .record-item {
    padding: 12px;
  }

  .record-meal {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .record-nutrition {
    flex-wrap: wrap;
    gap: 8px;
  }

  .record-actions {
    flex-direction: column;
    width: 100%;
    gap: 6px;
  }

  .record-actions .el-button {
    width: 100%;
    justify-content: center;
  }

  /* 手机端单列布局 */
  .el-row {
    flex-direction: column !important;
  }

  .el-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }

  /* 隐藏右侧装饰卡片 */
  .weather-card,
  .map-card {
    display: none !important;
  }
}

/* 食物建议列表样式 */
.food-suggestion {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.food-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  min-width: 100px;
}

.food-calories {
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 600;
  margin-left: auto;
}

.food-category {
  font-size: 12px;
  color: var(--color-text-light);
  background: var(--color-bg-secondary);
  padding: 2px 8px;
  border-radius: 4px;
}

/* 表单按钮对齐 */
.el-form-item .el-button {
  margin: 0;
}
</style>
