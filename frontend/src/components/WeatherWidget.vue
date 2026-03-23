<template>
  <div class="weather-widget">
    <div class="weather-display" @click="showDetail = true">
      <span class="weather-icon">{{ weatherIcon }}</span>
      <span class="weather-temp">{{ weather?.temp || '--' }}°C</span>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetail" title="天气详情" width="90%" :modal="true">
      <div v-if="weather" class="weather-detail">
        <div class="detail-main">
          <div class="detail-icon">{{ weatherIcon }}</div>
          <div class="detail-temp">{{ weather.temp }}°C</div>
          <div class="detail-desc">{{ weather.weather }}</div>
        </div>
        <el-divider />
        <div class="detail-info">
          <div class="info-item">
            <el-icon><Location /></el-icon>
            <span>{{ userCity }}</span>
          </div>
          <div class="info-item">
            <el-icon><Drizzling /></el-icon>
            <span>湿度 {{ weather.humidity }}%</span>
          </div>
          <div class="info-item">
            <el-icon><WindPower /></el-icon>
            <span>风速 {{ weather.wind }}级</span>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无天气数据" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Location, Drizzling, WindPower } from '@element-plus/icons-vue'
import { useUserStore } from '../store'
import { useWeatherStore } from '../stores/weatherStore'

const props = defineProps({
  weather: Object
})

const userStore = useUserStore()
const weatherStore = useWeatherStore()

const showDetail = ref(false)

const weatherIcon = computed(() => {
  return props.weather ? weatherStore.getWeatherEmoji(props.weather.weather) : '🌤️'
})

const userCity = computed(() => {
  return userStore.user?.city || '未设置'
})
</script>

<style scoped>
.weather-widget {
  display: flex;
  align-items: center;
}

.weather-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.weather-display:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

.weather-icon {
  font-size: 18px;
}

.weather-temp {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.weather-detail {
  padding: 10px 0;
}

.detail-main {
  text-align: center;
  padding: 20px;
}

.detail-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.detail-temp {
  font-size: 36px;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.detail-desc {
  font-size: 16px;
  color: var(--color-text-secondary);
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--color-text-primary);
}

.info-item .el-icon {
  color: var(--color-primary);
}

/* 桌面端隐藏 */
@media (min-width: 769px) {
  .weather-widget {
    display: none;
  }
}

/* 深色模式 */
.dark .weather-display {
  background: rgba(45, 45, 45, 0.9);
}
</style>
