<template>
  <div class="income-page fade-in">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div class="stat-card income-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-value">¥{{ totalIncome }}</div>
          <div class="stat-label">累计收入</div>
        </div>
      </div>

      <div class="stat-card month-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-value">¥{{ monthIncome }}</div>
          <div class="stat-label">本月收入</div>
        </div>
      </div>

      <div class="stat-card count-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <div class="stat-value">{{ records.length }}</div>
          <div class="stat-label">收入记录</div>
        </div>
      </div>

      <div class="stat-card balance-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value positive">¥{{ totalIncome }}</div>
          <div class="stat-label">总收入</div>
        </div>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <!-- 添加记录表单 -->
        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">📝 添加收入记录</span>
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
                      v-for="item in incomeCategories"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="来源" prop="itemName">
              <el-input
                v-model="form.itemName"
                placeholder="输入收入来源（如：工资、兼职）"
                size="large"
                clearable
              />
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
              <span class="card-title">📋 收入记录</span>
              <el-tag type="success">{{ records.length }} 条</el-tag>
            </div>
          </template>
          <div class="record-list" v-loading="tableLoading">
            <div v-for="record in records" :key="record.id" class="record-item">
              <div class="record-category">
                <el-tag type="success" size="large">
                  {{ getCategoryEmoji(record.category) }} {{ record.category }}
                </el-tag>
                <span class="record-date">{{ record.record_date }}</span>
              </div>
              <div class="record-item-name">{{ record.item_name }}</div>
              <div class="record-amount">
                <span class="amount-value">+¥{{ record.amount }}</span>
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
            <el-empty v-if="!tableLoading && records.length === 0" description="暂无记录，快去添加吧 💰" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 分类统计 -->
        <el-card class="category-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">📊 收入分类</span>
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
                color="#67c23a"
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
import { Edit, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '../store'
import request from '../utils/request'
import { incomeCategories } from '../data/productDatabase'

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const tableLoading = ref(false)
const editingId = ref(null)
const records = ref([])

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
  itemName: [{ required: true, message: '请输入收入来源', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
}

// 累计收入
const totalIncome = computed(() => {
  const total = records.value.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  return total.toFixed(2)
})

// 本月收入
const monthIncome = computed(() => {
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

const getCategoryEmoji = (category) => {
  const map = {
    '工资': '💰', '奖金': '🎁', '补贴': '💵', '兼职': '💼',
    '外快': '💸', '稿费': '✍️', '投资': '📈', '理财': '🏦',
    '礼金': '🎀', '红包': '🧧', '退款': '🔙', '报销': '📋', '其他': '📦'
  }
  return map[category] || '📦'
}

const getCategoryPercentage = (amount) => {
  const total = parseFloat(totalIncome.value)
  if (total === 0) return 0
  return Math.round((parseFloat(amount) / total) * 100)
}

const fetchRecords = async () => {
  try {
    tableLoading.value = true
    const data = await request.get('/income/records')
    records.value = Array.isArray(data) ? data : []
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
      await request.put(`/income/records/${editingId.value}`, form)
      ElMessage.success({ message: '更新成功 ✅', duration: 1500 })
    } else {
      await request.post('/income/records', form)
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

    await request.delete(`/income/records/${id}`)
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
})
</script>

<style scoped>
.income-page {
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
  background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
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
  background: #f0f9f0;
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

.form-card, .list-card, .category-card {
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
  background: #f0f9f0;
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
  color: #67c23a;
}

.record-notes {
  font-size: 13px;
  color: #999;
  padding: 8px 12px;
  background: rgba(103, 194, 58, 0.1);
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
  color: #67c23a;
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
