<template>
  <div class="records-page fade-in">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div class="stat-card expense-card">
        <div class="stat-icon">💸</div>
        <div class="stat-content">
          <div class="stat-value expense">-¥{{ totalExpense }}</div>
          <div class="stat-label">累计支出</div>
        </div>
      </div>

      <div class="stat-card income-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-value income">+¥{{ totalIncome }}</div>
          <div class="stat-label">累计收入</div>
        </div>
      </div>

      <div class="stat-card balance-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value" :class="balance >= 0 ? 'income' : 'expense'">
            {{ balance >= 0 ? '+' : '' }}¥{{ balance }}
          </div>
          <div class="stat-label">结余</div>
        </div>
      </div>

      <div class="stat-card count-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <div class="stat-value">{{ expenseRecords.length + incomeRecords.length }}</div>
          <div class="stat-label">总记录</div>
        </div>
      </div>
    </div>

    <!-- 添加记录表单 -->
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">📝 添加记录</span>
          <el-radio-group v-model="recordType" size="small">
            <el-radio-button value="expense">支出</el-radio-button>
            <el-radio-button value="income">收入</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="6">
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
          <el-col :span="6">
            <el-form-item :label="recordType === 'expense' ? '类别' : '来源'" prop="category">
              <el-select v-model="form.category" placeholder="选择" style="width: 100%">
                <el-option
                  v-for="item in (recordType === 'expense' ? expenseCategories : incomeCategories)"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label="recordType === 'expense' ? '物品名称' : '来源'" prop="itemName">
              <el-autocomplete
                v-if="recordType === 'expense'"
                v-model="form.itemName"
                :fetch-suggestions="searchProduct"
                placeholder="输入物品"
                @select="handleProductSelect"
                style="width: 100%"
              >
                <template #default="{ item }">
                  <span>{{ item.name }}</span>
                  <span class="cat-tag">{{ item.category }}</span>
                </template>
              </el-autocomplete>
              <el-input v-else v-model="form.itemName" placeholder="输入来源" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="金额" prop="amount">
              <el-input
                v-model.number="form.amount"
                type="number"
                :min="0"
                placeholder="0.00"
                style="width: 100%"
                @focus="handleAmountFocus"
              >
                <template #prefix>¥</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="1" placeholder="备注（可选）" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading" size="default">
            {{ editingId ? '更新' : '添加' }}
          </el-button>
          <el-button @click="handleReset" size="default">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20">
      <!-- 日历视图 -->
      <el-col :span="16">
        <el-card class="calendar-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">📅 {{ currentYear }}年 {{ currentMonth }}月</span>
              <div class="calendar-nav">
                <el-button text @click="prevMonth">
                  <el-icon><ArrowLeft /></el-icon>
                </el-button>
                <el-button @click="goToday">今天</el-button>
                <el-button text @click="nextMonth">
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          <div class="calendar-grid">
            <div class="calendar-header">
              <span v-for="day in ['日','一','二','三','四','五','六']" :key="day">{{ day }}</span>
            </div>
            <div class="calendar-days">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="calendar-day"
                :class="{
                  'other-month': !day.isCurrentMonth,
                  'today': day.isToday,
                  'has-record': day.dailyBalance !== 0
                }"
              >
                <span class="day-number">{{ day.date }}</span>
                <div v-if="day.dailyBalance !== 0" class="day-balance" :class="day.dailyBalance >= 0 ? 'income' : 'expense'">
                  {{ day.dailyBalance >= 0 ? '+¥' : '-¥' }}{{ Math.abs(day.dailyBalance).toFixed(0) }}
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧统计 -->
      <el-col :span="8">
        <!-- 智能建议 -->
        <el-card class="suggestion-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">💡 智能建议</span>
              <el-button text @click="fetchSuggestions">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="suggestion-list">
            <div v-for="(s, i) in suggestions" :key="i" class="suggestion-item">
              {{ s }}
            </div>
            <el-empty v-if="suggestions.length === 0" description="暂无建议" :image-size="60" />
          </div>
        </el-card>

        <!-- 分类统计 -->
        <el-card class="category-card">
          <template #header>
            <span class="card-title">📊 支出分类</span>
          </template>
          <div class="category-list">
            <div v-for="item in expenseByCategory" :key="item.category" class="category-item">
              <div class="cat-info">
                <span>{{ getCategoryEmoji(item.category, 'expense') }} {{ item.category }}</span>
                <span class="cat-amount expense">¥{{ item.total }}</span>
              </div>
              <el-progress
                :percentage="getPercentage(item.total, totalExpense)"
                :stroke-width="6"
                :show-text="false"
                color="#f56c6c"
              />
            </div>
          </div>
        </el-card>

        <el-card class="category-card">
          <template #header>
            <span class="card-title">📊 收入分类</span>
          </template>
          <div class="category-list">
            <div v-for="item in incomeByCategory" :key="item.category" class="category-item">
              <div class="cat-info">
                <span>{{ getCategoryEmoji(item.category, 'income') }} {{ item.category }}</span>
                <span class="cat-amount income">¥{{ item.total }}</span>
              </div>
              <el-progress
                :percentage="getPercentage(item.total, totalIncome)"
                :stroke-width="6"
                :show-text="false"
                color="#67c23a"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 记录列表 -->
    <el-card class="records-list-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">📋 记录明细</span>
          <el-radio-group v-model="filterType" size="small">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="expense">支出</el-radio-button>
            <el-radio-button value="income">收入</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div class="record-list">
        <div v-for="record in filteredRecords" :key="record.id + record.type" class="record-item">
          <div class="record-type-icon">
            <span :class="record.type === 'expense' ? 'expense' : 'income'">
              {{ record.type === 'expense' ? '💸' : '💰' }}
            </span>
          </div>
          <div class="record-info">
            <div class="record-main">
              <el-tag size="small" :type="record.type === 'expense' ? 'danger' : 'success'">
                {{ record.category }}
              </el-tag>
              <span class="record-name">{{ record.itemName }}</span>
            </div>
            <div class="record-meta">
              <span class="record-date">{{ record.recordDate }}</span>
              <span v-if="record.notes" class="record-notes">{{ record.notes }}</span>
            </div>
          </div>
          <div class="record-amount" :class="record.type === 'expense' ? 'expense' : 'income'">
            {{ record.type === 'expense' ? '-' : '+' }}¥{{ record.amount }}
          </div>
          <div class="record-actions">
            <el-button size="small" text @click="handleEdit(record)">编辑</el-button>
            <el-button size="small" text type="danger" @click="handleDelete(record)">删除</el-button>
          </div>
        </div>
        <el-empty v-if="filteredRecords.length === 0" description="暂无记录" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ArrowLeft, ArrowRight, Refresh } from '@element-plus/icons-vue'
import { useUserStore } from '../store'
import request from '../utils/request'
import { productDatabase, expenseCategories, incomeCategories } from '../data/productDatabase'

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const recordType = ref('expense')
const filterType = ref('all')
const editingId = ref(null)
const editingType = ref(null)

const expenseRecords = ref([])
const incomeRecords = ref([])
const suggestions = ref([])

// 当前查看的月份
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)

const form = reactive({
  recordDate: new Date().toISOString().split('T')[0],
  category: '',
  itemName: '',
  amount: null,
  notes: ''
})

// 金额聚焦时清空
const handleAmountFocus = () => {
  if (form.amount === 0 || form.amount === null) {
    form.amount = null
  }
}

const rules = {
  recordDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  itemName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }, { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }]
}

// 计算属性
const totalExpense = computed(() => {
  return expenseRecords.value.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0).toFixed(2)
})

const totalIncome = computed(() => {
  return incomeRecords.value.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0).toFixed(2)
})

const balance = computed(() => {
  return (parseFloat(totalIncome.value) - parseFloat(totalExpense.value)).toFixed(2)
})

const expenseByCategory = computed(() => {
  const map = {}
  expenseRecords.value.forEach(r => {
    if (!map[r.category]) map[r.category] = 0
    map[r.category] += parseFloat(r.amount || 0)
  })
  return Object.entries(map)
    .map(([category, total]) => ({ category, total: total.toFixed(2) }))
    .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
})

const incomeByCategory = computed(() => {
  const map = {}
  incomeRecords.value.forEach(r => {
    if (!map[r.category]) map[r.category] = 0
    map[r.category] += parseFloat(r.amount || 0)
  })
  return Object.entries(map)
    .map(([category, total]) => ({ category, total: total.toFixed(2) }))
    .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
})

// 日历数据
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()

  const days = []

  // 上个月的天数
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      date: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
      totalExpense: 0,
      totalIncome: 0,
      dailyBalance: 0
    })
  }

  // 当前月的天数
  const today = new Date()

  // 转换记录日期为本地日期字符串
  const getLocalDate = (record) => {
    if (!record.record_date) return ''
    const d = new Date(record.record_date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const dayExpense = expenseRecords.value
      .filter(r => getLocalDate(r) === dateStr)
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)
    const dayIncome = incomeRecords.value
      .filter(r => getLocalDate(r) === dateStr)
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)

    const balance = dayIncome - dayExpense

    days.push({
      date: i,
      dateStr,
      isCurrentMonth: true,
      isToday: today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === i,
      totalExpense: dayExpense,
      totalIncome: dayIncome,
      dailyBalance: balance
    })
  }

  // 下个月的天数补齐到42天
  while (days.length < 42) {
    days.push({
      date: days.length - firstDay - daysInMonth + 1,
      isCurrentMonth: false,
      isToday: false,
      totalExpense: 0,
      totalIncome: 0,
      dailyBalance: 0
    })
  }

  return days
})

// 合并的记录列表
const allRecords = computed(() => {
  const getLocalDate = (record) => {
    if (!record.record_date) return ''
    const d = new Date(record.record_date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const expense = expenseRecords.value.map(r => ({
    ...r,
    type: 'expense',
    itemName: r.item_name,
    recordDate: getLocalDate(r)
  }))
  const income = incomeRecords.value.map(r => ({
    ...r,
    type: 'income',
    itemName: r.item_name,
    recordDate: getLocalDate(r)
  }))
  return [...expense, ...income].sort((a, b) => b.recordDate.localeCompare(a.recordDate))
})

const filteredRecords = computed(() => {
  if (filterType.value === 'all') return allRecords.value
  return allRecords.value.filter(r => r.type === filterType.value)
})

// 方法
const searchProduct = (query, cb) => {
  if (!query) { cb([]); return }
  const results = productDatabase
    .filter(p => p.name.includes(query) || p.category.includes(query))
    .slice(0, 6)
  cb(results)
}

const handleProductSelect = (item) => {
  form.itemName = item.name
  form.category = item.category
}

const getCategoryEmoji = (cat, type) => {
  const emojis = {
    expense: { '食品': '🍎', '日用品': '🧴', '居住': '🏠', '交通': '🚗', '医疗': '💊', '服饰': '👔', '娱乐': '🎮', '通讯': '📱', '教育': '📚', '投资': '📊', '宠物': '🐾', '礼金': '🎁', '其他': '📦' },
    income: { '工资': '💰', '奖金': '🎁', '补贴': '💵', '兼职': '💼', '外快': '💸', '稿费': '✍️', '投资': '📈', '理财': '🏦', '礼金': '🎀', '红包': '🧧', '退款': '🔙', '报销': '📋', '其他': '📦' }
  }
  return emojis[type]?.[cat] || '📦'
}

const getPercentage = (amount, total) => {
  if (!total || parseFloat(total) === 0) return 0
  return Math.round((parseFloat(amount) / parseFloat(total)) * 100)
}

const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const goToday = () => {
  const now = new Date()
  currentYear.value = now.getFullYear()
  currentMonth.value = now.getMonth() + 1
}

const fetchData = async () => {
  try {
    const [expense, income] = await Promise.all([
      request.get('/expense/records').catch(() => []),
      request.get('/income/records').catch(() => [])
    ])
    expenseRecords.value = Array.isArray(expense) ? expense : []
    incomeRecords.value = Array.isArray(income) ? income : []
  } catch (e) {
    console.error('获取数据失败', e)
  }
}

const fetchSuggestions = async () => {
  try {
    const data = await request.get('/expense/suggestions')
    suggestions.value = data.suggestions || []
  } catch (e) {
    suggestions.value = []
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const api = recordType.value === 'expense' ? '/expense' : '/income'
    const payload = {
      category: form.category,
      itemName: form.itemName,
      amount: form.amount,
      recordDate: form.recordDate,
      notes: form.notes
    }

    if (editingId.value) {
      await request.put(`${api}/records/${editingId.value}`, payload)
    } else {
      await request.post(`${api}/records`, payload)
    }

    ElMessage.success('添加成功')
    handleReset()
    fetchData()
    fetchSuggestions()
  } catch (e) {
    console.error('提交失败', e)
  } finally {
    loading.value = false
  }
}

const handleEdit = (record) => {
  editingId.value = record.id
  editingType.value = record.type
  recordType.value = record.type
  Object.assign(form, {
    recordDate: record.recordDate,
    category: record.category,
    itemName: record.itemName,
    amount: parseFloat(record.amount) || null,
    notes: record.notes || ''
  })
}

const handleDelete = async (record) => {
  try {
    await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
    const api = record.type === 'expense' ? '/expense' : '/income'
    await request.delete(`${api}/records/${record.id}`)
    ElMessage.success('已删除')
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error('删除失败', e)
  }
}

const handleReset = () => {
  editingId.value = null
  editingType.value = null
  formRef.value?.resetFields()
  form.recordDate = new Date().toISOString().split('T')[0]
  form.amount = null
}

onMounted(() => {
  fetchData()
  fetchSuggestions()
})
</script>

<style scoped>
.records-page { padding: 0; }

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon { font-size: 36px; }

.stat-value {
  font-size: 22px;
  font-weight: 700;
}

.stat-value.expense { color: #f56c6c; }
.stat-value.income { color: #67c23a; }

.stat-label { font-size: 13px; color: #999; margin-top: 2px; }

.form-card, .calendar-card, .suggestion-card, .category-card, .records-list-card {
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title { font-size: 15px; font-weight: 600; color: #333; }

/* 日历 */
.calendar-nav { display: flex; align-items: center; gap: 8px; }

.calendar-grid { font-size: 13px; }

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  padding: 8px 0;
  color: #999;
  font-weight: 500;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  min-height: 60px;
  padding: 6px;
  border-radius: 8px;
  background: #fafafa;
  text-align: center;
}

.calendar-day.other-month { background: transparent; color: #ccc; }
.calendar-day.today { background: #e8f4ff; }

.day-number { font-weight: 600; color: #333; }

.day-balance {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 600;
}

.day-balance.expense { color: #f56c6c; }
.day-balance.income { color: #67c23a; }

/* 建议 */
.suggestion-list { display: flex; flex-direction: column; gap: 8px; }

.suggestion-item {
  padding: 10px 12px;
  background: linear-gradient(135deg, #667eea20, #764ba220);
  border-radius: 8px;
  border-left: 3px solid #667eea;
  font-size: 13px;
  color: #333;
}

/* 分类 */
.category-list { display: flex; flex-direction: column; gap: 12px; }

.cat-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
}

.cat-amount { font-weight: 600; }
.cat-amount.expense { color: #f56c6c; }
.cat-amount.income { color: #67c23a; }

/* 记录列表 */
.record-list { display: flex; flex-direction: column; gap: 10px; }

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 10px;
}

.record-type-icon { font-size: 24px; }

.record-info { flex: 1; }

.record-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.record-name { font-weight: 500; color: #333; }

.record-meta { font-size: 12px; color: #999; }
.record-notes { margin-left: 8px; }

.record-amount {
  font-size: 16px;
  font-weight: 700;
}

.record-amount.expense { color: #f56c6c; }
.record-amount.income { color: #67c23a; }

.record-actions { display: flex; gap: 4px; }

.cat-tag {
  margin-left: 8px;
  font-size: 11px;
  color: #999;
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
}

@media (max-width: 1024px) {
  .stats-section { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .el-row { flex-direction: column; }
  .el-col { width: 100% !important; max-width: 100% !important; }
  .stats-section { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .stat-card { padding: 14px; }
  .stat-value { font-size: 18px; }
  .calendar-day { min-height: 50px; }
}
</style>
