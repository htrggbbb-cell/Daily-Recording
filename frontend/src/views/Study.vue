<template>
  <div class="study-page fade-in">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div class="stat-card time-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalHours }}</div>
          <div class="stat-label">累计学习</div>
          <div class="stat-unit">小时</div>
        </div>
        <div class="stat-trend">📊</div>
      </div>

      <div class="stat-card week-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-value">{{ weekHours }}</div>
          <div class="stat-label">本周累计</div>
          <div class="stat-unit">小时</div>
        </div>
        <div class="stat-trend" :class="{ up: weekHours >= 20 }">
          {{ weekHours >= 20 ? '🎯' : '💪' }}
        </div>
      </div>

      <div class="stat-card subject-card">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <div class="stat-value">{{ subjectCount }}</div>
          <div class="stat-label">科目数量</div>
          <div class="stat-unit">个</div>
        </div>
        <div class="subject-tags">
          <span v-for="subject in topSubjects" :key="subject" class="mini-tag">{{ subject }}</span>
        </div>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <!-- 添加记录表单 -->
        <el-card class="form-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">📝 添加学习记录</span>
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
                <el-form-item label="科目" prop="subject">
                  <el-select
                    v-model="form.subject"
                    placeholder="选择科目"
                    filterable
                    allow-create
                    style="width: 100%"
                  >
                    <el-option
                      v-for="subject in subjectOptions"
                      :key="subject.value"
                      :label="subject.label"
                      :value="subject.value"
                    >
                      <div class="subject-option">
                        <span class="subject-icon">{{ subject.icon }}</span>
                        <span class="subject-name">{{ subject.label }}</span>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="学习内容" prop="content">
              <el-input v-model="form.content" type="textarea" :rows="3" placeholder="例如：学习Python的requests库，完成网络请求实战" />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="学习时长" prop="studyHours">
                  <el-input-number v-model="form.studyHours" :min="0.5" :max="24" :precision="1" :step="0.5" placeholder="0.5" style="width: 100%" controls-position="right" />
                  <span style="margin-left: 8px; color: var(--color-text-light);">小时</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="难度">
                  <el-select v-model="form.difficulty" placeholder="选择难度" style="width: 100%">
                    <el-option label="⭐ 简单" value="easy" />
                    <el-option label="⭐⭐ 中等" value="medium" />
                    <el-option label="⭐⭐⭐ 困难" value="hard" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="完成度">
                  <el-slider v-model="form.completion" :marks="{ 0: '0%', 50: '50%', 100: '100%' }" :show-tooltip="false" />
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
              <span class="card-title">📋 学习记录</span>
              <el-tag type="info">{{ records.length }} 条</el-tag>
            </div>
          </template>
          <div class="record-list" v-loading="tableLoading">
            <div v-for="record in records" :key="record.id" class="record-item">
              <div class="record-header">
                <div class="record-subject">
                  <span class="subject-badge" :style="{ background: getSubjectColor(record.subject) }">
                    {{ record.subject }}
                  </span>
                  <span class="record-date">{{ formatDate(record.record_date) }}</span>
                </div>
                <div class="record-difficulty">
                  <span v-for="n in getDifficultyStars(record.difficulty)" :key="n" class="star">⭐</span>
                </div>
              </div>
              <div class="record-content">{{ record.content }}</div>
              <div class="record-meta">
                <span class="meta-item time">⏱️ {{ record.study_hours }} 小时</span>
                <span class="meta-item completion">📊 完成度 {{ record.completion || 0 }}%</span>
                <el-progress
                  :percentage="record.completion || 0"
                  :show-text="false"
                  :stroke-width="4"
                  :color="getSubjectColor(record.subject)"
                  style="flex: 1; max-width: 100px;"
                />
              </div>
              <div class="record-notes" v-if="record.notes">📌 {{ record.notes }}</div>
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
            <el-empty v-if="!tableLoading && records.length === 0" description="暂无记录，开始学习吧 📚" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 学习热力图 -->
        <el-card class="heatmap-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">🗓️ 学习热力图</span>
            </div>
          </template>
          <div class="heatmap-content">
            <div class="week-grid">
              <div v-for="(day, index) in weekData" :key="index" class="day-cell" :class="getHeatClass(day.hours)">
                <div class="day-label">{{ day.label }}</div>
                <div class="day-hours">{{ day.hours }}h</div>
              </div>
            </div>
            <div class="heatmap-legend">
              <span class="legend-item"><span class="legend-box empty"></span> 0h</span>
              <span class="legend-item"><span class="legend-box low"></span> 1-2h</span>
              <span class="legend-item"><span class="legend-box medium"></span> 3-5h</span>
              <span class="legend-item"><span class="legend-box high"></span> 6h+</span>
            </div>
          </div>
        </el-card>

        <!-- 科目统计 -->
        <el-card class="subject-stats-card warm-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">📊 科目统计</span>
            </div>
          </template>
          <div class="subject-stats">
            <div v-for="stat in subjectStats" :key="stat.subject" class="subject-stat-item">
              <div class="stat-row">
                <span class="stat-subject">{{ stat.subject }}</span>
                <span class="stat-hours">{{ stat.totalHours }}h</span>
              </div>
              <el-progress
                :percentage="stat.percent"
                :show-text="false"
                :stroke-width="8"
                :color="getSubjectColor(stat.subject)"
              />
              <div class="stat-count">{{ stat.count }} 次记录</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import request from '../utils/request'

const formRef = ref(null)
const loading = ref(false)
const tableLoading = ref(false)
const editingId = ref(null)
const records = ref([])

const form = reactive({
  recordDate: new Date().toISOString().split('T')[0],
  subject: '',
  content: '',
  studyHours: 1,
  difficulty: 'medium',
  completion: 100,
  notes: ''
})

// 科目选项
const subjectOptions = [
  { label: '英语', value: '英语', icon: '🇬🇧', color: '#50C878' },
  { label: '算法', value: '算法', icon: '🧮', color: '#74B9FF' },
  { label: '开发项目', value: '开发项目', icon: '💻', color: '#6C5CE7' },
  { label: '论文', value: '论文', icon: '📄', color: '#E17055' },
  { label: '深度学习', value: '深度学习', icon: '🧠', color: '#9B59B6' },
  { label: '阅读', value: '阅读', icon: '📖', color: '#00B894' },
  { label: '其他', value: '其他', icon: '📝', color: '#95A5A6' }
]

const rules = {
  recordDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  subject: [{ required: true, message: '请输入科目', trigger: 'blur' }],
  content: [{ required: true, message: '请输入学习内容', trigger: 'blur' }],
  studyHours: [
    { required: true, message: '请输入学习时长', trigger: 'blur' },
    { type: 'number', min: 0.5, message: '学习时长至少0.5小时', trigger: 'blur' }
  ]
}

const subjectColors = {
  '英语': '#50C878',
  '算法': '#74B9FF',
  '开发项目': '#6C5CE7',
  '论文': '#E17055',
  '深度学习': '#9B59B6',
  '阅读': '#00B894',
  '其他': '#95A5A6'
}

const getSubjectColor = (subject) => {
  return subjectColors[subject] || '#FF8C42'
}

const getDifficultyStars = (difficulty) => {
  const map = { easy: 1, medium: 2, hard: 3 }
  return map[difficulty] || 2
}

// 格式化日期显示
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  // 处理ISO格式字符串
  const str = String(dateStr)
  if (str.includes('T')) {
    return str.split('T')[0]
  }
  return str
}

const getHeatClass = (hours) => {
  if (hours === 0) return 'empty'
  if (hours < 2) return 'low'
  if (hours < 6) return 'medium'
  return 'high'
}

// 累计统计（所有记录的总和）
const totalHours = computed(() => {
  const total = records.value.reduce((sum, r) => sum + (parseFloat(r.study_hours) || 0), 0)
  console.log('[totalHours] 计算结果:', total, '记录数:', records.value.length)
  return total > 0 ? total.toFixed(1) : '0.0'
})

const todayHours = computed(() => {
  // 使用本地日期避免时区问题
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  // 将record_date转换为YYYY-MM-DD格式进行比较
  const todayRecords = records.value.filter(r => {
    const recordDate = String(r.record_date).split('T')[0]
    return recordDate === today
  })
  console.log('[todayHours] 今日日期:', today, '匹配记录数:', todayRecords.length)
  console.log('[todayHours] 所有记录日期:', records.value.map(r => String(r.record_date).split('T')[0]))

  const total = todayRecords.reduce((sum, r) => sum + (parseFloat(r.study_hours) || 0), 0)
  console.log('[todayHours] 计算结果:', total)
  return total > 0 ? total.toFixed(1) : '0.0'
})

const weekHours = computed(() => {
  const now = new Date()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const total = records.value
    .filter(r => new Date(r.record_date) >= weekAgo)
    .reduce((sum, r) => sum + (parseFloat(r.study_hours) || 0), 0)
  return total > 0 ? total.toFixed(1) : '0.0'
})

const subjectCount = computed(() => {
  const subjects = new Set(records.value.map(r => r.subject))
  return subjects.size
})

const topSubjects = computed(() => {
  const counts = {}
  records.value.forEach(r => {
    counts[r.subject] = (counts[r.subject] || 0) + 1
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([subject]) => subject)
})

const weekData = computed(() => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - i))
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const dayRecords = records.value.filter(r => {
      const recordDate = String(r.record_date).split('T')[0]
      return recordDate === dateStr
    })
    const hours = dayRecords.reduce((sum, r) => sum + (parseFloat(r.study_hours) || 0), 0)
    return {
      label: days[date.getDay()],
      hours: hours.toFixed(1)
    }
  })
})

const subjectStats = computed(() => {
  const stats = {}
  const totalHours = records.value.reduce((sum, r) => sum + (r.study_hours || 0), 0)

  records.value.forEach(r => {
    if (!stats[r.subject]) {
      stats[r.subject] = { subject: r.subject, totalHours: 0, count: 0 }
    }
    stats[r.subject].totalHours += (r.study_hours || 0)
    stats[r.subject].count += 1
  })

  return Object.values(stats)
    .map(stat => ({
      ...stat,
      percent: totalHours > 0 ? (stat.totalHours / totalHours * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.totalHours - a.totalHours)
})

const fetchRecords = async () => {
  try {
    tableLoading.value = true
    const data = await request.get('/study/records')
    records.value = Array.isArray(data) ? data : []
    console.log('获取到记录:', records.value.length)
    console.log('记录数据:', JSON.stringify(records.value, null, 2))

    // 调试：显示今日日期和匹配的记录
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    console.log('今日日期:', today)
    const todayRecords = records.value.filter(r => r.record_date === today)
    console.log('今日记录数:', todayRecords.length)
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
      await request.put(`/study/records/${editingId.value}`, form)
      ElMessage.success('更新成功 ✅')
    } else {
      await request.post('/study/records', form)
      ElMessage.success('添加成功 ✅')
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
  console.log('[handleEdit] 编辑记录:', row)
  editingId.value = row.id
  // 将字符串转换为数字，处理null值
  const toNumber = (val) => val === null || val === undefined ? 0 : parseFloat(val)

  Object.assign(form, {
    recordDate: row.record_date ? String(row.record_date).split('T')[0] : '',
    subject: row.subject,
    content: row.content,
    studyHours: toNumber(row.study_hours),
    difficulty: row.difficulty,
    completion: toNumber(row.completion) || 100,
    notes: row.notes
  })
  console.log('[handleEdit] 表单数据:', JSON.parse(JSON.stringify(form)))
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/study/records/${id}`)
    ElMessage.success('删除成功 ✅')
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
  form.completion = 100
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.study-page {
  padding: 0;
}

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.stat-ring {
  width: 48px;
  height: 48px;
}

.stat-ring svg {
  transform: rotate(-90deg);
}

.stat-trend {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
}

.subject-tags {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  color: var(--color-text-secondary);
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

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.record-subject {
  display: flex;
  align-items: center;
  gap: 10px;
}

.subject-badge {
  padding: 4px 12px;
  border-radius: var(--radius-tag);
  color: white;
  font-size: 13px;
  font-weight: 500;
}

.record-date {
  font-size: 12px;
  color: var(--color-text-light);
}

.record-difficulty {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 12px;
}

.record-content {
  font-size: 15px;
  color: var(--color-text-primary);
  margin-bottom: 10px;
  line-height: 1.5;
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.meta-item {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.record-notes {
  font-size: 13px;
  color: var(--color-text-secondary);
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

/* 热力图 */
.heatmap-content {
  padding: 10px 0;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.day-cell {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: transform 0.2s ease;
  min-height: 60px;
}

.day-cell:hover {
  transform: scale(1.1);
}

.day-cell.empty { background: #f5f5f5; color: #666; }
.day-cell.low { background: #ffe8cc; color: #333; }
.day-cell.medium { background: #ffb347; color: #fff; }
.day-cell.high { background: #ff8c42; color: #fff; }

.day-label {
  font-size: 11px;
  margin-bottom: 2px;
  font-weight: 500;
}

.day-hours {
  font-weight: 700;
  font-size: 13px;
}

.heatmap-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 11px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.legend-box {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-box.empty { background: #f5f5f5; }
.legend-box.low { background: #ffe8cc; }
.legend-box.medium { background: #ffb347; }
.legend-box.high { background: #ff8c42; }

/* 科目统计 */
.subject-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.subject-stat-item {
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-button);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.stat-subject {
  font-weight: 500;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.stat-hours {
  font-weight: 600;
  color: var(--color-primary);
  flex-shrink: 0;
}

.stat-count {
  font-size: 12px;
  color: var(--color-text-light);
  margin-top: 4px;
}

/* 科目选择样式 */
.subject-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.subject-option .subject-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border-radius: 8px;
}

.subject-option .subject-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

/* 下拉选项悬停效果 */
.el-select-dropdown__item:hover .subject-option {
  background: transparent;
}

/* 响应式 */
@media (max-width: 1024px) {
  .stats-section {
    grid-template-columns: 1fr;
  }

  .stat-row {
    flex-wrap: wrap;
  }

  .stat-subject {
    flex: 1;
    min-width: 80px;
  }

  .stat-hours {
    font-size: 14px;
  }

  .day-cell {
    min-height: 50px;
  }

  .day-label {
    font-size: 10px;
  }

  .day-hours {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .week-grid {
    gap: 4px;
  }

  .day-cell {
    min-height: 45px;
  }

  .day-label {
    font-size: 9px;
  }

  .day-hours {
    font-size: 11px;
  }

  .heatmap-legend {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    font-size: 10px;
  }

  /* 学习记录手机端优化 */
  .record-item {
    padding: 12px;
  }

  .record-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .record-difficulty {
    align-self: flex-end;
  }

  .record-meta {
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

  .el-progress {
    max-width: 100% !important;
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
  .heatmap-card,
  .subject-stats-card {
    display: none !important;
  }
}

/* 表单按钮对齐 */
.el-form-item .el-button {
  margin: 0;
}
</style>
