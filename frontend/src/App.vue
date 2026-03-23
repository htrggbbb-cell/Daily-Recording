<template>
  <!-- 天气背景 -->
  <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 101; pointer-events: none;">
    <!-- 云朵1 - 大朵（卡通风格） -->
    <div v-if="weather && (weather.weather === '多云' || weather.weather === '阴')"
         style="position: absolute; top: 15%; left: 10%; width: 220px; height: 80px;
                animation: cloudFloat 50s ease-in-out infinite; opacity: 0.85;">
      <!-- 云朵底部 -->
      <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 50px;
                  background: #FFFFFF; border-radius: 50px;
                  box-shadow: 0 8px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(255,255,255,0.5);"></div>
      <!-- 云朵顶部圆球1 -->
      <div style="position: absolute; top: 0; left: 25px; width: 90px; height: 90px;
                  background: #FFFFFF; border-radius: 50%;
                  box-shadow: 0 8px 25px rgba(0,0,0,0.15), inset 0 -5px 15px rgba(0,0,0,0.05);"></div>
      <!-- 云朵顶部圆球2 -->
      <div style="position: absolute; top: 10px; left: 75px; width: 75px; height: 75px;
                  background: #FFFFFF; border-radius: 50%;
                  box-shadow: 0 8px 25px rgba(0,0,0,0.15), inset 0 -5px 15px rgba(0,0,0,0.05);"></div>
      <!-- 云朵顶部圆球3 -->
      <div style="position: absolute; top: 5px; left: 120px; width: 70px; height: 70px;
                  background: #FFFFFF; border-radius: 50%;
                  box-shadow: 0 8px 25px rgba(0,0,0,0.15), inset 0 -5px 15px rgba(0,0,0,0.05);"></div>
      <!-- 云朵顶部圆球4 -->
      <div style="position: absolute; top: 20px; left: 160px; width: 55px; height: 55px;
                  background: #FFFFFF; border-radius: 50%;
                  box-shadow: 0 8px 25px rgba(0,0,0,0.15), inset 0 -5px 15px rgba(0,0,0,0.05);"></div>
    </div>

    <!-- 云朵2 - 中朵（卡通风格） -->
    <div v-if="weather && (weather.weather === '多云' || weather.weather === '阴')"
         style="position: absolute; top: 50%; left: 55%; width: 180px; height: 65px;
                animation: cloudFloat 45s ease-in-out infinite; animation-delay: 10s; opacity: 0.8;">
      <!-- 云朵底部 -->
      <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 40px;
                  background: #FFFFFF; border-radius: 40px;
                  box-shadow: 0 6px 20px rgba(0,0,0,0.12), 0 3px 8px rgba(255,255,255,0.4);"></div>
      <!-- 云朵顶部圆球1 -->
      <div style="position: absolute; top: 0; left: 20px; width: 75px; height: 75px;
                  background: #FFFFFF; border-radius: 50%;
                  box-shadow: 0 6px 20px rgba(0,0,0,0.12), inset 0 -4px 12px rgba(0,0,0,0.04);"></div>
      <!-- 云朵顶部圆球2 -->
      <div style="position: absolute; top: 8px; left: 65px; width: 60px; height: 60px;
                  background: #FFFFFF; border-radius: 50%;
                  box-shadow: 0 6px 20px rgba(0,0,0,0.12), inset 0 -4px 12px rgba(0,0,0,0.04);"></div>
      <!-- 云朵顶部圆球3 -->
      <div style="position: absolute; top: 12px; left: 105px; width: 50px; height: 50px;
                  background: #FFFFFF; border-radius: 50%;
                  box-shadow: 0 6px 20px rgba(0,0,0,0.12), inset 0 -4px 12px rgba(0,0,0,0.04);"></div>
    </div>

    <!-- 云朵3 - 小朵（卡通风格） -->
    <div v-if="weather && (weather.weather === '多云' || weather.weather === '阴')"
         style="position: absolute; top: 72%; left: 18%; width: 140px; height: 55px;
                animation: cloudFloat 55s ease-in-out infinite; animation-delay: 20s; opacity: 0.75;">
      <!-- 云朵底部 -->
      <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 35px;
                  background: #FFFFFF; border-radius: 35px;
                  box-shadow: 0 5px 18px rgba(0,0,0,0.1), 0 2px 6px rgba(255,255,255,0.3);"></div>
      <!-- 云朵顶部圆球1 -->
      <div style="position: absolute; top: 0; left: 18px; width: 60px; height: 60px;
                  background: #FFFFFF; border-radius: 50%;
                  box-shadow: 0 5px 18px rgba(0,0,0,0.1), inset 0 -3px 10px rgba(0,0,0,0.03);"></div>
      <!-- 云朵顶部圆球2 -->
      <div style="position: absolute; top: 6px; left: 55px; width: 50px; height: 50px;
                  background: #FFFFFF; border-radius: 50%;
                  box-shadow: 0 5px 18px rgba(0,0,0,0.1), inset 0 -3px 10px rgba(0,0,0,0.03);"></div>
      <!-- 云朵顶部圆球3 -->
      <div style="position: absolute; top: 10px; left: 88px; width: 42px; height: 42px;
                  background: #FFFFFF; border-radius: 50%;
                  box-shadow: 0 5px 18px rgba(0,0,0,0.1), inset 0 -3px 10px rgba(0,0,0,0.03);"></div>
    </div>

    <!-- 雨滴 Canvas -->
    <canvas
      v-if="weather && weather.weather.includes('雨')"
      ref="rainCanvas"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    ></canvas>
  </div>

  <div id="app">
    <router-view />
    <WeatherWidget v-if="weather" :weather="weather" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useWeatherStore } from './stores/weatherStore'
import { useUserStore } from './store'
import WeatherWidget from './components/WeatherWidget.vue'

const weatherStore = useWeatherStore()
const userStore = useUserStore()
const weather = ref(null)
const darkModeAuto = ref(localStorage.getItem('darkModeAuto') !== 'false')  // 默认true

// 雨滴 Canvas 相关
const rainCanvas = ref(null)
let animationFrameId = null
let raindrops = []

// 雨量强度
const rainIntensity = computed(() => {
  if (!weather.value) return 'light'
  return weatherStore.getRainIntensity(weather.value.weather) || 'light'
})

// 判断是否是雨天
const isRainy = computed(() => {
  return weather.value && weather.value.weather.includes('雨')
})

// 初始化雨滴
const initRaindrops = () => {
  const intensityMap = { light: 100, medium: 200, heavy: 400 }
  const count = intensityMap[rainIntensity.value] || 100

  raindrops = []
  for (let i = 0; i < count; i++) {
    raindrops.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 5 + 8
    })
  }
}

// 绘制雨滴
const drawRain = () => {
  const canvas = rainCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.lineWidth = 1.5

  raindrops.forEach(drop => {
    ctx.beginPath()
    ctx.moveTo(drop.x, drop.y)
    ctx.lineTo(drop.x, drop.y + drop.length)
    ctx.stroke()

    drop.y += drop.speed

    if (drop.y > canvas.height) {
      drop.y = -drop.length
      drop.x = Math.random() * canvas.width
    }
  })

  animationFrameId = requestAnimationFrame(drawRain)
}

// 窗口大小调整
const handleResize = () => {
  if (rainCanvas.value) {
    rainCanvas.value.width = window.innerWidth
    rainCanvas.value.height = window.innerHeight
  }
  if (isRainy.value) initRaindrops()
}

// 根据天气/时间自动切换深色模式（仅当自动模式开启时）
watch(() => weather.value?.weather, (newWeather) => {
  if (!newWeather) return

  // 根据时间/天气设置背景颜色
  const timeBgColor = weatherStore.getTimeBackgroundColor()
  document.body.style.background = timeBgColor

  // 只有自动模式开启时，才根据时间/天气自动切换深色模式
  if (darkModeAuto.value) {
    const hour = new Date().getHours()
    const isNight = hour >= 19 || hour < 6  // 19点-6点为夜晚
    const isDarkWeather = newWeather === '多云' || newWeather === '阴' || newWeather.includes('雨')

    if (isNight || isDarkWeather) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
      window.dispatchEvent(new CustomEvent('darkModeChange', { detail: true }))
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
      window.dispatchEvent(new CustomEvent('darkModeChange', { detail: false }))
    }
  }

  // 启动/停止雨滴动画
  if (isRainy.value) {
    initRaindrops()
    drawRain()
  } else if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
})

// 处理自动深色模式切换
const handleDarkModeAutoChange = (event) => {
  darkModeAuto.value = event.detail
}

const initWeather = async () => {
  const city = userStore.user?.city || '南京'
  weather.value = await weatherStore.fetchWeather(city)
  console.log('[App] 天气:', weather.value?.weather)
}

onMounted(async () => {
  await initWeather()
  window.addEventListener('resize', handleResize)
  handleResize()

  // 监听自动深色模式切换事件
  window.addEventListener('darkModeAutoChange', handleDarkModeAutoChange)

  // 如果是雨天，启动雨滴动画
  if (isRainy.value) {
    initRaindrops()
    drawRain()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('darkModeAutoChange', handleDarkModeAutoChange)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

userStore.$subscribe((mutation, state) => {
  if (state.user?.city && state.user.city !== weather.value?.city) {
    initWeather()
  }
})
</script>

<style>
@keyframes cloudFloat {
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(80px) translateY(-20px); }
  50% { transform: translateX(160px) translateY(0); }
  75% { transform: translateX(80px) translateY(20px); }
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; transition: background 2s ease; }
#app { min-height: 100vh; position: relative; z-index: 10; }
</style>
