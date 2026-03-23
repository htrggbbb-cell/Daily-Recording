import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useWeatherStore = defineStore('weather', () => {
  // 状态
  const weather = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 用户设置
  const weatherEffectsEnabled = ref(true)
  const mobileWeatherEffectsEnabled = ref(false)

  // 获取天气效果开关状态
  const isMobile = computed(() => {
    return window.innerWidth <= 768
  })

  const shouldShowEffects = computed(() => {
    if (isMobile.value) {
      return weatherEffectsEnabled.value && mobileWeatherEffectsEnabled.value
    }
    return weatherEffectsEnabled.value
  })

  // 加载用户设置
  const loadSettings = () => {
    const saved = localStorage.getItem('weatherEffects')
    if (saved) {
      const settings = JSON.parse(saved)
      weatherEffectsEnabled.value = settings.enabled ?? true
      mobileWeatherEffectsEnabled.value = settings.mobileEnabled ?? false
    }
  }

  // 保存用户设置
  const saveSettings = () => {
    const settings = {
      enabled: weatherEffectsEnabled.value,
      mobileEnabled: mobileWeatherEffectsEnabled.value
    }
    localStorage.setItem('weatherEffects', JSON.stringify(settings))
  }

  // 切换天气效果
  const toggleWeatherEffects = (enabled) => {
    weatherEffectsEnabled.value = enabled
    saveSettings()
  }

  // 切换移动端天气效果
  const toggleMobileEffects = (enabled) => {
    mobileWeatherEffectsEnabled.value = enabled
    saveSettings()
  }

  // 获取当前时间背景色
  const getTimeBackgroundColor = () => {
    const hour = new Date().getHours()
    const minute = new Date().getMinutes()
    const time = hour + minute / 60 // 小数小时，如 6.5 = 6:30

    // 日出过渡期 6:00 - 8:00
    if (time >= 6 && time < 8) {
      const progress = (time - 6) / 2 // 0 到 1
      return interpolateColor('#FFE4B5', '#FFF8F0', progress)
    }

    // 白天 8:00 - 16:00
    if (time >= 8 && time < 16) {
      return '#FFF8F0'
    }

    // 日落过渡期 16:00 - 19:00
    if (time >= 16 && time < 19) {
      const progress = (time - 16) / 3 // 0 到 1
      if (progress < 0.5) {
        return interpolateColor('#FFF8F0', '#FFDAB9', progress * 2)
      } else {
        return interpolateColor('#FFDAB9', '#3D3D3D', (progress - 0.5) * 2)
      }
    }

    // 夜晚初期 19:00 - 22:00
    if (time >= 19 && time < 22) {
      const progress = (time - 19) / 3 // 0 到 1
      return interpolateColor('#3D3D3D', '#2D2D2D', progress)
    }

    // 深夜 22:00 - 6:00
    return '#1A1A1A'
  }

  // 颜色插值函数
  const interpolateColor = (color1, color2, factor) => {
    const hex2rgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }

    const rgb1 = hex2rgb(color1)
    const rgb2 = hex2rgb(color2)

    const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r))
    const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g))
    const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b))

    return `rgb(${r}, ${g}, ${b})`
  }

  // 获取天气天气图标
  const getWeatherEmoji = (weather) => {
    const weatherMap = {
      '晴': '☀️',
      '多云': '⛅',
      '阴': '☁️',
      '小雨': '🌧️',
      '中雨': '🌧️',
      '大雨': '⛈️',
      '暴雨': '⛈️',
      '雪': '❄️',
      '雾': '🌫️'
    }
    return weatherMap[weather] || '🌤️'
  }

  // 获取雨量强度
  const getRainIntensity = (weather) => {
    if (weather.includes('小')) return 'light'
    if (weather.includes('中')) return 'medium'
    if (weather.includes('大') || weather.includes('暴')) return 'heavy'
    return null
  }

  // 获取天气数据（从 Open-Meteo API）
  const fetchWeather = async (city) => {
    loading.value = true
    error.value = null

    try {
      // 城市坐标映射
      const cityCoords = {
        '北京': { lat: 39.9042, lon: 116.4074 },
        '上海': { lat: 31.2304, lon: 121.4737 },
        '南京': { lat: 32.0603, lon: 118.7969 },
        '杭州': { lat: 30.2741, lon: 120.1551 },
        '苏州': { lat: 31.2989, lon: 120.5853 },
        '无锡': { lat: 31.4912, lon: 120.3119 },
        '常州': { lat: 31.8106, lon: 119.9741 },
        '镇江': { lat: 32.2044, lon: 119.4550 },
        '扬州': { lat: 32.3949, lon: 119.4128 },
        '南通': { lat: 31.9807, lon: 120.8946 },
        '泰州': { lat: 32.4554, lon: 119.9228 },
        '徐州': { lat: 34.2044, lon: 117.2842 },
        '连云港': { lat: 34.5966, lon: 119.2216 },
        '淮安': { lat: 33.5904, lon: 119.1139 },
        '盐城': { lat: 33.3477, lon: 120.1617 },
        '宿迁': { lat: 33.9630, lon: 118.2757 }
      }

      const coords = cityCoords[city] || cityCoords['南京']

      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`
      )

      const weatherCode = response.data.current_weather.weathercode
      const temp = Math.round(response.data.current_weather.temperature)

      // 天气代码映射
      const codeToWeather = {
        0: '晴', 1: '晴',
        2: '多云', 3: '多云',
        45: '雾', 48: '雾',
        51: '小雨', 53: '小雨', 55: '小雨',
        61: '小雨', 63: '中雨', 65: '大雨',
        80: '小雨', 81: '中雨', 82: '大雨',
        95: '雷阵雨', 96: '雷阵雨', 99: '雷阵雨'
      }

      const weatherType = codeToWeather[weatherCode] || '晴'

      weather.value = {
        temp,
        weather: weatherType,
        humidity: 65,
        wind: 3
      }

      return weather.value
    } catch (err) {
      error.value = err.message
      console.error('获取天气失败:', err)
      // 返回默认天气
      weather.value = {
        temp: 20,
        weather: '晴',
        humidity: 65,
        wind: 3
      }
      return weather.value
    } finally {
      loading.value = false
    }
  }

  // 初始化
  loadSettings()

  return {
    weather,
    loading,
    error,
    weatherEffectsEnabled,
    mobileWeatherEffectsEnabled,
    shouldShowEffects,
    toggleWeatherEffects,
    toggleMobileEffects,
    getTimeBackgroundColor,
    getWeatherEmoji,
    getRainIntensity,
    fetchWeather
  }
})
