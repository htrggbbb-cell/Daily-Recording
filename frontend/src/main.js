import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/styles/global.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// PWA Service Worker 注册
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(() => {
    console.log('Service Worker 注册成功')
  }).catch((error) => {
    console.error('Service Worker 注册失败:', error)
  })
}
