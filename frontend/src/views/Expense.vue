<template>
  <div class="expense-page fade-in">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div class="stat-card expense-card">
        <div class="stat-icon">💸</div>
        <div class="stat-content">
          <div class="stat-value">¥{{ totalExpense }}</div>
          <div class="stat-label">累计支出</div>
        </div>
      </div>

      <div class="stat-card month-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-value">¥{{ monthExpense }}</div>
          <div class="stat-label">本月支出</div>
        </div>
      </div>

      <div class="stat-card count-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <div class="stat-value">{{ records.length }}</div>
          <div class="stat-label">支出记录</div>
        </div>
      </div>

      <div class="stat-card balance-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-value" :class="balance >= 0 ? 'positive' : 'negative'">
            {{ balance >= 0 ? '+' : '' }}¥{{ balance }}
          </div>
          <div class="stat-label">结余</div>
        </div>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <!-- 添加记录表单 -->
        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">📝 添加支出记录</span>
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
                <el-form-item label="类别" prop="category">
                  <el-select v-model="form.category" placeholder="选择类别" style="width: 100%">
                    <el-option
                      v-for="item in expenseCategories"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="物品名称" prop="itemName">
              <el-autocomplete
                v-model="form.itemName"
                :fetch-suggestions="searchProduct"
                placeholder="输入物品名称（如：大米、拖把）"
                @select="handleProductSelect"
                style="width: 100%"
                :highlight-first-item="true"
              >
                <template #default="{ item }">
                  <div class="product-suggestion">
                    <span class="product-name">{{ item.name }}</span>
                    <span class="product-category">{{ item.category }}</span>
                    <span class="product-price">{{ item.priceRange }}</span>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
            <el-form-item label="金额" prop="amount">
              <el-input-number
                v-model="form.amount"
                :min="0"
                :precision="2"
                placeholder="0.00"
                style="width: 100%"
                controls-position="right"
              >
                <template #prefix>¥</template>
              </el-input-number>
            </el-form-item>
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
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">📋 支出记录</span>
              <el-tag type="info">{{ records.length }} 条</el-tag>
            </div>
          </template>
          <div class="record-list" v-loading="tableLoading">
            <div v-for="record in records" :key="record.id" class="record-item">
              <div class="record-category">
                <el-tag :type="getCategoryTag(record.category)" size="large">
                  {{ getCategoryEmoji(record.category) }} {{ record.category }}
                </el-tag>
                <span class="record-date">{{ record.record_date }}</span>
              </div>
              <div class="record-item-name">{{ record.item_name }}</div>
              <div class="record-amount">
                <span class="amount-value">-¥{{ record.amount }}</span>
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
            <el-empty v-if="!tableLoading && records.length === 0" description="暂无记录，快去添加吧 💸" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 智能建议卡片 -->
        <el-card class="suggestion-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">💡 智能建议</span>
              <el-button text @click="fetchSuggestions" :loading="suggestionLoading">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="suggestion-list" v-loading="suggestionLoading">
            <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item">
              <span class="suggestion-icon">💡</span>
              <span class="suggestion-text">{{ suggestion }}</span>
            </div>
            <el-empty v-if="!suggestionLoading && suggestions.length === 0" description="根据你的消费记录，暂无建议" />
          </div>
        </el-card>

        <!-- 分类统计 -->
        <el-card class="category-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">📊 支出分类</span>
            </div>
          </template>
          <div class="category-list">
            <div v-for="item in categoryStats" :key="item.category" class="category-item">
              <div class="category-info">
                <span class="category-name">{{ getCategoryEmoji(item.category) }} {{ item.category }}</span>
                <span class="category-amount">¥{{ item.total }}</span>
              </div>
              <el-progress
                :percentage="getCategoryPercentage(item.total)"
                :stroke-width="8"
                :show-text="false"
                :color="getCategoryColor(item.category)"
              />
            </div>
            <el-empty v-if="categoryStats.length === 0" description="暂无分类数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { useUserStore } from '../store'
import request from '../utils/request'
import { productDatabase, expenseCategories, incomeCategories } from '../data/productDatabase'

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const tableLoading = ref(false)
const editingId = ref(null)
const records = ref([])
const suggestions = ref([])
const suggestionLoading = ref(false)

const form = reactive({
  recordDate: new Date().toISOString().split('T')[0],
  category: '',
  itemName: '',
  amount: 0,
  notes: ''
})

const rules = {
  recordDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  itemName: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
}

// 累计支出
const totalExpense = computed(() => {
  const total = records.value.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  return total.toFixed(2)
})

// 本月支出
const monthExpense = computed(() => {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthRecords = records.value.filter(r => {
    const date = new Date(r.record_date)
    return date.getMonth() + 1 === month && date.getFullYear() === year
  })
  const total = monthRecords.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  return total.toFixed(2)
})

// 分类统计
const categoryStats = computed(() => {
  const stats = {}
  records.value.forEach(r => {
    if (!stats[r.category]) {
      stats[r.category] = 0
    }
    stats[r.category] += parseFloat(r.amount) || 0
  })
  return Object.entries(stats)
    .map(([category, total]) => ({ category, total: total.toFixed(2) }))
    .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
})

// 结余（需要获取收入）
const balance = computed(() => {
  return 0 // 默认0，实际需要从收入接口获取
})

const getCategoryTag = (category) => {
  const map = {
    '食品': 'success', '日用品': 'warning', '居住': '', '交通': 'info',
    '医疗': 'danger', '服饰': 'success', '娱乐': 'warning', '通讯': 'info',
    '教育': '', '投资': '', '宠物': '', '礼金': 'warning', '其他': 'info'
  }
  return map[category] || ''
}

const getCategoryEmoji = (category) => {
  const map = {
    '食品': '🍎', '日用品': '🧴', '居住': '🏠', '交通': '🚗',
    '医疗': '💊', '服饰': '👔', '娱乐': '🎮', '通讯': '📱',
    '教育': '📚', '投资': '📊', '宠物': '🐾', '礼金': '🎁', '其他': '📦'
  }
  return map[category] || '📦'
}

const getCategoryColor = (category) => {
  const map = {
    '食品': '#67c23a', '日用品': '#e6a23c', '居住': '#909399', '交通': '#409eff',
    '医疗': '#f56c6c', '服饰': '#67c23a', '娱乐': '#e6a23c', '通讯': '#409eff',
    '教育': '#909399', '投资': '#409eff', '宠物': '#f56c6c', '礼金': '#e6a23c', '其他': '#909399'
  }
  return map[category] || '#909399'
}

const getCategoryPercentage = (amount) => {
  const total = parseFloat(totalExpense.value)
  if (total === 0) return 0
  return Math.round((parseFloat(amount) / total) * 100)
}

// 搜索商品
const searchProduct = (queryString, cb) => {
  if (!queryString || queryString.trim().length < 1) {
    cb([])
    return
  }

  const query = queryString.trim().toLowerCase()

  // 搜索匹配的商品
  const results = productDatabase
    .filter(product => {
      return product.name.toLowerCase().includes(query) ||
             product.category.toLowerCase().includes(query)
    })
    .sort((a, b) => {
      if (b.name.toLowerCase() === query) return 1
      if (a.name.toLowerCase() === query) return -1
      if (b.name.toLowerCase().startsWith(query)) return 1
      if (a.name.toLowerCase().startsWith(query)) return -1
      return 0
    })
    .slice(0, 8)
    .map(item => ({ ...item }))

  // 如果没有匹配，生成一些联想词
  if (results.length === 0) {
    const relatedProducts = generateRelatedProducts(queryString)
    if (relatedProducts.length > 0) {
      cb(relatedProducts)
    } else {
      cb([{
        name: '未找到匹配商品，请直接输入',
        category: '',
        priceRange: '',
        isPlaceholder: true
      }])
    }
  } else {
    cb(results)
  }
}

// 生成联想商品
const generateRelatedProducts = (query) => {
  const relatedMap = {
    '牛': [
      { name: '牛奶', category: '食品', priceRange: '3-8元/盒' },
      { name: '牛肉', category: '食品', priceRange: '40-60元/斤' },
      { name: '酸牛奶', category: '食品', priceRange: '5-15元/盒' },
      { name: '牛腩', category: '食品', priceRange: '35-50元/斤' }
    ],
    '羊': [
      { name: '羊肉', category: '食品', priceRange: '40-55元/斤' }
    ],
    '鸡': [
      { name: '鸡肉', category: '食品', priceRange: '15-25元/斤' },
      { name: '鸡翅', category: '食品', priceRange: '20-30元/斤' },
      { name: '鸡腿', category: '食品', priceRange: '18-28元/斤' }
    ],
    '猪': [
      { name: '猪肉', category: '食品', priceRange: '15-25元/斤' },
      { name: '五花肉', category: '食品', priceRange: '18-28元/斤' },
      { name: '排骨', category: '食品', priceRange: '25-35元/斤' }
    ],
    '米': [
      { name: '大米', category: '食品', priceRange: '3-8元/斤' },
      { name: '小米', category: '食品', priceRange: '5-10元/斤' }
    ],
    '面': [
      { name: '面粉', category: '食品', priceRange: '3-6元/斤' },
      { name: '挂面', category: '食品', priceRange: '4-8元/把' },
      { name: '面条', category: '食品', priceRange: '5-10元/包' }
    ],
    '洗': [
      { name: '洗发水', category: '日用品', priceRange: '20-60元' },
      { name: '洗衣液', category: '日用品', priceRange: '15-40元' },
      { name: '洗面奶', category: '日用品', priceRange: '20-50元' }
    ],
    '衣': [
      { name: '衣架', category: '日用品', priceRange: '10-25元' },
      { name: '洗衣液', category: '日用品', priceRange: '15-40元' },
      { name: '衣服', category: '服饰', priceRange: '100-500元' }
    ],
    '拖': [
      { name: '拖把', category: '日用品', priceRange: '15-40元' },
      { name: '拖布', category: '日用品', priceRange: '10-25元' }
    ],
    '扫': [
      { name: '扫把', category: '日用品', priceRange: '10-25元' }
    ],
    '奶': [
      { name: '牛奶', category: '食品', priceRange: '3-8元/盒' },
      { name: '酸奶', category: '食品', priceRange: '5-15元/盒' },
      { name: '酸牛奶', category: '食品', priceRange: '5-15元/盒' }
    ],
    '油': [
      { name: '食用油', category: '食品', priceRange: '10-20元/升' },
      { name: '花生油', category: '食品', priceRange: '20-40元/升' }
    ],
    '纸': [
      { name: '纸巾', category: '日用品', priceRange: '5-20元' },
      { name: '卫生纸', category: '日用品', priceRange: '5-15元' },
      { name: '厨房纸', category: '日用品', priceRange: '8-15元' }
    ]
  }

  for (const [key, products] of Object.entries(relatedMap)) {
    if (query.includes(key)) {
      return products
    }
  }

  return []
}

// 选择商品后自动填充类别
const handleProductSelect = (item) => {
  if (item.isPlaceholder) return
  form.itemName = item.name
  form.category = item.category
  ElMessage.success({ message: `已选择 ${item.name}，参考价：${item.priceRange}`, duration: 1500 })
}

const fetchRecords = async () => {
  try {
    tableLoading.value = true
    const data = await request.get('/expense/records')
    records.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取记录失败:', error)
    records.value = []
  } finally {
    tableLoading.value = false
  }
}

const fetchSuggestions = async () => {
  try {
    suggestionLoading.value = true
    const data = await request.get('/expense/suggestions')
    suggestions.value = data.suggestions || []
  } catch (error) {
    console.error('获取建议失败:', error)
    suggestions.value = []
  } finally {
    suggestionLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    if (editingId.value) {
      await request.put(`/expense/records/${editingId.value}`, form)
      ElMessage.success({ message: '更新成功 ✅', duration: 1500 })
    } else {
      await request.post('/expense/records', form)
      ElMessage.success({ message: '添加成功 ✅', duration: 1500 })
    }

    handleReset()
    fetchRecords()
    fetchSuggestions()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

const handleEdit = (row) => {
  editingId.value = row.id
  Object.assign(form, {
    recordDate: row.record_date ? String(row.record_date).split('T')[0] : '',
    category: row.category,
    itemName: row.item_name,
    amount: parseFloat(row.amount) || 0,
    notes: row.notes || ''
  })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/expense/records/${id}`)
    ElMessage.success({ message: '删除成功 ✅', duration: 1500 })
    fetchRecords()
    fetchSuggestions()
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
  fetchSuggestions()
})
</script>

<style scoped>
.expense-page {
  padding: 0;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 48px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 16px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.stat-value.positive {
  color: #67c23a;
}

.stat-value.negative {
  color: #f56c6c;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.form-card, .list-card, .suggestion-card, .category-card {
  margin-bottom: 20px;
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.record-item:hover {
  background: #f0f0ff;
  transform: translateX(4px);
}

.record-category {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.record-date {
  font-size: 12px;
  color: #999;
}

.record-item-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.record-amount {
  margin-bottom: 8px;
}

.amount-value {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.record-notes {
  font-size: 13px;
  color: #999;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
}

.record-actions {
  display: flex;
  gap: 8px;
}

.record-actions .el-button {
  margin: 0;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  border-radius: 10px;
  border-left: 3px solid #667eea;
}

.suggestion-icon {
  font-size: 18px;
}

.suggestion-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-name {
  font-size: 14px;
  color: #333;
}

.category-amount {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.product-suggestion {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  min-width: 100px;
}

.product-category {
  font-size: 12px;
  color: #667eea;
  background: #f0f0ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.product-price {
  font-size: 13px;
  color: #999;
  margin-left: auto;
}

.el-form-item .el-button {
  margin: 0;
}

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

  .record-item {
    padding: 12px;
  }

  .record-category {
    flex-direction: column;
    align-items: flex-start;
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

  .el-row {
    flex-direction: column !important;
  }

  .el-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
}
</style>
