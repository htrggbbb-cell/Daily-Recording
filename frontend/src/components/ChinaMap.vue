<template>
  <div class="china-map-wrapper">
    <div v-if="loading" class="map-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    <div v-else-if="error" class="map-error">
      <el-icon><Warning /></el-icon>
      <span>{{ error }}</span>
    </div>
    <div v-show="!loading && !error" ref="mapRef" class="map-container"></div>
    <div class="map-legend">
      <div class="legend-title">📍 {{ userLocation?.name || '未设置' }}</div>
      <div class="legend-temp" v-if="weather">
        <span class="temp-icon">{{ getWeatherEmoji(weather.weather) }}</span>
        <span class="temp-value">{{ weather.temp || '--' }}°C</span>
      </div>
      <div class="legend-temp" v-else>
        <span class="temp-value">加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Loading, Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { MapChart } from 'echarts/charts'
import { VisualMapComponent, TooltipComponent, GeoComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { getProvinceCityWeatherData } from '../utils/weather'

echarts.use([MapChart, VisualMapComponent, TooltipComponent, GeoComponent, CanvasRenderer])

const props = defineProps({
  userLocation: {
    type: Object,
    default: () => ({ name: '北京', lat: 39.9042, lng: 116.4074 })
  },
  weather: {
    type: Object,
    default: () => ({ temp: 25, humidity: 60, weather: '晴' })
  }
})

const mapRef = ref(null)
const loading = ref(true)
const error = ref(null)
const cityWeatherData = ref([])
let chart = null
let resizeTimer = null

// 省份代码映射（保留用于其他逻辑）
const provinceAdCode = {
  '北京': '110000', '上海': '310000', '天津': '120000', '重庆': '500000',
  '河北': '130000', '山西': '140000', '内蒙古': '150000', '辽宁': '210000',
  '吉林': '220000', '黑龙江': '230000', '江苏': '320000', '浙江': '330000',
  '安徽': '340000', '福建': '350000', '江西': '360000', '山东': '370000',
  '河南': '410000', '湖北': '420000', '湖南': '430000', '广东': '440000',
  '广西': '450000', '海南': '460000', '四川': '510000', '贵州': '520000',
  '云南': '530000', '西藏': '540000', '陕西': '610000', '甘肃': '620000',
  '青海': '630000', '宁夏': '640000', '新疆': '650000'
}

// 省份名→ECharts地图文件名映射（用于ECharts CDN）
const provinceFileName = {
  '北京': 'beijing', '上海': 'shanghai', '天津': 'tianjin', '重庆': 'chongqing',
  '河北': 'hebei', '山西': 'shanxi', '内蒙古': 'neimenggu', '辽宁': 'liaoning',
  '吉林': 'jilin', '黑龙江': 'heilongjiang', '江苏': 'jiangsu', '浙江': 'zhejiang',
  '安徽': 'anhui', '福建': 'fujian', '江西': 'jiangxi', '山东': 'shandong',
  '河南': 'henan', '湖北': 'hubei', '湖南': 'hunan', '广东': 'guangdong',
  '广西': 'guangxi', '海南': 'hainan', '四川': 'sichuan', '贵州': 'guizhou',
  '云南': 'yunnan', '西藏': 'xizang', '陕西': 'shaanxi', '甘肃': 'gansu',
  '青海': 'qinghai', '宁夏': 'ningxia', '新疆': 'xinjiang',
  '台湾': 'taiwan', '香港': 'xianggang', '澳门': 'aomen'
}

// 中国地图温度数据（使用真实天气数据）
const chinaTempData = ref([])

const getWeatherEmoji = (weather) => {
  const map = {
    '晴': '☀️', '多云': '⛅', '阴': '☁️',
    '小雨': '🌧️', '中雨': '🌧️', '大雨': '⛈️',
    '雪': '❄️', '雾': '🌫️'
  }
  return map[weather] || '🌤️'
}

// 根据用户城市匹配省份
const matchProvince = (cityName) => {
  // 城市到省份的映射
  const cityToProvince = {
    '北京': '北京', '上海': '上海', '天津': '天津', '重庆': '重庆',
    '南京': '江苏', '苏州': '江苏', '无锡': '江苏', '常州': '江苏',
    '镇江': '江苏', '扬州': '江苏', '南通': '江苏', '连云港': '江苏',
    '淮安': '江苏', '盐城': '江苏', '泰州': '江苏', '宿迁': '江苏',
    '徐州': '江苏',
    '杭州': '浙江', '宁波': '浙江', '温州': '浙江', '嘉兴': '浙江',
    '湖州': '浙江', '绍兴': '浙江', '金华': '浙江', '衢州': '浙江',
    '舟山': '浙江', '台州': '浙江', '丽水': '浙江',
    '广州': '广东', '深圳': '广东', '珠海': '广东', '汕头': '广东',
    '佛山': '广东', '东莞': '广东', '中山': '广东', '惠州': '广东',
    '江门': '广东', '茂名': '广东', '湛江': '广东',
    '成都': '四川', '绵阳': '四川', '自贡': '四川',
    '武汉': '湖北', '宜昌': '湖北', '襄阳': '湖北',
    '西安': '陕西', '济南': '山东', '青岛': '山东',
    '沈阳': '辽宁', '大连': '辽宁', '长沙': '湖南',
    '哈尔滨': '黑龙江', '长春': '吉林', '福州': '福建',
    '合肥': '安徽', '南昌': '江西', '郑州': '河南',
    '太原': '山西', '石家庄': '河北', '呼和浩特': '内蒙古'
  }

  return cityToProvince[cityName] || null
}

// 辅助函数：将城市名转换为地图区域名
const toMapRegionName = (cityName, provinceName) => {
  // 特殊处理直辖市
  if (['北京', '上海', '天津', '重庆'].includes(cityName)) {
    return cityName + '市'
  }
  // 内蒙古、广西、西藏、宁夏、新疆等自治区特殊处理
  if (provinceName === '内蒙古') return cityName
  if (provinceName === '广西') return cityName + '市'
  if (provinceName === '西藏') return cityName + '地区'
  if (provinceName === '宁夏') return cityName + '市'
  if (provinceName === '新疆') return cityName + '地区'  // 或 '州'

  // 普通地级市加"市"后缀
  return cityName + '市'
}

const initMap = async () => {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 200))

  loading.value = true
  error.value = null

  console.log('[ChinaMap] props.userLocation:', props.userLocation)
  console.log('[ChinaMap] props.weather:', props.weather)

  if (!mapRef.value) {
    error.value = '地图容器未找到'
    loading.value = false
    return
  }

  try {
    if (chart) {
      chart.dispose()
    }

    chart = echarts.init(mapRef.value)

    const userCity = props.userLocation?.name || '北京'
    const lat = props.userLocation?.lat || 39.9042
    const lng = props.userLocation?.lng || 116.4074
    const temp = props.weather?.temp || 25

    console.log('[ChinaMap] 城市温度:', userCity, temp)

    // 匹配用户所在省份
    let matchedProvince = matchProvince(userCity)
    let useProvinceMap = false
    let mapName = 'china'

    if (matchedProvince && provinceFileName[matchedProvince]) {
      try {
        // 使用ECharts官方CDN加载省级地图
        const fileName = provinceFileName[matchedProvince]
        const provResponse = await fetch(`https://fastly.jsdelivr.net/npm/echarts@4.9.0/map/json/province/${fileName}.json`)
        if (provResponse.ok) {
          const provData = await provResponse.json()
          echarts.registerMap('province', provData)
          useProvinceMap = true
          mapName = 'province'

          // 获取省内城市温度数据
          loading.value = true
          console.log('[ChinaMap] 开始获取省内城市天气数据，省份:', matchedProvince)
          cityWeatherData.value = await getProvinceCityWeatherData(matchedProvince)
          console.log('[ChinaMap] 获取到城市天气数据，数量:', cityWeatherData.value.length)
          console.log('[ChinaMap] 城市天气数据详情:', JSON.stringify(cityWeatherData.value, null, 2))

          // 调试：检查城市名映射
          const mappedData = cityWeatherData.value.map(d => ({
            original: d.name,
            mapped: toMapRegionName(d.name, matchedProvince),
            temp: d.temp
          }))
          console.log('[ChinaMap] 城市名映射:', JSON.stringify(mappedData, null, 2))
        }
      } catch (e) {
        console.log('无法加载省级地图，使用中国地图:', e)
      }
    }

    if (!useProvinceMap) {
      // 使用ECharts官方CDN加载中国地图
      const chinaResponse = await fetch('https://fastly.jsdelivr.net/npm/echarts@4.9.0/map/json/china.json')
      if (!chinaResponse.ok) throw new Error('地图数据加载失败')
      const chinaData = await chinaResponse.json()
      echarts.registerMap('china', chinaData)
    }

    // 计算省份中心点（用于地图自动居中）
    let provinceCenter = null
    let provinceZoom = 1

    if (useProvinceMap && cityWeatherData.value.length > 0) {
      // 使用城市坐标的平均值作为省份中心
      const { provinceCities } = await import('../data/provinceCities.js')
      const cities = provinceCities[matchedProvince] || []
      if (cities.length > 0) {
        const avgLat = cities.reduce((sum, c) => sum + c.lat, 0) / cities.length
        const avgLng = cities.reduce((sum, c) => sum + c.lng, 0) / cities.length
        provinceCenter = [avgLng, avgLat]
        provinceZoom = 1.0  // 省级地图缩放级别
        console.log('[ChinaMap] 省份中心:', matchedProvince, provinceCenter)
      }
    }

    // 配置visualMap和tooltip
    const visualConfig = useProvinceMap && cityWeatherData.value.length > 0 ? {
      visualMap: {
        min: Math.min(...cityWeatherData.value.map(d => d.temp)),
        max: Math.max(...cityWeatherData.value.map(d => d.temp)),
        text: ['高温', '低温'],
        calculable: true,
        inRange: {
          color: ['#50a3ba', '#eac736', '#d94e5d']
        },
        textStyle: { fontSize: 10 },
        left: 'left',
        bottom: '10px'
      }
    } : {}

    // 构建series数组
    const series = [
      {
        name: useProvinceMap ? matchedProvince : '中国',
        type: 'map',
        map: mapName,
        roam: true,
        scaleLimit: { min: 0.8, max: 3 },
        // 省级地图自动居中
        ...(useProvinceMap && provinceCenter ? {
          center: provinceCenter,
          zoom: provinceZoom
        } : {}),
        label: {
          show: true,
          fontSize: useProvinceMap ? 10 : 9,
          color: '#333'
        },
        itemStyle: {
          borderColor: '#999',
          borderWidth: 0.5,
          // 省级地图有温度数据时，不设置固定颜色，让 visualMap 控制热力图颜色
          ...(useProvinceMap && cityWeatherData.value.length > 0 ? {} : { areaColor: '#f3f3f3' })
        },
        emphasis: {
          label: { show: true },
          itemStyle: { areaColor: '#FFB347' }
        },
        // 省级地图显示城市温度数据
        data: useProvinceMap ? cityWeatherData.value.map(d => ({
          name: toMapRegionName(d.name, matchedProvince),
          value: d.temp
        })) : []
      }
    ]

    // 只有中国地图才显示effectScatter
    if (!useProvinceMap) {
      series.push({
        name: '当前位置',
        type: 'effectScatter',
        coordinateSystem: 'map', // 使用 map 坐标系而不是 geo
        data: [{ name: userCity, value: [lng, lat, temp] }],
        symbolSize: 18,
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 4 },
        itemStyle: {
          color: '#E74C3C',
          shadowBlur: 10,
          shadowColor: '#E74C3C'
        },
        label: {
          formatter: `${userCity}\n${temp}°C`,
          position: 'right',
          show: true,
          fontSize: 12,
          color: '#E74C3C',
          fontWeight: 'bold'
        }
      })
    }

    const option = {
      ...visualConfig,
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (params.seriesType === 'effectScatter') {
            return `${params.name}<br/>${temp}°C`
          }
          if (useProvinceMap && params.seriesType === 'map') {
            // 从地图区域名反查原始城市名
            const cityData = cityWeatherData.value.find(d =>
              toMapRegionName(d.name, matchedProvince) === params.name
            )
            if (cityData && cityData.temp !== null) {
              return `${cityData.name}<br/>温度: ${cityData.temp}°C`
            }
          }
          return `${params.name}`
        },
        textStyle: { fontSize: 12 }
      },
      series
    }

    chart.setOption(option, true) // true表示不合并，完全重新设置

    chart.setOption(option, true) // true表示不合并，完全重新设置
    setTimeout(() => chart.resize(), 300)
    loading.value = false
    console.log('地图加载成功，显示:', useProvinceMap ? matchedProvince : '中国')
    console.log('城市天气数据:', cityWeatherData.value)

  } catch (err) {
    console.error('地图加载失败:', err)
    error.value = '地图加载失败'
    loading.value = false
  }
}

const handleResize = () => {
  if (chart) {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => chart.resize(), 100)
  }
}

onMounted(() => {
  console.log('[ChinaMap] onMounted - props.weather:', props.weather)
  console.log('[ChinaMap] onMounted - props.userLocation:', props.userLocation)
  initMap()
  window.addEventListener('resize', handleResize)
})

// 监听props变化
watch(() => props.weather, (newWeather) => {
  console.log('[ChinaMap] weather prop changed:', newWeather)
}, { immediate: true })

watch(() => props.userLocation, (newLocation) => {
  console.log('[ChinaMap] userLocation prop changed:', newLocation)
}, { immediate: true })

onBeforeUnmount(() => {
  if (resizeTimer) clearTimeout(resizeTimer)
  if (chart) {
    chart.dispose()
    chart = null
  }
  window.removeEventListener('resize', handleResize)
})

watch(() => [props.userLocation, props.weather], () => {
  initMap()
}, { deep: true })
</script>

<style scoped>
.china-map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: calc(100% - 35px);
  min-height: 320px;
}

.map-legend {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.legend-title {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.legend-temp {
  display: flex;
  align-items: center;
  gap: 6px;
}

.temp-icon {
  font-size: 18px;
}

.temp-value {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-primary);
}

.map-loading,
.map-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 320px;
  gap: 12px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.map-loading .el-icon {
  font-size: 32px;
  color: var(--color-primary);
}

.map-error {
  color: var(--color-danger);
}

.map-error .el-icon {
  font-size: 32px;
}
</style>
